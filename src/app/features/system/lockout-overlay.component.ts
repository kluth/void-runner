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
      <div class="lockout-terminal-overlay" role="dialog" aria-modal="true" aria-label="Emergency System Lockout">
        <div class="ascii-modal">
          <pre>
┌────────────────────────────────────────────────────────────┐
│ <span class="alert-title">NODE_LOCKOUT_ENGAGED</span>                                       │
├────────────────────────────────────────────────────────────┤
│ STATUS: <span class="status-warn">AUTHENTICATION_FAILURE</span>                              │
│ PURGE_ESTIMATED: <span class="timer-val" [class.danger]="gameService.lockoutTimer() < 10">{{ gameService.lockoutTimer().toString().padStart(2, '0') }}s</span>                                │
│ RESOLVED: [{{ getProgress() }}] {{ gameService.lockoutSolvedCount() }}/3                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ CHALLENGE:                                                 │
│ <span class="challenge-text">"{{ currentPuzzle()?.q }}"</span>                                 │
│                                                            │
│ <span class="input-prompt">></span> <input type="text" [(ngModel)]="puzzleInput" 
                         (keyup.enter)="submitAnswer()"
                         placeholder="RESOLVE_SYNTAX..."
                         class="terminal-input"
                         autofocus>                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ <span class="hint-text">FAILURE_PENALTY: -5 SECONDS</span>                                  │
│ <span class="noise-text">PROTOCOL: PENDING_RE_SYNC</span>                                    │
└────────────────────────────────────────────────────────────┘
          </pre>
        </div>
      </div>
    }
  `,
  styles: `
    .lockout-terminal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: 30000; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .ascii-modal {
      color: var(--primary);
    }
    pre { margin: 0; line-height: 1.2; position: relative; }
    .alert-title { color: var(--tertiary); font-weight: bold; }
    .status-warn { color: var(--tertiary); }
    .timer-val { font-weight: bold; }
    .timer-val.danger { color: var(--tertiary); animation: blink 0.1s steps(1) infinite; }
    
    .challenge-text { 
      display: block;
      padding: 0 2rem;
      white-space: normal;
      color: #fff;
      font-style: italic;
    }

    .input-prompt { color: var(--secondary); font-weight: bold; margin-left: 1rem; }
    .terminal-input {
      background: transparent;
      border: none;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
      outline: none;
      width: 300px;
      font-size: 0.9rem;
    }

    .hint-text { color: var(--tertiary); font-size: 0.7rem; opacity: 0.6; padding-left: 1rem; }
    .noise-text { opacity: 0.2; font-size: 0.6rem; padding-left: 1rem; }

    @keyframes blink { 50% { opacity: 0; } }
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

  getProgress() {
    const solved = this.gameService.lockoutSolvedCount();
    return '█'.repeat(solved) + '░'.repeat(3 - solved);
  }
}
