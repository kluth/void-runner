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
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #000; z-index: 20000;
      display: flex; align-items: center; justify-content: center;
      color: #00ff00; font-family: 'JetBrains Mono', monospace;
    }
    .boot-box { width: 600px; padding: 40px; border: 1px solid #111; }
    .boot-logo { font-size: 2em; font-weight: 900; letter-spacing: 10px; margin-bottom: 10px; color: #fff; text-shadow: 0 0 10px #00ff00; }
    .boot-version { font-size: 0.6em; color: #008800; margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 10px; }
    
    .log-stream { display: flex; flex-direction: column; gap: 5px; height: 250px; overflow: hidden; }
    .log-entry { font-size: 0.7em; }
    .status { color: #fff; font-weight: bold; margin-right: 10px; }
    
    .success-line { margin-top: 30px; font-size: 0.8em; color: #00ffff; animation: blink 1s infinite; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
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
