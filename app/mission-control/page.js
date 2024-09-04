'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import MySatellites from '../../components/MySatellites';
import Button from '../../components/Button';

export default function MissionControl() {
  const { user, isLoading } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className='text-white'>Loading...</div>;
  }

  if (!user) {
    return null; // This will not be rendered as useEffect will redirect
  }

  return (
    <div className='min-h-screen bg-[#0D1117] text-white p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Mission Control</h1>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
        <MySatellites />
      </div>
    </div>
  );
}
