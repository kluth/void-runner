import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-integrity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="integrity-container">
      <div class="sec-header">LOCAL_HOST // SYSTEM_INTEGRITY</div>
      
      <div class="status-bar">
        <div class="integrity-val" [class.low]="gameService.systemIntegrity() < 40">
          HEALTH: {{ gameService.systemIntegrity() }}%
        </div>
        <div class="bar-bg">
          <div class="bar-fg" [style.width.%]="gameService.systemIntegrity()" [class.low]="gameService.systemIntegrity() < 40"></div>
        </div>
      </div>

      <div class="status-bar" style="margin-bottom: 2rem;">
        <div class="integrity-val" [class.high]="gameService.systemHeat() > 80" style="color: var(--primary);">
          SYS_HEAT: {{ gameService.systemHeat() }}%
        </div>
        <div class="bar-bg">
          <div class="bar-fg heat-fill" [style.width.%]="gameService.systemHeat()" [class.high]="gameService.systemHeat() > 80"></div>
        </div>
      </div>

      <div class="debuff-list">
        @for (debuff of gameService.activeDebuffs(); track debuff.id) {
          <div class="debuff-card" [class]="debuff.type">
            <div class="d-top">
              <span class="d-icon">
                @if (debuff.type === 'RANSOM') { [PAY] }
                @else if (debuff.type === 'GLITCH') { [VIR] }
                @else if (debuff.type === 'LOCK') { [LOK] }
              </span>
              <span class="d-name">{{ debuff.name }}</span>
            </div>
            <div class="d-timer">RECOVERY: {{ getRemaining(debuff.expiresAt) }}s</div>
          </div>
        } @empty {
          <div class="clean-status">NO THREATS DETECTED</div>
        }
      </div>
    </div>
  `,
  styles: `
    .integrity-container { background: var(--layer-1); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--neon-shadow); }
    .sec-header { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; color: var(--tertiary); background: var(--layer-2); padding: 0.75rem; margin-bottom: 1.5rem; letter-spacing: 2px; font-weight: 900; text-transform: uppercase; }
    
    .status-bar { margin-bottom: 1.5rem; background: var(--layer-2); padding: 1rem; }
    .integrity-val { font-size: 0.8rem; font-weight: 900; color: var(--secondary); margin-bottom: 0.5rem; font-family: 'JetBrains Mono', monospace; }
    .integrity-val.low { color: var(--tertiary); animation: blink 0.5s steps(2) infinite alternate; }
    .integrity-val.high { color: var(--tertiary) !important; animation: blink 0.5s steps(2) infinite alternate; }
    .bar-bg { width: 100%; height: 2px; background: var(--layer-0); }
    .bar-fg { height: 100%; background: var(--secondary); transition: width 0.3s steps(4); }
    .bar-fg.low { background: var(--tertiary); box-shadow: 0 0 10px var(--tertiary); }
    .heat-fill { background: var(--primary); }
    .heat-fill.high { background: var(--tertiary); box-shadow: 0 0 10px var(--tertiary); }

    .debuff-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .debuff-card { background: var(--layer-2); padding: 1rem; position: relative; overflow: hidden; }
    .debuff-card.RANSOM { border-left: 4px solid #ffaa00; }
    .debuff-card.GLITCH { border-left: 4px solid #ff00ff; }
    .debuff-card.LOCK { border-left: 4px solid var(--tertiary); }
    
    .d-top { display: flex; align-items: center; gap: 12px; margin-bottom: 0.5rem; }
    .d-icon { font-size: 0.6rem; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: var(--primary); }
    .d-name { font-size: 0.7rem; font-weight: 900; color: #fff; text-transform: uppercase; }
    .d-timer { font-size: 0.55rem; color: var(--primary); opacity: 0.4; font-family: 'JetBrains Mono', monospace; }

    .clean-status { font-size: 0.65rem; color: var(--secondary); opacity: 0.4; text-align: center; padding: 1rem; font-weight: 900; }
    @keyframes blink { from { opacity: 1; } to { opacity: 0.3; } }
  `
})
export class SystemIntegrityComponent {
  gameService = inject(GameService);

  getRemaining(expiresAt: number) {
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }
}
