'use client';

import { useState } from 'react';

export function Launch() {
  const [formData, setFormData] = useState({
    satelliteName: '',
    yourName: '',
    organisationName: '',
    missionWhitepaper: '',
    missionDescription: '',
    launchDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // TODO: Implement the countdown or navigation to a countdown page
  };

  return (
    <div className='min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Launch Your Satellite</h1>
      <form onSubmit={handleSubmit} className='w-full max-w-md space-y-4'>
        <input
          type='text'
          name='satelliteName'
          value={formData.satelliteName}
          onChange={handleInputChange}
          placeholder='Satellite Name'
          className='w-full px-4 py-2 bg-[#21262D] rounded-md'
          required
        />
        <input
          type='text'
          name='yourName'
          value={formData.yourName}
          onChange={handleInputChange}
          placeholder='Your Name'
          className='w-full px-4 py-2 bg-[#21262D] rounded-md'
          required
        />
        <input
          type='text'
          name='organisationName'
          value={formData.organisationName}
          onChange={handleInputChange}
          placeholder='Organisation Name'
          className='w-full px-4 py-2 bg-[#21262D] rounded-md'
          required
        />
        <input
          type='url'
          name='missionWhitepaper'
          value={formData.missionWhitepaper}
          onChange={handleInputChange}
          placeholder='Mission Whitepaper (URL)'
          className='w-full px-4 py-2 bg-[#21262D] rounded-md'
          required
        />
        <textarea
          name='missionDescription'
          value={formData.missionDescription}
          onChange={handleInputChange}
          placeholder='Description of the Mission'
          className='w-full px-4 py-2 bg-[#21262D] rounded-md h-32'
          required
        ></textarea>
        <input
          type='date'
          name='launchDate'
          value={formData.launchDate}
          onChange={handleInputChange}
          className='w-full px-4 py-2 bg-[#21262D] rounded-md'
          required
        />
        <button
          type='submit'
          className='w-full px-6 py-3 transition-colors bg-blue-600 rounded-md hover:bg-blue-700'
        >
          Start Countdown
        </button>
      </form>
    </div>
  );
}
