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
      border: var(--ghost-border);
    }
    .sec-header {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 4px;
      color: var(--warning-magenta);
      margin-bottom: 2rem;
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
      background: var(--layer-0);
      padding: 2rem;
      border: var(--ghost-border);
    }
    .h-icon { font-size: 3rem; margin-bottom: 1rem; color: var(--matrix-green); }
    .h-name { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem; }
    .h-desc { font-size: 0.7rem; color: #666; }

    .tuning-grid { display: flex; flex-direction: column; gap: 1rem; }
    .tune-card { background: var(--layer-2); padding: 1rem; border: var(--ghost-border); display: flex; align-items: center; gap: 1rem; }
    .tune-card .label { font-size: 0.6rem; font-weight: 900; min-width: 80px; }
    .tune-card input { flex: 1; }
    .tune-card .val { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--matrix-green); min-width: 60px; text-align: right; }

    .risk-meter { display: flex; flex-direction: column; gap: 0.5rem; }
    .risk-meter .label { font-size: 0.6rem; font-weight: 900; color: var(--critical-error); }
    .bar-bg { width: 100%; height: 4px; background: #200; }
    .bar-fg { height: 100%; background: var(--critical-error); box-shadow: 0 0 10px #f00; transition: width 0.2s ease; }
    .risk-meter .val { font-size: 0.75rem; color: var(--critical-error); text-align: right; font-weight: 900; }

    .apply-btn {
      background: var(--matrix-green);
      color: #000;
      border: none;
      padding: 1rem;
      font-size: 0.7rem;
      font-weight: 900;
      cursor: pointer;
      letter-spacing: 1px;
    }
    .apply-btn:hover:not(:disabled) {
      background: #fff;
      box-shadow: 0 0 20px var(--matrix-green);
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
