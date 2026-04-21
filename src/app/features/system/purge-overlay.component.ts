import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purge-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.purgeActive()) {
      <div class="purge-terminal-overlay" role="dialog" aria-label="System Purge Imminent">
        <div class="ascii-modal">
          <pre>
┌────────────────────────────────────────────────────────────┐
│ <span class="alert-title">!!! CRITICAL_TRACE_DETECTED !!!</span>                            │
├────────────────────────────────────────────────────────────┤
│ BLUE_TEAM_INTERVENTION: ISOLATION_SUCCESSFUL               │
│ SYSTEM_PURGE: <span class="status-warn">INITIALIZED</span>                                   │
│                                                            │
│ ASSET_INCINERATION_SEQUENCE: <span class="status-warn">READY</span>                         │
│                                                            │
│ <span class="timer-label">T-MINUS:</span> <span class="timer-val" [class.danger]="gameService.purgeTimer() < 10">{{ gameService.purgeTimer().toString().padStart(2, '0') }}s</span>                                        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ <span class="instruction-label">EMERGENCY_OVERRIDE_REQUIRED</span>                                │
│ EXECUTE: <span class="code">abort_purge {{ gameService.purgeCode() }}</span>                    │
└────────────────────────────────────────────────────────────┘
          </pre>
        </div>
      </div>
    }
  `,
  styles: `
    .purge-terminal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 20000; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .ascii-modal {
      color: var(--primary);
      text-align: left;
    }
    pre { margin: 0; line-height: 1.2; }
    .alert-title { color: var(--tertiary); font-weight: bold; }
    .status-warn { color: var(--tertiary); }
    .timer-label { opacity: 0.8; }
    .timer-val { font-size: 1.5rem; font-weight: bold; color: var(--primary); }
    .timer-val.danger { color: var(--tertiary); animation: blink 0.2s steps(1) infinite; }
    .instruction-label { opacity: 0.7; font-size: 0.8rem; }
    .code { color: var(--secondary); font-weight: bold; text-decoration: underline; }

    @keyframes blink { 50% { opacity: 0; } }
  `
})
export class PurgeOverlayComponent {
  gameService = inject(GameService);
}
