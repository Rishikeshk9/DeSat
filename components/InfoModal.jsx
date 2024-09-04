import React from 'react';
import Button from './Button';

const InfoModal = ({ onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-[#21262D] p-6 rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto text-white'>
        <h2 className='mb-4 text-2xl font-bold'>About DeSat</h2>
        <div className='space-y-6'>
          <p>
            DeSat is a revolutionary platform that empowers individuals and
            organizations to participate in space exploration and satellite
            technology.
          </p>

          <div>
            <h3 className='mb-2 text-xl font-semibold'>For Individuals</h3>
            <ul className='pl-5 space-y-2 list-disc'>
              <li>
                Explore real-time on-chain and off-chain data of thousands of
                space objects
              </li>
              <li>Participate in crowd-funded missions</li>
              <li>Gain shared ownership of mission NFTs</li>
              <li>Access mission-critical on-chain data</li>
              <li>Learn about satellite technology and space science</li>
            </ul>
          </div>

          <div>
            <h3 className='mb-2 text-xl font-semibold'>For Organizations</h3>
            <ul className='pl-5 space-y-2 list-disc'>
              <li>Launch space missions with on-chain mission data</li>
              <li>Raise crowd funds for missions</li>
              <li>
                Utilize blockchain technology for transparent mission management
              </li>
              <li>
                Engage with a community of space enthusiasts and potential
                investors
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-2 text-xl font-semibold'>How It Works</h3>
            <ol className='pl-5 space-y-2 list-decimal'>
              <li>Search for satellites using our extensive database</li>
              <li>
                View detailed information and real-time positioning of
                satellites
              </li>
              <li>
                Use the "Launch Satellite" feature to create your own virtual
                satellite mission or participate in existing ones
              </li>
              <li>Monitor and manage your satellite projects or investments</li>
            </ol>
          </div>

          <p>
            Join us in shaping the future of space exploration and satellite
            technology. With DeSat, the cosmos is just a click away!
          </p>
        </div>
        <Button onClick={onClose} className='mt-6'>
          Close
        </Button>
      </div>
    </div>
  );
};

export default InfoModal;
