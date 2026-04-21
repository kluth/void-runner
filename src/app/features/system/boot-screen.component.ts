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
        <div class="boot-logo">VOID<span class="logo-accent">_OS</span></div>
        <div class="boot-version">BUILD_772.1 // NEURAL_KERNEL_INIT</div>
        
        <div class="log-stream">
          @for (log of bootLogs(); track $index) {
            <div class="log-entry">
              <span class="status">[<span class="check">OK</span>]</span> {{ log }}
            </div>
          }
        </div>

        @if (isComplete()) {
          <div class="success-line">
            <span class="success-icon">▶</span> SYSTEM_READY. ESTABLISHING_UPLINK...
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .boot-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
      background: var(--layer-0); z-index: 20000;
      display: flex; align-items: center; justify-content: center;
      color: var(--secondary); font-family: 'JetBrains Mono', monospace;
      padding: 1rem;
      /* Diagonal accent lines in background */
      background-image: 
        linear-gradient(135deg, rgba(252,238,9,0.03) 25%, transparent 25%),
        linear-gradient(225deg, rgba(0,240,255,0.02) 25%, transparent 25%);
      background-size: 100% 100%;
    }
    .boot-box { 
      width: 100%; 
      max-width: 40rem; 
      padding: 2.5rem; 
      border: 1px solid rgba(252, 238, 9, 0.3); 
      background: var(--layer-1);
      box-shadow: var(--neon-shadow);
      clip-path: var(--clip-notch);
      position: relative;
    }
    /* Top-left neon corner */
    .boot-box::before {
      content: '';
      position: absolute; top: -1px; left: -1px;
      width: 20px; height: 20px;
      border-top: 2px solid var(--primary);
      border-left: 2px solid var(--primary);
      filter: drop-shadow(0 0 6px var(--primary));
    }
    /* Bottom-right cyan corner */
    .boot-box::after {
      content: '';
      position: absolute; bottom: -1px; right: -1px;
      width: 20px; height: 20px;
      border-bottom: 2px solid var(--secondary);
      border-right: 2px solid var(--secondary);
      filter: drop-shadow(0 0 6px var(--secondary));
    }

    .boot-logo {
      font-family: 'Orbitron', 'JetBrains Mono', monospace;
      font-size: clamp(1.8rem, 8vw, 3rem);
      font-weight: 900;
      letter-spacing: 12px;
      margin-bottom: 0.5rem;
      color: var(--primary);
      text-shadow: 0 0 10px var(--primary), 0 0 40px rgba(252,238,9,0.3);
      text-align: center;
      animation: neon-flicker 3s infinite;
    }
    .logo-accent {
      color: var(--secondary);
      text-shadow: 0 0 10px var(--secondary), 0 0 40px rgba(0,240,255,0.3);
    }
    .boot-version {
      font-size: 0.6rem;
      color: var(--text-dim);
      margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(252,238,9,0.15);
      padding-bottom: 0.75rem;
      text-align: center;
      letter-spacing: 3px;
      font-family: 'Orbitron', monospace;
    }
    
    .log-stream {
      display: flex; flex-direction: column; gap: 0.4rem;
      height: 15rem; overflow: hidden;
      mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    }
    .log-entry {
      font-size: 0.7rem; line-height: 1.4;
      border-left: 2px solid rgba(252,238,9,0.2);
      padding-left: 8px;
    }
    .status { color: var(--text-dim); font-weight: bold; margin-right: 0.75rem; }
    .check { color: var(--primary); }
    
    .success-line {
      margin-top: 2rem; font-size: 0.8rem;
      color: var(--primary);
      text-shadow: 0 0 10px var(--primary);
      animation: blink 1s steps(2) infinite;
      text-align: center;
      font-family: 'Orbitron', monospace;
      letter-spacing: 2px;
    }
    .success-icon { color: var(--success); }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes neon-flicker {
      0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
        text-shadow: 0 0 10px var(--primary), 0 0 40px rgba(252,238,9,0.3);
        opacity: 1;
      }
      20%, 24%, 55% { text-shadow: none; opacity: 0.85; }
    }

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
