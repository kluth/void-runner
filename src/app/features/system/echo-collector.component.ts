import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-echo-collector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="echo-field">
      @for (echo of gameService.voidEchoes(); track echo.id) {
        @if (!echo.captured) {
          <div class="echo-fragment" 
               [style.left.%]="echo.x" 
               [style.top.%]="echo.y"
               (click)="gameService.captureEcho(echo.id)">
            <span class="glitch-text">{{ echo.id }}</span>
          </div>
        } @else {
          <div class="captured-echo terminal-frame" 
               [style.left.%]="echo.x" 
               [style.top.%]="echo.y">
            <div class="ascii-line">DECRYPTED_Lore</div>
            <p>{{ echo.text }}</p>
            <button class="text-xs" (click)="removeEcho(echo.id)">[ DISMISS ]</button>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .echo-field {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 1000;
    }
    .echo-fragment {
      position: absolute;
      pointer-events: auto;
      cursor: pointer;
      color: var(--neon-cyan);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      padding: 4px;
      border: 1px solid rgba(0, 229, 255, 0.2);
      background: rgba(0, 0, 0, 0.5);
      animation: drift 10s infinite linear, pulse 2s infinite;
    }
    .captured-echo {
      position: absolute;
      pointer-events: auto;
      width: 200px;
      padding: 8px;
      z-index: 1001;
      font-size: 0.7rem;
    }
    @keyframes drift {
      0% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(10px, 10px) rotate(5deg); }
      50% { transform: translate(0, 20px) rotate(0deg); }
      75% { transform: translate(-10px, 10px) rotate(-5deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; box-shadow: 0 0 5px var(--neon-cyan); }
      50% { opacity: 1; box-shadow: 0 0 15px var(--neon-cyan); }
    }
  `
})
export class EchoCollectorComponent {
  gameService = inject(GameService);

  removeEcho(id: string) {
    this.gameService.voidEchoes.update(echoes => echoes.filter(e => e.id !== id));
  }
}
