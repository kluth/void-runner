import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { OnboardAiService } from '../../core/services/onboard-ai.service';

@Component({
  selector: 'app-high-density-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hud-container">
      <div class="hud-panel pulse-subtle" title="CPU_LOAD">
        <span class="p-label">CPU:</span>
        <span class="p-val">{{ 42 + (gameService.systemStress() / 10) | number:'1.1-1' }}%</span>
      </div>
      
      <div class="hud-panel" title="NETWORK_LATENCY">
        <span class="p-label">NET:</span>
        <span class="p-val">{{ 15 + gameService.detectionLevel() }}ms</span>
      </div>

      <div class="hud-panel" [class.alert]="gameService.systemHeat() > 80" title="CORE_TEMP">
        <span class="p-label">TMP:</span>
        <span class="p-val">{{ gameService.systemHeat() }}°C</span>
      </div>

      <div class="hud-panel" [class.alert]="gameService.systemIntegrity() < 40" title="KERNEL_STABILITY">
        <span class="p-label">KER:</span>
        <span class="p-val">{{ gameService.systemIntegrity() }}%</span>
      </div>
    </div>
  `,
  styles: `
    :host {
      position: fixed; top: 44px; left: 0; width: 100%; z-index: 1500;
      pointer-events: none;
    }
    .hud-container {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 4px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      border-bottom: 1px solid rgba(0, 255, 159, 0.05);
    }

    .hud-panel {
      display: flex; gap: 4px; align-items: baseline;
      padding: 2px 8px;
      background: rgba(10, 15, 30, 0.6);
      border: 1px solid rgba(0, 255, 159, 0.1);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
    }
    .p-label { opacity: 0.4; font-size: 0.5rem; }
    .p-val { font-weight: bold; color: var(--primary); }
    .alert .p-val { color: var(--neon-magenta); }

    .pulse-subtle { animation: pulse 4s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  `
})
export class HighDensityHudComponent {
  gameService = inject(GameService);
  onboard = inject(OnboardAiService);
}
