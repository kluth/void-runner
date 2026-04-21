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
        
        <div class="ascii-modal">
          <div class="ascii-border-top">┌── SYSTEM_OVERRIDE_IN_PROGRESS ───────────────────────────────────────────┐</div>
          
          <div class="modal-body">
            <div class="ascii-border-left">│</div>
            
            <div class="modal-content">
              <div class="ascii-art-container">
                <pre>{{ currentAscii() }}</pre>
              </div>

              <div class="warning-header">NEURAL_OVERRIDE_ACTIVE // SOURCE: VOID</div>
              
              <div class="message-stream">
                <span class="cursor">></span> {{ gameService.hijackMessage() || 'ESTABLISHING_NEURAL_UPLINK...' }}
              </div>

              <div class="challenge-box">
                @if (gameService.campaignLevel() <= 3) {
                    <div class="hint-box">
                        [DEBUG_HINT]: KEY_REQUIRED = "{{ gameService.hijackUnlockCode() }}"
                    </div>
                }

                <div class="input-area">
                  <span class="prompt">SYNC_CODE:</span>
                  <input type="text" 
                         [(ngModel)]="solveInput" 
                         (keyup.enter)="release()"
                         placeholder="........"
                         autofocus>
                </div>
              </div>

              <div class="actions">
                <button class="action-btn" [disabled]="!solveInput" (click)="release()">[ PURGE_SESSION ]</button>
                <button class="action-btn" (click)="replay()">[ REPLAY_SIGNAL ]</button>
                
                @if (showForcePurge()) {
                    <button class="action-btn force" (click)="forcePurge()">[ FORCE_PURGE_250cr ]</button>
                }
              </div>

              <div class="status-info">
                 <span class="status-item">TRACE: {{ 94 + (timeElapsed() / 10) | number:'1.0-0' }}%</span>
                 <span class="status-item">STABILITY: {{ 100 - timeElapsed() }}%</span>
              </div>
            </div>

            <div class="ascii-border-right">│</div>
          </div>

          <div class="ascii-border-bottom">└──────────────────────────────────────────────────────────────────────────┘</div>
        </div>
      </div>
    }
  `,
  styles: `
    .hijack-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #000; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      color: var(--primary); font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
    }

    .glitch-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, rgba(0, 255, 0, 0.03) 1px, transparent 2px, transparent 4px);
      pointer-events: none; z-index: 5;
    }

    .ascii-modal {
      position: relative;
      z-index: 10;
      background: #000;
      display: flex;
      flex-direction: column;
      max-width: 90vw;
    }

    .ascii-border-top, .ascii-border-bottom {
      white-space: nowrap;
      overflow: hidden;
      font-size: 0.8rem;
      color: var(--primary);
    }

    .modal-body {
      display: flex;
    }

    .ascii-border-left, .ascii-border-right {
      width: 1ch;
      border-left: 1px solid var(--primary);
      margin: 0 4px;
      opacity: 0.5;
    }

    .modal-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .ascii-art-container {
      font-size: 0.5rem;
      line-height: 1;
      margin-bottom: 1.5rem;
      opacity: 0.7;
      color: var(--primary-bright);
      animation: flicker 0.2s infinite alternate;
    }

    @keyframes flicker {
      from { opacity: 0.5; }
      to { opacity: 0.8; }
    }

    .warning-header {
      font-size: 0.7rem;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
      font-weight: 900;
      background: var(--primary);
      color: #000;
      padding: 2px 10px;
    }

    .message-stream {
      font-size: 1rem;
      margin-bottom: 2rem;
      min-height: 60px;
      color: var(--primary-bright);
      max-width: 500px;
    }

    .cursor { animation: blink 0.5s steps(2) infinite; }
    @keyframes blink { 0% { opacity: 0; } 100% { opacity: 1; } }

    .challenge-box {
      width: 100%;
      margin-bottom: 2rem;
    }

    .hint-box {
      font-size: 0.65rem;
      color: var(--secondary);
      margin-bottom: 1rem;
      border: 1px dashed var(--secondary);
      padding: 5px;
    }

    .input-area {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary);
      padding: 10px;
    }

    .prompt { font-size: 0.8rem; font-weight: 900; }

    input {
      background: transparent;
      border: none;
      color: var(--primary-bright);
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      width: 120px;
      text-transform: uppercase;
    }

    .actions {
      display: flex;
      gap: 15px;
      margin-bottom: 2rem;
    }

    .action-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      font-size: 0.75rem;
      padding: 5px 10px;
      cursor: pointer;
    }

    .action-btn:hover:not(:disabled) {
      background: var(--primary);
      color: #000;
    }

    .action-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .action-btn.force {
      color: var(--secondary);
    }
    .action-btn.force:hover {
      background: var(--secondary);
      color: #000;
    }

    .status-info {
      display: flex;
      gap: 30px;
      font-size: 0.6rem;
      opacity: 0.6;
    }

    .status-item { font-weight: 900; }
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
