/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface PaperPiece {
  id: string;
  left: number; // spawn position horizontally (%)
  sizeW: number; // width in pixels
  sizeH: number; // height in pixels
  color: string;
  duration: number; // speed of fall (seconds)
  delay: number; // entry stagger delay
  swayX: number; // horizontal drift amplitude
  rotTargetX: number; // 3D flipping transitions
  rotTargetY: number;
  rotTargetZ: number;
  isCircle: boolean;
}

export default function FallingPaper() {
  const [pieces, setPieces] = useState<PaperPiece[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Beautiful festive paper palette
  const paperColors = [
    '#ffd700', // Metallic Gold
    '#ff6b6b', // Coral Red
    '#f06292', // Cotton candy Pink
    '#ba68c8', // Soft Lilac
    '#4fc3f7', // Sky Blue
    '#4db6ac', // Mint Teal
    '#a1887f', // Rose Gold/Bronze
    '#ffffff', // Crisp White paper
    '#ffe082', // Warm Yellow
  ];

  useEffect(() => {
    // Detect mobile device to scale down particle density
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generatePiece = (id: string, initialSpawn = false): PaperPiece => {
    const sizeW = Math.random() * 8 + 6; // 6px to 14px width
    const sizeH = sizeW * (Math.random() * 1.5 + 0.6); // varying aspect ratios for realistic strips

    return {
      id,
      left: Math.random() * 100,
      sizeW,
      sizeH,
      color: paperColors[Math.floor(Math.random() * paperColors.length)],
      duration: Math.random() * 8 + 7, // Slow majestic weightless fall (7s to 15s)
      delay: initialSpawn ? Math.random() * -12 : Math.random() * 1.5, // stagger spawn keys
      swayX: Math.random() * 60 - 30, // sways left-to-right up to 30px
      rotTargetX: Math.random() * 720 - 360, // 3D flips during descent
      rotTargetY: Math.random() * 720 - 360,
      rotTargetZ: Math.random() * 360 - 180,
      isCircle: Math.random() > 0.85, // precalculate circle vs rectangular paper shred
    };
  };

  useEffect(() => {
    // Keep count strictly lightweight on mobile to preserve 60 FPS smoothly
    const limitCount = isMobile ? 22 : 65;
    
    // Populate an initial backdrop of paper shreds to start instantly falling
    const initialConfetti = Array.from({ length: limitCount }, (_, i) => generatePiece(`confetti-init-${i}`, true));
    setPieces(initialConfetti);

    // Active replenishment interval to trickle new falling paper pieces
    const interval = setInterval(() => {
      setPieces((prev) => {
        // Keep a steady beautiful storm of particles safely scaled for the device
        if (prev.length < limitCount) {
          return [...prev, generatePiece(`confetti-spawn-${Math.random()}`, false)];
        }
        return prev;
      });
    }, isMobile ? 600 : 450);

    return () => clearInterval(interval);
  }, [isMobile]);

  const handleComplete = (id: string) => {
    // Replace the fallen piece safely
    setPieces((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden select-none"
      id="falling-shreds-backdrop"
    >
      {pieces.map((piece) => {
        return (
          <motion.div
            key={piece.id}
            initial={{ 
              y: '-10vh', 
              x: `${piece.left}vw`, 
              opacity: 0, 
              rotateX: 0, 
              rotateY: 0, 
              rotate: 0 
            }}
            animate={{
              y: '110vh',
              x: [
                `${piece.left}vw`, 
                `${piece.left + piece.swayX / 12}vw`, 
                `${piece.left - piece.swayX / 12}vw`, 
                `${piece.left + piece.swayX / 8}vw`
              ],
              opacity: [0, 1, 1, 0.9, 0],
              rotateX: piece.rotTargetX,
              rotateY: piece.rotTargetY,
              rotate: piece.rotTargetZ,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'linear',
              opacity: { times: [0, 0.1, 0.85, 0.95, 1], duration: piece.duration },
            }}
            onAnimationComplete={() => handleComplete(piece.id)}
            className="absolute"
            style={{
              width: `${piece.sizeW}px`,
              height: `${piece.sizeH}px`,
              backgroundColor: piece.color,
              borderRadius: piece.isCircle ? '50%' : '1.5px',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </div>
  );
}
