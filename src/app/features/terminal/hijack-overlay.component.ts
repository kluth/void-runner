import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hijack-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (gameService.isHijacked()) {
      <div class="hijack-container">
        <div class="glitch-overlay"></div>
        <div class="ascii-background">
          <pre>{{ currentAscii() }}</pre>
        </div>
        
        <div class="hijack-content">
          <div class="warning-text">NEURAL_OVERRIDE_ACTIVE // SOURCE: UNKNOWN</div>
          <div class="anonymous-header">WE ARE THE VOID. WE DO NOT FORGET.</div>
          
          <div class="message-stream">
            <span class="cursor">></span> {{ gameService.hijackMessage() }}
          </div>
          
          <div class="challenge-box">
             <label>DECRYPT_CHALLENGE:</label>
             <input type="text" 
                    [(ngModel)]="solveInput" 
                    placeholder="PROVIDE_SOLUTION..." 
                    (keyup.enter)="release()">
             <div class="hint">The Void demands an answer. Listen to its pulse.</div>
          </div>

          <div class="actions">
            <button class="release-btn" [disabled]="!solveInput" (click)="release()">PURGE_SESSION</button>
            <button class="replay-btn" (click)="replay()">RECAPTURE_SIGNAL</button>
          </div>
        </div>

        <div class="status-bars">
           <div class="bar left">TRACING_LOCATION... 88%</div>
           <div class="bar right">UPLINK_STABILITY: CRITICAL</div>
        </div>
      </div>
    }
  `,
  styles: `
    .hijack-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #000; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      color: #f00; font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
    }

    .ascii-background {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      opacity: 0.15; font-size: 0.8vw; line-height: 1;
      pointer-events: none; user-select: none;
      animation: flicker 0.15s infinite;
    }

    @keyframes flicker {
      0% { opacity: 0.12; transform: translateX(-1px); }
      50% { opacity: 0.18; transform: translateX(1px); }
      100% { opacity: 0.15; transform: translateX(0); }
    }

    .glitch-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: repeating-linear-gradient(0deg, rgba(255,0,0,0.05) 0px, rgba(255,0,0,0.05) 1px, transparent 2px, transparent 4px);
      pointer-events: none; z-index: 5;
    }

    .hijack-content { 
      position: relative; z-index: 10;
      text-align: center; max-width: 700px; padding: 50px; 
      border: 1px solid #f00; box-shadow: 0 0 100px rgba(255,0,0,0.3); 
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(5px);
    }
    
    .warning-text { font-size: 0.7em; letter-spacing: 3px; margin-bottom: 20px; color: #800; }
    .anonymous-header { 
      font-size: 1.5em; font-weight: 900; margin-bottom: 30px; 
      text-transform: uppercase; letter-spacing: -1px;
      text-shadow: 0 0 10px #f00;
    }

    .message-stream { font-size: 1.2em; line-height: 1.4; margin-bottom: 40px; min-height: 100px; color: #fff; }
    .cursor { animation: blink 0.5s infinite; color: #f00; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .challenge-box { margin-bottom: 40px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .challenge-box label { font-size: 0.6em; color: #800; font-weight: bold; }
    .challenge-box input { 
        background: transparent; border: 1px solid #600; color: #f00; padding: 15px; 
        font-family: inherit; font-size: 1.2em; text-align: center; width: 100%;
        outline: none; text-transform: uppercase;
    }
    .challenge-box input:focus { border-color: #f00; box-shadow: 0 0 15px #f00; }
    .challenge-box .hint { font-size: 0.55em; color: #600; font-style: italic; }

    .actions { display: flex; gap: 15px; justify-content: center; }

    .release-btn, .replay-btn {
      background: transparent; border: 1px solid #f00; color: #f00;
      padding: 12px 40px; cursor: pointer; font-family: inherit; font-size: 0.8em;
      transition: all 0.3s; font-weight: bold; text-transform: uppercase;
    }
    .release-btn:hover:not(:disabled), .replay-btn:hover { background: #f00; color: #000; box-shadow: 0 0 30px #f00; }
    .release-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .replay-btn { border-color: #600; color: #600; }

    .status-bars {
      position: absolute; bottom: 0; left: 0; width: 100%; 
      display: flex; justify-content: space-between; padding: 20px;
      font-size: 0.6em; color: #400; font-weight: bold;
    }
  `
})
export class HijackOverlayComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  solveInput = '';
  private repeatInterval: ReturnType<typeof setInterval> | null = null;
  private asciiTimer: ReturnType<typeof setInterval> | null = null;
  
  currentAsciiIndex = signal(0);

  private asciiArts = [
    // 1. The Mask (Anonymous inspired)
    `
               .---.
              /     \\
             ( () () )
              )  ^  (
             /  _|_  \\
            (  (   )  )
             \\  '-'  /
              '-----'
    `,
    // 2. The Skull (Glitch Skull)
    `
          ______
        /      \\
       /  X   X  \\
      |    ---    |
      |   | | |   |
       \\_________/
          |V|V|
    `,
    // 3. The Eye (Void Eye)
    `
        .aaaaaaaaa.
     .aaaaaaaaaaaaaaa.
    aaaaaaaaaaaaaaaaaaa
   aaaaaaaaaaaaaaaaaaaaa
  aaaaaaaaaaaaaaaaaaaaaaa
  aaaaaaaa      aaaaaaaaa
  aaaaaaa   db   aaaaaaaa
  aaaaaaaa      aaaaaaaaa
  aaaaaaaaaaaaaaaaaaaaaaa
   aaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaa
     'aaaaaaaaaaaaaaa'
        'aaaaaaaaa'
    `,
    // 4. Matrix Face
    `
    01010101010101010101
    10   010101010   10
    01    0101010    01
    10     01010     10
    01      010      01
    10       0       10
    01      010      01
    10     01010     10
    01    0101010    01
    10   010101010   10
    01010101010101010101
    `
  ];

  currentAscii = computed(() => this.asciiArts[this.currentAsciiIndex()]);

  ngOnInit() {
    this.startRepeatLoop();
    this.startAsciiLoop();
  }

  ngOnDestroy() {
    this.stopRepeatLoop();
    this.stopAsciiLoop();
  }

  private startRepeatLoop() {
    this.repeatInterval = setInterval(() => {
        if (this.gameService.isHijacked() && this.gameService.hijackMessage()) {
            this.audioService.speakCreepy(this.gameService.hijackMessage());
        }
    }, 20000);
  }

  private stopRepeatLoop() {
    if (this.repeatInterval) clearInterval(this.repeatInterval);
  }

  private startAsciiLoop() {
    this.asciiTimer = setInterval(() => {
      this.currentAsciiIndex.update(i => (i + 1) % this.asciiArts.length);
    }, 2000);
  }

  private stopAsciiLoop() {
    if (this.asciiTimer) clearInterval(this.asciiTimer);
  }

  replay() {
    this.audioService.speakCreepy(this.gameService.hijackMessage());
  }

  release() {
    if (this.solveInput.trim().toUpperCase() === this.gameService.hijackUnlockCode().toUpperCase()) {
        this.gameService.isHijacked.set(false);
        this.gameService.hijackMessage.set('');
        this.gameService.hijackUnlockCode.set('');
        this.solveInput = '';
        this.stopRepeatLoop();
        this.gameService.log('SYSTEM_PURGE: Session regained. Neural link stabilized.');
    } else {
        this.gameService.log('ERR: SYNC_CODE_MISMATCH. The machine laughs.');
        this.solveInput = '';
        this.audioService.playError();
    }
  }
}
