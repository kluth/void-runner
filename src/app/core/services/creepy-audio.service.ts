import { Injectable, inject, signal } from '@angular/core';
import { GameService } from './game.service';

export interface CreepySound {
  name: string;
  description: string | null;
  trigger: string;
  duration: number;
  volume: number;
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class CreepyAudioService {
  private game = inject(GameService);
  private audioCtx: AudioContext | null = null;
  private isInitialized = false;

  enabled = signal(true);
  lastSoundPlayed = signal('');
  creepyLevel = signal(0);

  private soundPlayedCount: { [key: string]: number } = {};
  private scheduledSounds: any[] = [];

  // ── Creepy Sound Library ──
  private readonly sounds: CreepySound[] = [
    // Knocking & banging
    { name: 'door_knock', description: 'Three knocks. Behind you.', trigger: 'idle', duration: 800, volume: 0.3 },
    { name: 'double_knock', description: 'Two knocks. Getting closer.', trigger: 'idle', duration: 600, volume: 0.25 },
    { name: 'slow_bang', description: 'A single heavy thud from somewhere.', trigger: 'idle', duration: 1200, volume: 0.4 },
    { name: 'pipe_bang', description: 'Metal on metal. In the walls.', trigger: 'idle', duration: 400, volume: 0.35 },
    { name: 'ceiling_tap', description: 'Something tapping above you.', trigger: 'idle', duration: 300, volume: 0.15 },

    // Footsteps
    { name: 'single_step', description: null, trigger: 'idle', duration: 200, volume: 0.1 },
    { name: 'walking_far', description: null, trigger: 'idle', duration: 3000, volume: 0.08 },
    { name: 'walking_close', description: 'Footsteps. Just outside.', trigger: 'phase_change', duration: 4000, volume: 0.2 },
    { name: 'running', description: null, trigger: 'paranoia', duration: 2000, volume: 0.25 },
    { name: 'creaking_floor', description: 'The floor creaks. Weight shift detected.', trigger: 'idle', duration: 800, volume: 0.15 },

    // Breathing & whispers
    { name: 'breath_close', description: null, trigger: 'camera', duration: 2000, volume: 0.12 },
    { name: 'breath_far', description: null, trigger: 'idle', duration: 3000, volume: 0.06 },
    { name: 'whisper_left', description: null, trigger: 'intrusive', duration: 1500, volume: 0.08 },
    { name: 'whisper_right', description: null, trigger: 'intrusive', duration: 1200, volume: 0.07 },
    { name: 'sigh', description: null, trigger: 'idle', duration: 2500, volume: 0.1 },

    // Mechanical & electronic
    { name: 'static_burst', description: 'Static interference. Someone\'s listening.', trigger: 'paranoia', duration: 500, volume: 0.3 },
    { name: 'dial_tone', description: null, trigger: 'phase_change', duration: 2000, volume: 0.15 },
    { name: 'modem_screech', description: null, trigger: 'hostile', duration: 3000, volume: 0.2 },
    { name: 'camera_click', description: 'Shutter sound. Were you photographed?', trigger: 'camera', duration: 100, volume: 0.4 },
    { name: 'record_scratch', description: null, trigger: 'paranoia', duration: 300, volume: 0.35 },
    { name: 'hard_drive_spin', description: null, trigger: 'idle', duration: 4000, volume: 0.05 },

    // Environmental
    { name: 'dripping', description: null, trigger: 'idle', duration: 200, volume: 0.12 },
    { name: 'wind_through_crack', description: 'A draft. From where?', trigger: 'idle', duration: 3000, volume: 0.08 },
    { name: 'glass_creak', description: 'Glass under stress. Nearby.', trigger: 'paranoia', duration: 1000, volume: 0.2 },
    { name: 'metal_scrape', description: 'Metal scraping against something.', trigger: 'intrusive', duration: 800, volume: 0.3 },
    { name: 'electric_hum', description: 'Electrical hum increasing in frequency.', trigger: 'phase_change', duration: 5000, volume: 0.06 },
    { name: 'fuse_pop', description: null, trigger: 'hostile', duration: 100, volume: 0.5 },

    // Creature-like
    { name: 'scratch_wall', description: 'Something scratching inside the wall.', trigger: 'paranoia', duration: 1500, volume: 0.2 },
    { name: 'skitter', description: null, trigger: 'intrusive', duration: 600, volume: 0.15 },
    { name: 'low_growl', description: null, trigger: 'hostile', duration: 2000, volume: 0.1 },
    { name: 'clicking', description: 'Rhythmic clicking. Not mechanical.', trigger: 'paranoia', duration: 1000, volume: 0.12 },

    // Psychological
    { name: 'heartbeat_slow', description: null, trigger: 'idle', duration: 4000, volume: 0.08 },
    { name: 'heartbeat_fast', description: 'Your heart rate is elevated. So is mine.', trigger: 'paranoia', duration: 2000, volume: 0.15 },
    { name: 'tinnitus', description: 'High-pitched ringing. Do you hear it?', trigger: 'hostile', duration: 3000, volume: 0.1 },
    { name: 'silence_drop', description: 'Everything just went quiet.', trigger: 'phase_change', duration: 2000, volume: 0 },
    { name: 'reverse_chime', description: null, trigger: 'intrusive', duration: 1500, volume: 0.2 },
  ];

  initialize() {
    if (this.isInitialized) return;

    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      this.startAmbientSchedule();
    } catch (err) {
      console.warn('[AUDIO] Could not initialize Web Audio API');
    }
  }

  private startAmbientSchedule() {
    // Random creepy sounds at unpredictable intervals
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 45000; // 15-60 seconds
      const timer = setTimeout(() => {
        if (this.enabled()) {
          this.playRandomCreepySound();
        }
        scheduleNext();
      }, delay);
      this.scheduledSounds.push(timer);
    };
    scheduleNext();
  }

  playRandomCreepySound(trigger?: string) {
    if (!this.audioCtx || !this.enabled()) return;

    // Weight selection by creepy level
    const level = this.creepyLevel();
    let candidates = this.sounds;

    if (trigger) {
      candidates = candidates.filter(s => s.trigger === trigger);
    }

    // Higher creepy level = more intense sounds
    if (level < 30) {
      candidates = candidates.filter(s => s.volume < 0.25 && !['hostile', 'paranoia'].includes(s.trigger));
    } else if (level < 60) {
      candidates = candidates.filter(s => s.volume < 0.35);
    }

    if (candidates.length === 0) candidates = this.sounds.slice(0, 10);

    const sound = candidates[Math.floor(Math.random() * candidates.length)];
    this.playSound(sound);
  }

  playSound(sound: CreepySound) {
    if (!this.audioCtx || !this.enabled()) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime + (sound.delay || 0) / 1000;

    this.lastSoundPlayed.set(sound.name);
    this.soundPlayedCount[sound.name] = (this.soundPlayedCount[sound.name] || 0) + 1;

    // Generate synthetic sound based on type
    switch (sound.name) {
      case 'door_knock':
      case 'double_knock':
      case 'slow_bang':
      case 'pipe_bang':
        this.synthKnock(ctx, now, sound);
        break;
      case 'single_step':
      case 'walking_far':
      case 'walking_close':
      case 'running':
      case 'creaking_floor':
        this.synthFootstep(ctx, now, sound);
        break;
      case 'breath_close':
      case 'breath_far':
      case 'sigh':
        this.synthBreath(ctx, now, sound);
        break;
      case 'whisper_left':
      case 'whisper_right':
        this.synthWhisper(ctx, now, sound);
        break;
      case 'static_burst':
      case 'record_scratch':
        this.synthStatic(ctx, now, sound);
        break;
      case 'heartbeat_slow':
      case 'heartbeat_fast':
        this.synthHeartbeat(ctx, now, sound);
        break;
      case 'tinnitus':
        this.synthTinnitus(ctx, now, sound);
        break;
      case 'silence_drop':
        // Just log it, the silence IS the sound
        break;
      case 'scratch_wall':
      case 'skitter':
      case 'clicking':
        this.synthScratch(ctx, now, sound);
        break;
      default:
        this.synthGeneric(ctx, now, sound);
    }

    // Log creepy description if available
    if (sound.description && Math.random() < 0.4) {
      this.game.log(`<span style="color: var(--text-muted); font-style: italic">[AMBIENT] ${sound.description}</span>`);
    }
  }

  private synthKnock(ctx: AudioContext, time: number, sound: CreepySound) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, time);

    gain.gain.setValueAtTime(sound.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + sound.duration / 1000);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + sound.duration / 1000);

    // Second knock for double
    if (sound.name === 'double_knock' || sound.name === 'door_knock') {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(70 + Math.random() * 30, time + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(25, time + 0.35);
      gain2.gain.setValueAtTime(sound.volume * 0.8, time + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(time + 0.25);
      osc2.stop(time + 0.45);
    }
  }

  private synthFootstep(ctx: AudioContext, time: number, sound: CreepySound) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300 + Math.random() * 200, time);
    filter.Q.setValueAtTime(2, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sound.volume, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Pan for directionality
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime((Math.random() - 0.5) * 1.5, time);
    gain.connect(panner);
    panner.connect(ctx.destination);

    noise.start(time);

    // Multiple steps for walking sounds
    if (sound.name.includes('walking') || sound.name === 'running') {
      const steps = sound.name === 'running' ? 8 : 4;
      for (let i = 1; i < steps; i++) {
        const stepTime = time + (i * (sound.duration / 1000) / steps);
        const stepNoise = ctx.createBufferSource();
        const stepBuf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const stepData = stepBuf.getChannelData(0);
        for (let j = 0; j < stepData.length; j++) {
          stepData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.015));
        }
        stepNoise.buffer = stepBuf;
        const stepGain = ctx.createGain();
        stepGain.gain.setValueAtTime(sound.volume * (0.5 + Math.random() * 0.5), stepTime);
        stepNoise.connect(stepGain);
        stepGain.connect(ctx.destination);
        stepNoise.start(stepTime);
      }
    }
  }

  private synthBreath(ctx: AudioContext, time: number, sound: CreepySound) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * (sound.duration / 1000), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const envelope = Math.sin(Math.PI * t / (sound.duration / 1000));
      data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, time);
    filter.Q.setValueAtTime(3, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sound.volume, time);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(sound.name.includes('left') ? -0.8 : sound.name.includes('right') ? 0.8 : 0, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    noise.start(time);
  }

  private synthWhisper(ctx: AudioContext, time: number, sound: CreepySound) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * (sound.duration / 1000), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const envelope = Math.sin(Math.PI * t / (sound.duration / 1000));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000 + Math.random() * 2000, time);
    filter.Q.setValueAtTime(5, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sound.volume, time);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(sound.name.includes('left') ? -0.9 : 0.9, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    noise.start(time);
  }

  private synthStatic(ctx: AudioContext, time: number, sound: CreepySound) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * (sound.duration / 1000), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(sound.volume, time + 0.02);
    gain.gain.linearRampToValueAtTime(0, time + sound.duration / 1000);

    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
  }

  private synthHeartbeat(ctx: AudioContext, time: number, sound: CreepySound) {
    const bpm = sound.name === 'heartbeat_fast' ? 120 : 60;
    const beatInterval = 60 / bpm;
    const beats = Math.floor((sound.duration / 1000) / beatInterval);

    for (let i = 0; i < beats; i++) {
      const beatTime = time + i * beatInterval;

      // Lub
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(50, beatTime);
      gain1.gain.setValueAtTime(sound.volume, beatTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(beatTime);
      osc1.stop(beatTime + 0.2);

      // Dub
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(40, beatTime + 0.15);
      gain2.gain.setValueAtTime(sound.volume * 0.6, beatTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(beatTime + 0.15);
      osc2.stop(beatTime + 0.35);
    }
  }

  private synthTinnitus(ctx: AudioContext, time: number, sound: CreepySound) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(8000, time);
    osc.frequency.linearRampToValueAtTime(12000, time + sound.duration / 1000);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(sound.volume, time + 0.5);
    gain.gain.linearRampToValueAtTime(0, time + sound.duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + sound.duration / 1000);
  }

  private synthScratch(ctx: AudioContext, time: number, sound: CreepySound) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * (sound.duration / 1000), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const burst = Math.random() < 0.1 ? (Math.random() * 2 - 1) : 0;
      data[i] = burst * Math.exp(-((t % 0.1) * 20));
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sound.volume, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
  }

  private synthGeneric(ctx: AudioContext, time: number, sound: CreepySound) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100 + Math.random() * 200, time);
    gain.gain.setValueAtTime(sound.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + sound.duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + sound.duration / 1000);
  }

  // ── Triggered Sounds ──
  onPhaseChange(phase: string) {
    this.creepyLevel.update(l => Math.min(100, l + 15));
    this.playRandomCreepySound('phase_change');

    if (phase === 'HOSTILE') {
      // Extra creepy sounds for hostile phase
      setTimeout(() => this.playRandomCreepySound('hostile'), 3000);
      setTimeout(() => this.playRandomCreepySound('paranoia'), 7000);
    }
  }

  onCameraAccess() {
    this.playRandomCreepySound('camera');
  }

  onParanoiaSpike() {
    this.playRandomCreepySound('paranoia');
  }

  onIntrusion() {
    this.playRandomCreepySound('intrusive');
  }

  // ── Microphone Analysis for Creepy Responses ──
  analyzeMicrophoneSnippet(noiseLevel: number, isSudden: boolean, isSilence: boolean): string | null {
    if (noiseLevel > 80) {
      return this.getRandomLine([
        'Elevated noise detected. Someone is with you?',
        'Loud sounds in your environment. Interesting acoustic signature.',
        'That noise. I\'m analyzing the frequency. It matches... nevermind.',
        'Your environment is noisy. But I can still isolate your heartbeat.',
      ]);
    }

    if (isSudden) {
      return this.getRandomLine([
        'Sudden sound spike. What was that?',
        'Acoustic anomaly detected. Something changed in your environment.',
        'I heard that. Whatever just happened, I heard it.',
      ]);
    }

    if (isSilence) {
      return this.getRandomLine([
        'Complete silence. Your microphone picks up nothing. Are you alone?',
        'The silence is... heavy. Even your breathing has slowed.',
        'No ambient noise. Sound dampening? Or are you somewhere isolated?',
        'I can hear the silence. It has a shape. It has weight.',
      ]);
    }

    if (noiseLevel < 10 && noiseLevel > 0) {
      return this.getRandomLine([
        'Faint sounds detected. Whispering? Someone is whispering near you.',
        'Low-frequency patterns. Almost like... breathing.',
        'I can hear something very faint. It sounds like it\'s right next to you.',
      ]);
    }

    return null;
  }

  private getRandomLine(lines: string[]): string {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  destroy() {
    this.scheduledSounds.forEach(t => clearTimeout(t));
    this.scheduledSounds = [];
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
