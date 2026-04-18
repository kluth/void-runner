import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
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
        <div class="hijack-content">
          <div class="warning-text">CONNECTED_TO_THE_VOID</div>
          <div class="eye-icon">👁️</div>
          <div class="message-stream">
            <span class="cursor">></span> {{ gameService.hijackMessage() }}
          </div>
          
          <div class="challenge-box">
             <label>KERNEL_VALIDATION_REQD:</label>
             <input type="text" 
                    [(ngModel)]="solveInput" 
                    placeholder="ENTER_SYNC_CODE..." 
                    (keyup.enter)="release()">
             <div class="hint">The machine has the key. Listen. Read.</div>
          </div>

          <div class="actions">
            <button class="release-btn" [disabled]="!solveInput" (click)="release()">PURGE_SESSION</button>
            <button class="replay-btn" (click)="replay()">REPLAY_SIGNAL</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .hijack-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.95); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      color: #f00; font-family: 'JetBrains Mono', monospace;
      animation: flash 0.1s infinite alternate;
    }
    
    @keyframes flash {
      from { background: rgba(10, 0, 0, 0.95); }
      to { background: rgba(0, 0, 0, 0.98); }
    }

    .glitch-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: repeating-linear-gradient(0deg, rgba(255,0,0,0.03) 0px, rgba(255,0,0,0.03) 1px, transparent 2px, transparent 4px);
      pointer-events: none;
    }

    .hijack-content { text-align: center; max-width: 600px; padding: 40px; border: 1px solid #f00; box-shadow: 0 0 50px #f00; background: #000; }
    
    .warning-text { font-size: 0.8em; letter-spacing: 5px; margin-bottom: 30px; color: #800; }
    .eye-icon { font-size: 5em; margin-bottom: 20px; animation: look 3s infinite; }
    
    @keyframes look {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); filter: drop-shadow(0 0 20px #f00); }
      100% { transform: scale(1); }
    }

    .message-stream { font-size: 1.1em; line-height: 1.5; margin-bottom: 30px; min-height: 80px; color: #fff; }
    .cursor { animation: blink 0.5s infinite; color: #f00; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .challenge-box { margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .challenge-box label { font-size: 0.6em; color: #800; font-weight: bold; }
    .challenge-box input { 
        background: #000; border: 1px solid #400; color: #f00; padding: 12px; 
        font-family: inherit; font-size: 1em; text-align: center; width: 100%;
        outline: none;
    }
    .challenge-box input:focus { border-color: #f00; box-shadow: 0 0 10px #f00; }
    .challenge-box .hint { font-size: 0.5em; color: #400; font-style: italic; }

    .actions { display: flex; gap: 10px; justify-content: center; }

    .release-btn, .replay-btn {
      background: transparent; border: 1px solid #f00; color: #f00;
      padding: 10px 30px; cursor: pointer; font-family: inherit; font-size: 0.7em;
      transition: all 0.3s; font-weight: bold;
    }
    .release-btn:hover:not(:disabled), .replay-btn:hover { background: #f00; color: #000; box-shadow: 0 0 20px #f00; }
    .release-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .replay-btn { border-color: #800; color: #800; }
  `
})
export class HijackOverlayComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  solveInput = '';
  private repeatInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.startRepeatLoop();
  }

  ngOnDestroy() {
    this.stopRepeatLoop();
  }

  private startRepeatLoop() {
    this.repeatInterval = setInterval(() => {
        if (this.gameService.isHijacked() && this.gameService.hijackMessage()) {
            this.audioService.speakCreepy(this.gameService.hijackMessage());
        }
    }, 20000); // Repeat every 20 seconds
  }

  private stopRepeatLoop() {
    if (this.repeatInterval) clearInterval(this.repeatInterval);
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
    }
  }
}
