import { Injectable, signal } from '@angular/core';

export interface TrackProfile {
  name: string;
  bpm: number;
  scale: number[]; 
  pattern: number[]; 
  type: OscillatorType;
  filterFreq: number;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private isMusicPlaying = false;
  
  currentTrack = signal<string>('SYSTEM_IDLE');
  playlist: TrackProfile[] = [];
  currentIndex = 0;

  // Internal Audio State (Pushed from GameService to avoid circular dependency)
  masterVolume = signal(0.5);
  speechEnabled = signal(true);

  constructor() {
    this.generatePlaylist();
  }

  private generatePlaylist() {
    const prefixes = ['NEURAL', 'VOID', 'CYBER', 'MATRIX', 'GHOST', 'DATA', 'SHADOW', 'COBALT', 'NEON', 'HEX'];
    const suffixes = ['BREACH', 'STREAM', 'PULSE', 'LINK', 'DUMP', 'REBOOT', 'PHASE', 'WAVE', 'STATIC', 'CORE'];
    const scales = [
      [55, 65.41, 73.42, 82.41, 98], 
      [55, 61.74, 65.41, 82.41, 87.31], 
      [41.2, 49, 55, 61.74, 65.41], 
      [32.7, 43.65, 49, 55, 65.41] 
    ];
    const patterns = [
      [1, 0, 1, 0, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 0],
      [1, 0, 0, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 0, 0, 0],
      [1, 0, 1, 1, 0, 1, 1, 0]
    ];
    const types: OscillatorType[] = ['sawtooth', 'square', 'triangle'];

    for (let i = 0; i < 55; i++) {
      const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${suffixes[Math.floor(Math.random() * suffixes.length)]}_0x${i.toString(16).toUpperCase()}`;
      this.playlist.push({
        name,
        bpm: 100 + Math.floor(Math.random() * 60),
        scale: scales[Math.floor(Math.random() * scales.length)],
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
        type: types[Math.floor(Math.random() * types.length)],
        filterFreq: 400 + Math.random() * 1000
      });
    }
  }

  playBeep(freq = 440, duration = 0.1, type: OscillatorType = 'square', volume = 0.1) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Scale local volume by master volume
    const finalVolume = volume * this.masterVolume();
    
    gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSuccess() { this.playBeep(880, 0.2, 'square', 0.05); setTimeout(() => this.playBeep(1320, 0.4, 'square', 0.05), 100); }
  playError() { this.playBeep(110, 0.3, 'sawtooth', 0.1); }
  playClick() { this.playBeep(1200, 0.05, 'sine', 0.02); }
  playGlitch() {
    for(let i=0; i<5; i++) {
      setTimeout(() => this.playBeep(Math.random() * 1000 + 100, 0.05, 'sawtooth', 0.02), i * 30);
    }
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      if (this.musicInterval) clearInterval(this.musicInterval);
      this.isMusicPlaying = false;
      this.currentTrack.set('SYSTEM_IDLE');
      return;
    }

    this.isMusicPlaying = true;
    this.playNextTrack();
  }

  private playNextTrack() {
    if (!this.isMusicPlaying) return;
    
    const track = this.playlist[this.currentIndex];
    this.currentTrack.set(track.name);
    
    let step = 0;
    const intervalTime = 60000 / (track.bpm * 2); 

    if (this.musicInterval) clearInterval(this.musicInterval);

    this.musicInterval = setInterval(() => {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const patternStep = step % track.pattern.length;
      
      if (track.pattern[patternStep] > 0) {
        const freq = track.scale[step % track.scale.length];
        this.playBassNote(freq, 0.3, track.type, track.filterFreq);
      }

      if (step % 4 === 0) this.playKick();
      if (step % 8 === 4) this.playSnare(0.1);
      if (step % 2 === 0) this.playHiHat();

      step++;

      if (step >= 256) {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.playNextTrack();
      }
    }, intervalTime);
  }

  private playBassNote(freq: number, duration: number, type: OscillatorType, filterFreq: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    filter.Q.setValueAtTime(5, this.ctx.currentTime);

    const finalVolume = 0.04 * this.masterVolume();
    gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playKick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    const finalVolume = 0.1 * this.masterVolume();
    gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  private playSnare(duration: number) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const finalVolume = 0.03 * this.masterVolume();
    gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  private playHiHat() {
    const duration = 0.05;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, this.ctx.currentTime);

    const finalVolume = 0.01 * this.masterVolume();
    gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  speakCreepy(text: string) {
    if (!this.speechEnabled()) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft David')) || voices[0];
    
    utterance.pitch = 0.1; 
    utterance.rate = 0.7;  
    utterance.volume = 0.6 * this.masterVolume();

    window.speechSynthesis.speak(utterance);
  }
}
