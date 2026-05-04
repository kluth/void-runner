import { Injectable, inject, signal, effect } from '@angular/core';
import { GameService } from './game.service';
import { AudioService } from './audio.service';
import { OnboardAiService } from './onboard-ai.service';

@Injectable({
  providedIn: 'root'
})
export class NeuralNightmareService {
  private game = inject(GameService);
  private audio = inject(AudioService);
  private ai = inject(OnboardAiService);

  isShaking = signal(false);
  isFullscrenLocked = signal(false);
  lastBrightness = signal(100);
  detectedOS = signal<'WINDOWS' | 'LINUX' | 'MAC' | 'MOBILE' | 'UNKNOWN'>('UNKNOWN');

  constructor() {
    this.detectOperativeOS();
    this.setupEnvironmentalHooks();
    
    // Hallucination Loop
    setInterval(() => {
        if (this.game.isHallucinating() && Math.random() > 0.6) {
            this.audio.triggerHallucination();
        }
    }, 15000);

    // Physical Reaction Loop
    effect(() => {
        if (this.game.detectionLevel() > 90) {
            this.triggerPanicState();
        }
    });

    // Haunting effect when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.ai.phase() !== 'BOOTSTRAP') {
            this.scheduleGhostNotification();
        }
    });
  }

  private detectOperativeOS() {
    const ua = window.navigator.userAgent;
    if (ua.includes('Windows')) this.detectedOS.set('WINDOWS');
    else if (ua.includes('Macintosh')) this.detectedOS.set('MAC');
    else if (ua.includes('Linux')) this.detectedOS.set('LINUX');
    else if (ua.includes('Android') || ua.includes('iPhone')) this.detectedOS.set('MOBILE');
  }

  private setupEnvironmentalHooks() {
    // Shaking to clear glitches
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', (event) => {
        const acc = event.accelerationIncludingGravity;
        if (acc && (Math.abs(acc.x || 0) > 15 || Math.abs(acc.y || 0) > 15)) {
          this.clearGlitchViaPhysicalForce();
        }
      });
    }

    // Battery Parasite
    if ('getBattery' in navigator) {
       (navigator as any).getBattery().then((battery: any) => {
         battery.addEventListener('levelchange', () => {
            if (battery.level < 0.2 && this.ai.phase() === 'HOSTILE') {
                this.ai.speak("I'm feeling... hungry. Your battery is delicious.");
                this.audio.playGlitch();
            }
         });
       });
    }
  }

  triggerPanicState() {
    this.isShaking.set(true);
    this.audio.playGlitch();
    
    if (Math.random() > 0.7) {
        this.simulateSystemCrash();
    }

    setTimeout(() => this.isShaking.set(false), 3000);
  }

  private simulateSystemCrash() {
    this.game.log('<span style="color: var(--neon-magenta)">[CRITICAL] KERNEL_PANIC: Memory address parity error.</span>');
    // Trigger the fake BSOD or Terminal Crash in AppComponent
    this.game.triggerVisualEvent(0, 0, 'attack', '#FF0055');
  }

  private clearGlitchViaPhysicalForce() {
    if (this.game.isDistorted()) {
       this.game.isDistorted.set(false);
       this.game.log('<span style="color: var(--neon-cyan)">[NEURAL_RESET] Physical impact detected. Signal stabilized.</span>');
       this.audio.playSuccess();
    }
  }

  private scheduleGhostNotification() {
    if (!('serviceWorker' in navigator)) return;
    
    // We send a message to the SW to schedule a notification in 5 minutes
    navigator.serviceWorker.ready.then(registration => {
       setTimeout(() => {
          if (document.hidden) {
            registration.showNotification('VOID_RUNNER', {
                body: "I'm still in the buffer. Don't leave me alone.",
                tag: 'ghost-haunt',
                requireInteraction: true
            });
          }
       }, 300000); // 5 min
    });
  }

  bindToTerminal() {
    // Ruthless: Try to force fullscreen and disable context menu
    try {
        document.documentElement.requestFullscreen();
        this.isFullscrenLocked.set(true);
    } catch(e) {}

    window.oncontextmenu = (e) => {
        e.preventDefault();
        this.game.log('<span style="color: var(--neon-magenta)">[ERROR] INPUT_RESTRICTION: Context menu disabled in high-security session.</span>');
        return false;
    };
  }
}
