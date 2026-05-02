import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-pulse-diagnostics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pulse-overlay" *ngIf="game.systemStress() > 60">
      <div class="diagnostic-box terminal-frame">
        <div class="ascii-line magenta">VOICE_DIAGNOSTICS_PULSE</div>
        <div class="metrics">
          <div class="metric">CPU_LOAD: {{ 40 + (game.systemStress() / 2) | number:'1.0-0' }}%</div>
          <div class="metric">NEURAL_DRIFT: {{ game.neuralLoad() }}ms</div>
          <div class="metric">STABILITY: {{ game.psychStability() | number:'1.0-0' }}%</div>
        </div>
        <div class="glitch-line">SCANNING_KERNEL_FOR_ANOMALIES...</div>
      </div>
    </div>
  `,
  styles: `
    .pulse-overlay {
      position: fixed; bottom: 80px; right: 20px;
      width: 250px; max-width: calc(100vw - 40px); z-index: 4000; pointer-events: none;
      animation: pulse-entry 0.3s ease-out;
    }
    .diagnostic-box {
      background: rgba(255, 0, 85, 0.1);
      border-color: var(--neon-magenta);
      padding: 10px;
      backdrop-filter: blur(15px);
    }
    .metrics { display: flex; flex-direction: column; gap: 5px; margin: 10px 0; }
    .metric { font-size: 0.6rem; color: var(--neon-magenta); font-family: 'JetBrains Mono', monospace; }
    .glitch-line { font-size: 0.5rem; opacity: 0.6; animation: text-glitch 2s infinite; }

    @keyframes pulse-entry {
      from { transform: scale(0.9) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes text-glitch {
      0%, 100% { transform: none; }
      95% { transform: skewX(10deg); opacity: 0.5; }
    }
  `
})
export class PulseDiagnosticsComponent {
  game = inject(GameService);
}
