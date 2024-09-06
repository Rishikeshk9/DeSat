'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { calculateSatellitePosition } from '@/app/utils/satellite';
import GLTFModelViewer from './GLTFModelViewer';
import MoonViewer from './MoonViewer';
import Link from 'next/link';
import { Particles } from './Particles';
import InfoModal from './InfoModal';
import Button from './Button';
import { gsap } from 'gsap';
import { useWeb3Auth } from './Web3AuthProvider';
import XMTPConversationModal from './XMTPConversationModal';
import MySatellites from './MySatellites';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isEarthCentered, setIsEarthCentered] = useState(false);
  const searchContainerRef = useRef(null);
  const earthContainerRef = useRef(null);
  const [showXMTPModal, setShowXMTPModal] = useState(false);

  const { user, isLoading, login, logout } = useWeb3Auth();

  useEffect(() => {
    // Load and parse the CSV file
    fetch('/satcat.csv')
      .then((response) => response.text())
      .then((csvText) => {
        const results = Papa.parse(csvText, { header: true });
        setCsvData(results.data);
        console.log(results.data);
      });
  }, []);

  useEffect(() => {
    if (selectedSatellite && selectedSatellite.tle) {
      const data = calculateSatellitePosition(
        selectedSatellite.tle[0],
        selectedSatellite.tle[1]
      );
      if (data) {
        console.log('Setting satellite data:', data);
        setSatelliteData(data);
      } else {
        console.error('Failed to calculate satellite position');
      }
    }
  }, [selectedSatellite]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.length >= 3) {
      const filteredResults = csvData.filter((row) =>
        row.OBJECT_NAME.toLowerCase().includes(value.toLowerCase())
      );
      console.log(filteredResults);
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleSatelliteClick = async (noradId) => {
    try {
      const response = await fetch(
        `https://api.n2yo.com/rest/v1/satellite/tle/${noradId}&apiKey=A5EXJY-NPGGRP-MLW28F-5BVR`
      );
      const data = await response.json();
      console.log(data);

      if (data.tle) {
        const tle = data.tle.split('\r\n');
        if (tle.length >= 2) {
          const satelliteData = {
            ...data,
            tle: tle,
            lastRefresh: Date.now(),
          };
          console.log('Setting selected satellite:', satelliteData);
          setSelectedSatellite(satelliteData);

          try {
            const position = calculateSatellitePosition(tle[0], tle[1]);
            if (position) {
              console.log('Setting initial satellite data:', position);
              setSatelliteData(position);
            } else {
              console.error('Failed to calculate initial satellite position');
            }
          } catch (error) {
            console.error('Error calculating satellite position:', error);
            setSelectedSatellite({ ...satelliteData, noTleData: true });
            setSatelliteData(null);
          }
        } else {
          console.error('Invalid TLE data');
          setSelectedSatellite({ ...data, noTleData: true });
          setSatelliteData(null);
        }
      } else {
        console.error('No TLE data available');
        setSelectedSatellite({ ...data, noTleData: true });
        setSatelliteData(null);
      }
    } catch (error) {
      console.error('Error fetching satellite details:', error);
      setSelectedSatellite({ noTleData: true, error: true });
      setSatelliteData(null);
    }

    // After setting the satellite data, animate the earth to the center
    if (!isEarthCentered) {
      animateEarthToCenter();
    }
  };

  const handleRefresh = useCallback(async () => {
    if (selectedSatellite) {
      const now = Date.now();
      if (
        !selectedSatellite.lastRefresh ||
        now - selectedSatellite.lastRefresh >= 10000
      ) {
        try {
          const response = await fetch(
            `https://api.n2yo.com/rest/v1/satellite/tle/${selectedSatellite.info.satid}&apiKey=A5EXJY-NPGGRP-MLW28F-5BVR`
          );
          const data = await response.json();
          const tle = data.tle.split('\r\n');
          const updatedSatelliteData = {
            ...selectedSatellite,
            tle: tle,
            lastRefresh: now,
          };
          setSelectedSatellite(updatedSatelliteData);

          // Calculate new position based on updated TLE
          const newPosition = calculateSatellitePosition(tle[0], tle[1]);
          setSatelliteData(newPosition);
        } catch (error) {
          console.error('Error refreshing satellite data:', error);
        }
      }
    }
  }, [selectedSatellite]);

  useEffect(() => {
    let intervalId;
    if (showModal && selectedSatellite) {
      // Initial refresh
      handleRefresh();

      // Set up interval for refreshing every 10 seconds
      intervalId = setInterval(() => {
        handleRefresh();
      }, 10000); // 10000 milliseconds = 10 seconds
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [showModal, selectedSatellite, handleRefresh]);

  const animateEarthToCenter = () => {
    gsap.to(searchContainerRef.current, {
      bottom: '10%',
      duration: 1,
      ease: 'power2.inOut',
    });
    gsap.to(earthContainerRef.current, {
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => setIsEarthCentered(true),
    });
  };

  const handleLaunchSatellite = () => {
    if (!user) {
      login();
    } else {
      setShowXMTPModal(true);
    }
  };

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center bg-[#0D1117] px-4 md:px-6 relative'>
      <div
        ref={earthContainerRef}
        className='absolute w-full h-full'
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <MoonViewer
          satelliteData={satelliteData}
          isEarthCentered={isEarthCentered}
        />
      </div>

      {/* Launch Satellite, Mission Control, and Login buttons in the top right corner */}
      <div className='absolute z-10 flex space-x-2 top-4 right-4'>
        <Button onClick={handleLaunchSatellite}>Launch Satellite</Button>
        {user && (
          <Link href='/mission-control'>
            <Button>Mission Control</Button>
          </Link>
        )}
        {isLoading ? (
          <Button disabled>Loading...</Button>
        ) : user ? (
          <Button onClick={logout}>Logout</Button>
        ) : (
          <Button onClick={login}>Login</Button>
        )}
      </div>

      <div
        ref={searchContainerRef}
        className='absolute left-0 w-full px-4 bottom-4'
      >
        <div className='w-full max-w-md mx-auto'>
          <form className='flex items-center rounded-md bg-[#21262D] px-4 py-2 text-white shadow-lg '>
            <SearchIcon className='w-5 h-5 text-white' />
            <input
              type='search'
              placeholder='Search for satellites, missions, and more...'
              className='w-full px-2 py-1 text-white bg-transparent focus:outline-none focus:ring-0'
              value={searchTerm}
              onChange={handleSearch}
            />
          </form>
          {searchResults.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-[#21262D] rounded-md shadow-lg text-white -top-40 max-w-96'>
              <table className='w-full text-left'>
                <thead className='text-xs text-white'>
                  <tr>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-right'>Type</th>
                    <th className='px-4 py-2 text-right'>NORAD ID</th>
                    <th className='px-4 py-2 text-right'>Launch Date</th>
                  </tr>
                </thead>
              </table>
              <ul className='overflow-y-auto text-white/30 max-h-28 '>
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className='px-4 py-2 hover:bg-[#30363D] cursor-pointer'
                    onClick={() => handleSatelliteClick(result.NORAD_CAT_ID)}
                  >
                    <table className='w-full text-sm font-semibold text-left'>
                      <tbody>
                        <tr>
                          <td className='text-left'>{result.OBJECT_NAME}</td>
                          <td className='text-right'>{result.OBJECT_TYPE}</td>
                          <td className='text-right'>{result.NORAD_CAT_ID}</td>
                          <td className='text-right'>{result.LAUNCH_DATE}</td>
                        </tr>
                      </tbody>
                    </table>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col items-center justify-center w-full text-center '>
        <h1 className='flex text-3xl font-bold tracking-tighter text-center text-white sm:text-4xl md:text-5xl lg:text-6xl '>
          DeSat
        </h1>
        <p className='flex text-xs text-center text-white/50'>
          Own & Control the Future of Space Exploration
        </p>
        <p
          onClick={() => setShowInfoModal(true)}
          className='text-xs underline text-white/50 cursor-help'
        >
          know more
        </p>
      </div>
      {showModal && selectedSatellite && !selectedSatellite.noTleData && (
        <div className='fixed z-[999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full'>
          <div className='bg-[#21262D] p-4 rounded-md w-5/6 h-5/6 flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center'>
                <h2 className='mr-4 text-xl font-bold text-white'>
                  {selectedSatellite.info.satname}
                </h2>
                <Button
                  onClick={handleRefresh}
                  className='text-sm bg-blue-500 hover:bg-blue-600'
                >
                  Refresh
                </Button>
              </div>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
            <div className='relative flex flex-grow'>
              <div className='w-full h-full '>
                <GLTFModelViewer
                  glbUrl='./Hubble.glb'
                  satelliteData={satelliteData}
                />
              </div>
              <div className='absolute right-0 w-1/4 h-full pl-4 text-white'>
                <h3 className='mb-2 text-lg font-semibold'>Satellite Data</h3>
                {satelliteData && (
                  <div>
                    <p>
                      <strong>Longitude:</strong>{' '}
                      {satelliteData.longitude.toFixed(4)}°
                    </p>
                    <p>
                      <strong>Latitude:</strong>{' '}
                      {satelliteData.latitude.toFixed(4)}°
                    </p>
                    <p>
                      <strong>Altitude:</strong>{' '}
                      {satelliteData.altitude.toFixed(2)} km
                    </p>
                    <p>
                      <strong>Velocity:</strong>{' '}
                      {satelliteData.velocityKmS.toFixed(2)} km/s
                    </p>
                  </div>
                )}
                <h3 className='mt-4 mb-2 text-lg font-semibold'>
                  Satellite Info
                </h3>
                {selectedSatellite && (
                  <div>
                    <p>
                      <strong>NORAD ID:</strong> {selectedSatellite.info.satid}
                    </p>
                    <p>
                      <strong>International Designator:</strong>{' '}
                      {selectedSatellite.info.intDesignator}
                    </p>
                    <p>
                      <strong>Launch Date:</strong>{' '}
                      {selectedSatellite.info.launchDate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
      {showXMTPModal && (
        <XMTPConversationModal onClose={() => setShowXMTPModal(false)} />
      )}
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='11' cy='11' r='8' />
      <path d='m21 21-4.3-4.3' />
    </svg>
  );
}
