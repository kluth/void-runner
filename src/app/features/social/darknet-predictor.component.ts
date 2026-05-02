import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-darknet-predictor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="predictor-container terminal-frame">
      <div class="ascii-line cyan">DARKNET_MESH_PREDICTOR // v3.1</div>
      
      <div class="predictions-list">
        @for (ev of game.predictiveEvents(); track ev.type) {
          <div class="prediction-card" [class.high-prob]="ev.probability > 70">
            <div class="p-header">
              <span class="p-type">{{ ev.type }}</span>
              <span class="p-prob">{{ ev.probability }}% CONFIDENCE</span>
            </div>
            <div class="p-eta">ETA: {{ ev.eta }}s</div>
            <p class="p-reasoning">> {{ ev.reasoning }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .predictor-container { padding: 10px; background: rgba(0, 0, 0, 0.8); }
    .predictions-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .prediction-card { border-left: 2px solid var(--neon-cyan); padding-left: 10px; opacity: 0.8; }
    .prediction-card.high-prob { border-color: var(--neon-magenta); opacity: 1; }
    .p-header { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: bold; }
    .p-type { color: var(--neon-cyan); }
    .high-prob .p-type { color: var(--neon-magenta); }
    .p-eta { font-size: 0.6rem; opacity: 0.6; }
    .p-reasoning { font-size: 0.65rem; color: #ccc; font-style: italic; margin-top: 4px; }
  `
})
export class DarknetPredictorComponent {
  game = inject(GameService);
}
