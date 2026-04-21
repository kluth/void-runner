import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purge-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.purgeActive()) {
      <div class="purge-terminal-overlay p-4" role="dialog" aria-label="System Purge Imminent">
        <div class="terminal-frame max-w-md w-full bg-black/95 shadow-2xl border-tertiary">
          <div class="ascii-line mb-4 text-tertiary font-bold">!!! CRITICAL_TRACE_DETECTED !!!</div>
          
          <div class="flex flex-col gap-6 py-2">
            <div class="status-box text-sm font-mono flex flex-col gap-2">
              <div class="flex justify-between">
                 <span class="opacity-70">INTERVENTION:</span>
                 <span class="text-secondary">ISOLATION_SUCCESSFUL</span>
              </div>
              <div class="flex justify-between">
                 <span class="opacity-70">SYSTEM_PURGE:</span>
                 <span class="text-tertiary animate-pulse font-bold">INITIALIZED</span>
              </div>
            </div>

            <div class="timer-section flex flex-col items-center py-4 border-y border-dashed border-tertiary/30">
              <div class="text-[10px] opacity-50 mb-1 uppercase tracking-widest">ASSET_INCINERATION_SEQUENCE</div>
              <div class="timer-display flex items-baseline gap-2">
                <span class="text-xs opacity-70">T-MINUS:</span>
                <span class="timer-val text-4xl font-black text-tertiary" [class.danger]="gameService.purgeTimer() < 10">
                  {{ gameService.purgeTimer().toString().padStart(2, '0') }}s
                </span>
              </div>
            </div>

            <div class="override-box">
              <div class="ascii-line mb-2 text-[10px] text-tertiary opacity-70">EMERGENCY_OVERRIDE_REQUIRED</div>
              <div class="instruction p-3 bg-tertiary/10 border border-tertiary/20 text-center">
                <div class="text-[10px] opacity-50 mb-2">EXECUTE_COMMAND:</div>
                <code class="text-secondary font-bold text-lg tracking-wider">
                  abort_purge {{ gameService.purgeCode() }}
                </code>
              </div>
            </div>
          </div>

          <div class="ascii-line mt-4 text-tertiary opacity-30"></div>
        </div>
      </div>
    }
  `,
  styles: `
    .purge-terminal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(10, 0, 0, 0.9);
      z-index: 20000; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      backdrop-filter: blur(8px);
    }

    .timer-val { 
      text-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
    }
    
    .timer-val.danger { 
      animation: blink 0.2s steps(1) infinite; 
    }

    @keyframes blink { 50% { opacity: 0; } }

    .terminal-frame.border-tertiary {
      border-color: var(--tertiary) !important;
    }
    .terminal-frame.border-tertiary::before, 
    .terminal-frame.border-tertiary::after {
      border-color: var(--tertiary) !important;
    }
  `
})
export class PurgeOverlayComponent {
  gameService = inject(GameService);
}
