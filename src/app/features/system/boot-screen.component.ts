import { Component, inject, signal, OnInit } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boot-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="boot-container">
      <div class="boot-box">
        <div class="boot-logo">VOID_OS</div>
        <div class="boot-version">BUILD_772.1 // KERNEL_INIT</div>
        
        <div class="log-stream">
          @for (log of bootLogs(); track $index) {
            <div class="log-entry">
              <span class="status">[ OK ]</span> {{ log }}
            </div>
          }
        </div>

        @if (isComplete()) {
          <div class="success-line">SYSTEM_READY. ESTABLISHING_LINK...</div>
        }
      </div>
    </div>
  `,
  styles: `
    .boot-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
      background: #000; z-index: 20000;
      display: flex; align-items: center; justify-content: center;
      color: #00ff00; font-family: 'JetBrains Mono', monospace;
      padding: 1rem;
    }
    .boot-box { 
      width: 100%; 
      max-width: 40rem; 
      padding: 2.5rem; 
      border: 1px solid #111; 
      background: rgba(5,5,5,0.8);
      box-shadow: 0 0 20px rgba(0,255,0,0.05);
    }
    .boot-logo { font-size: clamp(1.5rem, 8vw, 2.5rem); font-weight: 900; letter-spacing: 10px; margin-bottom: 0.75rem; color: #fff; text-shadow: 0 0 10px #00ff00; text-align: center; }
    .boot-version { font-size: 0.6rem; color: #008800; margin-bottom: 2.5rem; border-bottom: 1px solid #222; padding-bottom: 0.75rem; text-align: center; }
    
    .log-stream { display: flex; flex-direction: column; gap: 0.4rem; height: 15rem; overflow: hidden; mask-image: linear-gradient(to bottom, black 80%, transparent 100%); }
    .log-entry { font-size: 0.7rem; line-height: 1.4; }
    .status { color: #fff; font-weight: bold; margin-right: 0.75rem; }
    
    .success-line { margin-top: 2rem; font-size: 0.8rem; color: #00ffff; animation: blink 1s infinite; text-align: center; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    @media (max-width: 480px) {
      .boot-box { padding: 1.5rem; }
      .boot-logo { letter-spacing: 5px; }
      .log-stream { height: 12rem; }
    }
  `
})
export class BootScreenComponent implements OnInit {
  gameService = inject(GameService);
  bootLogs = signal<string[]>([]);
  isComplete = signal(false);

  private steps = [
    "Initializing Neural Kernel...",
    "Bypassing Post-Blackout Firewalls...",
    "Mounting Encrypted Filesystems...",
    "Loading Driver: VOID_NET_V4",
    "Handshaking with Syndicate Relay...",
    "Scanning for 2039 Data Fragments...",
    "Establishing Neural Proxy...",
    "Checking Hardware Integrity...",
    "Scanning for Intrusion Anomalies...",
    "Syncing Global Leaderboard...",
    "Calibrating Audio Interface...",
    "Injecting Cyber-Payloads..."
  ];

  ngOnInit() {
    this.runBootSequence();
  }

  async runBootSequence() {
    for (const step of this.steps) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      this.bootLogs.update(logs => [...logs, step]);
    }
    this.isComplete.set(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.gameService.isBooting.set(false);
  }
}
