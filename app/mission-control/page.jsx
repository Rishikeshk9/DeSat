'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import MySatellites from '../../components/MySatellites';
import Button from '../../components/Button';
import CrowdfundingView from '../../components/CrowdfundingView';
import { ethers } from 'ethers';
import CrowdfundingSatelliteABI from '../../lib/abis/CrowdfundingSatellite.json';

export default function MissionControl() {
  const { user, isLoading, provider } = useWeb3Auth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('satellites');
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const fetchUserInfo = useCallback(async () => {
    if (!provider) return;
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);
      const chainId = await ethersProvider.getNetwork().then(network => network.chainId);

      setUserInfo({
        address,
        balance: ethers.formatEther(balance),
        chainId: chainId.toString()
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, [provider]);

  useEffect(() => {
    if (!isLoading && provider) {
      fetchUserInfo();
    }
  }, [isLoading, provider, fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      fetchSatellitesAndCampaigns();
    }
  }, [userInfo]);

  const fetchSatellitesAndCampaigns = async () => {
    try {
      // console.log('fetch user', userInfo);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/satellite?isCrowdfunding=true`);
      const satellites = await response.json();

      const campaignDetails = await Promise.all(
        satellites.map(satellite => fetchCampaignDetails(satellite))
      );

      const validCampaigns = campaignDetails.filter(campaign => campaign !== null);
      
      setActiveCampaigns(validCampaigns);
      
      // Only set userCampaigns if userInfo.address is available
      if (userInfo?.address) {
        setUserCampaigns(validCampaigns.filter(campaign => 
          campaign.address && campaign.address.toLowerCase() === userInfo.address.toLowerCase()
        ));
      } else {
        setUserCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching satellites and campaigns:', error);
    }
  };

  const fetchCampaignDetails = async (satellite) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const crowdfundingContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
        CrowdfundingSatelliteABI,
        signer
      );

      const details = await crowdfundingContract.getCampaignDetails(satellite.tokenId);

      if (details[0] === '0x0000000000000000000000000000000000000000' || Number(details[1]) === 0) {
        return null;
      }

      return {
        ...satellite,
        creator: details[0],
        goal: ethers.formatEther(details[1]),
        totalFunded: ethers.formatEther(details[2]),
        endTime: new Date(Number(details[3]) * 1000),
        isActive: details[4],
        tokenAddress: details[5],
      };
    } catch (error) {
      console.error(`Error fetching campaign details for token ${satellite.tokenId}:`, error);
      return null;
    }
  };

  const refreshCampaigns = async () => {
    await fetchSatellitesAndCampaigns();
  };

  if (isLoading) {
    return <div className='text-white'>Loading...</div>;
  }

  if (!userInfo) {
    return <div className='text-white'>Fetching user information...</div>;
  }

  return (
    <div className='min-h-screen bg-[#0D1117] text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Mission Control</h1>
          <div>
            <p>Address: {userInfo.address}</p>
            <p>Balance: {userInfo.balance} ETH</p>
            <p>Chain ID: {userInfo.chainId}</p>
          </div>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
        <div className='mb-6'>
          <Button 
            onClick={() => setActiveTab('satellites')} 
            className={`mr-4 ${activeTab === 'satellites' ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            My Satellites and Campaigns
          </Button>
          <Button 
            onClick={() => setActiveTab('campaigns')} 
            className={activeTab === 'campaigns' ? 'bg-blue-600' : 'bg-gray-600'}
          >
            Active Campaigns
          </Button>
        </div>
        {activeTab === 'satellites' ? (
          <div>
            <h2 className='text-2xl font-bold mb-4'>My Satellites</h2>
            <MySatellites />
            <h2 className='text-2xl font-bold mb-4 mt-8'>My Campaigns</h2>
            {userCampaigns.length > 0 ? (
              userCampaigns.map(campaign => (
                <CrowdfundingView 
                  key={campaign.tokenId} 
                  campaign={campaign} 
                  isUserCampaign={true} 
                  onCampaignUpdate={refreshCampaigns}
                />
              ))
            ) : (
              <p>You have no active campaigns.</p>
            )}
          </div>
        ) : (
          <div>
            <h2 className='text-2xl font-bold mb-4'>Active Campaigns</h2>
            {activeCampaigns.length > 0 ? (
              activeCampaigns.map(campaign => (
                <CrowdfundingView 
                  key={campaign.tokenId} 
                  campaign={campaign} 
                  isUserCampaign={false} 
                  onCampaignUpdate={refreshCampaigns}
                />
              ))
            ) : (
              <p>No active campaigns found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
