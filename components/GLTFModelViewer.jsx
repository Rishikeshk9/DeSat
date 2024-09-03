'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GLTFModelViewer = ({ glbUrl, satelliteData }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef(null);
  const satelliteRef = useRef(null);
  const globeRef = useRef(null);
  const cloudsRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });

    const starVertices = [];
    for (let i = 0; i < 20000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    scene.add(stars);

    // Add globe with Earth texture, normal map, and specular map
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth.jpg');
    const earthNormalMap = textureLoader.load('/earth_normal_map.tif');
    const earthSpecularMap = textureLoader.load('/earth_specular_map.tif');
    const cloudsTexture = textureLoader.load('/earth_clouds.jpg');

    const globeGeometry = new THREE.SphereGeometry(0.9, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      normalMap: earthNormalMap,
      specularMap: earthSpecularMap,
      specular: new THREE.Color(0x333333),
      shininess: 3,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeRef.current = globe;
    scene.add(globe);

    // Add clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(0.91, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.3,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsRef.current = clouds;
    scene.add(clouds);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        const object = gltf.scene;
        // Scale down the satellite model significantly
        object.scale.setScalar(0.01);

        satelliteRef.current = object;
        scene.add(object);

        // Position the camera closer to the satellite
        const initialCameraDistance = 0.1;
        camera.position.set(
          initialCameraDistance,
          initialCameraDistance,
          initialCameraDistance
        );
        camera.lookAt(object.position);
        controls.target.copy(object.position);

        // Position the satellite light

        // Initial resize to fit the container
        handleResize();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('An error happened', error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.0002;
      }
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.00005; // Reduced by half
      }
      if (satelliteRef.current && cameraRef.current) {
        cameraRef.current.lookAt(satelliteRef.current.position);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle container resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [glbUrl]);

  const updateSatellitePosition = () => {
    if (!satelliteRef.current || !satelliteData) return;

    const { latitude, longitude, altitude } = satelliteData;

    // Convert latitude and longitude to radians
    const lat = latitude * (Math.PI / 180);
    const lon = longitude * (Math.PI / 180);

    // Calculate the position (doubled the distance)
    const radius = 1 + (altitude / 6371) * 0.2; // Doubled the scaled altitude
    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    satelliteRef.current.position.set(x, y, z);
    satelliteRef.current.rotation.x = Math.PI * 2;
    satelliteRef.current.rotation.z = Math.PI * 2;

    // Update camera position to follow the satellite
    if (cameraRef.current && controlsRef.current) {
      const cameraDistance = 0.1; // Reduced camera distance for closer view
      cameraRef.current.position.set(
        x + cameraDistance,
        y + cameraDistance,
        z + cameraDistance
      );
      controlsRef.current.target.set(x, y, z);
    }
  };

  useEffect(() => {
    if (satelliteRef.current && satelliteData) {
      updateSatellitePosition();
    }
  }, [satelliteData]);

  return <div ref={mountRef} className='w-full h-full' />;
};

export default GLTFModelViewer;
