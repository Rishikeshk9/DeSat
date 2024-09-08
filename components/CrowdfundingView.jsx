'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3AuthProvider';
import Button from './Button';
import Notification from './Notification';
import CrowdfundingSatelliteABI from '../lib/abis/CrowdfundingSatellite.json';
import SATFANABI from '../lib/abis/SATFAN.json';
import Image from 'next/image';

const CrowdfundingView = ({ campaign, isUserCampaign, onCampaignUpdate }) => {
  const { provider } = useWeb3Auth();
  const [contribution, setContribution] = useState('');
  const [loading, setLoading] = useState(false);
  const [canEndCampaign, setCanEndCampaign] = useState(false);
  const [notification, setNotification] = useState(null);
  const [allowance, setAllowance] = useState('0');
  const [localCampaignStatus, setLocalCampaignStatus] = useState(campaign?.isActive ?? false);

  useEffect(() => {
    if (campaign) {
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = campaign.endTime.getTime() / 1000;
      const goalReached = Number.parseFloat(campaign.totalFunded) >= Number.parseFloat(campaign.goal);
      setCanEndCampaign((currentTime >= endTime || goalReached) && localCampaignStatus);
    }
    if (provider && campaign) {
      checkAllowance();
    }
  }, [campaign, provider, localCampaignStatus]);

  const checkAllowance = async () => {
    try {
      const _ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await _ethersProvider.getSigner();
      const tokenContract = new ethers.Contract(
        campaign.tokenAddress,
        SATFANABI,
        signer
      );
      const userAddress = await signer.getAddress();
      const currentAllowance = await tokenContract.allowance(userAddress, process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS);
      setAllowance(ethers.formatEther(currentAllowance));
    } catch (error) {
      console.error('Error checking allowance:', error);
    }
  };

  const handleContribute = async () => {
    if (!provider || !campaign) return;
    setLoading(true);
    try {
      const _ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await _ethersProvider.getSigner();
      const crowdfundingContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
        CrowdfundingSatelliteABI,
        signer
      );

      const tokenContract = new ethers.Contract(
        campaign.tokenAddress,
        SATFANABI,
        signer
      );
      const amount = ethers.parseEther(contribution);

      if (Number(allowance) < Number(contribution)) {
        const approveTx = await tokenContract.approve(
          process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
          amount
        );
        await approveTx.wait();
      }

      const tx = await crowdfundingContract.contribute(campaign.tokenId, amount);
      await tx.wait();

      showNotification('Contribution successful!', 'success');
      onCampaignUpdate();
      checkAllowance();
    } catch (error) {
      console.error('Error contributing:', error);
      showNotification('Error contributing. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCampaign = async () => {
    if (!provider || !campaign) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crowdfunding/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId: campaign.tokenId }),
      });

      if (!response.ok) {
        throw new Error('Failed to end campaign');
      }

      const result = await response.json();
      showNotification('Campaign ended successfully!', 'success');
      
      // Open transaction in Chiliz explorer
      if (result.transactionHash) {
        const explorerUrl = `https://testnet.chiliscan.com/tx/${result.transactionHash}`;
        window.open(explorerUrl, '_blank', 'noopener,noreferrer');
      }

      // Update local state
      setLocalCampaignStatus(false);
      setCanEndCampaign(false);

      // Trigger the parent component to update all campaigns
      onCampaignUpdate();

    } catch (error) {
      console.error('Error ending campaign:', error);
      showNotification('Error ending campaign. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Address copied to clipboard!', 'info');
    });
  };

  if (!campaign) {
    return null;
  }

  return (
    <div className='p-6 bg-gray-800 rounded-lg shadow-lg mb-6'>
      <div className='flex flex-col md:flex-row'>
        <div className='md:w-1/3 mb-4 md:mb-0 md:mr-6'>
          <Image
            src={campaign.imageUrl}
            alt={campaign.satelliteName}
            width={300}
            height={300}
            className='rounded-lg'
          />
        </div>
        <div className='md:w-2/3'>
          <h2 className='mb-4 text-2xl font-bold'>{campaign.satelliteName}</h2>
          <p className='mb-2'><strong>Organization:</strong> {campaign.organizationName}</p>
          <p className='mb-2'><strong>Description:</strong> {campaign.satelliteDescription}</p>
          <p className='mb-2'>
            <strong>Creator:</strong>{' '}
            <span 
              className='cursor-pointer hover:underline' 
              onClick={() => copyToClipboard(campaign.creator)}
              onKeyPress={(e) => e.key === 'Enter' && copyToClipboard(campaign.creator)}
              title='Click to copy full address'
              tabIndex={0}
              role="button"
            >
              {truncateAddress(campaign.creator)}
            </span>
          </p>
          <p className='mb-2'><strong>Goal:</strong> {campaign.goal} SATFAN</p>
          <p className='mb-2'><strong>Total Funded:</strong> {campaign.totalFunded} SATFAN</p>
          <p className='mb-2'><strong>End Time:</strong> {campaign.endTime.toLocaleString()}</p>
          <p className='mb-2'><strong>Status:</strong> {localCampaignStatus ? 'Active' : 'Ended'}</p>
          <p className='mb-2'><strong>Progress:</strong> {((Number.parseFloat(campaign.totalFunded) / Number.parseFloat(campaign.goal)) * 100).toFixed(2)}%</p>
          
          {campaign.isActive && !isUserCampaign && (
            <div className='mt-4'>
              <div className='flex items-center mb-4'>
                <input
                  type='number'
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder='Amount to contribute'
                  className='w-full p-2 mr-2 bg-gray-700 rounded'
                />
                <Button onClick={handleContribute} disabled={loading}>
                  {loading ? 'Contributing...' : 'Contribute'}
                </Button>
              </div>
            </div>
          )}
          {isUserCampaign && localCampaignStatus && (
            <Button 
              onClick={handleEndCampaign} 
              disabled={loading || !canEndCampaign}
              className={`w-full mt-4 ${canEndCampaign ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 cursor-not-allowed'}`}
            >
              {loading ? 'Ending Campaign...' : 'End Campaign'}
            </Button>
          )}
        </div>
      </div>
      <div className='w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700 mt-4'>
        <div className='bg-blue-600 h-2.5 rounded-full' style={{ width: `${((Number.parseFloat(campaign.totalFunded) / Number.parseFloat(campaign.goal)) * 100).toFixed(2)}%` }} />
      </div>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default CrowdfundingView;
