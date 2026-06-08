/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Sparkles, Check, Link, Globe, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import { updateBirthdayConfig, BirthdayConfig } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  currentConfig: BirthdayConfig;
  onConfigChange: (updated: BirthdayConfig) => void;
}

export default function AdminPanel({ currentConfig, onConfigChange }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentConfig.name);
  const [relation, setRelation] = useState(currentConfig.relation);
  const [date, setDate] = useState(currentConfig.date);
  const [passcode, setPasscode] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Synchronize dynamic updates loaded from Firestore cloud trigger after initial mount
  React.useEffect(() => {
    setName(currentConfig.name);
    setRelation(currentConfig.relation);
    setDate(currentConfig.date);
  }, [currentConfig]);

  // Simple elegant chime sound for successful publication
  const playSuccessChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5 chime
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.1);
    } catch (e) {
      // Ignored if blocked
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    // Human passcode check to protect the creator's live site
    if (passcode.trim() !== '1206') {
      setErrorMessage('❌ Invalid passcode! Hint: Use the default passcode "1206" to authenticate.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('❌ Recipient name is required!');
      return;
    }

    if (!relation.trim()) {
      setErrorMessage('❌ Salutation / greeting prefix is required!');
      return;
    }

    setIsSaving(true);
    try {
      const newConfig = {
        name: name.trim(),
        relation: relation.trim(),
        date: date.trim() || 'June 8, 2026',
      };

      // 1. Write update to Firestore database
      await updateBirthdayConfig(newConfig);

      // 2. Feed changes back to Parent App state
      onConfigChange({
        id: 'active',
        ...newConfig
      });

      // 3. Trigger success animations and sounds
      playSuccessChime();
      setSaveSuccess(true);
      
      // Beautiful burst of golden achievement stars!
      confetti({
        particleCount: 50,
        spread: 45,
        colors: ['#fbbf24', '#f43f5e', '#a855f7'],
      });

      // Reset fields
      setPasscode('');
      
      // Hide victory box after 4.5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4500);

    } catch (err) {
      setErrorMessage('❌ Failed to update live configuration. Make sure you are online.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPersonalizedLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Build query parameters
    const params = new URLSearchParams();
    params.set('name', name);
    params.set('relation', relation);
    params.set('date', date);
    
    const finalUrl = `${baseUrl}?${params.toString()}`;
    
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <>
      {/* Floating Gear Settings Launcher */}
      <div className="fixed top-6 right-20 z-50 select-none">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08, rotate: 30 }}
          whileTap={{ scale: 0.93 }}
          className="cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-100 border border-amber-500/30 p-2.5 rounded-full shadow-lg shadow-black/45 flex items-center justify-center gap-1.5 font-sans font-semibold text-xs transition-all relative group"
          id="admin-launcher-button"
        >
          <Settings size={15} className="animate-spin duration-3000 group-hover:text-amber-100" />
          <span className="hidden sm:inline pr-1">PERSONALIZATION PANEL</span>
          {/* Heart alert ping */}
          <span className="absolute top-0 right-0 flex h-2.5 w-2.5 translate-x-1 -translate-y-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        </motion.button>
      </div>

      {/* Admin Panel Modal Overlay Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 font-sans select-none">
            {/* Soft background clicks minimize overlay */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            {/* Main Deluxe Dashboard Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#0f0a1d]/95 rounded-3xl border border-amber-500/20 p-6 md:p-8 shadow-2xl shadow-amber-500/5 select-text glass"
              id="admin-dashboard-panel"
            >
              {/* Premium neon edge accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500" />

              {/* Header section */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5" id="admin-header-row">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-white tracking-widest">PERSONALIZATION PANEL</h3>
                    <p className="text-[10px] text-white/50 tracking-wide font-medium">Design dynamic layouts for different friends</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
                  id="admin-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick instructions help section */}
              <div className="mb-5 bg-white/5 border border-white/10 p-3.5 rounded-xl flex gap-2.5 select-text">
                <HelpCircle size={32} className="text-amber-300 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-white/80 select-text">
                  <span className="font-semibold text-amber-200">How this works:</span> You can publish names to the <span className="font-semibold">Live website</span> instantly! Since data sits on Firestore, visiting your main link will show whoever was published last. Perfect for swapping greetings on the fly!
                </div>
              </div>

              {/* Config Form wrapper */}
              <form onSubmit={handlePublish} className="space-y-4">
                {/* Greeting / Relation prefix */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                    Greeting Prefix / Salutation
                  </label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    placeholder="e.g. My Dear Friend, Respected, Dear"
                    maxLength={70}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-white/40">Greeting wording shown before the name (e.g. "My Dear Friend").</span>
                </div>

                {/* Birthday Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                    Celebrity Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Naim, Puja Didi"
                    maxLength={50}
                    required
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-white/40">Target name of the birthday star.</span>
                </div>

                {/* Event Celebration Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-rose-300 uppercase tracking-widest">
                    Celebration Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. June 12, 2026, or June 8"
                    maxLength={35}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-white/40">Dynamic date updating top-right layout badges automatically.</span>
                </div>

                {/* Security Passcode checks */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center gap-1">
                      <Lock size={12} /> Admin Auth Passcode
                    </label>
                    <span className="text-[9px] bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/20 font-mono font-black">
                      Passcode: 1206
                    </span>
                  </div>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter 1206 to authorize..."
                    className="w-full bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono tracking-widest"
                  />
                </div>

                {/* Error messages display */}
                {errorMessage && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium animate-pulse" id="admin-error-text">
                    {errorMessage}
                  </div>
                )}

                {/* Success messages display */}
                {saveSuccess && (
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-bold flex items-center gap-2" id="admin-success-text">
                    <ShieldCheck size={16} className="text-emerald-400 animate-bounce" />
                    <span>Published to Live Cloud! Recipient will instantly load the new changes. ✨</span>
                  </div>
                )}

                {/* Action buttons panel */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* Copy Link sharing shortcut */}
                  <button
                    type="button"
                    onClick={handleCopyPersonalizedLink}
                    className="w-full cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    id="admin-copy-link-btn"
                  >
                    <Link size={13} className="text-rose-400" />
                    <span>{copiedLink ? '📋 COPIED DISPATCH LINK!' : '📋 BUILD & COPY CUSTOM URL'}</span>
                  </button>

                  {/* Publish to Cloud DB */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full cursor-pointer disabled:opacity-50 text-xs font-bold py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 shadow-lg border border-white/10 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                    id="admin-publish-btn"
                  >
                    <Globe size={13} className="animate-pulse" />
                    <span>{isSaving ? '⚡ PUBLISHING...' : '🚀 DEPLOY ON THE LIVE LINK'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
