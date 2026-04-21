import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Mission } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-rfid-clone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rfid-container" (click)="stopSignal()">
      <div class="status-readout">
        <span class="label">SIGNAL_STRENGTH:</span>
        <span class="value" [style.color]="signalColor()">{{ signalStrength() }}%</span>
      </div>

      <div class="signal-track">
        <div class="clone-zone" [style.left.%]="zoneStart()" [style.width.%]="zoneWidth()"></div>
        <div class="signal-bar" [style.left.%]="barPosition()"></div>
      </div>

      <div class="instructions">
        TAP_TO_INTERCEPT_ENCRYPTION_WAVE
      </div>

      <div class="debug-data">
        PHASE_SHIFT: {{ barPosition().toFixed(2) }}ms<br>
        ZONE_SYNC: {{ zoneStart().toFixed(2) }} - {{ zoneEnd().toFixed(2) }}
      </div>
    </div>
  `,
  styles: `
    .rfid-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      cursor: crosshair;
    }

    .status-readout {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      display: flex;
      gap: 10px;
    }

    .label { opacity: 0.5; }
    .value { font-weight: 900; }

    .signal-track {
      width: 80%;
      height: 40px;
      background: rgba(0, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .clone-zone {
      position: absolute;
      top: 0;
      height: 100%;
      background: rgba(0, 255, 0, 0.2);
      border-left: 2px solid var(--secondary);
      border-right: 2px solid var(--secondary);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
    }

    .signal-bar {
      position: absolute;
      top: 0;
      width: 4px;
      height: 100%;
      background: var(--tertiary);
      box-shadow: 0 0 10px var(--tertiary);
      z-index: 10;
    }

    .instructions {
      font-size: 0.7rem;
      letter-spacing: 2px;
      opacity: 0.7;
      text-transform: uppercase;
      animation: blink 1s steps(2) infinite;
    }

    .debug-data {
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-size: 0.5rem;
      opacity: 0.2;
      font-family: 'JetBrains Mono', monospace;
      text-align: right;
    }

    @keyframes blink {
      50% { opacity: 0.2; }
    }
  `
})
export class RfidCloneComponent implements OnInit, OnDestroy {
  @Input({ required: true }) mission!: Mission;

  gameService = inject(GameService);
  audioService = inject(AudioService);

  barPosition = signal(0);
  zoneStart = signal(0);
  zoneWidth = signal(0);
  zoneEnd = signal(0);
  
  signalStrength = signal(0);
  signalColor = signal('var(--primary)');

  private animationId: number | null = null;
  private startTime: number = 0;
  private speed: number = 0.1;
  private active = true;

  ngOnInit() {
    this.setupGame();
    this.startTime = Date.now();
    this.animate();
  }

  setupGame() {
    const diff = this.mission.difficulty || 1;
    this.zoneWidth.set(Math.max(10, 30 - (diff * 2)));
    this.zoneStart.set(20 + Math.random() * (60 - this.zoneWidth()));
    this.zoneEnd.set(this.zoneStart() + this.zoneWidth());
    this.speed = 0.05 + (diff * 0.02);
  }

  animate = () => {
    if (!this.active) return;

    const elapsed = Date.now() - this.startTime;
    const pos = (Math.sin(elapsed * this.speed * 0.1) + 1) * 50; // oscillates between 0 and 100
    this.barPosition.set(pos);

    // Update signal strength based on proximity to zone
    const center = this.zoneStart() + (this.zoneWidth() / 2);
    const dist = Math.abs(pos - center);
    const strength = Math.max(0, 100 - (dist * 2));
    this.signalStrength.set(Math.floor(strength));

    if (strength > 80) this.signalColor.set('var(--secondary)');
    else if (strength > 40) this.signalColor.set('var(--primary)');
    else this.signalColor.set('var(--tertiary)');

    this.animationId = requestAnimationFrame(this.animate);
  }

  stopSignal() {
    if (!this.active) return;
    this.active = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);

    this.audioService.playClick();
    const pos = this.barPosition();
    
    if (pos >= this.zoneStart() && pos <= this.zoneEnd()) {
      this.gameService.log('SIGNAL_SYNC: SUCCESS. CLONING_RFID_CHIP...');
      this.gameService.completeMission(this.mission);
    } else {
      this.gameService.log('SIGNAL_SYNC: FAILED. FREQUENCY_MISMATCH.');
      this.gameService.failMission(this.mission);
    }
  }

  ngOnDestroy() {
    this.active = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}
