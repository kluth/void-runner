import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-integrity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="integrity-terminal">
      <div class="ascii-border">
        ┌────────────────────────────────────────────────────────┐
        │ <span class="sec-header">LOCAL_HOST // SYSTEM_INTEGRITY</span>                       │
        ├────────────────────────────────────────────────────────┤
        │ STATUS: <span class="integrity-val" [class.low]="gameService.systemIntegrity() < 40">INTEGRITY [{{ getProgressBar(gameService.systemIntegrity()) }}] {{ gameService.systemIntegrity() }}%</span> │
        │ THERMAL: <span class="integrity-val" [class.high]="gameService.systemHeat() > 80">SYS_HEAT  [{{ getProgressBar(gameService.systemHeat()) }}] {{ gameService.systemHeat() }}%</span> │
        ├────────────────────────────────────────────────────────┤
        │ <span class="sub-label">ACTIVE_THREATS_VIGILANCE</span>                                │
        @for (debuff of gameService.activeDebuffs(); track debuff.id) {
          <div class="debuff-entry">
            │ - <span class="debuff-type">[{{ debuff.type }}]</span> {{ debuff.name.padEnd(20) }} | REC: <span class="rec-val">{{ getRemaining(debuff.expiresAt).toString().padStart(3) }}s</span> │
          </div>
        } @empty {
          │ <span class="no-threats">NO_EXTERNAL_THREATS_DETECTED</span>                          │
        }
        └────────────────────────────────────────────────────────┘
      </div>
    </div>
  `,
  styles: `
    .integrity-terminal {
      background: var(--layer-0);
      padding: 1rem;
      color: var(--neon-green);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.2;
    }
    .ascii-border {
      white-space: pre;
      display: inline-block;
    }
    .sec-header {
      font-weight: bold;
      color: var(--neon-green);
      text-shadow: 0 0 6px rgba(0, 255, 159, 0.3);
    }
    .sub-label {
      opacity: 0.7;
      font-size: 0.75rem;
      color: var(--neon-cyan);
    }
    .integrity-val { color: var(--neon-green); }
    .integrity-val.low { color: var(--neon-magenta); animation: blink 0.5s steps(1) infinite; }
    .integrity-val.high { color: var(--neon-orange); animation: blink 0.5s steps(1) infinite; }
    
    .debuff-entry { margin: 0; }
    .debuff-type { color: var(--neon-orange); }
    .rec-val { color: var(--neon-cyan); }
    .no-threats { color: var(--neon-green); opacity: 0.6; }

    @keyframes blink { 50% { opacity: 0; } }
  `
})
export class SystemIntegrityComponent {
  gameService = inject(GameService);

  getRemaining(expiresAt: number) {
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }

  getProgressBar(val: number) {
    const chars = 10;
    const filled = Math.floor((val / 100) * chars);
    return '█'.repeat(filled) + '░'.repeat(chars - filled);
  }
}
