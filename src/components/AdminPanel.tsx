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
  const [generatedUrl, setGeneratedUrl] = useState('');

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
      setErrorMessage('❌ যাকে পাঠাবেন তার নাম দেওয়া আবশ্যক!');
      return;
    }

    if (!relation.trim()) {
      setErrorMessage('❌ শুভেচ্ছাসূচক সম্বোধন দেওয়া আবশ্যক!');
      return;
    }

    const newConfig = {
      id: 'custom',
      name: name.trim(),
      relation: relation.trim(),
      date: date.trim() || 'June 15, 2026',
    };

    // Feed changes back to Parent App state dynamically
    onConfigChange(newConfig);

    // Build the query parameter URL
    // Convert dev sub-domain to the public shared pre-domain so anyone can access it!
    let shareableOrigin = window.location.origin;
    if (shareableOrigin.includes('-dev-')) {
      shareableOrigin = shareableOrigin.replace('-dev-', '-pre-');
    }
    const baseUrl = shareableOrigin + window.location.pathname;
    
    const params = new URLSearchParams();
    params.set('name', newConfig.name);
    params.set('relation', newConfig.relation);
    params.set('date', newConfig.date);
    
    const finalUrl = `${baseUrl}?${params.toString()}`;
    setGeneratedUrl(finalUrl);

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
      }, 4000);
    }).catch(() => {
      // If direct navigator clipboard copy is restricted, we still generate it perfectly in state
      setSaveSuccess(true);
      playSuccessChime();
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
                  <h3 className="text-sm font-bold uppercase text-white tracking-widest">কাস্টমাইজেশন প্যানেল</h3>
                  <p className="text-[10px] text-white/50 tracking-wide font-medium">আপনার বন্ধুদের জন্য কাস্টম শুভেচ্ছা লিংক তৈরি করুন</p>
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
                <span className="font-semibold text-amber-200">কিভাবে ব্যবহার করবেন:</span> নিচে নাম, শুভেচ্ছাসূচক সম্বোধন এবং উদযাপনের তারিখটি লিখুন। এরপর <span className="font-semibold text-rose-300">"লিংক তৈরি করুন এবং কপি করুন"</span> বাটনে ক্লিক করলে আপনার বন্ধুর জন্য একটি বিশেষ লিংক তৈরি হয়ে চমৎকারভাবে কপি হয়ে যাবে!
              </div>
            </div>

            {/* Config Form wrapper */}
            <form onSubmit={handleApplyChanges} className="space-y-4">
              {/* Greeting / Relation prefix */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                  শুভেচ্ছাসূচক সম্বোধন
                </label>
                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="যেমন: অতি প্রিয় বন্ধু, প্রিয়, প্রাণপ্রিয়"
                  maxLength={70}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[9px] text-white/40">নামের আগে যে পরম ভালোবাসাময় সম্বোধনটি দেখাবে (যেমন: "প্রিয়তম বন্ধু")।</span>
              </div>

              {/* Birthday Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                  বন্ধুর নাম
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: Naim, রাজিব"
                  maxLength={50}
                  required
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[9px] text-white/40">যার জন্মদিন তার আসল বা ডাক নাম।</span>
              </div>

              {/* Event Celebration Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-rose-300 uppercase tracking-widest">
                  উদযাপনের তারিখ
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="যেমন: June 15, 2026, অথবা ১৫ জুন"
                  maxLength={35}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[9px] text-white/40">উদযাপনের তারিখ। এটি ডান কোণায় এবং থিমের সাথে অটোমেটিক দেখা যাবে।</span>
              </div>

              {/* Error messages display */}
              {errorMessage && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium animate-pulse" id="admin-error-text">
                  {errorMessage}
                </div>
              )}

              {/* Success messages display */}
              {saveSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-bold flex flex-col gap-1" id="admin-success-text">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400 animate-bounce" />
                    <span>আপনার বন্ধুদের জন্য কাস্টমাইজড লিংকটি সফলভাবে তৈরি হয়েছে! ✨</span>
                  </div>
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
                  <span>{copiedLink ? '📋 লিংক কপি করা হয়েছে!' : '📋 লিংক তৈরি ও কপি করুন'}</span>
                </button>
              </div>

              {/* Display generated link layout for manual copy */}
              {generatedUrl && (
                <div className="mt-4 p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2.5 select-text">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe size={11} className="text-amber-400" />
                    <span>আপনার বন্ধুর জন্য বিশেষ লিংক:</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedUrl}
                      className="w-full bg-[#18122b]/60 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-purple-200 focus:outline-none select-all"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedUrl).then(() => {
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        });
                      }}
                      className="shrink-0 bg-white/10 hover:bg-white/15 border border-white/10 text-white hover:text-amber-200 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}
                    </button>
                  </div>
                  <p className="text-[9.5px] leading-relaxed text-emerald-400/90 font-medium">
                    💡 এই লিংকটি আপনার বন্ধুকে পাঠান। এটি ওপেন করলে আপনার বন্ধু সম্পুর্ণ বাংলায় চমৎকার এবং ল্যাগ-মুক্ত সুন্দর সারপ্রাইজটি দেখতে পাবে!
                  </p>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
