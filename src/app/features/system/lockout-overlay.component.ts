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
      <div class="lockout-terminal-overlay p-4" role="dialog" aria-modal="true" aria-label="Emergency System Lockout">
        <div class="terminal-frame max-w-lg w-full bg-black/95 shadow-2xl">
          <div class="ascii-line mb-4 text-tertiary font-bold">NODE_LOCKOUT_ENGAGED</div>
          
          <div class="flex flex-col gap-4">
            <div class="flex justify-between text-xs font-mono">
              <span class="opacity-70">STATUS: <span class="text-tertiary">AUTHENTICATION_FAILURE</span></span>
              <span class="opacity-70">TIMER: <span class="timer-val" [class.danger]="gameService.lockoutTimer() < 10">{{ gameService.lockoutTimer() }}s</span></span>
            </div>

            <div class="text-xs font-mono opacity-70">
              RESOLVED: [{{ getProgress() }}] {{ gameService.lockoutSolvedCount() }}/3
            </div>

            <div class="ascii-line">CHALLENGE</div>
            
            <div class="challenge-box py-4 px-2 text-center italic text-white text-base">
              "{{ currentPuzzle()?.q }}"
            </div>

            <div class="ascii-line">INPUT</div>

            <div class="input-area flex items-center gap-2 p-2 border border-dashed border-primary">
              <span class="text-secondary font-bold">></span>
              <input type="text" [(ngModel)]="puzzleInput" 
                     (keyup.enter)="submitAnswer()"
                     placeholder="RESOLVE_SYNTAX..."
                     class="flex-grow bg-transparent border-none outline-none text-primary font-mono text-base"
                     autofocus>
            </div>

            <div class="footer-info mt-4 flex flex-col gap-1 text-[10px] opacity-40 uppercase">
              <div class="text-tertiary font-bold">FAILURE_PENALTY: -5 SECONDS</div>
              <div>PROTOCOL: PENDING_RE_SYNC</div>
            </div>
          </div>
          
          <div class="ascii-line mt-4"></div>
        </div>
      </div>
    }
  `,
  styles: `
    .lockout-terminal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 30000; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      backdrop-filter: blur(4px);
    }
    
    .timer-val { font-weight: bold; color: var(--primary); }
    .timer-val.danger { color: var(--tertiary); animation: blink 0.2s steps(1) infinite; }
    
    @keyframes blink { 50% { opacity: 0; } }

    input::placeholder {
      opacity: 0.3;
    }
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
