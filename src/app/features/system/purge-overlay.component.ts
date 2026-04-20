import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purge-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.purgeActive()) {
      <div class="purge-overlay" role="dialog" aria-label="System Purge Imminent">
        <div class="purge-box">
          <div class="alert-icon" aria-hidden="true">[!]</div>
          <h2 class="title glitch-title">CRITICAL TRACE REACHED</h2>
          <div class="desc">
            Blue Team has isolated your node. System Purge initiated.<br>
            All hardware, credits, and active operations will be incinerated.
          </div>
          
          <div class="timer" [class.danger]="gameService.purgeTimer() < 10">
            T-MINUS: {{ gameService.purgeTimer() }}s
          </div>
          
          <div class="instruction">
            Open terminal and execute override protocol:<br>
            <span class="code">abort_purge {{ gameService.purgeCode() }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .purge-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(193, 0, 20, 0.2);
      backdrop-filter: blur(5px);
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bg-pulse 1s infinite alternate;
    }

    @keyframes bg-pulse {
      from { background: rgba(193, 0, 20, 0.2); }
      to { background: rgba(193, 0, 20, 0.4); }
    }

    .purge-box {
      width: 100%;
      max-width: 500px;
      padding: 3rem;
      background: var(--layer-1);
      border: 4px solid var(--tertiary);
      text-align: center;
      box-shadow: 0 0 100px var(--tertiary);
      animation: shake 0.5s infinite;
    }

    @keyframes shake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }

    .alert-icon {
      font-size: 4rem;
      color: var(--tertiary);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 900;
      margin-bottom: 1rem;
    }

    .title {
      color: var(--tertiary);
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .desc {
      font-size: 0.85rem;
      color: #fff;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .timer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 3rem;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 2rem;
      text-shadow: 0 0 20px var(--primary);
    }

    .timer.danger {
      color: var(--tertiary);
      text-shadow: 0 0 30px var(--tertiary);
      animation: scale-pulse 0.5s infinite alternate;
    }

    @keyframes scale-pulse {
      from { transform: scale(1); }
      to { transform: scale(1.1); }
    }

    .instruction {
      font-size: 0.75rem;
      color: var(--primary);
      opacity: 0.8;
      background: var(--layer-2);
      padding: 1rem;
    }

    .code {
      display: block;
      margin-top: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--secondary);
    }
  `
})
export class PurgeOverlayComponent {
  gameService = inject(GameService);
}
