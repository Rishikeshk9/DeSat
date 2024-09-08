'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3Auth } from './Web3AuthProvider';
import Button from './Button';
import { ethers } from 'ethers';
import CrowdfundingView from './CrowdfundingView';

const getAccounts = async (provider) => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
};

const MySatellites = () => {
  const [satellites, setSatellites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, provider } = useWeb3Auth();

  useEffect(() => {
    const fetchSatellites = async () => {
      if (!user || !provider) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        const userAddress = await getAccounts(provider);
        if (!userAddress) {
          setError('Failed to get user address');
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/satellite?address=${userAddress}`,
          {
            headers: {
              'ngrok-skip-browser-warning': '69420',
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch satellites');
        }
        const data = await response.json();
        setSatellites(data);
      } catch (err) {
        console.error('Error fetching satellites:', err);
        setError('Failed to load satellites. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSatellites();
  }, [user, provider]);

  if (isLoading) {
    return <div className='text-white'>Loading your satellites...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  return (
    <div className='bg-[#0D1117] text-white p-6 rounded-lg'>
      <h2 className='mb-4 text-2xl font-bold'>My Satellites</h2>
      {satellites.length === 0 ? (
        <p>You haven't launched any satellites yet.</p>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2'>
          {satellites.map((satellite) => (
            <div
              key={satellite.tokenId}
              className='bg-[#21262D] p-4 rounded-lg'
            >
              <img
                src={satellite.imageUrl}
                alt={satellite.satelliteName}
                className='object-cover w-full h-40 mb-2 rounded-md'
              />
              <h3 className='mb-2 text-xl font-semibold'>
                {satellite.satelliteName}
              </h3>
              <p>
                <strong>Token ID:</strong> {satellite.tokenId}
              </p>

              <CrowdfundingView tokenId={satellite.tokenId} />
              <p>
                <strong>Organization:</strong> {satellite.organizationName}
              </p>
              <p>
                <strong>Launch Date:</strong>{' '}
                {new Date(satellite.missionLaunchDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Crowdfunding:</strong>{' '}
                {satellite.isCrowdfunding ? 'Yes' : 'No'}
              </p>
              <p className='mb-2'>
                <strong>Description:</strong> {satellite.satelliteDescription}
              </p>
              <div className='flex justify-between'>
                <Button
                  className='mt-2'
                  onClick={() =>
                    window.open(satellite.whitepaperLink, '_blank')
                  }
                >
                  View Whitepaper
                </Button>
                <Button className='mt-2'>View Details</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySatellites;
