import React from 'react';

const InfoModal = ({ onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-[#21262D] p-6 rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto text-white'>
        <h2 className='text-2xl font-bold mb-4'>About DeSat</h2>
        <div className='space-y-4'>
          <p>
            DeSat is a revolutionary platform that empowers individuals and
            organizations to participate in space exploration and satellite
            technology.
          </p>
          <h3 className='text-xl font-semibold'>Key Features:</h3>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Search and track existing satellites in real-time</li>
            <li>Launch your own virtual satellites</li>
            <li>Contribute to space research and exploration</li>
            <li>Learn about satellite technology and space science</li>
          </ul>
          <h3 className='text-xl font-semibold'>How It Works:</h3>
          <ol className='list-decimal pl-5 space-y-2'>
            <li>Search for satellites using our extensive database</li>
            <li>
              View detailed information and real-time positioning of satellites
            </li>
            <li>
              Use the "Launch Satellite" feature to create your own virtual
              satellite mission
            </li>
            <li>Monitor and manage your satellite projects</li>
          </ol>
          <p>
            Join us in shaping the future of space exploration and satellite
            technology. With DeSat, the cosmos is just a click away!
          </p>
        </div>
        <button
          onClick={onClose}
          className='mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
