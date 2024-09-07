'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './Web3AuthProvider';
import Button from './Button';
import CrowdfundingSatelliteABI from '../lib/abis/CrowdfundingSatellite.json';
import SATFANABI from '../lib/abis/SATFAN.json';

const CrowdfundingView = ({ tokenId }) => {
  const { provider, user, ethersProvider, signer, getChainId, switchChain } =
    useWeb3Auth();
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [contribution, setContribution] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provider && tokenId) {
      fetchCampaignDetails();
    }
  }, [provider, tokenId]);

  const fetchCampaignDetails = async () => {
    try {
      const _ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await _ethersProvider.getSigner();
      const crowdfundingContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
        CrowdfundingSatelliteABI,
        signer
      );

      const details = await crowdfundingContract.getCampaignDetails(tokenId);
      console.log(details);
      setCampaignDetails({
        creator: details[0],
        goal: ethers.formatEther(details[1]),
        totalFunded: ethers.formatEther(details[2]),
        endTime: new Date(Number(details[3]) * 1000),
        isActive: details[4],
        tokenAddress: details[5],
      });
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  };

  const handleContribute = async () => {
    if (!provider || !campaignDetails) return;
    await switchChain();
    console.log(provider);
    setLoading(true);
    try {
      const _ethersProvider = new ethers.BrowserProvider(provider);
      console.log(_ethersProvider);
      const signer = await _ethersProvider.getSigner();
      console.log(signer);
      const crowdfundingContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
        CrowdfundingSatelliteABI,
        signer
      );

      const tokenContract = new ethers.Contract(
        campaignDetails.tokenAddress,
        SATFANABI,
        signer
      );
      console.log(tokenContract);
      const amount = ethers.parseEther(contribution);

      console.log(amount);
      // Approve the crowdfunding contract to spend tokens
      const approveTx = await tokenContract.approve(
        process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
        amount
      );
      console.log(approveTx);
      await approveTx.wait();

      // Contribute to the campaign
      const tx = await crowdfundingContract.contribute(tokenId, amount);
      console.log(tx);
      await tx.wait();

      alert('Contribution successful!');
      fetchCampaignDetails();
    } catch (error) {
      console.error('Error contributing:', error);
      alert('Error contributing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCampaign = async () => {
    if (!provider || !campaignDetails) return;

    setLoading(true);
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const crowdfundingContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS,
        CrowdfundingSatelliteABI,
        signer
      );

      const tx = await crowdfundingContract.endCampaign(tokenId);
      await tx.wait();

      alert('Campaign ended successfully!');
      fetchCampaignDetails();
    } catch (error) {
      console.error('Error ending campaign:', error);
      alert('Error ending campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!campaignDetails) {
    return <div>Loading campaign details...</div>;
  }

  return (
    <div className='p-4 bg-gray-800 rounded-lg'>
      <h2 className='mb-4 text-2xl font-bold'>Crowdfunding Campaign</h2>
      <p>Creator: {campaignDetails.creator}</p>
      <p>Goal: {campaignDetails.goal} SATFAN</p>
      <p>Total Funded: {campaignDetails.totalFunded} SATFAN</p>
      <p>End Time: {campaignDetails.endTime.toLocaleString()}</p>
      <p>Status: {campaignDetails.isActive ? 'Active' : 'Ended'}</p>
      {campaignDetails.isActive && (
        <div className='mt-4'>
          <input
            type='number'
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder='Amount to contribute'
            className='w-full p-2 mb-2 bg-gray-700 rounded'
          />
          <Button onClick={handleContribute} disabled={loading}>
            {loading ? 'Contributing...' : 'Contribute'}
          </Button>
          
          {(new Date() >= campaignDetails.endTime || parseFloat(campaignDetails.totalFunded) >= parseFloat(campaignDetails.goal)) && (
            <Button onClick={handleEndCampaign} disabled={loading}>
              {loading ? 'Ending Campaign...' : 'End Campaign'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CrowdfundingView;
