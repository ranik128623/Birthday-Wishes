/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, FileText, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GiftRevealProps {
  isActive: boolean;
}

export default function GiftReveal({ isActive }: GiftRevealProps) {
  const [boxState, setBoxState] = useState<'closed' | 'vibrating' | 'opened'>('closed');
  const [typedMessage, setTypedMessage] = useState<string[]>([]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTypingCompleted, setIsTypingCompleted] = useState(false);

  // Heartfelt letter broken down into lines/paragraphs for elegant typed styling
  const birthdaySentences = [
    "তোমার ভবিষ্যতের প্রতিটি দিন সুখ, সাফল্য, শান্তি আর সুস্বাস্থ্য দিয়ে ভরে উঠুক।",
    "তোমার প্রতিটি সুন্দর স্বপ্ন যেন এক এক করে পূরণ হয়।",
    "যেকোনো কঠিন পরিস্থিতিতেও শক্ত থেকো এবং সবসময় নিজের ওপর বিশ্বাস রেখো।",
    "বাবা-মায়ের যত্ন নিও এবং তাদের সাথে কাটানো প্রতিটি মুহূর্তকে পরম সুখে আগলে রেখো।",
    "তোমার জীবন সুন্দর স্মৃতি, ভালোবাসা আর অফুরন্ত আশীর্বাদে ধন্য হোক।",
    "তোমাকে আবারও জানাই শুভ জন্মদিন! ❤️"
  ];

  // Confetti triggering function
  const triggerConfettiSurprise = () => {
    // 1. Center burst
    confetti({
      particleCount: 160,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7', '#60a5fa', '#34d399'],
    });

    // 2. Scheduled side firework cascades
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#f43f5e', '#fbbf24', '#ffffff'],
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ec4899', '#f43f5e', '#fbbf24'],
      });
    }, 450);
  };

  // Trigger the opening routine
  const handleOpenGift = () => {
    if (boxState !== 'closed') return;
    
    // 1. Shift to vibrating
    setBoxState('vibrating');

    // 2. Wait 800ms for dramatic shaking, then open!
    setTimeout(() => {
      setBoxState('opened');
      triggerConfettiSurprise();
    }, 900);
  };

  // Automatically trigger if welcome layer already scroll-transitioned and user clicks anywhere
  useEffect(() => {
    if (isActive && boxState === 'closed') {
      // Auto-focus unboxer or guide them to tap the pulsing box
    }
  }, [isActive]);

  // Typing simulator effect
  useEffect(() => {
    if (boxState !== 'opened') return;

    if (typingIndex < birthdaySentences.length) {
      const sentence = birthdaySentences[typingIndex];
      let currentWordIndex = 0;
      const words = sentence.split(' ');
      let currentAccumulator = '';

      const wordInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
          currentAccumulator += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          setTypedMessage((prev) => {
            const next = [...prev];
            next[typingIndex] = currentAccumulator;
            return next;
          });
          currentWordIndex++;
        } else {
          clearInterval(wordInterval);
          // Wait briefly, then write the next sentence
          setTimeout(() => {
            setTypingIndex((prev) => prev + 1);
          }, 400);
        }
      }, 75); // speed of typing words (75ms/word creates a comfortable, luxury reading rhythm)

      return () => clearInterval(wordInterval);
    } else {
      setIsTypingCompleted(true);
      // Run celebratory confetti finish
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f43f5e'],
      });
    }
  }, [boxState, typingIndex]);

  return (
    <section 
      id="gift-reveal"
      className="relative min-h-[90vh] py-16 px-6 flex flex-col items-center justify-center font-sans"
    >
      <div className="max-w-3xl w-full flex flex-col items-center justify-center relative" id="gift-stage">
        
        <AnimatePresence mode="wait">
          {/* STAGE A: GIFT BOX */}
          {boxState !== 'opened' && (
            <motion.div
              key="gift-box-stage"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: boxState === 'vibrating' ? [0, -8, 8, -6, 6, -4, 4, 0] : 0,
                y: boxState === 'vibrating' ? [0, -4, 4, -4, 4, -2, 2, 0] : 0,
                rotate: boxState === 'vibrating' ? [0, -1.5, 1.5, -1, 1, -0.5, 0.5, 0] : 0
              }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ 
                duration: boxState === 'vibrating' ? 0.85 : 0.6,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center gap-6 cursor-pointer"
              onClick={handleOpenGift}
              id="interactive-box-wrapper"
            >
              <div className="text-center max-w-md select-none" id="unboxing-instructions">
                <h3 className="text-2xl font-serif font-bold text-glow-gold mb-2">🎁 তোমার জন্মদিনের উপহার প্রস্তুত!</h3>
                <p className="text-white/60 text-xs tracking-wider">উপহারের বাক্সটিতে চাপ দিয়ে তোমার বিশেষ সারপ্রাইজটি উন্মোচন করো</p>
              </div>

              {/* 3D Looking Vector Gift Box */}
              <div className="relative w-64 h-64 mt-4 filter drop-shadow-[0_15px_30px_rgba(244,63,94,0.3)] animate-float">
                {/* Lid component */}
                <motion.div
                  animate={{ 
                    y: boxState === 'vibrating' ? [-10, -18, -10] : 0,
                  }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-lg shadow-md z-20 flex justify-center"
                >
                  {/* Ribbon Bow */}
                  <div className="absolute -top-7 w-20 h-8 flex justify-center z-30" id="ribbon-bow-svg">
                    <svg viewBox="0 0 100 40" className="w-full h-full fill-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
                      {/* Left Loop */}
                      <path d="M 50 25 C 20 0, 10 15, 50 25 Z" />
                      {/* Right Loop */}
                      <path d="M 50 25 C 80 0, 90 15, 50 25 Z" />
                      {/* Center Knot */}
                      <circle cx="50" cy="25" r="7" className="fill-yellow-500" />
                    </svg>
                  </div>
                  {/* Horizontal gold wrap ribbon details */}
                  <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-sm"></div>
                </motion.div>

                {/* Box body */}
                <div className="absolute bottom-0 left-2 right-2 top-14 bg-gradient-to-b from-rose-600 via-rose-700 to-pink-800 rounded-b-xl shadow-inner z-10">
                  {/* Vertical Ribbon Wrap */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Heart className="text-rose-700 w-4.5 h-4.5 fill-current animate-pulse opacity-90" />
                  </div>
                </div>

                {/* Sparkling dots on top of the gift */}
                <div className="absolute inset-0 pointer-events-none z-30">
                  <div className="absolute top-4 left-6 text-yellow-200 animate-pulse"><Sparkles size={16} /></div>
                  <div className="absolute bottom-8 right-6 text-yellow-300 animate-bounce" style={{ animationDelay: '0.2s' }}><Sparkles size={12} /></div>
                </div>
              </div>

              {/* Shaking Action Prompt */}
              <div
                className={`px-6 py-2 rounded-full border text-xs tracking-wider font-semibold capitalize transition-all ${
                  boxState === 'vibrating' 
                    ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-200 animate-pulse' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20'
                }`}
                id="interactive-box-footer-badge"
              >
                {boxState === 'vibrating' ? '⚡ উপহার খোলা হচ্ছে...' : '👉 উপহারটি খুলতে বক্সে ক্লিক করো'}
              </div>
            </motion.div>
          )}

          {/* STAGE B: heart letter REVEALED */}
          {boxState === 'opened' && (
            <motion.div
              key="letter-stage"
              initial={{ scale: 0.92, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="glass-card w-full max-w-2xl px-6 py-8 md:px-12 md:py-12 rounded-3xl relative overflow-hidden z-20"
              id="heartfelt-letter-box"
            >
              {/* Gold luxury accents */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-yellow-400 to-fuchsia-500" />
              <div className="absolute top-6 left-6 text-rose-500/20"><Heart size={32} className="fill-current" /></div>
              <div className="absolute bottom-6 right-6 text-yellow-400/20"><Sparkles size={32} /></div>

              {/* Decorative Envelope Head */}
              <div className="flex flex-col items-center gap-3 mb-8 text-center" id="letter-identity-header">
                <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-300 animate-pulse">
                  <FileText size={20} />
                </div>
                <h4 className="text-sm font-semibold tracking-widest text-rose-300 uppercase">তোমার জন্য একটি চিঠিপত্র</h4>
                <div className="h-0.5 w-12 bg-rose-500/30 rounded-full"></div>
              </div>

              {/* Message Typing Body */}
              <div className="space-y-6 md:text-left select-text relative px-2" id="typed-letter-content">
                {typedMessage.map((line, idx) => {
                  const isLastSentence = idx === birthdaySentences.length - 1;
                  return (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`font-sans leading-relaxed tracking-wider select-text ${
                        isLastSentence
                          ? 'text-xl md:text-2xl font-serif text-center mt-10 font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-rose-300 to-pink-400 py-3 block border-t border-b border-white/5 text-glow-gold'
                          : 'text-white/90 text-sm md:text-base font-light'
                      }`}
                    >
                      {/* Check if line matches and apply custom emphasis tags */}
                      {line}
                    </motion.p>
                  );
                })}

                {/* Smooth flashing cursor placeholder while writing */}
                {!isTypingCompleted && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-4.5 bg-rose-400 ml-1 rounded-sm"
                  ></motion.span>
                )}
              </div>

              {/* Interactive letter receipt completion badge & smooth scroll button */}
              {isTypingCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className="flex flex-col items-center gap-5 mt-10"
                  id="receipt-and-scroll-cta-group"
                >
                  <div
                    className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 py-2 px-4 rounded-full max-w-xs mx-auto animate-pulse"
                    id="receipt-completion-badge"
                  >
                    <CheckCircle2 size={13} />
                    <span>ভালোবাসার সাথে উপহারটি উন্মোচন করা হয়েছে ❤️</span>
                  </div>

                  {/* Pulsing smooth scrolling button */}
                  <motion.button
                    onClick={() => {
                      const targetEl = document.getElementById('special-wishes');
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(251, 191, 36, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce mt-2 group border border-white/10"
                    id="goto-promises-scroll-btn"
                  >
                    <Sparkles size={14} className="text-yellow-100 group-hover:rotate-12 transition-transform" />
                    <span>🌟 আমার ৫টি সোনালী প্রতিশ্রুতি উন্মোচন করো 🌟</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
