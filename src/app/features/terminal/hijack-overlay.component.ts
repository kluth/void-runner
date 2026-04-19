import { Component, inject, signal, OnInit, OnDestroy, computed, effect } from '@angular/core';
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
          
          <div class="system-guide">
            <span class="pulse">!</span> SYSTEM_ERROR: Neural sync lost. 
            @if (gameService.campaignLevel() <= 3) {
                <div class="initiate-help">
                    HINT: The AI wants you to solve this: <b>{{ gameService.hijackUnlockCode() }}</b>
                </div>
            } @else {
                Solve the AI's riddle to regain control.
            }
          </div>

          @if (showHint()) {
              <div class="debugger-hint">
                  <span class="tag">NEURAL_DEBUGGER:</span> {{ getHintMessage() }}
              </div>
          }

          <div class="message-stream">
            <span class="cursor">></span> {{ gameService.hijackMessage() || 'ESTABLISHING_NEURAL_UPLINK...' }}
          </div>
          
          <div class="challenge-box">
             <label>INPUT_RIDDLE_SOLUTION:</label>
             <input type="text" 
                    [(ngModel)]="solveInput" 
                    placeholder="ENTER_KEY_HERE..." 
                    (keyup.enter)="release()">
             <div class="hint">Listen to the Void. The solution is the answer to its question.</div>
          </div>

          <div class="actions">
            <button class="release-btn" [disabled]="!solveInput" (click)="release()">PURGE_SESSION</button>
            <button class="replay-btn" (click)="replay()">RECAPTURE_SIGNAL</button>
            
            @if (showForcePurge()) {
                <button class="force-btn" (click)="forcePurge()">FORCE_PURGE (250cr)</button>
            }
          </div>
        </div>

        <div class="status-bars">
           <div class="bar left">TRACING_LOCATION... {{ 94 + (timeElapsed() / 10) | number:'1.0-0' }}%</div>
           <div class="bar right">UPLINK_STABILITY: {{ 100 - timeElapsed() }}%</div>
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
      opacity: 0.25; font-size: 0.7vw; line-height: 1.1;
      pointer-events: none; user-select: none;
      animation: flicker 0.15s infinite;
      color: #f00;
    }

    @keyframes flicker {
      0% { opacity: 0.20; transform: skewX(-1deg); }
      50% { opacity: 0.30; transform: skewX(1deg); }
      100% { opacity: 0.25; transform: skewX(0); }
    }

    .debugger-hint {
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid #0ff;
        color: #0ff;
        padding: 10px;
        font-size: 0.7em;
        margin-bottom: 20px;
        text-align: left;
    }
    .debugger-hint .tag { font-weight: bold; margin-right: 5px; }

    .initiate-help { color: #0f0; margin-top: 5px; font-size: 1.1em; }

    .glitch-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: repeating-linear-gradient(0deg, rgba(255,0,0,0.08) 0px, rgba(255,0,0,0.08) 1px, transparent 2px, transparent 4px);
      pointer-events: none; z-index: 5;
    }

    .hijack-content { 
      position: relative; z-index: 10;
      text-align: center; max-width: 800px; padding: 40px; 
      border: 2px solid #f00; box-shadow: 0 0 120px rgba(255,0,0,0.4); 
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(8px);
    }
    
    .system-guide {
      border: 1px solid #f00;
      background: rgba(255, 0, 0, 0.1);
      padding: 10px;
      font-size: 0.7em;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .system-guide .pulse {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: #f00;
      border-radius: 50%;
      margin-right: 10px;
      animation: guide-pulse 0.8s infinite;
    }

    @keyframes guide-pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }

    .warning-text { font-size: 0.8em; letter-spacing: 4px; margin-bottom: 20px; color: #800; font-weight: bold; }
    .anonymous-header { 
      font-size: 1.8em; font-weight: 900; margin-bottom: 30px; 
      text-transform: uppercase; letter-spacing: -2px;
      text-shadow: 0 0 15px #f00, 0 0 30px #f00;
    }

    .message-stream { font-size: 1.2em; line-height: 1.5; margin-bottom: 40px; min-height: 100px; color: #fff; }
    .cursor { animation: blink 0.5s infinite; color: #f00; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .challenge-box { margin-bottom: 40px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .challenge-box label { font-size: 0.7em; color: #800; font-weight: bold; letter-spacing: 2px; }
    .challenge-box input { 
        background: rgba(40,0,0,0.3); border: 2px solid #800; color: #f00; padding: 15px; 
        font-family: inherit; font-size: 1.4em; text-align: center; width: 100%;
        outline: none; text-transform: uppercase;
    }
    .challenge-box input:focus { border-color: #f00; box-shadow: 0 0 20px #f00; }
    .challenge-box .hint { font-size: 0.6em; color: #800; font-style: italic; }

    .actions { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }

    .release-btn, .replay-btn, .force-btn {
      background: transparent; border: 2px solid #f00; color: #f00;
      padding: 12px 30px; cursor: pointer; font-family: inherit; font-size: 0.8em;
      transition: all 0.3s; font-weight: 900; text-transform: uppercase;
    }
    .release-btn:hover:not(:disabled), .replay-btn:hover { background: #f00; color: #000; box-shadow: 0 0 30px #f00; }
    .release-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    
    .force-btn { border-color: #ffaa00; color: #ffaa00; }
    .force-btn:hover { background: #ffaa00; color: #000; box-shadow: 0 0 30px #ffaa00; }

    .status-bars {
      position: absolute; bottom: 0; left: 0; width: 100%; 
      display: flex; justify-content: space-between; padding: 25px;
      font-size: 0.7em; color: #600; font-weight: bold;
    }
  `
})
export class HijackOverlayComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  solveInput = '';
  
  timeElapsed = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private repeatInterval: ReturnType<typeof setInterval> | null = null;
  private asciiTimer: ReturnType<typeof setInterval> | null = null;
  
  currentAsciiIndex = signal(0);
  showHint = computed(() => this.timeElapsed() >= 25);
  showForcePurge = computed(() => this.timeElapsed() >= 50);

  private asciiArts = [
    `
                 MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
             MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
          MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
        MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
       MMMMMMWNXK00KKXNWMMMMMMMMMMMMMMMMMMMWX00KKXNWMMMMMM
      MMMMMXx:''....'';cdOXWMMMMMMMMMMMWXOdc;''....'':xXMMM
     MMMMNo.   .::::.    .,o0WMMMMMMW0o,.    .::::.   .oNMM
    MMMM0;    :O0KK0O:      .oXMMMMXo.      :O0KK0O:    ;0MM
    MMMWl     xKKKKKKx       .kMMMMk.       xKKKKKKx     lWM
    MMMN:     cO0KK0Oc       .kMMMMk.       cO0KK0Oc     :NM
    MMMWo      .;::;.       .oXMMMMXo.       .;::;.      oWM
    MMMMXo.               .ckWMMMMMMWkc.               .oXMM
     MMMMWKdc,.      ..;cxKWMMMMMMMMMMWKxc;..      .,cdKWMM
      MMMMMMMWNXK00KXNWMMMMMMMMMMMMMMMMMMMMWNXK00KXNWMMMMMM
        MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
          MMMMMMMMMMMMMMMMMMMWWWWWWWMMMMMMMMMMMMMMMMMM
            MMMMMMMMMMMWKOxdollllllodxOKWMMMMMMMMMMM
               MMMMMMW0o;..        ..;o0WMMMMMM
                 MMMMXo.              .oXMMMM
                  MMWl      ......      lWM
                  MMN:     ........     :NM
                  MMWl      ......      lWM
                   NKd.                .dKN
    `,
    `
                00000000000000000000000000
             00000000000000000000000000000000
           000000000000000000000000000000000000
          00000000000000000000000000000000000000
         0000000111110000000000000000111110000000
        000000111111111000000000000111111111000000
        000000111  1111000000000000111  1111000000
        000000111111111000000000000111111111000000
         0000000111110000000000000000111110000000
          00000000000000000000000000000000000000
           000000000000011111111000000000000000
             000000000011111111110000000000
               0000000011 11 11 1100000000
                 00000011 11 11 11000000
                    0001111111111000
    `
  ];

  currentAscii = computed(() => this.asciiArts[this.currentAsciiIndex()]);

  constructor() {
      // Reset timer when a new hijack starts
      effect(() => {
          if (this.gameService.isHijacked()) {
              this.timeElapsed.set(0);
              this.startTimer();
          } else {
              this.stopTimer();
          }
      });
  }

  ngOnInit() {
    this.startRepeatLoop();
    this.startAsciiLoop();
  }

  ngOnDestroy() {
    this.stopRepeatLoop();
    this.stopAsciiLoop();
    this.stopTimer();
  }

  private startTimer() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
          this.timeElapsed.update(t => t + 1);
      }, 1000);
  }

  private stopTimer() {
      if (this.timer) clearInterval(this.timer);
  }

  getHintMessage() {
      const code = this.gameService.hijackUnlockCode();
      if (!isNaN(Number(code))) return "The answer is a simple INTEGER. Calculate the sum the AI posed.";
      if (code.length <= 4 && /^[0-9A-F]+$/.test(code)) return "The answer is a short HEXADECIMAL byte.";
      if (/^[01]+$/.test(code)) return "The answer is a BINARY string (0 and 1 only).";
      return "The answer is a specific WORD spelled backwards. Listen carefully.";
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
    }, 2500);
  }

  private stopAsciiLoop() {
    if (this.asciiTimer) clearInterval(this.asciiTimer);
  }

  replay() {
    this.audioService.speakCreepy(this.gameService.hijackMessage());
  }

  forcePurge() {
      if (this.gameService.credits() >= 250) {
          this.gameService.credits.update(c => c - 250);
          this.gameService.log('SYSTEM_FORCE_PURGE: 250cr expended to bypass override.');
          this.terminateHijack();
      } else {
          this.gameService.reputation.update(r => Math.max(0, r - 50));
          this.gameService.log('SYSTEM_FORCE_PURGE: Insufficient credits. Reputation burned to bypass override.');
          this.terminateHijack();
      }
  }

  private terminateHijack() {
      this.gameService.isHijacked.set(false);
      this.gameService.hijackMessage.set('');
      this.gameService.hijackUnlockCode.set('');
      this.solveInput = '';
      this.stopRepeatLoop();
      this.audioService.playSuccess();
  }

  release() {
    if (this.solveInput.trim().toUpperCase() === this.gameService.hijackUnlockCode().toUpperCase()) {
        this.terminateHijack();
        this.gameService.log('SYSTEM_PURGE: Session regained. Neural link stabilized.');
    } else {
        this.gameService.log('ERR: SYNC_CODE_MISMATCH. The machine laughs.');
        this.solveInput = '';
        this.audioService.playError();
    }
  }
}
