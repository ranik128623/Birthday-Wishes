/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Radio } from 'lucide-react';
import { musicEngine } from '../utils/audio';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(45); // 45% default medium volume
  const [musicType, setMusicType] = useState<'synth' | 'mp3'>('synth');
  const [showControls, setShowControls] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initial sync with engine
    setIsPlaying(musicEngine.getIsPlaying());
    setIsMuted(musicEngine.getIsMuted());
    setVolume(Math.round(musicEngine.getVolume() * 100));
    setMusicType(musicEngine.getPlaybackType());

    // Set engine volume to comfortable default
    musicEngine.setVolume(0.45);

    // Try standard autoplay trigger
    const triggerAutoplay = () => {
      musicEngine.play();
      const playing = musicEngine.getIsPlaying();
      setIsPlaying(playing);
      setAutoplayBlocked(!playing);
    };

    // Extended aggressive interaction listeners to trigger immediately on any user action
    const handleUserInteraction = () => {
      if (!musicEngine.getIsPlaying()) {
        musicEngine.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('wheel', handleUserInteraction);
    };

    // Attempt immediately when layout mounts
    const timeoutId = setTimeout(() => {
      triggerAutoplay();
    }, 600);

    // Register interactions
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('wheel', handleUserInteraction);

    // Click outside listener to minimize panel instantly on both desktop (mouse) and mobile (touch)
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowControls(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      clearTimeout(timeoutId);
      cleanupListeners();
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isPlaying) {
      musicEngine.pause();
      setIsPlaying(false);
    } else {
      musicEngine.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mutedState = musicEngine.toggleMute();
    setIsMuted(mutedState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    musicEngine.setVolume(val / 100);
    if (val > 0 && isMuted) {
      musicEngine.toggleMute();
      setIsMuted(false);
    }
  };

  const handleTypeChange = (type: 'synth' | 'mp3') => {
    musicEngine.setPlaybackType(type);
    setMusicType(type);
    setIsPlaying(musicEngine.getIsPlaying());
  };

  const handleShortcutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowControls(true);
    // Also resume/play if stopped
    if (!isPlaying) {
      handlePlayPause();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Autoplay Alert trigger */}
      {autoplayBlocked && !isPlaying && (
        <button
          onClick={() => handlePlayPause()}
          className="glass hover:bg-rose-500/20 text-rose-200 border-rose-500/30 text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce cursor-pointer z-50"
          id="music-alert-badge"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          🎵 জন্মদিনের সুর শুনতে এখানে ক্লিক করো
        </button>
      )}

      {/* Main Expander Music Control Panel */}
      <div 
        ref={panelRef}
        id="sound-control-panel"
        className={`glass rounded-2xl shadow-xl border border-white/10 transition-all duration-300 overflow-hidden ${
          showControls ? 'w-72 p-4' : 'w-14 h-14 p-0 flex items-center justify-center'
        }`}
      >
        {showControls ? (
          <div className="flex flex-col gap-3 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-rose-300 tracking-wider flex items-center gap-1">
                <Music size={12} className={isPlaying ? 'animate-spin' : ''} />
                সারপ্রাইজ সাউন্ডট্র্যাক
              </span>
              <button 
                onClick={handlePlayPause}
                className="p-1.5 hover:bg-white/10 rounded-full text-rose-200 transition-colors cursor-pointer"
                id="panel-play-pause"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>

            {/* Song Choice Tabs */}
            <div className="flex bg-white/5 rounded-lg p-1 text-[11px] font-medium" id="song-choice-tabs">
              <button
                onClick={() => handleTypeChange('synth')}
                className={`flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  musicType === 'synth' ? 'bg-rose-500/35 text-rose-100 font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <Music size={11} />
                মিউজিক বক্স
              </button>
              <button
                onClick={() => handleTypeChange('mp3')}
                className={`flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  musicType === 'mp3' ? 'bg-rose-500/35 text-rose-100 font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <Radio size={11} />
                মিষ্টি পিয়ানো
              </button>
            </div>

            {/* Title / Equalizer */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0" id="current-track-info">
                <div className="text-[11px] text-white/50">চলতি থিম</div>
                <div className="text-xs font-bold truncate text-rose-100">
                  {musicType === 'synth' ? '🧸 ঘুমপাড়ানি সুর (সিন্থেসাইজড)' : '🎹 সুন্দর স্বপ্ন (লো-ফাই পিয়ানো)'}
                </div>
              </div>

              {/* Pulsing visualizer bar columns */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-6 w-8 pb-1" id="music-eq-visualizer">
                  <div className="w-1 bg-rose-400 rounded-full animate-[pulse_1s_infinite_alternate]" style={{ height: '30%', animationDelay: '0.1s' }}></div>
                  <div className="w-1 bg-rose-300 rounded-full animate-[pulse_1.2s_infinite_alternate]" style={{ height: '70%', animationDelay: '0.4s' }}></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-[pulse_0.8s_infinite_alternate]" style={{ height: '40%', animationDelay: '0.2s' }}></div>
                  <div className="w-1 bg-amber-400 rounded-full animate-[pulse_1.4s_infinite_alternate]" style={{ height: '60%', animationDelay: '0s' }}></div>
                </div>
              )}
            </div>

            {/* Volume Control bar */}
            <div className="flex items-center gap-2 mt-1">
              <button onClick={handleMuteToggle} className="text-white/70 hover:text-rose-400 cursor-pointer" id="mute-button">
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400"
              />
              <span className="text-[10px] font-mono text-white/40 w-6 text-right">{isMuted ? 0 : volume}%</span>
            </div>

            {/* Dynamic Click to minimize helper */}
            <div className="text-[9px] text-white/30 text-center font-medium tracking-wide mt-1 select-none">
              💡 প্যানেলটি ছোট করতে বাইরে ক্লিক করো
            </div>
          </div>
        ) : (
          <button
            onClick={handleShortcutClick}
            className="w-full h-full flex flex-col items-center justify-center rounded-full relative cursor-pointer"
            id="music-shortcut-button"
          >
            {/* Ambient indicator circle glow */}
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border border-rose-500/40 animate-ping opacity-60"></span>
            )}
            
            <div className={`p-3 rounded-full text-rose-300 hover:text-rose-100 transition-colors ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? <Music size={22} className="animate-spin duration-1000" /> : <Play size={22} />}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
