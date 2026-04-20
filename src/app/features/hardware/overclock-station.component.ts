import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overclock-station',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overclock-container hud-panel">
      <div class="sec-header">HARDWARE_LAB // OVERCLOCK_STATION</div>
      
      <div class="station-main">
        <div class="hardware-preview">
          <div class="h-icon">⚡</div>
          <div class="h-name">{{ selectedHardware()?.name || 'SELECT_MODULE' }}</div>
          <div class="h-desc">{{ selectedHardware()?.description || 'No module selected for optimization.' }}</div>
        </div>
        
        <div class="tuning-grid">
          <div class="tune-card">
            <div class="label">VOLTAGE</div>
            <input type="range" min="0" max="100" [(ngModel)]="voltage" (input)="updateStats()">
            <div class="val">{{ voltage }}mV</div>
          </div>
          <div class="tune-card">
            <div class="label">FREQUENCY</div>
            <input type="range" min="0" max="100" [(ngModel)]="frequency" (input)="updateStats()">
            <div class="val">{{ frequency }}MHz</div>
          </div>
        </div>
        
        <div class="risk-meter">
          <div class="label">STABILITY_RISK</div>
          <div class="bar-bg"><div class="bar-fg" [style.width.%]="riskLevel()"></div></div>
          <div class="val">{{ riskLevel() }}%</div>
        </div>
        
        <button class="apply-btn" [disabled]="!selectedHardware()" (click)="applyOverclock()">INIT_FLASH_BIOS</button>
      </div>
    </div>
  `,
  styles: `
    .overclock-container {
      padding: 2rem;
      background: var(--layer-1);
    }
    .sec-header {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--primary);
      background: var(--layer-2);
      padding: 0.75rem;
      margin-bottom: 2rem;
      text-transform: uppercase;
    }
    .station-main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 400px;
      margin: 0 auto;
    }
    .hardware-preview {
      text-align: center;
      background: var(--layer-2);
      padding: 2.5rem;
    }
    .h-icon { font-size: 2rem; margin-bottom: 1.5rem; color: var(--secondary); font-family: 'JetBrains Mono', monospace; font-weight: 900; }
    .h-name { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    .h-desc { font-size: 0.65rem; color: #fff; opacity: 0.4; line-height: 1.6; }

    .tuning-grid { display: flex; flex-direction: column; gap: 0.75rem; }
    .tune-card { background: var(--layer-2); padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
    .tune-card .label { font-size: 0.6rem; font-weight: 900; min-width: 90px; color: var(--primary); opacity: 0.5; }
    .tune-card input { flex: 1; accent-color: var(--primary); }
    .tune-card .val { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--primary); min-width: 70px; text-align: right; font-weight: 900; }

    .risk-meter { display: flex; flex-direction: column; gap: 0.75rem; background: var(--layer-0); padding: 1.25rem; }
    .risk-meter .label { font-size: 0.6rem; font-weight: 900; color: var(--tertiary); letter-spacing: 1px; }
    .bar-bg { width: 100%; height: 2px; background: rgba(193, 0, 20, 0.1); }
    .bar-fg { height: 100%; background: var(--tertiary); box-shadow: 0 0 10px var(--tertiary); transition: width 0.1s steps(4); }
    .risk-meter .val { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--tertiary); text-align: right; font-weight: 900; }

    .apply-btn {
      background: var(--secondary);
      color: var(--on-primary);
      border: none;
      padding: 1.25rem;
      font-size: 0.75rem;
      font-weight: 900;
      cursor: pointer;
      font-family: 'Space Grotesk', sans-serif;
      transition: all 0.05s steps(2);
    }
    .apply-btn:hover:not(:disabled) {
      filter: brightness(1.2);
      box-shadow: 0 0 20px var(--secondary);
    }
    .apply-btn:disabled { opacity: 0.2; cursor: not-allowed; }
  `
})
export class OverclockStationComponent {
  gameService = inject(GameService);

  selectedHardware = signal<any>(null);
  voltage = 50;
  frequency = 50;
  riskLevel = signal(25);

  constructor() {
    this.selectedHardware.set(this.gameService.inventory()[0] || null);
    this.updateStats();
  }

  updateStats() {
    const risk = (this.voltage + this.frequency) / 2;
    this.riskLevel.set(Math.floor(risk));
  }

  applyOverclock() {
    if (Math.random() * 100 > (100 - this.riskLevel())) {
      this.gameService.log(`!!! CRITICAL: HARDWARE FAILURE. Module ${this.selectedHardware().name} fried. !!!`);
      this.gameService.systemIntegrity.update(i => i - 20);
    } else {
      this.gameService.log(`SUCCESS: Overclock applied to ${this.selectedHardware().name}. Performance boosted by ${Math.floor(this.riskLevel() / 2)}%.`);
    }
  }
}
