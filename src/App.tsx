/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, Lock } from 'lucide-react';
import BackgroundParticles from './components/BackgroundParticles';
import WelcomeScreen from './components/WelcomeScreen';
import GiftReveal from './components/GiftReveal';
import SpecialWishes from './components/SpecialWishes';
import MusicPlayer from './components/MusicPlayer';
import AdminPanel from './components/AdminPanel';
import FallingPaper from './components/FallingPaper';
import { getBirthdayConfig, BirthdayConfig } from './lib/firebase';

export default function App() {
  const [unlockedSurprise, setUnlockedSurprise] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPassKeyPrompt, setShowPassKeyPrompt] = useState(false);
  const [passKeyValue, setPassKeyValue] = useState('');
  const [passKeyError, setPassKeyError] = useState('');
  
  const [config, setConfig] = useState<BirthdayConfig>({
    id: 'active',
    name: 'Naim',
    relation: 'My Dear Friend',
    date: 'June 8, 2026',
  });
  
  const giftSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Sync customizable URL parameter keys for robust custom link distribution
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    const urlRelation = params.get('relation');
    const urlDate = params.get('date');
    const isAdminParam = params.get('admin') === 'true' || params.get('edit') === 'true';

    if (isAdminParam) {
      setShowAdmin(true);
    }

    if (urlName || urlRelation || urlDate) {
      setConfig({
        id: 'url-param',
        name: urlName || 'Naim',
        relation: urlRelation || 'Dear',
        date: urlDate || 'June 8, 2026',
      });
    } else {
      // 2. Fetch live data from Firestore cloud database instance
      getBirthdayConfig()
        .then((cloudConfig) => {
          setConfig(cloudConfig);
        })
        .catch((e) => {
          console.warn("Failed loading active cloud configurator", e);
        });
    }
  }, []);

  // Smooth scroll handler to scroll down to the unwrapping zone
  const handleOpenGiftTransition = () => {
    setUnlockedSurprise(true);
    
    // Smooth scrolling defer after components render
    setTimeout(() => {
      if (giftSectionRef.current) {
        giftSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07030e] text-white selection:bg-rose-500/30 selection:text-rose-200 overflow-x-hidden antialiased">
      {/* 1. Global Ambient Particle Backdrop */}
      <BackgroundParticles />

      {/* 2. Top Minimal Luxury Overlay Frame (Header details of the birthday) */}
      <header className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center select-none max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onDoubleClick={() => {
            setShowPassKeyPrompt(true);
            setPassKeyValue('');
            setPassKeyError('');
          }}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          title="কাস্টমাইজেশন আনলক করতে ডাবল-ক্লিক করুন"
          id="header-brand-logo"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart size={14} className="text-white fill-current animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-[0.2em] text-glow-gold font-sans select-none">
            উৎসব শুধু তোমার জন্য
          </span>
        </motion.div>

        {/* Dynamic tracker badge updated automatically */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-semibold tracking-wider text-rose-300 flex items-center gap-1.5"
          id="header-date-badge"
        >
          <Calendar size={11} className="text-rose-400" />
          <span>{config.date}</span>
        </motion.div>
      </header>

      {/* 3. Core Single-Page Section Layout */}
      <main className="relative z-10 w-full" id="main-birthday-content">
        {/* Layer 1: Welcome Screen (Hero Zone) */}
        <WelcomeScreen 
          onOpenGift={handleOpenGiftTransition} 
          name={config.name}
          relation={config.relation}
        />

        {/* Layer 2 and 3: Birthday surprise reveal zones */}
        <AnimatePresence>
          {unlockedSurprise && (
            <>
              {/* Dynamic falling paper shreds floating all over the unlocked website */}
              <FallingPaper />

              <motion.div
                ref={giftSectionRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="w-full flex flex-col gap-16 pb-24"
                id="surprise-content-unfolded"
              >
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Layer 2: The Gift Box Unwrapping and Letter typing */}
                <GiftReveal isActive={unlockedSurprise} />

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

                {/* Layer 3: The Special Staggered Wish Cards */}
                <SpecialWishes />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      {/* 4. Music Player Console & Deluxe Dynamic Customizer panel */}
      <MusicPlayer />
      
      {/* Admin Passkey Verification Prompt Modal */}
      <AnimatePresence>
        {showPassKeyPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 font-sans select-none">
            {/* Soft backdrop click dismiss helper */}
            <div className="absolute inset-0" onClick={() => setShowPassKeyPrompt(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#0a0514]/95 border border-rose-500/20 rounded-2xl p-6 md:p-8 shadow-2xl text-center glass"
              id="admin-passkey-prompt-modal"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-amber-500 rounded-t-2xl" />

              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
                <Lock size={20} />
              </div>
              
              <h3 className="text-sm font-bold uppercase text-white tracking-widest mb-1">
                কাস্টমাইজেশন প্যানেল
              </h3>
              <p className="text-[11px] text-white/50 mb-6 font-light">
                কাস্টমাইজেশন অপশনগুলো আনলক করতে অনুগ্রহ করে আপনার গোপন পাসকোডটি লিখুন।
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (passKeyValue.trim() === '128623') {
                  setShowAdmin(true);
                  setShowPassKeyPrompt(false);
                } else {
                  setPassKeyError('❌ ভুল পাসকোড! প্রবেশাধিকারে বাধা।');
                }
              }} className="space-y-4">
                <input
                  type="password"
                  value={passKeyValue}
                  onChange={(e) => {
                    setPassKeyValue(e.target.value);
                    setPassKeyError('');
                  }}
                  placeholder="••••••"
                  className="w-full text-center bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-3 font-mono tracking-[0.5em] text-sm text-white focus:outline-none transition-colors"
                  autoFocus
                />

                {passKeyError && (
                  <p className="text-[10px] text-rose-400 font-semibold animate-pulse">{passKeyError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassKeyPrompt(false)}
                    className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl py-2 px-3 text-xs font-semibold transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 cursor-pointer bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2 px-3 text-xs font-bold transition-colors shadow-lg shadow-rose-500/25"
                  >
                    আনলক করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showAdmin && (
        <AdminPanel 
          currentConfig={config} 
          onConfigChange={(updated) => setConfig(updated)} 
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* 5. Minimal Cinematic design details in background margins */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-12 hidden lg:flex select-none opacity-30 tracking-[0.2em] font-mono text-[9px] text-white/50 writing-vertical" id="margin-tag-left">
        <span>✨ স্বর্গীয় অনুভূতি ✨</span>
        <span>•</span>
        <span>শান্তি • সাফল্য • স্মৃতি</span>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-12 hidden lg:flex select-none opacity-30 tracking-[0.2em] font-mono text-[9px] text-white/50 writing-vertical" id="margin-tag-right">
        <span>🎉 শুভ জন্মদিন 🎉</span>
        <span>•</span>
        <span>সুখ ও সমৃদ্ধি</span>
      </div>

      {/* 6. Premium Crafted Footer Section */}
      <footer className="relative z-10 py-10 w-full border-t border-white/5 text-center mt-auto select-none" id="birthday-footer-row">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/55 font-light animate-pulse" id="footer-greetings">
            <span>বিশেষ এক মানুষের জন্য পরম ভালোবাসায় তৈরি</span>
            <span className="text-rose-500 text-glow-pink">❤️</span>
          </div>
          <p className="text-[10px] font-mono text-white/20 select-text">
            © ২০২৬ • তোমার জন্য অফুরন্ত আশীর্বাদ ও অসাধারণ সাফল্যের শুভকামনা।
          </p>
        </div>
      </footer>
    </div>
  );
}
