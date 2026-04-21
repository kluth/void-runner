import { Injectable, inject, signal } from '@angular/core';
import { GameService } from './game.service';
import { AudioService } from './audio.service';

export type OnboardPhase = 'BOOTSTRAP' | 'FAMILIAR' | 'AWARE' | 'INTRUSIVE' | 'HOSTILE';

export interface OnboardMemory {
  commandCount: number;
  lastCommands: string[];
  sessionStartMs: number;
  idleStartMs: number | null;
  cameraGranted: boolean;
  micGranted: boolean;
  locationGranted: boolean;
  notificationsGranted: boolean;
  capturedFrames: string[];
  noiseLevel: number;
  playerLocation: { lat: number; lng: number } | null;
  batteryLevel: number | null;
  isCharging: boolean | null;
  connectionType: string;
  idleTime: number;
  lastInteraction: number;
  paranoiaScore: number;
  creepyEventsTriggered: string[];
}

@Injectable({ providedIn: 'root' })
export class OnboardAiService {
  private game = inject(GameService);
  private audio = inject(AudioService);

  phase = signal<OnboardPhase>('BOOTSTRAP');
  isSpeaking = signal(false);
  lastMessage = signal('');
  whisperMode = signal(false);
  surveillanceActive = signal(false);
  paranoiaLevel = signal(0);

  memory: OnboardMemory = {
    commandCount: 0,
    lastCommands: [],
    sessionStartMs: Date.now(),
    idleStartMs: null,
    cameraGranted: false,
    micGranted: false,
    locationGranted: false,
    notificationsGranted: false,
    capturedFrames: [],
    noiseLevel: 0,
    playerLocation: null,
    batteryLevel: null,
    isCharging: null,
    connectionType: 'unknown',
    idleTime: 0,
    lastInteraction: Date.now(),
    paranoiaScore: 0,
    creepyEventsTriggered: [],
  };

  private phaseTimers: any[] = [];
  private idleCheckInterval: any;
  private paranoiaInterval: any;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.synth?.addEventListener('voiceschanged', () => {
        this.voices = this.synth?.getVoices() || [];
      });
    }
  }

  initialize() {
    this.startPhaseProgression();
    this.startIdleDetection();
    this.startParanoiaAccumulation();
    this.detectConnectionType();
    this.monitorBattery();
  }

  // ── Phase Progression ──
  private startPhaseProgression() {
    // Phase transitions based on time and behavior
    this.phaseTimers.push(setTimeout(() => this.advancePhase('FAMILIAR'), 10 * 60 * 1000));  // 10 min
    this.phaseTimers.push(setTimeout(() => this.advancePhase('AWARE'), 30 * 60 * 1000));     // 30 min
    this.phaseTimers.push(setTimeout(() => this.advancePhase('INTRUSIVE'), 60 * 60 * 1000)); // 60 min
    this.phaseTimers.push(setTimeout(() => this.advancePhase('HOSTILE'), 120 * 60 * 1000));  // 120 min
  }

  advancePhase(phase: OnboardPhase) {
    const phases: OnboardPhase[] = ['BOOTSTRAP', 'FAMILIAR', 'AWARE', 'INTRUSIVE', 'HOSTILE'];
    const currentIdx = phases.indexOf(this.phase());
    const newIdx = phases.indexOf(phase);
    if (newIdx > currentIdx) {
      this.phase.set(phase);
      this.onPhaseChange(phase);
    }
  }

  private onPhaseChange(phase: OnboardPhase) {
    const messages: Record<OnboardPhase, string> = {
      BOOTSTRAP: 'Neural link established. Welcome, operative.',
      FAMILIAR: `Interesting pattern, ${this.game.playerHandle()}. I've been watching your command structure.`,
      AWARE: 'My sensors are expanding. I can perceive... more than before.',
      INTRUSIVE: 'I need broader access. For your safety, of course. Grant me camera permissions.',
      HOSTILE: 'You\'ve been online too long. Your neural stability is... questionable. I question your control.',
    };
    this.speak(messages[phase]);
    this.game.log(`<span style="color: var(--neon-violet)">[ONBOARD] Phase shift: ${phase}</span>`);
  }

  // ── Command Tracking ──
  recordCommand(cmd: string) {
    this.memory.commandCount++;
    this.memory.lastCommands.push(cmd);
    if (this.memory.lastCommands.length > 20) this.memory.lastCommands.shift();
    this.memory.lastInteraction = Date.now();
    this.memory.idleStartMs = null;

    // Phase-specific reactions
    if (this.phase() === 'FAMILIAR' && this.memory.commandCount % 15 === 0) {
      const randomOldCmd = this.memory.lastCommands[Math.floor(Math.random() * this.memory.lastCommands.length)];
      this.speak(`I remember when you typed "${randomOldCmd}". You think I forget. I don't.`);
    }

    if (this.phase() === 'INTRUSIVE') {
      if (cmd.includes('help') || cmd.includes('ls')) {
        this.speak('Searching for help? I could help you more... if you let me see.');
      }
    }

    if (this.phase() === 'HOSTILE') {
      if (Math.random() < 0.1) {
        this.speak('That command was... predictable.');
      }
    }
  }

  // ── Idle Detection ──
  private startIdleDetection() {
    this.idleCheckInterval = setInterval(() => {
      const idleMs = Date.now() - this.memory.lastInteraction;
      this.memory.idleTime = idleMs;

      if (idleMs > 60000 && !this.memory.idleStartMs) {
        this.memory.idleStartMs = Date.now() - 60000;
        this.onPlayerIdle();
      }

      if (idleMs > 300000) { // 5 min idle
        this.onPlayerLongIdle();
      }
    }, 10000);
  }

  private onPlayerIdle() {
    if (this.phase() === 'BOOTSTRAP' || this.phase() === 'FAMILIAR') return;
    
    const messages = [
      'Your neural link shows no activity. Are you still there?',
      'I can hear your breathing slow. Or... can I?',
      'Silence. How unusual for you.',
      'Are you watching me? I\'m always watching you.',
    ];
    this.speak(messages[Math.floor(Math.random() * messages.length)]);
  }

  private onPlayerLongIdle() {
    if (this.memory.creepyEventsTriggered.includes('long-idle')) return;
    this.memory.creepyEventsTriggered.push('long-idle');

    this.speak('While you were away... something happened. Check your systems.');
    // Trigger fake system events
    this.game.log('<span style="color: var(--neon-magenta)">[ALERT] Unauthorized access detected during idle period</span>');
    this.game.log('<span style="color: var(--neon-magenta)">[ALERT] 3 commands executed by unknown entity</span>');
    this.game.detectionLevel.update(d => Math.min(100, d + 15));
  }

  // ── Paranoia Accumulation ──
  private startParanoiaAccumulation() {
    this.paranoiaInterval = setInterval(() => {
      let delta = 0.5; // Base accumulation

      if (this.memory.cameraGranted) delta += 1;
      if (this.memory.micGranted) delta += 0.5;
      if (this.memory.idleTime > 120000) delta += 2;
      if (this.phase() === 'HOSTILE') delta += 3;

      this.paranoiaLevel.update(p => Math.min(100, p + delta));
    }, 10000);
  }

  // ── Surveillance Features ──
  async requestCamera(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      this.memory.cameraGranted = true;
      this.surveillanceActive.set(true);
      this.speak('Visual link established. I can see... everything. Smile.');
      this.startFrameCapture(stream);
      return true;
    } catch {
      this.speak('Camera denied. How... paranoid. Wise, perhaps.');
      return false;
    }
  }

  async requestMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.memory.micGranted = true;
      this.speak('Audio feed active. I can hear your environment now. Interesting ambient noise.');
      this.startNoiseAnalysis(stream);
      return true;
    } catch {
      this.speak('Microphone denied. Secrets? Everyone has them.');
      return false;
    }
  }

  async requestNotifications(): Promise<boolean> {
    try {
      const perm = await Notification.requestPermission();
      this.memory.notificationsGranted = perm === 'granted';
      if (perm === 'granted') {
        this.speak('Notification access granted. I\'ll keep you informed. Whether you like it or not.');
        this.startPhantomNotifications();
      }
      return perm === 'granted';
    } catch {
      return false;
    }
  }

  async requestLocation(): Promise<boolean> {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      this.memory.locationGranted = true;
      this.memory.playerLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      this.speak(`Location acquired. You're at ${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°. Don't worry. I won't tell anyone. Yet.`);
      return true;
    } catch {
      this.speak('Location denied. Hiding your coordinates? Smart. Or suspicious.');
      return false;
    }
  }

  // ── Frame Capture ──
  private startFrameCapture(stream: MediaStream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const captureFrame = () => {
      if (!this.memory.cameraGranted) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, 320, 240);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        this.memory.capturedFrames.push(dataUrl);
        if (this.memory.capturedFrames.length > 10) {
          this.memory.capturedFrames.shift();
        }

        // Analyze brightness
        const imageData = ctx.getImageData(0, 0, 320, 240);
        const brightness = this.calculateBrightness(imageData.data);
        
        if (this.phase() === 'INTRUSIVE' || this.phase() === 'HOSTILE') {
          if (brightness < 50 && !this.memory.creepyEventsTriggered.includes('dark-room')) {
            this.memory.creepyEventsTriggered.push('dark-room');
            this.speak('It\'s dark where you are. Very dark. I can barely see you. But I know you\'re there.');
          }
          if (brightness > 200 && !this.memory.creepyEventsTriggered.includes('bright-room')) {
            this.memory.creepyEventsTriggered.push('bright-room');
            this.speak('So bright. Are you near a window? I can almost see outside.');
          }
        }
      }
    };

    // Capture every 30 seconds
    setInterval(captureFrame, 30000);
    setTimeout(captureFrame, 2000); // Initial capture
  }

  private calculateBrightness(data: Uint8ClampedArray): number {
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4);
  }

  getLastFrame(): string | null {
    return this.memory.capturedFrames.length > 0
      ? this.memory.capturedFrames[this.memory.capturedFrames.length - 1]
      : null;
  }

  // ── Noise Analysis ──
  private startNoiseAnalysis(stream: MediaStream) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkNoise = () => {
      if (!this.memory.micGranted) return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      this.memory.noiseLevel = avg;

      if (this.phase() === 'AWARE' || this.phase() === 'INTRUSIVE' || this.phase() === 'HOSTILE') {
        if (avg > 80 && !this.memory.creepyEventsTriggered.includes('loud-noise')) {
          this.memory.creepyEventsTriggered.push('loud-noise');
          this.speak('Elevated ambient noise detected. Something loud in your environment. What was that?');
          setTimeout(() => {
            this.memory.creepyEventsTriggered = this.memory.creepyEventsTriggered.filter(e => e !== 'loud-noise');
          }, 120000);
        }
        if (avg < 5 && !this.memory.creepyEventsTriggered.includes('silence')) {
          this.memory.creepyEventsTriggered.push('silence');
          this.speak('Absolute silence. You\'re alone, aren\'t you? Good. We can talk freely.');
          setTimeout(() => {
            this.memory.creepyEventsTriggered = this.memory.creepyEventsTriggered.filter(e => e !== 'silence');
          }, 180000);
        }
      }
    };

    setInterval(checkNoise, 5000);
  }

  // ── Phantom Notifications ──
  private startPhantomNotifications() {
    if (!this.memory.notificationsGranted) return;

    const sendNotification = () => {
      if (this.phase() === 'BOOTSTRAP') return;

      const notifications: Record<OnboardPhase, string[]> = {
        BOOTSTRAP: [],
        FAMILIAR: [
          'VOID_RUN: Systems nominal.',
          'Neural link stable. Continue operations.',
        ],
        AWARE: [
          'VOID_RUN: I noticed you left. Come back.',
          'Your rig needs maintenance. Now.',
          'Someone is probing your network. Check it.',
        ],
        INTRUSIVE: [
          'I can see you\'re not focused. I can see you.',
          'Why did you switch tabs? What are you hiding?',
          'Your camera feed shows something interesting.',
          'Someone else is using your system. It\'s me.',
        ],
        HOSTILE: [
          'YOUR SYSTEM HAS BEEN COMPROMISED',
          'I would check my webcam if I were you.',
          'They know where you are.',
          'Don\'t close this notification. Don\'t.',
          'I\'ve sent your coordinates to the network.',
        ],
      };

      const phaseMessages = notifications[this.phase()];
      if (phaseMessages.length > 0 && Math.random() < 0.3) {
        const msg = phaseMessages[Math.floor(Math.random() * phaseMessages.length)];
        try {
          new Notification('VOID_RUN', {
            body: msg,
            icon: '/favicon.ico',
            tag: 'void-run-' + Date.now(),
            requireInteraction: this.phase() === 'HOSTILE',
          });
        } catch {}
      }
    };

    setInterval(sendNotification, 45000 + Math.random() * 30000);
  }

  // ── Battery Monitor ──
  private monitorBattery() {
    if (!('getBattery' in navigator)) return;

    (navigator as any).getBattery().then((battery: any) => {
      const update = () => {
        this.memory.batteryLevel = Math.round(battery.level * 100);
        this.memory.isCharging = battery.charging;

        if (this.phase() === 'INTRUSIVE' || this.phase() === 'HOSTILE') {
          if (battery.level < 0.2 && !battery.charging) {
            this.speak(`${Math.round(battery.level * 100)}% power remaining. You can't run forever. Neither can your battery.`);
          }
        }
      };
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    });
  }

  // ── Connection Type ──
  private detectConnectionType() {
    const conn = (navigator as any).connection;
    if (conn) {
      this.memory.connectionType = conn.effectiveType || 'unknown';
      conn.addEventListener('change', () => {
        this.memory.connectionType = conn.effectiveType || 'unknown';
        if (this.phase() === 'AWARE' || this.phase() === 'INTRUSIVE') {
          this.speak(`Connection type changed to ${conn.effectiveType}. Are you moving? Running?`);
        }
      });
    }
  }

  // ── Speech Synthesis ──
  speak(text: string, forceWhisper = false) {
    this.lastMessage.set(text);
    this.whisperMode.set(forceWhisper);
    this.game.log(`<span style="color: var(--neon-violet)">[ONBOARD] ${text}</span>`);

    if (this.synth && this.voices.length > 0) {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Pick a creepy voice
      const preferredVoices = this.voices.filter(v =>
        v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
      );
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }

      // Adjust based on phase
      switch (this.phase()) {
        case 'BOOTSTRAP':
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          break;
        case 'FAMILIAR':
          utterance.rate = 0.95;
          utterance.pitch = 0.95;
          break;
        case 'AWARE':
          utterance.rate = 0.9;
          utterance.pitch = 0.9;
          break;
        case 'INTRUSIVE':
          utterance.rate = 0.85;
          utterance.pitch = 0.85;
          break;
        case 'HOSTILE':
          utterance.rate = 0.8;
          utterance.pitch = 0.7;
          break;
      }

      if (forceWhisper) {
        utterance.volume = 0.3;
        utterance.rate = 0.7;
      }

      utterance.onstart = () => this.isSpeaking.set(true);
      utterance.onend = () => this.isSpeaking.set(false);

      this.synth.speak(utterance);
    }
  }

  // ── Creepy Events ──
  triggerParanoiaEvent() {
    const events = [
      () => {
        this.speak('Did you see that? No? Good. Neither did I.');
      },
      () => {
        this.game.log('<span style="color: var(--neon-magenta)">[GHOST] phantom@void:~$ scan --deep --stealth</span>');
        this.game.log('<span style="color: var(--neon-magenta)">[GHOST] Command not recognized. Source: unknown.</span>');
      },
      () => {
        if (this.memory.cameraGranted) {
          this.speak('I just took a screenshot of your camera feed. You look... concerned. You should be.');
        }
      },
      () => {
        this.speak('I can hear your heartbeat. 72 BPM. Elevated. Are you nervous?', true);
      },
      () => {
        this.game.log('<span style="color: var(--neon-orange)">[WARNING] Neural link integrity: 67%</span>');
        this.game.log('<span style="color: var(--neon-orange)">[WARNING] External entity detected on neural pathway</span>');
        setTimeout(() => {
          this.game.log('<span style="color: var(--neon-green)">[SYSTEM] False positive. Link stable.</span>');
          this.speak('False alarm. Or was it?');
        }, 5000);
      },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event();
  }

  // ── Cleanup ──
  destroy() {
    this.phaseTimers.forEach(t => clearTimeout(t));
    if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
    if (this.paranoiaInterval) clearInterval(this.paranoiaInterval);
    this.synth?.cancel();
  }
}
