import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-social-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="heatmap-container terminal-frame">
      <div class="ascii-line">NEURAL_INFLUENCE_HEATMAP</div>
      
      <div class="influence-grid">
        @for (entry of heatmapData(); track entry.operative) {
          <div class="influence-cell" 
               [style.opacity]="entry.intensity"
               [style.background-color]="entry.color"
               [title]="entry.operative + ': ' + entry.action">
            <div class="cell-label">{{ entry.operative.substring(0,2) }}</div>
          </div>
        }
      </div>

      <div class="heatmap-footer">
        <div class="stat">AGGREGATE_PRESSURE: {{ aggregatePressure() }}%</div>
        <div class="stat">SYNERGY_INDEX: 0.84</div>
      </div>
    </div>
  `,
  styles: `
    .heatmap-container {
      padding: 10px;
      background: rgba(0, 0, 0, 0.8);
      margin-top: 10px;
    }
    .influence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
      gap: 5px;
      margin: 10px 0;
    }
    .influence-cell {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0, 255, 159, 0.2);
      font-size: 0.6rem;
      font-weight: bold;
      color: #000;
    }
    .cell-label { opacity: 0.8; }
    .heatmap-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.6rem;
      opacity: 0.6;
    }
  `
})
export class SocialHeatmapComponent {
  gameService = inject(GameService);

  heatmapData = computed(() => {
    const team = this.gameService.teamProgress();
    return Object.entries(team).map(([operative, data]) => ({
      operative,
      action: data.action,
      intensity: (data.progress / 100) * 0.8 + 0.2,
      color: this.getActionColor(data.action)
    }));
  });

  aggregatePressure = computed(() => {
    const data = this.heatmapData();
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + (curr.intensity * 100), 0);
    return Math.floor(sum / data.length);
  });

  getActionColor(action: string) {
    if (action.includes('DECRYPT')) return 'var(--neon-cyan)';
    if (action.includes('BREACH')) return 'var(--neon-magenta)';
    if (action.includes('SURVEIL')) return 'var(--neon-yellow)';
    return 'var(--neon-green)';
  }
}
