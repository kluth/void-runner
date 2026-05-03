import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { StabilityHudComponent } from './stability-hud.component';

@Component({
  selector: 'app-system-integrity',
  standalone: true,
  imports: [CommonModule, StabilityHudComponent],
  template: `
    <div class="integrity-terminal">
      <app-stability-hud />
      <div class="ascii-border">
        ┌────────────────────────────────────────────────────────┐
        │ <span class="sec-header">LOCAL_HOST // SYSTEM_INTEGRITY</span>                       │
        ├────────────────────────────────────────────────────────┤
        │ STATUS: <span class="integrity-val" [class.low]="gameService.systemIntegrity() < 40">INTEGRITY [{{ getProgressBar(gameService.systemIntegrity()) }}] {{ gameService.systemIntegrity() }}%</span> │
        │ THERMAL: <span class="heat-val" [class.high]="gameService.systemHeat() > 80">HEAT_LEVEL [{{ getProgressBar(gameService.systemHeat()) }}] {{ gameService.systemHeat() }}°C</span>   │
        │ UPLINK: <span class="text-secondary">ESTABLISHED // LATENCY {{ 15 + gameService.detectionLevel() }}ms</span>           │
        └────────────────────────────────────────────────────────┘
      </div>

      <div class="active-debuffs" *ngIf="gameService.activeDebuffs().length > 0">
         <div class="sec-label">! DETECTED_ANOMALIES !</div>
         @for (debuff of gameService.activeDebuffs(); track debuff.id) {
            <div class="debuff-item">
               <span class="d-type">[{{ debuff.type }}]</span>
               <span class="d-timer">{{ getRemainingTime(debuff.expiresAt) }}s</span>
            </div>
         }
      </div>
    </div>
  `,
  styles: `
    .integrity-terminal { color: var(--primary); font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; }
    .ascii-border { white-space: pre; line-height: 1.2; opacity: 0.8; margin-top: 10px; }
    .sec-header { font-weight: bold; color: var(--secondary); }
    .integrity-val.low { color: var(--tertiary); animation: blink 1s infinite; }
    .heat-val.high { color: var(--tertiary); }
    
    .active-debuffs { margin-top: 15px; border: 1px solid var(--tertiary); padding: 8px; background: rgba(255, 0, 0, 0.05); }
    .sec-label { font-size: 0.6rem; color: var(--tertiary); font-weight: 900; margin-bottom: 5px; }
    .debuff-item { display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--tertiary); }

    @keyframes blink { 50% { opacity: 0.3; } }
  `
})
export class SystemIntegrityComponent {
  gameService = inject(GameService);

  getRemainingTime(expiresAt: number): number {
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }

  getRemaining(expiresAt: number): number {
    return this.getRemainingTime(expiresAt);
  }

  getProgressBar(val: number) {
    const chars = 10;
    const filled = Math.floor((val / 100) * chars);
    return '█'.repeat(filled) + '░'.repeat(chars - filled);
  }
}
