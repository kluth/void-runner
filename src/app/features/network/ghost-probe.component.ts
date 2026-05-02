import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-ghost-probe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="probes-container" *ngIf="game.ghostProbes().length > 0">
      <div class="ascii-line">ACTIVE_GHOST_PROBES</div>
      <div class="probe-list">
        @for (probe of game.ghostProbes(); track probe.id) {
          <div class="probe-item" [class.done]="probe.progress >= 100">
            <div class="p-header">
              <span>{{ probe.id }}</span>
              <span>{{ probe.progress > 100 ? 'COMPLETE' : probe.progress + '%' }}</span>
            </div>
            <div class="p-bar">
              <div class="p-fill" [style.width.%]="probe.progress"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .probes-container { padding: 10px; background: rgba(0, 0, 0, 0.6); margin-top: 10px; border: 1px dashed var(--primary); }
    .probe-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .probe-item { font-size: 0.6rem; }
    .p-header { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .p-bar { height: 4px; background: rgba(255, 255, 255, 0.1); }
    .p-fill { height: 100%; background: var(--primary); transition: width 0.5s linear; }
    .done .p-fill { background: var(--neon-cyan); }
  `
})
export class GhostProbeComponent {
  game = inject(GameService);
}
