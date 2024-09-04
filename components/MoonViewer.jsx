'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

const MoonViewer = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    mountRef.current.appendChild(renderer.domElement);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(0.75, 128, 128); // Increased segments for smoother sphere
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth.jpg');
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Improve texture sharpness
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 5,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.scale.setScalar(1.5); // Increase the size of the earth
    earth.position.set(0, -2.5, 0); // Start position below the view
    scene.add(earth);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // Soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 10, 0); // Position light to the right of the earth
    scene.add(directionalLight);

    const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 0.05);
    directionalLightLeft.position.set(-5, 5, 5); // Position light to the left of the earth
    scene.add(directionalLightLeft);

    // Camera position
    camera.position.z = 2.5;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;

    // Ease-in animation with 2-second delay
    setTimeout(() => {
      gsap.to(earth.position, {
        y: -1.35,
        duration: 2,
        ease: 'power2.out',
      });
    }, 2000);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Rotate the earth
      earth.rotation.y += 0.0007; // Adjust this value to change rotation speed

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
      renderer.setPixelRatio(window.devicePixelRatio); // Ensure proper pixel ratio on resize
    };

    // Initial resize
    handleResize();

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className='w-full h-full' />;
};

export default MoonViewer;
