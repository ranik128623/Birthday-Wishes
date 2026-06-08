/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Particle } from '../types';

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 65;

    // Sparkle colors (rose golds, warm purples, pastel soft violets, champagne gold)
    const sparkleColors = [
      'rgba(244, 63, 94, ', // rose-500
      'rgba(217, 70, 239, ', // fuchsia-500
      'rgba(251, 191, 36, ', // amber-400
      'rgba(167, 139, 250, ', // violet-400
      'rgba(253, 244, 255, ', // warm whitish-pink
    ];

    const createParticle = (width: number, height: number, initY = false): Particle => {
      const colorBase = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      return {
        id: Math.random(),
        x: Math.random() * width,
        y: initY ? Math.random() * height : height + 10,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.15,
        color: colorBase,
        opacity: Math.random() * 0.5 + 0.2,
      };
    };

    // Initialize particles across the entire height initially
    const initParticles = (width: number, height: number) => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(createParticle(width, height, true));
      }
    };

    // Resize observer logic (robust, anti-stretching container resize strategy)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        initParticles(width, height);
      }
    });

    resizeObserver.observe(container);

    // Initial setup in case ResizeObserver triggers asynchronously
    const initialWidth = container.clientWidth;
    const initialHeight = container.clientHeight;
    canvas.width = initialWidth;
    canvas.height = initialHeight;
    initParticles(initialWidth, initialHeight);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        // Drift upwards
        p.y -= p.speed;
        // Subtle sine horizontal wave movement
        p.x += Math.sin(p.y / 30) * 0.2;

        // Soft twinkle breathing effect
        p.opacity += (Math.random() - 0.5) * 0.04;
        if (p.opacity < 0.1) p.opacity = 0.15;
        if (p.opacity > 0.8) p.opacity = 0.8;

        // Draw particle
        ctx.beginPath();
        // Generate glowing gradients for champagne stars
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        grad.addColorStop(0, `${p.color}${p.opacity})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw sparkling diamond center for some particles
        if (index % 5 === 0) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity + 0.1})`;
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Recycle particles that drift out of view
        if (p.y < -15 || p.x < -15 || p.x > canvas.width + 15) {
          particles[index] = createParticle(canvas.width, canvas.height);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="background-particles"
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 bg-gradient-to-b from-[#0a0512] via-[#0f0a1d] to-[#040108] overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
