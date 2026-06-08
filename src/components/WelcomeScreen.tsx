/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Gift, ChevronDown, Sparkles, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FloatingBalloon } from '../types';
import { musicEngine } from '../utils/audio';

interface WelcomeScreenProps {
  onOpenGift: () => void;
  name: string;
  relation: string;
}

export default function WelcomeScreen({ onOpenGift, name, relation }: WelcomeScreenProps) {
  const [balloons, setBalloons] = useState<FloatingBalloon[]>([]);

  const handleOpenButtonClick = () => {
    try {
      musicEngine.play();
    } catch (e) {
      console.warn("Sound play exception:", e);
    }
    onOpenGift();
  };

  // Pastel luxury balloon colors
  const balloonColors = [
    '#f43f5e', // deep rose
    '#ec4899', // pink
    '#d946ef', // fuchsia
    '#a855f7', // purple
    '#eab308', // amber golden
    '#3b82f6', // sky-sapphire
  ];

  useEffect(() => {
    // Generate a beautiful, elegant bouquet of wandering floating birthday balloons
    const list: FloatingBalloon[] = [];
    for (let i = 0; i < 18; i++) {
      list.push({
        id: i,
        color: balloonColors[i % balloonColors.length],
        driftX: Math.random() * 60 - 30, // side sway
        duration: Math.random() * 10 + 12, // slow, comforting drifting speed
        delay: Math.random() * 5,
        left: Math.random() * 90 + 5, // random vertical lane
        size: Math.random() * 18 + 26, // balloon size diameter (26px - 44px)
      });
    }
    setBalloons(list);
  }, []);

  return (
    <section 
      id="welcome-screen"
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden font-sans"
    >
      {/* Absolute floating balloons container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" id="ambient-balloons">
        {balloons.map((b) => (
          <div
            key={b.id}
            className="absolute bottom-[-100px] flex flex-col items-center"
            style={{
              left: `${b.left}%`,
              animation: `balloon-drift ${b.duration}s linear infinite`,
              animationDelay: `${b.delay}s`,
              '--drift-x': `${b.driftX}px`,
            } as any}
          >
            {/* Balloon body */}
            <div
              className="rounded-t-full rounded-b-3xl relative opacity-85 shadow-md flex items-center justify-center"
              style={{
                width: `${b.size}px`,
                height: `${b.size * 1.2}px`,
                backgroundColor: b.color,
                boxShadow: `inset -6px -10px 15px rgba(0,0,0,0.2), 0 10px 20px ${b.color}25`,
              }}
            >
              {/* Highlight glossy patch */}
              <div className="absolute top-2 left-2 w-2 h-4 bg-white/40 rounded-full rotate-[-15deg]"></div>
            </div>
            {/* Balloon knot */}
            <div 
              className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px]"
              style={{ borderBottomColor: b.color }}
            />
            {/* Balloon string thread */}
            <div className="w-[0.5px] h-12 bg-white/20 origin-top rotate-[-2deg] animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Foreground Container with Glass Cards for High Contrast readable text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="glass-card max-w-2xl px-8 py-12 md:px-12 md:py-16 rounded-3xl mx-auto z-10 select-text flex flex-col items-center gap-6 relative"
        id="hero-glass-box"
      >
        {/* Soft magical sparkling decorations in the corners of the card */}
        <div className="absolute top-4 left-4 text-rose-500/30 w-8 h-8 animate-pulse"><Sparkles size={24} /></div>
        <div className="absolute top-6 right-6 text-amber-500/30 w-6 h-6 animate-float"><Star size={20} /></div>
        <div className="absolute bottom-6 left-6 text-fuchsia-500/30 w-6 h-6 animate-float-slow"><Heart size={20} /></div>

        {/* Premium badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold tracking-widest text-rose-300 uppercase flex items-center gap-1.5 animate-bounce"
          id="celebration-badge"
        >
          <Sparkles size={11} className="text-amber-400" />
          তোমার জন্য একটি বিশেষ সারপ্রাইজ অপেক্ষা করছে
        </motion.div>

        {/* Heading */}
        <div className="space-y-4" id="hero-headings">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-glow-pink select-text"
          >
            🎉 শুভ জন্মদিন, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-fuchsia-400">
              {relation} {name}
            </span>{' '}
            🎂
          </motion.h1>
 
          {/* Heartfelt Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="text-white/80 font-sans text-base md:text-lg font-light leading-relaxed max-w-lg mx-auto"
          >
            আজ তোমার বিশেষ দিন, আর পৃথিবীর সব সুখ, হাসি আর অফুরন্ত আশীর্বাদ যেন সবসময় তোমারই থাকে।
          </motion.p>
        </div>

        {/* Sparkle decorative line */}
        <div className="w-1/3 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent my-1"></div>

        {/* Primary Glowing Call To Action Button */}
        <motion.button
          onClick={handleOpenButtonClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="animate-pulse-glow group cursor-pointer relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-8 py-4 rounded-full text-white font-bold text-base shadow-xl border border-white/20 transition-all flex items-center gap-3"
          id="reveal-gift-button"
        >
          {/* Internal moving gloss flash reflection */}
          <span className="absolute inset-0 bg-white/25 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></span>
          
          <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 text-amber-100" />
          <span className="tracking-wide">🎁 তোমার উপহারটি খোলো</span>
        </motion.button>
      </motion.div>
 
      {/* Gentle Scroll Indicator */}
      <div 
        onClick={handleOpenButtonClick}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors cursor-pointer z-10"
        id="scroll-helper"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase">এখানে ক্লিক করো অথবা নিচে যাও</span>
        <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  );
}
