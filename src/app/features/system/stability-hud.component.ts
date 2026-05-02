import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-stability-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stability-container">
      <div class="stat-label">NEURAL_STABILITY</div>
      <div class="stability-bar" [class.warning]="gameService.psychStability() < 50" [class.danger]="gameService.psychStability() < 30">
        <div class="stability-fill" [style.width.%]="gameService.psychStability()"></div>
        <div class="stability-text">{{ gameService.psychStability() | number:'1.0-0' }}%</div>
      </div>
      
      @if (gameService.isHallucinating()) {
        <div class="hallucination-warning glitch-text">PSYCH_BREAK_IMMINENT</div>
      }
    </div>
  `,
  styles: `
    .stability-container { width: 100%; margin-bottom: 10px; }
    .stat-label { font-size: 0.55rem; color: var(--neon-violet); margin-bottom: 2px; }
    .stability-bar {
      height: 12px; background: rgba(191, 64, 255, 0.1);
      border: 1px solid rgba(191, 64, 255, 0.3);
      position: relative; overflow: hidden;
    }
    .stability-fill {
      height: 100%; background: var(--neon-violet);
      transition: width 0.3s ease;
    }
    .stability-text {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.5rem; color: #fff; font-weight: bold;
    }
    .warning .stability-fill { background: var(--neon-orange); }
    .danger .stability-fill { 
      background: var(--neon-magenta);
      animation: stress-pulse 0.5s infinite;
    }
    .hallucination-warning {
      color: var(--neon-magenta); font-size: 0.6rem; text-align: center; margin-top: 5px;
      text-shadow: 0 0 5px var(--neon-magenta);
    }
    @keyframes stress-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `
})
export class StabilityHudComponent {
  gameService = inject(GameService);
}
