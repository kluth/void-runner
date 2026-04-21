import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lockout-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (gameService.lockoutActive()) {
      <div class="lockout-overlay" role="dialog" aria-modal="true" aria-label="Emergency System Lockout">
        <div class="lockout-box">
          <div class="header">
             <div class="alert-icon" aria-hidden="true">[!]</div>
             <h2 class="glitch-title">NODE_LOCKOUT_ENGAGED</h2>
          </div>
          
          <div class="timer" [class.danger]="gameService.lockoutTimer() < 10">
            PURGE_ESTIMATED: {{ gameService.lockoutTimer() }}s
          </div>

          <div class="puzzle-status">
             PUZZLES_RESOLVED: {{ gameService.lockoutSolvedCount() }} / 3
          </div>

          @if (currentPuzzle()) {
            <div class="puzzle-chamber">
               <div class="challenge">"{{ currentPuzzle().q }}"</div>
               <div class="input-row">
                  <input type="text" [(ngModel)]="puzzleInput" 
                         (keyup.enter)="submitAnswer()"
                         placeholder="RESOLVE_SYNTAX..."
                         autofocus>
                  <button class="primary" (click)="submitAnswer()">EXECUTE</button>
               </div>
               <div class="hint">FAILURE_PENALTY: -5 SECONDS</div>
            </div>
          }
          
          <div class="noise-line" aria-hidden="true">AUTHENTICATION_PROTOCOL: PENDING_RE_SYNC</div>
        </div>
      </div>
    }
  `,
  styles: `
    .lockout-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(14, 14, 14, 0.95); backdrop-filter: blur(10px);
      z-index: 30000; display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
    }
    
    .lockout-box {
      width: 100%; max-width: 600px; padding: 3rem;
      background: var(--layer-1); border: 2px solid var(--tertiary);
      box-shadow: 0 0 100px var(--tertiary);
      text-align: center;
    }

    .alert-icon { font-size: 3rem; color: var(--tertiary); margin-bottom: 1rem; }
    h2 { color: var(--tertiary); font-size: 1.5rem; margin-bottom: 2rem; }

    .timer {
      font-family: 'JetBrains Mono', monospace; font-size: 2.5rem;
      color: var(--primary); margin-bottom: 1rem;
    }
    .timer.danger { color: var(--tertiary); animation: flicker 0.1s infinite; }

    .puzzle-status {
      font-size: 0.8rem; font-weight: 900; color: var(--secondary);
      margin-bottom: 2rem; background: var(--layer-2); padding: 8px;
    }

    .puzzle-chamber {
      background: var(--layer-0); padding: 2rem; margin-bottom: 2rem;
    }
    .challenge { font-size: 1.1rem; color: #fff; margin-bottom: 2rem; line-height: 1.6; }
    
    .input-row { display: flex; gap: 10px; }
    input { flex: 1; border-bottom: 2px solid var(--tertiary) !important; font-size: 1.1rem; }
    
    .hint { font-size: 0.6rem; color: var(--tertiary); opacity: 0.5; margin-top: 15px; font-weight: 900; }
    .noise-line { font-size: 0.5rem; opacity: 0.2; font-family: 'JetBrains Mono', monospace; }

    @keyframes flicker { from { opacity: 1; } to { opacity: 0.5; } }
  `
})
export class LockoutOverlayComponent {
  gameService = inject(GameService);
  puzzleInput = '';

  currentPuzzle() {
    return this.gameService.lockoutPuzzles()[this.gameService.lockoutSolvedCount()];
  }

  submitAnswer() {
    if (this.puzzleInput.trim()) {
      this.gameService.solveLockoutPuzzle(this.puzzleInput.trim());
      this.puzzleInput = '';
    }
  }
}
