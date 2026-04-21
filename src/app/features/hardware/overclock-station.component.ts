import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overclock-station',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-station">
      <div class="ascii-border">┌────────────────────────────────────────────────────────────────────────────┐</div>
      <div class="ascii-line">│ <span class="blink">>></span> HARDWARE_LAB // OVERCLOCK_STATION                                   │</div>
      <div class="ascii-border">├────────────────────────────────────────────────────────────────────────────┤</div>
      <div class="hardware-preview">
        <div class="ascii-line">│ [ MODULE_IDENTIFICATION ]                                                  │</div>
        <div class="ascii-line">│ NAME: {{ (selectedHardware()?.name || 'NULL') | uppercase }}</div>
        <div class="ascii-line">│ DESC: {{ selectedHardware()?.description || 'CONNECT_MODULE_FOR_ANALYSIS' }}</div>
      </div>
      <div class="ascii-border">├────────────────────────────────────────┬───────────────────────────────────┤</div>
      <div class="tuning-risk-grid">
        <div class="tuning-panel">
          <div class="ascii-line">│ [ TUNING_PARAMETERS ]                  │ [ STABILITY_REPORT ]              │</div>
          <div class="tune-row">
            <div class="ascii-line">│ VOLTAGE:   [{{ getProgressBar(voltage) }}] {{ voltage | number:'3.0' }}mV │ RISK_LEVEL:                       │</div>
          </div>
          <div class="control-row">
            <div class="ascii-line">│ </div>
            <input type="range" min="0" max="100" [(ngModel)]="voltage" (input)="updateStats()" class="terminal-slider">
            <div class="ascii-line"> │ [{{ getProgressBar(riskLevel()) }}] {{ riskLevel() | number:'3.0' }}%      │</div>
          </div>
          <div class="ascii-border">├────────────────────────────────────────┤                                   │</div>
          <div class="tune-row">
            <div class="ascii-line">│ FREQUENCY: [{{ getProgressBar(frequency) }}] {{ frequency | number:'3.0' }}MHz │                                   │</div>
          </div>
          <div class="control-row">
            <div class="ascii-line">│ </div>
            <input type="range" min="0" max="100" [(ngModel)]="frequency" (input)="updateStats()" class="terminal-slider">
            <div class="ascii-line"> │                                   │</div>
          </div>
        </div>
      </div>
      <div class="ascii-border">├────────────────────────────────────────┴───────────────────────────────────┤</div>
      <div class="action-row">
        <button class="terminal-btn" [disabled]="!selectedHardware()" (click)="applyOverclock()">
          │ [ INIT_FLASH_BIOS_SEQUENCE ]                                               │
        </button>
      </div>
      <div class="ascii-border">└────────────────────────────────────────────────────────────────────────────┘</div>
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
      display: inline-block;
      white-space: pre;
    }

    .ascii-border, .ascii-line, .tune-row, .control-row {
      line-height: 1.2;
    }

    .hardware-preview {
      display: flex;
      flex-direction: column;
    }

    .tuning-panel {
      display: flex;
      flex-direction: column;
    }

    .control-row {
      display: flex;
      align-items: center;
    }

    .terminal-slider {
      -webkit-appearance: none;
      width: 250px;
      background: transparent;
      cursor: pointer;
    }

    .terminal-slider::-webkit-slider-runnable-track {
      height: 1px;
      background: var(--primary);
    }

    .terminal-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 15px;
      width: 10px;
      background: var(--primary);
      margin-top: -7px;
    }

    .terminal-btn {
      background: transparent;
      border: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      text-align: left;
      cursor: pointer;
      padding: 0;
      width: 100%;
    }

    .terminal-btn:hover:not(:disabled) {
      background: var(--primary);
      color: #000;
    }

    .terminal-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .blink {
      animation: blink 1s steps(2) infinite;
    }

    @keyframes blink {
      to { visibility: hidden; }
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
    return '='.repeat(filled) + ' '.repeat(total - filled);
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
