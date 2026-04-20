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
      background: var(--layer-0); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      color: var(--tertiary); font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
    }

    .ascii-background {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      opacity: 0.15; font-size: 0.7vw; line-height: 1.1;
      pointer-events: none; user-select: none;
      animation: flicker 0.15s infinite;
      color: var(--tertiary);
    }

    @keyframes flicker {
      0% { opacity: 0.10; transform: skewX(-1deg); }
      50% { opacity: 0.20; transform: skewX(1deg); }
      100% { opacity: 0.15; transform: skewX(0); }
    }

    .debugger-hint {
        background: var(--layer-2);
        border: var(--ghost-border);
        color: var(--primary);
        padding: 15px;
        font-size: 0.7rem;
        margin-bottom: 2rem;
        text-align: left;
    }
    .debugger-hint .tag { font-weight: 900; margin-right: 8px; }

    .initiate-help { color: var(--secondary); margin-top: 8px; font-size: 1rem; font-family: 'Space Grotesk', sans-serif; font-weight: 900; }

    .glitch-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: repeating-linear-gradient(0deg, rgba(193, 0, 20, 0.08) 0px, rgba(193, 0, 20, 0.08) 1px, transparent 2px, transparent 4px);
      pointer-events: none; z-index: 5;
    }
    
    .hijack-content { 
      position: relative; z-index: 10;
      text-align: center; max-width: 800px; padding: 3rem; 
      border: 2px solid var(--tertiary); box-shadow: 0 0 150px rgba(193, 0, 20, 0.3); 
      background: rgba(14, 14, 14, 0.95);
      backdrop-filter: blur(20px);
    }
    
    .system-guide {
      background: var(--layer-2);
      padding: 15px;
      font-size: 0.7rem;
      margin-bottom: 2rem;
      line-height: 1.6;
      border-left: 4px solid var(--tertiary);
    }

    .system-guide .pulse {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: var(--tertiary);
      margin-right: 10px;
      animation: guide-pulse 0.8s steps(2) infinite;
    }

    @keyframes guide-pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

    .warning-text { font-size: 0.7rem; letter-spacing: 4px; margin-bottom: 1rem; color: var(--tertiary); font-weight: 900; opacity: 0.6; }
    .anonymous-header { 
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.8rem; font-weight: 900; margin-bottom: 2.5rem; 
      text-transform: uppercase; letter-spacing: -0.05em;
      color: #fff;
      text-shadow: 0 0 15px var(--tertiary);
    }

    .message-stream { font-size: 1.1rem; line-height: 1.6; margin-bottom: 3rem; min-height: 100px; color: #fff; }
    .cursor { animation: blink 0.5s steps(2) infinite; color: var(--tertiary); }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .challenge-box { margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .challenge-box label { font-size: 0.6rem; color: var(--tertiary); font-weight: 900; letter-spacing: 2px; }
    .challenge-box input { 
        background: var(--layer-0); border: var(--ghost-border); color: var(--tertiary); padding: 1.5rem; 
        font-family: inherit; font-size: 1.4rem; text-align: center; width: 100%;
        outline: none; text-transform: uppercase;
    }
    .challenge-box input:focus { border-color: var(--tertiary); box-shadow: 0 0 20px rgba(193, 0, 20, 0.2); }
    .challenge-box .hint { font-size: 0.6rem; color: var(--tertiary); opacity: 0.4; font-style: italic; }

    .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

    .release-btn, .replay-btn, .force-btn {
      background: transparent; border: var(--ghost-border); color: var(--tertiary);
      padding: 1rem 2rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem;
      transition: all 0.05s steps(2); font-weight: 900; text-transform: uppercase;
    }
    .release-btn:hover:not(:disabled), .replay-btn:hover { background: var(--tertiary); color: #fff; box-shadow: 0 0 30px var(--tertiary); }
    .release-btn:disabled { opacity: 0.2; cursor: not-allowed; }
    
    .force-btn { color: #ffaa00; border-color: #ffaa00; }
    .force-btn:hover { background: #ffaa00; color: #000; box-shadow: 0 0 30px #ffaa00; }

    .status-bars {
      position: absolute; bottom: 0; left: 0; width: 100%; 
      display: flex; justify-content: space-between; padding: 2rem;
      font-size: 0.6rem; color: var(--tertiary); opacity: 0.4; font-weight: 900;
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
         .u888888888u.
       .888888888888888.
      d88888888P"Y888888b
      8888888P'   \`888888
      \`Y88888P     d88888
        \`Y8888.   .88888P
          \`Y888   8888P'
            Y88   88P'
            |88   88|
            |88   88|
            j88   88k
           .88P   Y88.
           d88'   \`88b
          .88P     Y88.
          d88'     \`88b
         .88P       Y88.
         888         888
         Y88b       d88P
          "Y888888888P"
            \`"Y888P"'

              .8888.
             d888888b
             88888888
             Y888888P
              \`Y88P'
  `,
  `
               MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
...
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
