'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import Button from './Button';

const MoonViewer = ({ satelliteData, isEarthCentered }) => {
  const mountRef = useRef(null);
  const earthRef = useRef(null);
  const satelliteRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [satelliteInfo, setSatelliteInfo] = useState(null);
  const earthRotationSpeedRef = useRef(0.0007);
  const satelliteLightRef = useRef(null);
  const [labelPosition, setLabelPosition] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);

    mountRef.current.appendChild(renderer.domElement);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(0.75, 128, 128);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth.jpg');
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 5,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.scale.setScalar(1.5);
    earth.position.set(0, 0, 0); // Center the Earth
    scene.add(earth);
    earthRef.current = earth;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 10, 0);
    scene.add(directionalLight);

    const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 0.05);
    directionalLightLeft.position.set(-5, 5, 5);
    scene.add(directionalLightLeft);

    // Camera position
    camera.position.set(0, 0, 3);
    camera.lookAt(earth.position);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.copy(earth.position);
    controlsRef.current = controls;

    // Load satellite model
    const loader = new GLTFLoader();
    loader.load(
      './Hubble.glb',
      (gltf) => {
        const satellite = gltf.scene;
        satellite.scale.setScalar(0.0075);
        scene.add(satellite);
        satelliteRef.current = satellite;
        satellite.visible = false; // Hide initially

        // Add area light to the satellite
        const width = 0.1;
        const height = 0.1;
        const intensity = 5;
        const rectLight = new THREE.RectAreaLight(
          0xffffff,
          intensity,
          width,
          height
        );
        rectLight.position.set(0, 0.05, 0); // Slightly above the satellite
        rectLight.lookAt(0, 0, 0);
        satellite.add(rectLight);
        satelliteLightRef.current = rectLight;

        // Uncomment the next line to see the light helper (for debugging)
        // const rectLightHelper = new RectAreaLightHelper(rectLight);
        // satellite.add(rectLightHelper);
      },
      undefined,
      (error) => console.error('An error happened', error)
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      earth.rotation.y += earthRotationSpeedRef.current;
      camera.lookAt(earth.position); // Always look at Earth
      renderer.render(scene, camera);

      // Update satellite info for HTML display
      if (
        satelliteRef.current &&
        satelliteRef.current.visible &&
        satelliteData
      ) {
        const screenPosition = satelliteRef.current.position
          .clone()
          .project(camera);
        const x = (screenPosition.x * 0.5 + 0.5) * mountRef.current.clientWidth;
        const y =
          (-screenPosition.y * 0.5 + 0.5) * mountRef.current.clientHeight;
        setLabelPosition({ x, y });
      } else {
        setLabelPosition(null);
      }
    };
    animate();

    // Handle container resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Adjust camera and earth position for mobile devices
      if (width < height) {
        camera.position.z = 6;
        earth.scale.setScalar(1.3);
      } else {
        camera.position.z = 5;
        earth.scale.setScalar(1.5);
      }
      camera.lookAt(earth.position);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (isEarthCentered && earthRef.current && cameraRef.current) {
      gsap.to(earthRef.current.position, {
        y: 0,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (cameraRef.current) {
            cameraRef.current.lookAt(earthRef.current.position);
          }
        },
      });
    }
  }, [isEarthCentered]);

  useEffect(() => {
    if (
      satelliteData &&
      satelliteRef.current &&
      cameraRef.current &&
      controlsRef.current &&
      earthRef.current
    ) {
      console.log('Updating satellite position with data:', satelliteData);
      const { latitude, longitude, altitude, velocityKmS } = satelliteData;
      const lat = latitude * (Math.PI / 180);
      const lon = longitude * (Math.PI / 180);
      const radius = 1.15 + (altitude / 6371) * 0.3;
      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);

      satelliteRef.current.position.set(x, y, z);

      // Reset satellite rotation to 0 on all axes
      satelliteRef.current.rotation.set(0, 0, 0);

      satelliteRef.current.visible = true;

      // Adjust the light intensity based on the satellite's velocity
      if (satelliteLightRef.current) {
        const baseIntensity = 5;
        const velocityFactor = velocityKmS / 7.66; // 7.66 km/s is approximate velocity of ISS
        satelliteLightRef.current.intensity = baseIntensity * velocityFactor;
      }

      // Adjust Earth's rotation speed based on satellite velocity
      const baseRotationSpeed = 0.0007;
      const velocityFactor = velocityKmS / 7.66;
      earthRotationSpeedRef.current = baseRotationSpeed * velocityFactor;

      // Move camera to show both Earth and satellite
      gsap.to(cameraRef.current.position, {
        x: x * 1.5,
        y: y * 1.5,
        z: z * 1.5,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => {
          cameraRef.current.lookAt(earthRef.current.position);
          controlsRef.current.target.copy(earthRef.current.position);
        },
      });
    } else if (satelliteRef.current) {
      satelliteRef.current.visible = false;
    }
  }, [satelliteData]);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.zoomIn();
      setIsZoomedIn(true);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.zoomOut();
      setIsZoomedIn(false);
    }
  };

  return (
    <div className='relative w-full h-full'>
      <div ref={mountRef} className='w-full h-full' />
      {labelPosition && satelliteData && (
        <div
          className='absolute p-2 text-xs text-white bg-black bg-opacity-50 rounded'
          style={{
            left: `${labelPosition.x}px`,
            top: `${labelPosition.y}px`,
            transform: 'translate(50%, -100%)',
          }}
        >
          <p>Latitude: {satelliteData.latitude?.toFixed(2) ?? 'N/A'}°</p>
          <p>Longitude: {satelliteData.longitude?.toFixed(2) ?? 'N/A'}°</p>
          <p>Altitude: {satelliteData.altitude?.toFixed(2) ?? 'N/A'} km</p>
          <p>Velocity: {satelliteData.velocityKmS?.toFixed(2) ?? 'N/A'} km/s</p>
        </div>
      )}
    </div>
  );
};

export default MoonViewer;
