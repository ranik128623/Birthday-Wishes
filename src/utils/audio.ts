/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private melodyTimeoutId: any = null;
  private isCurrentlyPlaying = false;
  private currentVolume = 0.35; // default low-to-medium volume
  private isMuted = false;
  
  // Audio Nodes
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  // Track state
  private playbackType: 'synth' | 'mp3' = 'synth';
  private audioEl: HTMLAudioElement | null = null;

  // Happy Birthday Melody in F Major (slower, ambient, 65 BPM)
  // freq, duration (beats), spacing before next note (beats)
  private melody = [
    { note: 'C4', freq: 261.63, b: 0.75 },
    { note: 'C4', freq: 261.63, b: 0.25 },
    { note: 'D4', freq: 293.66, b: 1.0 },
    { note: 'C4', freq: 261.63, b: 1.0 },
    { note: 'F4', freq: 349.23, b: 1.0 },
    { note: 'E4', freq: 329.63, b: 2.0 },

    { note: 'C4', freq: 261.63, b: 0.75 },
    { note: 'C4', freq: 261.63, b: 0.25 },
    { note: 'D4', freq: 293.66, b: 1.0 },
    { note: 'C4', freq: 261.63, b: 1.0 },
    { note: 'G4', freq: 392.00, b: 1.0 },
    { note: 'F4', freq: 349.23, b: 2.0 },

    { note: 'C4', freq: 261.63, b: 0.75 },
    { note: 'C4', freq: 261.63, b: 0.25 },
    { note: 'C5', freq: 523.25, b: 1.0 },
    { note: 'A4', freq: 440.00, b: 1.0 },
    { note: 'F4', freq: 349.23, b: 1.0 },
    { note: 'E4', freq: 329.63, b: 1.0 },
    { note: 'D4', freq: 293.66, b: 2.0 },

    { note: 'Bb4', freq: 466.16, b: 0.75 },
    { note: 'Bb4', freq: 466.16, b: 0.25 },
    { note: 'A4', freq: 440.00, b: 1.0 },
    { note: 'F4', freq: 349.23, b: 1.0 },
    { note: 'G4', freq: 392.00, b: 1.0 },
    { note: 'F4', freq: 3.5 } // Long ring out
  ];

  private currentNoteIndex = 0;
  private tempo = 68; // BPM (beats per minute)
  private beatDuration = 60 / 68; // in seconds (~0.88s)

  constructor() {
    // Lazy initialize to avoid browser console warnings prior to user interaction
  }

  private initContext() {
    if (this.ctx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create a master volume control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);

    // Create a cozy, spatial delay (echo feedback)
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayGain = this.ctx.createGain();
    
    // Configure spatial echo: 400ms delay, soft damp feedback
    this.delayNode.delayTime.setValueAtTime(0.40, this.ctx.currentTime);
    this.delayGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    // Create Warm Lowpass filter (cleans up high frequencies, makes it soothing and warm)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(1400, this.ctx.currentTime);

    // Connect nodes: Synth Sound -> Filter -> Master Gain -> Output
    // Also feed Master to Delay Node -> Master Gain (for ambient space echoes)
    this.filterNode.connect(this.masterGain);
    
    // Connect delays in feedback loop
    this.masterGain.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.masterGain); // Echo returns into master gain

    this.masterGain.connect(this.ctx.destination);

    // Prepare Streaming track
    this.audioEl = new Audio();
    // Using a beautiful, soft, licensed piano stream from Mixkit (vetted CC music)
    this.audioEl.src = 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3';
    this.audioEl.loop = true;
    this.audioEl.volume = this.isMuted ? 0 : this.currentVolume * 0.7; // slightly lower volume for MP3 stream
    
    // Setup listener for media element in the audio context graph (requires CORS, so we play simple audio element directly to keep it robust and prevent CORS blocks)
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.currentVolume * 0.7;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    const activeVolume = this.isMuted ? 0 : this.currentVolume;
    
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(activeVolume, this.ctx.currentTime);
    }
    if (this.audioEl) {
      this.audioEl.volume = activeVolume * 0.7;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public getPlaybackType(): 'synth' | 'mp3' {
    return this.playbackType;
  }

  public setPlaybackType(type: 'synth' | 'mp3') {
    if (type === this.playbackType) return;
    
    const wasPlaying = this.isCurrentlyPlaying;
    if (wasPlaying) {
      this.pause();
    }
    
    this.playbackType = type;
    
    if (wasPlaying) {
      this.play();
    }
  }

  public play() {
    this.initContext();
    if (this.isCurrentlyPlaying) return;

    this.isCurrentlyPlaying = true;

    // Wake context in case browser is blocking
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.playbackType === 'mp3') {
      if (this.audioEl) {
        this.audioEl.play().catch(err => {
          console.warn('MP3 Autoplay blocked, falling back to synthesiser:', err);
          // Fallback to synthesiser
          this.playbackType = 'synth';
          this.playSynthMelody();
        });
      }
    } else {
      this.currentNoteIndex = 0;
      this.playSynthMelody();
    }
  }

  public pause() {
    this.isCurrentlyPlaying = false;
    
    if (this.melodyTimeoutId) {
      clearTimeout(this.melodyTimeoutId);
      this.melodyTimeoutId = null;
    }

    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  // Synthesizes a delicate, vintage, warm physical-modeling music box or chime
  private playBellSound(frequency: number, time: number) {
    if (!this.ctx || !this.filterNode) return;

    // 1. Metal Cylinder Pin Pluck (high-passed, short transient snap)
    const pluckOsc = this.ctx.createOscillator();
    const pluckGain = this.ctx.createGain();
    pluckOsc.type = 'triangle';
    pluckOsc.frequency.setValueAtTime(frequency * 2, time); // Octave up snap
    pluckGain.gain.setValueAtTime(0.04, time);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    // 2. High Pure Sine Wave (Tines body resonance)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(frequency, time);
    bellGain.gain.setValueAtTime(0.18, time);
    // Smooth bell chime exponential ringing decay
    bellGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

    // 3. Ambient warm secondary overtone (provides acoustic luxury)
    const overtoneOsc = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    overtoneOsc.type = 'sine';
    // Bell harmonic factor (perfect 5th or octave up)
    overtoneOsc.frequency.setValueAtTime(frequency * 1.5, time);
    overtoneGain.gain.setValueAtTime(0.03, time);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);

    // Connect these tines to the Lowpass filter node
    pluckOsc.connect(pluckGain);
    pluckGain.connect(this.filterNode);

    bellOsc.connect(bellGain);
    bellGain.connect(this.filterNode);

    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(this.filterNode);

    // Play!
    pluckOsc.start(time);
    pluckOsc.stop(time + 0.05);

    bellOsc.start(time);
    bellOsc.stop(time + 2.0);

    overtoneOsc.start(time);
    overtoneOsc.stop(time + 1.0);

    // 4. Play an atmospheric minor/major supportive bass drone on key root notes
    // Trigger soft warming drones occasionally to support the melody
    if (this.currentNoteIndex === 0 || this.currentNoteIndex === 6 || this.currentNoteIndex === 12 || this.currentNoteIndex === 19) {
      this.playAmbientDrone(frequency / 2, time);
    }
  }

  // Soft warming string synth pad drone
  private playAmbientDrone(frequency: number, time: number) {
    if (!this.ctx || !this.filterNode) return;

    // Deep sub-octave drone
    const droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(frequency, time); // Deep root frequency
    
    // Cinematic slow swelling envelope
    droneGain.gain.setValueAtTime(0.0, time);
    droneGain.gain.linearRampToValueAtTime(0.04, time + 1.2); // Warm swell
    droneGain.gain.exponentialRampToValueAtTime(0.0001, time + 4.5); // long sustain release

    droneOsc.connect(droneGain);
    droneGain.connect(this.filterNode);

    droneOsc.start(time);
    droneOsc.stop(time + 4.6);
  }

  // Schedules notes iteratively to keep memory footprint light and keep timer active
  private playSynthMelody = () => {
    if (!this.isCurrentlyPlaying || this.playbackType !== 'synth') return;

    this.initContext();
    if (!this.ctx) return;

    const note = this.melody[this.currentNoteIndex];
    const now = this.ctx.currentTime;
    
    // Play with minor micro-timing imperfections to sound like a vintage mechanical music box
    const humanizedDelay = (Math.random() - 0.5) * 0.008; 
    this.playBellSound(note.freq, now + Math.max(0, humanizedDelay));

    // Determine the length to wait before trigger-scheduling the next note
    const delayInSeconds = note.b * this.beatDuration;
    
    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    // Schedule the next note in real-world millisecond intervals
    this.melodyTimeoutId = setTimeout(this.playSynthMelody, delayInSeconds * 1000);
  };
}

export const musicEngine = new BirthdayAudioEngine();
