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
  onClose: () => void;
}

export default function AdminPanel({ currentConfig, onConfigChange, onClose }: AdminPanelProps) {
  const [name, setName] = useState(currentConfig.name);
  const [relation, setRelation] = useState(currentConfig.relation);
  const [date, setDate] = useState(currentConfig.date);
  
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

  const handleApplyChanges = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('❌ Recipient name is required!');
      return;
    }

    if (!relation.trim()) {
      setErrorMessage('❌ Salutation / greeting prefix is required!');
      return;
    }

    const newConfig = {
      id: 'custom',
      name: name.trim(),
      relation: relation.trim(),
      date: date.trim() || 'June 8, 2026',
    };

    // Feed changes back to Parent App state dynamically
    onConfigChange(newConfig);

    // Build the query parameter URL
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('name', newConfig.name);
    params.set('relation', newConfig.relation);
    params.set('date', newConfig.date);
    
    const finalUrl = `${baseUrl}?${params.toString()}`;

    // Copy to clipboard
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopiedLink(true);
      setSaveSuccess(true);
      playSuccessChime();
      
      // Beautiful burst of golden achievement stars on copy!
      confetti({
        particleCount: 50,
        spread: 45,
        colors: ['#fbbf24', '#f43f5e', '#a855f7'],
      });

      setTimeout(() => {
        setCopiedLink(false);
        setSaveSuccess(false);
      }, 3500);
    }).catch(() => {
      setErrorMessage('❌ Failed to copy link automatically. Please copy the URL from browser window.');
    });
  };

  return (
    <>
      {/* Admin Panel Modal Overlay Drawer */}
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 font-sans select-none animate-fadeIn">
          {/* Soft background clicks minimize overlay */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Main Deluxe Dashboard Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#0f0a1d]/95 rounded-3xl border border-rose-500/20 p-6 md:p-8 shadow-2xl shadow-rose-500/5 select-text glass"
            id="admin-dashboard-panel"
          >
            {/* Premium neon edge accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500" />

            {/* Header section */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5" id="admin-header-row">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-white tracking-widest">PERSONALIZATION PANEL</h3>
                  <p className="text-[10px] text-white/50 tracking-wide font-medium">Design custom layouts for different friends</p>
                </div>
              </div>
              <button
                onClick={onClose}
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
                <span className="font-semibold text-amber-200">How to use:</span> Fill out the name, greeting salutation, and celebration date below. Click <span className="font-semibold text-rose-300">"BUILD & COPY CUSTOM URL"</span> to instantly generate and copy a unique link with their wishes locked in!
              </div>
            </div>

            {/* Config Form wrapper */}
            <form onSubmit={handleApplyChanges} className="space-y-4">
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
                  <span>Customized link is built and copied to your clipboard! ✨</span>
                </div>
              )}

              {/* Action buttons panel */}
              <div className="flex flex-col gap-2 pt-2">
                {/* Apply and copy custom link */}
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:via-pink-400 hover:to-amber-400 text-white border border-white/10 text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  id="admin-copy-link-btn"
                >
                  <Link size={13} className="text-white animate-pulse" />
                  <span>{copiedLink ? '📋 COPIED TO CLIPBOARD!' : '📋 BUILD & COPY CUSTOM URL'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
