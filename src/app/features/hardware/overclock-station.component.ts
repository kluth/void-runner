import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StabilityTest {
  pattern: number[];
  userPattern: number[];
  phase: 'idle' | 'showing' | 'input' | 'success' | 'fail';
  level: number;
}

@Component({
  selector: 'app-overclock-station',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-station terminal-frame" [class.overheating]="temperature() > 80">
      <div class="ascii-line">HARDWARE_LAB // OVERCLOCK_STATION</div>
      
      <!-- Hardware Preview -->
      <div class="hardware-preview">
        <div class="preview-header">MODULE_IDENTIFICATION</div>
        <div class="preview-content">
          <div class="info-row">
            <span class="label">NAME:</span>
            <span class="value">{{ (selectedHardware()?.name || 'NULL') | uppercase }}</span>
          </div>
          <div class="info-row">
            <span class="label">TEMP:</span>
            <span class="value" [class.critical]="temperature() > 80">{{ temperature() }}°C</span>
          </div>
        </div>
      </div>

      <!-- Tuning Controls -->
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

          <div class="control-group">
            <div class="stat-header">
              <span>COOLING</span>
              <span class="stat-value">{{ cooling | number:'3.0' }}%</span>
            </div>
            <div class="progress-container">
              [{{ getProgressBar(cooling) }}]
            </div>
            <input type="range" min="0" max="100" [(ngModel)]="cooling" (input)="updateStats()" class="terminal-slider">
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
            
            <!-- Stability Test Mini-Game -->
            <div class="stability-test">
              <div class="test-header">STABILITY_TEST</div>
              @if (stabilityTest().phase === 'idle') {
                <button class="test-btn" (click)="startStabilityTest()">START_TEST</button>
              } @else if (stabilityTest().phase === 'showing') {
                <div class="test-display">
                  <div class="pattern-label">MEMORIZE_PATTERN:</div>
                  <div class="pattern-grid">
                    @for (i of [0,1,2,3,4,5,6,7,8]; track i) {
                      <div class="pattern-cell" [class.active]="stabilityTest().pattern.includes(i)"></div>
                    }
                  </div>
                </div>
              } @else if (stabilityTest().phase === 'input') {
                <div class="test-display">
                  <div class="pattern-label">REPEAT_PATTERN:</div>
                  <div class="pattern-grid">
                    @for (i of [0,1,2,3,4,5,6,7,8]; track i) {
                      <button class="pattern-cell" 
                              [class.active]="stabilityTest().userPattern.includes(i)"
                              (click)="addToPattern(i)"></button>
                    }
                  </div>
                  <button class="submit-btn" (click)="submitPattern()">SUBMIT</button>
                </div>
              } @else if (stabilityTest().phase === 'success') {
                <div class="test-result success">
                  ✓ STABILITY_CONFIRMED
                </div>
              } @else if (stabilityTest().phase === 'fail') {
                <div class="test-result fail">
                  ✗ STABILITY_FAILED
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Visual Effects -->
      <div class="visual-effects">
        @if (isOverheating()) {
          <div class="smoke-effect"></div>
          <div class="spark-effect"></div>
        }
        @if (isOverclocked()) {
          <div class="glitch-effect"></div>
        }
      </div>

      <div class="action-row">
        <button class="terminal-btn flash-btn" [disabled]="!selectedHardware()" (click)="applyOverclock()">
          [ APPLY_OVERCLOCK ]
        </button>
        <button class="terminal-btn cool-btn" [disabled]="temperature() < 40" (click)="emergencyCool()">
          [ EMERGENCY_COOL ]
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }

    .terminal-station {
      position: relative;
      overflow: hidden;
    }

    .overheating {
      animation: overheat-pulse 0.5s infinite;
    }

    @keyframes overheat-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.3); }
      50% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.6); }
    }

    .critical {
      color: #ff0000 !important;
      animation: blink 0.5s infinite;
    }

    @keyframes blink {
      50% { opacity: 0.5; }
    }

    .stability-test {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid rgba(0, 255, 0, 0.2);
      background: rgba(0, 0, 0, 0.3);
    }

    .test-header {
      font-size: 0.7rem;
      letter-spacing: 2px;
      margin-bottom: 0.5rem;
      color: var(--neon-cyan);
    }

    .test-btn {
      width: 100%;
      padding: 0.5rem;
      background: transparent;
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      cursor: pointer;
      font-family: inherit;
    }

    .test-btn:hover {
      background: var(--neon-cyan);
      color: #000;
    }

    .test-display {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .pattern-label {
      font-size: 0.7rem;
      opacity: 0.7;
    }

    .pattern-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
    }

    .pattern-cell {
      width: 100%;
      aspect-ratio: 1;
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid rgba(0, 255, 0, 0.3);
      cursor: pointer;
      transition: all 0.1s;
    }

    .pattern-cell.active {
      background: var(--neon-green);
      box-shadow: 0 0 10px var(--neon-green);
    }

    .submit-btn {
      margin-top: 0.5rem;
      padding: 0.3rem;
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      cursor: pointer;
      font-family: inherit;
    }

    .test-result {
      padding: 0.5rem;
      text-align: center;
      font-weight: bold;
    }

    .test-result.success {
      color: var(--neon-green);
      border: 1px solid var(--neon-green);
    }

    .test-result.fail {
      color: var(--neon-magenta);
      border: 1px solid var(--neon-magenta);
    }

    .visual-effects {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }

    .smoke-effect {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(100, 100, 100, 0.5) 0%, transparent 70%);
      animation: smoke-rise 2s infinite;
    }

    @keyframes smoke-rise {
      0% { transform: translateY(0) scale(1); opacity: 0.5; }
      100% { transform: translateY(-100px) scale(2); opacity: 0; }
    }

    .spark-effect {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      background: #ffff00;
      border-radius: 50%;
      box-shadow: 0 0 20px #ffff00, 0 0 40px #ff8800;
      animation: spark-flash 0.1s infinite;
    }

    @keyframes spark-flash {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.5); }
    }

    .glitch-effect {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 0, 0.03) 2px,
        rgba(0, 255, 0, 0.03) 4px
      );
      animation: scanline-flicker 0.1s infinite;
    }

    @keyframes scanline-flicker {
      0% { opacity: 0.3; }
      50% { opacity: 0.6; }
      100% { opacity: 0.3; }
    }

    .cool-btn {
      width: 100%;
      background: transparent;
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      padding: 0.8rem;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .cool-btn:hover:not(:disabled) {
      background: var(--neon-cyan);
      color: #000;
    }

    .cool-btn:disabled { opacity: 0.2; cursor: not-allowed; }
  `})
export class OverclockStationComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  selectedHardware = signal<any>(null);
  voltage = 50;
  frequency = 50;
  cooling = 50;
  temperature = signal(40);
  riskLevel = signal(25);
  stabilityTest = signal<StabilityTest>({
    pattern: [],
    userPattern: [],
    phase: 'idle',
    level: 1
  });

  private tempInterval: any;
  private testTimeout: any;

  ngOnInit() {
    this.selectedHardware.set(this.gameService.inventory()[0] || null);
    this.updateStats();
    this.startTemperatureSimulation();
  }

  ngOnDestroy() {
    if (this.tempInterval) clearInterval(this.tempInterval);
    if (this.testTimeout) clearTimeout(this.testTimeout);
  }

  updateStats() {
    const risk = (this.voltage + this.frequency) / 2;
    this.riskLevel.set(Math.floor(risk));
    
    // Temperature increases with voltage and frequency, decreases with cooling
    const tempChange = (this.voltage + this.frequency) / 100 - (this.cooling / 100);
    this.temperature.update(t => Math.max(30, Math.min(100, t + tempChange * 5)));
  }

  startTemperatureSimulation() {
    this.tempInterval = setInterval(() => {
      if (this.isOverclocked()) {
        this.temperature.update(t => Math.min(100, t + 2));
      } else {
        this.temperature.update(t => Math.max(30, t - 1));
      }
      
      // Overheating damage
      if (this.temperature() > 90) {
        this.gameService.systemIntegrity.update(i => Math.max(0, i - 1));
        if (this.temperature() > 95) {
          this.audioService.playError();
        }
      }
    }, 1000);
  }

  isOverheating(): boolean {
    return this.temperature() > 80;
  }

  isOverclocked(): boolean {
    return this.voltage > 70 || this.frequency > 70;
  }

  getProgressBar(value: number): string {
    const total = 10;
    const filled = Math.floor((value / 100) * total);
    return '█'.repeat(filled) + '░'.repeat(total - filled);
  }

  startStabilityTest() {
    const level = this.stabilityTest().level;
    const patternLength = 3 + level;
    const pattern: number[] = [];
    
    for (let i = 0; i < patternLength; i++) {
      pattern.push(Math.floor(Math.random() * 9));
    }
    
    this.stabilityTest.set({
      pattern,
      userPattern: [],
      phase: 'showing',
      level
    });
    
    // Show pattern for 2 seconds
    this.testTimeout = setTimeout(() => {
      this.stabilityTest.update(t => ({ ...t, phase: 'input' }));
    }, 2000);
  }

  addToPattern(index: number) {
    this.stabilityTest.update(t => ({
      ...t,
      userPattern: [...t.userPattern, index]
    }));
  }

  submitPattern() {
    const test = this.stabilityTest();
    const isCorrect = test.pattern.length === test.userPattern.length &&
                      test.pattern.every((v, i) => v === test.userPattern[i]);
    
    if (isCorrect) {
      this.stabilityTest.set({
        pattern: [],
        userPattern: [],
        phase: 'success',
        level: test.level + 1
      });
      this.gameService.log('STABILITY_TEST: PASSED. Hardware confirmed stable.');
      this.audioService.playSuccess();
      
      // Reset after 2 seconds
      setTimeout(() => {
        this.stabilityTest.update(t => ({ ...t, phase: 'idle' }));
      }, 2000);
    } else {
      this.stabilityTest.set({
        pattern: [],
        userPattern: [],
        phase: 'fail',
        level: Math.max(1, test.level - 1)
      });
      this.gameService.log('STABILITY_TEST: FAILED. Hardware instability detected.');
      this.audioService.playError();
      this.temperature.update(t => Math.min(100, t + 10));
      
      // Reset after 2 seconds
      setTimeout(() => {
        this.stabilityTest.update(t => ({ ...t, phase: 'idle' }));
      }, 2000);
    }
  }

  applyOverclock() {
    if (Math.random() * 100 > (100 - this.riskLevel())) {
      this.gameService.log(`!!! CRITICAL: HARDWARE FAILURE. Module ${this.selectedHardware()?.name} fried. !!!`);
      this.gameService.systemIntegrity.update(i => Math.max(0, i - 20));
      this.audioService.playError();
    } else {
      const boost = Math.floor(this.riskLevel() / 2);
      this.gameService.log(`SUCCESS: Overclock applied to ${this.selectedHardware()?.name}. Performance boosted by ${boost}%.`);
      this.audioService.playSuccess();
    }
  }

  emergencyCool() {
    this.temperature.set(40);
    this.gameService.log('EMERGENCY_COOL: Cooling system activated. Temperature reset.');
    this.audioService.playSuccess();
  }
}
