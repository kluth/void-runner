import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-neural-link-widgets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widgets-container">
      @for (widget of activeWidgets(); track widget.id) {
        <div class="floating-widget terminal-frame" [class.glitch]="game.isGlitchy()">
          <div class="ascii-line">{{ widget.label }}</div>
          <div class="widget-action" (click)="executeWidget(widget)">
            [ {{ widget.actionLabel }} ]
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .widgets-container {
      position: fixed; top: 50%; right: 180px; transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 15px; z-index: 500; pointer-events: none;
    }
    .floating-widget {
      width: 150px; padding: 8px; background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px); pointer-events: auto; cursor: pointer;
      animation: float-in 0.5s ease-out;
    }
    .widget-action {
      font-size: 0.7rem; color: var(--neon-cyan); text-align: center; margin-top: 5px;
      font-family: 'Orbitron', monospace;
    }
    .widget-action:hover { color: #fff; text-shadow: 0 0 10px var(--neon-cyan); }
    
    @keyframes float-in {
      from { transform: translateX(50px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @media (max-width: 1300px) {
      .widgets-container { right: 20px; }
    }
    @media (max-width: 850px) {
      .widgets-container { top: 70px; right: 10px; transform: none; flex-direction: row; flex-wrap: wrap; }
      @keyframes float-in {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    }
  `
})
export class NeuralLinkWidgetsComponent {
  game = inject(GameService);

  activeWidgets = computed(() => {
    const widgets = [];
    const intent = this.game.predictedIntent();
    const heat = this.game.systemHeat();

    if (intent === 'SYSTEM' || heat > 70) {
      widgets.push({ id: 'w1', label: 'THERMAL_VENT', actionLabel: 'EXECUTE_PURGE', cmd: 'cooldown' });
    }
    if (intent === 'NETWORK') {
      widgets.push({ id: 'w2', label: 'TRACE_SPOOF', actionLabel: 'ROTATE_IP', cmd: 'spoof' });
    }
    if (this.game.credits() > 5000 && intent === 'HARDWARE') {
      widgets.push({ id: 'w3', label: 'MARKET_DEAL', actionLabel: 'BROWSE_BLACK_MARKET', cmd: 'market' });
    }

    return widgets;
  });

  executeWidget(w: any) {
    this.game.processCommand(w.cmd);
  }
}
