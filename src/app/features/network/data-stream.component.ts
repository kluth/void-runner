import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-data-stream',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stream-container">
      <svg width="100%" height="60">
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="transparent" />
            <stop offset="50%" stop-color="var(--primary)" />
            <stop offset="100%" stop-color="transparent" />
          </linearGradient>
        </defs>
        
        @for (line of lines; track line) {
          <text class="flowing-data" x="-100" [attr.y]="line" [style.animation-duration]="getDuration()">
            {{ dataPacket }}
          </text>
        }

        <rect width="100%" height="2" y="30" fill="url(#flowGrad)" opacity="0.3" />
      </svg>
    </div>
  `,
  styles: `
    .stream-container { width: 100%; height: 60px; overflow: hidden; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 255, 159, 0.1); }
    .flowing-data {
      font-size: 0.6rem; font-family: 'JetBrains Mono', monospace;
      fill: var(--primary); opacity: 0.8;
      animation: flow linear infinite;
    }
    @keyframes flow {
      from { transform: translateX(0); }
      to { transform: translateX(calc(100% + 100px)); }
    }
  `
})
export class DataStreamComponent {
  game = inject(GameService);
  lines = [20, 40];
  dataPacket = '0101_PACKET_ENCRYPTED_SHA256_VOID_STREAM_INIT...';

  getDuration() {
    const stress = this.game.systemStress();
    return `${Math.max(1, 5 - (stress / 20))}s`;
  }
}
