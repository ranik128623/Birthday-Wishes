/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Smile, Trophy, Heart, Home, Star, Gift, Check, Lock, Sparkle } from 'lucide-react';
import { WishCard } from '../types';
import confetti from 'canvas-confetti';

export default function SpecialWishes() {
  const [unlockedWishes, setUnlockedWishes] = useState<string[]>([]);

  const wishes: WishCard[] = [
    {
      id: 'success',
      title: 'Success in Life',
      description: 'May your professional and personal endeavors soar. May every project you touch turn to gold, and may your talents be recognized and celebrated far and wide.',
      category: 'CAREER & GROWTH',
      iconName: 'Trophy',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      id: 'health',
      title: 'Good Health',
      description: 'May you be blessed with vibrant longevity, boundless biological energy, and mental peace. May you stay protected, strong, and radiant every single day.',
      category: 'VITALITY & WELLNESS',
      iconName: 'Heart',
      gradient: 'from-rose-400 to-pink-500',
    },
    {
      id: 'family',
      title: 'Family Happiness',
      description: 'May your household remain a safe haven of laughter, deep warmth, and ultimate harmony. Cherish every single second and make gorgeous, timeless memories with your parents.',
      category: 'LOVE & HARMONY',
      iconName: 'Home',
      gradient: 'from-emerald-400 to-cyan-500',
    },
    {
      id: 'dreams',
      title: 'Achievement of Dreams',
      description: 'May every lofty goal, silent prayer, and personal aspiration materialize one-by-one. Never stop believing in your beautiful potential; the cosmos is aligning for you.',
      category: 'ASPIRATION & PURPOSE',
      iconName: 'Sparkles',
      gradient: 'from-fuchsia-400 to-violet-500',
    },
    {
      id: 'smiles',
      title: 'Endless Smiles',
      description: 'May sorrow stay far from your threshold. May genuine warmth, joy, and hearty humor paint your lips day-in and day-out, attracting happiness wherever you walk.',
      category: 'JOY & OPTIMISM',
      iconName: 'Smile',
      gradient: 'from-blue-400 to-indigo-500',
    },
  ];

  // Synthesize a beautiful harmonic celebratory tine chime
  const playUnwrapChime = (index: number) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      
      const ctx = new AudioCtxClass();
      
      // Beautiful ascending celebratory pentatonic scale frequencies
      const scale = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5, D5, E5, G5, A5
      const baseFreq = scale[index % scale.length];

      // Master Node Chain
      const masterVolume = ctx.createGain();
      masterVolume.gain.setValueAtTime(0.25, ctx.currentTime);
      masterVolume.connect(ctx.destination);

      // 1. Crystal Bell Sine Voice
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      bellGain.gain.setValueAtTime(0.15, ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      // 2. Sparkle Higher Harmonic Overtone
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      overtoneGain.gain.setValueAtTime(0.05, ctx.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      // Connect nodes
      bellOsc.connect(bellGain);
      bellGain.connect(masterVolume);
      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(masterVolume);

      // Start chime
      bellOsc.start();
      bellOsc.stop(ctx.currentTime + 1.3);
      overtoneOsc.start();
      overtoneOsc.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.warn("AudioContext chime blocked or not supported on device.", e);
    }
  };

  // Perform unwrap animations
  const handleUnwrapWish = (id: string, index: number, event: React.MouseEvent) => {
    if (unlockedWishes.includes(id)) return;

    // Trigger audio tine note
    playUnwrapChime(index);

    // Confetti burst from click position coordinates
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const xRatio = (rect.left + rect.width / 2) / window.innerWidth;
    const yRatio = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x: xRatio, y: yRatio },
      colors: ['#fbbf24', '#f43f5e', '#a855f7', '#60a5fa'],
    });

    const updated = [...unlockedWishes, id];
    setUnlockedWishes(updated);

    // Grand finale screen confetti cascade when all 5 are opened!
    if (updated.length === wishes.length) {
      setTimeout(() => {
        // Continuous fireworks showers for 2.5 seconds
        const end = Date.now() + 2500;
        const colors = ['#f43f5e', '#ec4899', '#fbbf24', '#38bdf8', '#a855f7'];

        (function frame() {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: colors
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }, 600);
    }
  };

  const renderIcon = (name: string) => {
    const iconProps = { className: `w-6 h-6 text-white` };
    switch (name) {
      case 'Trophy':
        return <Trophy {...iconProps} />;
      case 'Heart':
        return <Heart {...iconProps} />;
      case 'Home':
        return <Home {...iconProps} />;
      case 'Sparkles':
        return <Sparkles {...iconProps} />;
      case 'Smile':
        return <Smile {...iconProps} />;
      default:
        return <Star {...iconProps} />;
    }
  };

  return (
    <section 
      id="special-wishes"
      className="relative py-12 px-6 max-w-6xl mx-auto flex flex-col items-center gap-12 font-sans select-none scroll-mt-24"
    >
      {/* Decorative overhead details */}
      <div className="text-center space-y-4" id="special-wishes-header">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/25 text-[10px] font-bold tracking-[0.25em] text-pink-300 uppercase inline-flex items-center gap-1.5"
          >
            <Sparkle size={10} className="animate-spin text-amber-300" />
            GOLDEN PROMISES FOR A BRIGHT FUTURE
          </motion.div>
        </div>

        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-serif font-bold text-glow-gold tracking-tight"
        >
          Special Birthday Wishes For You
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          className="text-white/70 max-w-lg mx-auto text-xs md:text-sm font-light select-text"
        >
          Tap the locked golden packages below one-by-one to unwrap my special blessings for your future life.
        </motion.p>
      </div>

      {/* Gamification progress bar */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xl glass" id="unlock-tracker-panel">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-rose-300 tracking-wider flex items-center gap-1">
            🎁 BLESSINGS UNWRAPPED:
          </span>
          <span className="font-mono text-amber-200 bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
            {unlockedWishes.length} of {wishes.length} Revealed
          </span>
        </div>
        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            style={{ width: `${(unlockedWishes.length / wishes.length) * 100}%` }}
          />
        </div>
        {unlockedWishes.length === wishes.length ? (
          <div className="text-[11px] text-emerald-400 text-center font-bold tracking-widest uppercase mt-0.5 animate-pulse flex items-center justify-center gap-1">
            <Check size={11} /> All wishes unlocked! May your year ahead be majestic! ❤️
          </div>
        ) : (
          <div className="text-[10px] text-white/40 text-center font-medium tracking-wide">
            👆 Touch each sealed box below to unfold the magic inside!
          </div>
        )}
      </div>

      {/* Grid containing individual wrapped packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full" id="wish-cards-grid">
        {wishes.map((item, index) => {
          const isUnlocked = unlockedWishes.includes(item.id);
          
          return (
            <div key={item.id} className="relative h-[19.5rem] w-full perspective-1000" id={`wish-card-container-${item.id}`}>
              <motion.div
                animate={{ rotateY: isUnlocked ? 0 : 0 }} // Flip animation transition
                className="w-full h-full relative"
              >
                <AnimatePresence mode="wait">
                  {/* CARD FRONT: SEALED GOLD GIFT WRAP ENVELOPE */}
                  {!isUnlocked ? (
                    <motion.div
                      key="card-sealed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      onClick={(e) => handleUnwrapWish(item.id, index, e)}
                      whileHover={{ y: -6, scale: 1.03, boxShadow: '0 0 25px rgba(251, 191, 36, 0.25)' }}
                      className="absolute inset-0 cursor-pointer rounded-2xl glass-card flex flex-col items-center justify-center p-6 border border-amber-500/25 bg-gradient-to-b from-amber-950/20 via-[#0e071a]/85 to-indigo-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center overflow-hidden group select-none"
                    >
                      {/* Ambient corner flares */}
                      <div className="absolute top-3 left-3 text-amber-500/20 group-hover:text-amber-500/40 transition-colors"><Lock size={14} /></div>
                      <div className="absolute bottom-3 right-3 text-amber-500/20 group-hover:text-amber-500/40 transition-colors"><Sparkles size={14} /></div>

                      {/* Moving shiny diagonal bar detail */}
                      <span className="absolute inset-0 bg-white/5 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></span>

                      {/* Wrapping physical looks */}
                      <div className="relative w-20 h-20 bg-amber-500/10 rounded-full border border-amber-400/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-400/20 transition-all duration-300 shadow-inner">
                        <Gift className="w-10 h-10 text-amber-400 fill-current animate-bounce" />
                      </div>

                      <span className="text-[9px] font-mono tracking-[0.2em] text-amber-300 font-bold uppercase mb-1">
                        GOLDEN BLESSING #{index + 1}
                      </span>
                      <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-100 transition-colors">
                        🔓 Unwrap Sweet Promise
                      </h3>
                      <p className="text-[10px] text-white/40 mt-1 uppercase font-semibold tracking-wider">
                        TAP TO SECURE SURPRISE
                      </p>
                    </motion.div>
                  ) : (
                    /* CARD BACK: REVEALED SWEET WISH DETAILS */
                    <motion.div
                      key="card-revealed"
                      initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      className="absolute inset-0 rounded-2xl glass-card p-6 border border-white/12 bg-gradient-to-b from-white/5 to-[#12071f]/65 shadow-[0_12px_40px_rgba(0,0,0,0.65)] flex flex-col gap-4 overflow-hidden group select-text"
                    >
                      {/* Absolute blur category splotch */}
                      <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>

                      {/* Revealed checkmark absolute badge */}
                      <div className="absolute top-3 left-3 bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-2 rounded-full text-emerald-400 text-[8px] font-bold tracking-widest uppercase flex items-center gap-0.5 animate-pulse">
                        <Check size={8} /> Opened
                      </div>

                      {/* Layout Header block */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Category tag */}
                        <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase font-semibold">
                          {item.category}
                        </span>

                        {/* Styled Icon Wrapper with its matching theme gradient indicator */}
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300`}>
                          {renderIcon(item.iconName)}
                        </div>
                      </div>

                      {/* Accent divider */}
                      <div className="h-[1px] w-full bg-white/5"></div>

                      {/* Core Card Details */}
                      <div className="space-y-2 select-text">
                        <h3 className="text-lg font-serif font-bold text-white group-hover:text-rose-200 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-white/70 text-xs leading-relaxed font-light select-text">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
