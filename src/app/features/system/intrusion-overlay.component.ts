import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intrusion-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.intrusionActive()) {
      <div class="intrusion-overlay">
        <div class="warning-banner">SYSTEM BREACH IN PROGRESS</div>
        <div class="intrusion-content">
          <div class="alert-icon">[!]</div>
          <div class="info">
            <div class="label">INCOMING ACCESS ATTEMPT</div>
            <div class="target">NEURAL_CORE // SECTOR_7</div>
          </div>
          <div class="progress-section">
            <div class="progress-bar-bg">
              <div class="progress-bar-fg" [style.width.%]="gameService.intrusionProgress()"></div>
            </div>
            <div class="progress-val">{{ gameService.intrusionProgress() | number:'1.0-0' }}%</div>
          </div>
          <button class="defend-btn" (click)="gameService.counterIntrusion()">
            EXECUTE_COUNTER_MEASURE
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .intrusion-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      background: var(--layer-1);
      border: 2px solid var(--tertiary);
      box-shadow: 0 0 50px var(--tertiary);
      z-index: 9999;
      padding-bottom: 2rem;
      animation: shake 0.5s infinite;
    }
    
    @keyframes shake {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      25% { transform: translate(-52%, -50%) rotate(-1deg); }
      50% { transform: translate(-50%, -48%) rotate(1deg); }
      75% { transform: translate(-48%, -50%) rotate(-1deg); }
      100% { transform: translate(-50%, -50%) rotate(0deg); }
    }

    .warning-banner { background: var(--tertiary); color: #fff; text-align: center; font-weight: 900; padding: 8px; font-size: 0.8rem; letter-spacing: 3px; font-family: 'Space Grotesk', sans-serif; }
    
    .intrusion-content { padding: 2rem; display: flex; flex-direction: column; align-items: center; }
    .alert-icon { font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--tertiary); font-family: 'JetBrains Mono', monospace; font-weight: 900; }
    
    .info { text-align: center; margin-bottom: 2rem; }
    .info .label { font-size: 0.6rem; color: var(--tertiary); opacity: 0.6; font-weight: 900; }
    .info .target { font-size: 1rem; font-weight: 900; color: #fff; margin-top: 8px; font-family: 'Space Grotesk', sans-serif; }
    
    .progress-section { width: 100%; margin-bottom: 2rem; }
    .progress-bar-bg { width: 100%; height: 2px; background: var(--layer-0); }
    .progress-bar-fg { height: 100%; background: var(--tertiary); box-shadow: 0 0 10px var(--tertiary); transition: width 0.1s steps(4); }
    .progress-val { font-size: 0.75rem; color: var(--tertiary); font-weight: 900; margin-top: 8px; text-align: right; font-family: 'JetBrains Mono', monospace; }
    
    .defend-btn { background: var(--tertiary); color: #fff; border: none; padding: 1rem 2rem; font-family: 'Space Grotesk', sans-serif; font-weight: 900; cursor: pointer; font-size: 0.8rem; transition: all 0.05s steps(2); }
    .defend-btn:hover { background: #fff; color: var(--tertiary); }
  `
})
export class IntrusionOverlayComponent {
  gameService = inject(GameService);
}
