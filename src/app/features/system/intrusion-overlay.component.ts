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
          <div class="alert-icon">⚠️</div>
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
      background: rgba(20, 0, 0, 0.95);
      border: 2px solid #ff0000;
      box-shadow: 0 0 30px #f00;
      z-index: 9999;
      padding-bottom: 20px;
      animation: shake 0.5s infinite;
    }
    
    @keyframes shake {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      25% { transform: translate(-52%, -50%) rotate(-1deg); }
      50% { transform: translate(-50%, -48%) rotate(1deg); }
      75% { transform: translate(-48%, -50%) rotate(-1deg); }
      100% { transform: translate(-50%, -50%) rotate(0deg); }
    }

    .warning-banner { background: #ff0000; color: #fff; text-align: center; font-weight: bold; padding: 5px; font-size: 0.8em; letter-spacing: 3px; }
    
    .intrusion-content { padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .alert-icon { font-size: 3em; margin-bottom: 15px; }
    
    .info { text-align: center; margin-bottom: 20px; }
    .info .label { font-size: 0.6em; color: #ff8888; }
    .info .target { font-size: 1em; font-weight: bold; color: #fff; margin-top: 5px; }
    
    .progress-section { width: 100%; margin-bottom: 20px; }
    .progress-bar-bg { width: 100%; height: 15px; background: #300; border: 1px solid #500; }
    .progress-bar-fg { height: 100%; background: #ff0000; box-shadow: 0 0 10px #f00; transition: width 0.1s; }
    .progress-val { font-size: 0.7em; color: #ff0000; font-weight: bold; margin-top: 5px; text-align: right; }
    
    .defend-btn { background: #ff0000; color: #fff; border: none; padding: 12px 24px; font-family: inherit; font-weight: bold; cursor: pointer; font-size: 0.8em; }
    .defend-btn:hover { background: #fff; color: #ff0000; }
  `
})
export class IntrusionOverlayComponent {
  gameService = inject(GameService);
}
