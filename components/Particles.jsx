import React, { useEffect, useRef } from 'react';

export const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle class
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Start at random y position
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = 0; // Start from top
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1; // Slight horizontal movement
        this.speedY = Math.random() * 3 + 2; // Faster downward movement
        this.brightness = Math.random() * 0.5 + 0.5; // Random brightness
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset particle when it goes off screen
        if (this.y > canvas.height) {
          this.reset();
        }

        // Fade out as it falls
        this.brightness -= 0.005;
        if (this.brightness <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particle array
    const particleArray = [];
    const numberOfParticles = 1;

    for (let i = 0; i < numberOfParticles; i++) {
      particleArray.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Match background color with slight transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full' />
  );
};
