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

      <div class="debuff-list">
        @for (debuff of gameService.activeDebuffs(); track debuff.id) {
          <div class="debuff-card" [class]="debuff.type">
            <div class="d-top">
              <span class="d-icon">
                @if (debuff.type === 'RANSOM') { 💸 }
                @else if (debuff.type === 'GLITCH') { ☣️ }
                @else if (debuff.type === 'LOCK') { 🔒 }
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
    .integrity-container { background: rgba(15, 0, 0, 0.9); border: 1px solid #400; padding: 15px; margin-bottom: 15px; }
    .sec-header { font-size: 0.7em; color: #ff0000; border-bottom: 1px solid #400; padding-bottom: 8px; margin-bottom: 12px; letter-spacing: 2px; font-weight: bold; }
    
    .status-bar { margin-bottom: 15px; }
    .integrity-val { font-size: 0.8em; font-weight: bold; color: #00ff00; margin-bottom: 5px; font-family: monospace; }
    .integrity-val.low { color: #ff0000; animation: blink 1s infinite; }
    .bar-bg { width: 100%; height: 10px; background: #200; border: 1px solid #400; }
    .bar-fg { height: 100%; background: #00ff00; transition: width 0.3s; }
    .bar-fg.low { background: #ff0000; box-shadow: 0 0 10px #f00; }

    .debuff-list { display: flex; flex-direction: column; gap: 8px; }
    .debuff-card { background: #000; border: 1px solid #444; padding: 8px; position: relative; overflow: hidden; }
    .debuff-card.RANSOM { border-color: #ffaa00; }
    .debuff-card.GLITCH { border-color: #ff00ff; }
    .debuff-card.LOCK { border-color: #ff0000; }
    
    .d-top { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
    .d-icon { font-size: 1em; }
    .d-name { font-size: 0.6em; font-weight: bold; color: #fff; }
    .d-timer { font-size: 0.5em; color: #888; font-family: monospace; }

    .clean-status { font-size: 0.6em; color: #004400; text-align: center; padding: 5px; }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
  `
})
export class SystemIntegrityComponent {
  gameService = inject(GameService);

  getRemaining(expiresAt: number) {
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }
}
