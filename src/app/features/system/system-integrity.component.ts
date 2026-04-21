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
            │ - [{{ debuff.type }}] {{ debuff.name.padEnd(20) }} | REC: {{ getRemaining(debuff.expiresAt).toString().padStart(3) }}s │
          </div>
        } @empty {
          │ NO_EXTERNAL_THREATS_DETECTED                          │
        }
        └────────────────────────────────────────────────────────┘
      </div>
    </div>
  `,
  styles: `
    .integrity-terminal {
      background: #000;
      padding: 1rem;
      color: var(--primary);
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
      color: var(--primary);
    }
    .sub-label {
      opacity: 0.7;
      font-size: 0.75rem;
    }
    .integrity-val { color: var(--primary); }
    .integrity-val.low { color: var(--tertiary); animation: blink 0.5s steps(1) infinite; }
    .integrity-val.high { color: var(--tertiary); animation: blink 0.5s steps(1) infinite; }
    
    .debuff-entry { margin: 0; }

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
