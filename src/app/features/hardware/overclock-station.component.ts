import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overclock-station',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-station terminal-frame">
      <div class="ascii-line">HARDWARE_LAB // OVERCLOCK_STATION</div>
      
      <div class="hardware-preview">
        <div class="preview-header">MODULE_IDENTIFICATION</div>
        <div class="preview-content">
          <div class="info-row">
            <span class="label">NAME:</span>
            <span class="value">{{ (selectedHardware()?.name || 'NULL') | uppercase }}</span>
          </div>
          <div class="info-row">
            <span class="label">DESC:</span>
            <span class="value">{{ selectedHardware()?.description || 'CONNECT_MODULE_FOR_ANALYSIS' }}</span>
          </div>
        </div>
      </div>

      <div class="tuning-risk-grid">
        <div class="tuning-panel">
          <div class="panel-header">TUNING_PARAMETERS</div>
          
          <div class="control-group">
            <div class="stat-header">
              <span>VOLTAGE</span>
              <span class="stat-value">{{ voltage | number:'3.0' }}mV</span>
            </div>
            <div class="progress-container">
              [{{ getProgressBar(voltage) }}]
            </div>
            <input type="range" min="0" max="100" [(ngModel)]="voltage" (input)="updateStats()" class="terminal-slider">
          </div>

          <div class="control-group">
            <div class="stat-header">
              <span>FREQUENCY</span>
              <span class="stat-value">{{ frequency | number:'3.0' }}MHz</span>
            </div>
            <div class="progress-container">
              [{{ getProgressBar(frequency) }}]
            </div>
            <input type="range" min="0" max="100" [(ngModel)]="frequency" (input)="updateStats()" class="terminal-slider">
          </div>
        </div>

        <div class="stability-panel">
          <div class="panel-header">STABILITY_REPORT</div>
          <div class="risk-display">
            <div class="risk-label">RISK_LEVEL:</div>
            <div class="risk-meter">
              <span class="meter-text">[{{ getProgressBar(riskLevel()) }}] {{ riskLevel() | number:'3.0' }}%</span>
              <div class="risk-status" [class.high-risk]="riskLevel() > 70">
                @if (riskLevel() > 70) {
                  [ WARNING: CRITICAL_INSTABILITY ]
                } @else if (riskLevel() > 40) {
                  [ CAUTION: MODERATE_RISK ]
                } @else {
                  [ STABLE ]
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button class="terminal-btn flash-btn" [disabled]="!selectedHardware()" (click)="applyOverclock()">
          [ INIT_FLASH_BIOS_SEQUENCE ]
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      padding: 1rem;
    }

    .terminal-station {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .hardware-preview {
      background: rgba(0, 255, 0, 0.03);
      padding: 1rem;
      border: 1px solid rgba(0, 255, 0, 0.1);
    }

    .preview-header, .panel-header {
      font-size: 0.75rem;
      font-weight: bold;
      opacity: 0.6;
      margin-bottom: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .preview-content { display: flex; flex-direction: column; gap: 0.5rem; }
    .info-row { display: flex; gap: 1rem; font-size: 0.9rem; }
    .info-row .label { opacity: 0.5; width: 60px; }
    .info-row .value { color: var(--primary); }

    .tuning-risk-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .tuning-panel, .stability-panel {
      display: flex;
      flex-direction: column;
    }

    .control-group {
      margin-bottom: 1.5rem;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
    }

    .progress-container {
      font-family: monospace;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
      color: var(--primary);
    }

    .terminal-slider {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      cursor: pointer;
    }

    .terminal-slider::-webkit-slider-runnable-track {
      height: 2px;
      background: rgba(0, 255, 0, 0.2);
    }

    .terminal-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 8px;
      background: var(--primary);
      margin-top: -7px;
      border-radius: 0;
      box-shadow: 0 0 5px var(--primary);
    }

    .risk-display {
      background: rgba(0, 255, 0, 0.05);
      padding: 1rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
    }

    .risk-label { font-size: 0.85rem; opacity: 0.7; }
    .meter-text { font-family: monospace; font-size: 0.85rem; display: block; margin-bottom: 0.5rem; }
    
    .risk-status {
      font-size: 0.75rem;
      font-weight: bold;
      padding: 0.4rem;
      text-align: center;
      border: 1px solid var(--primary);
    }

    .high-risk {
      color: #ff0000;
      border-color: #ff0000;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .flash-btn {
      width: 100%;
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 0.8rem;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .flash-btn:hover:not(:disabled) {
      background: var(--primary);
      color: #000;
    }

    .flash-btn:disabled { opacity: 0.2; cursor: not-allowed; }

    @media (max-width: 600px) {
      .tuning-risk-grid { grid-template-columns: 1fr; }
    }
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

  getProgressBar(value: number): string {
    const total = 10;
    const filled = Math.floor((value / 100) * total);
    return '█'.repeat(filled) + '░'.repeat(total - filled);
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
