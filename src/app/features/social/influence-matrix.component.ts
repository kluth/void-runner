import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactionService } from '../../core/services/faction.service';

@Component({
  selector: 'app-influence-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="matrix-container terminal-frame">
      <div class="ascii-line">UNDERGROUND_DIPLOMACY // INFLUENCE_MATRIX</div>
      
      <div class="matrix-grid">
        @for (item of factionService.influenceMatrix(); track item.factionId) {
          <div class="faction-node" [style.border-color]="getFaction(item.factionId)?.color">
            <div class="node-header" [style.background]="getFaction(item.factionId)?.color">
              {{ getFaction(item.factionId)?.tag }}
            </div>
            <div class="node-body">
              <div class="inf-bar">
                <div class="inf-fill" [style.width.%]="item.influence" [style.background]="getFaction(item.factionId)?.color"></div>
              </div>
              <div class="inf-value">{{ item.influence | number:'1.0-0' }}%</div>
            </div>
          </div>
        }
      </div>

      <div class="ai-diplomat">
        <div class="ascii-line violet">NEURAL_DIPLOMAT_ADVISORY</div>
        <p class="advice-text">{{ getAdvisory() }}</p>
      </div>
    </div>
  `,
  styles: `
    .matrix-container { padding: 10px; background: rgba(0, 0, 0, 0.8); }
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 10px;
      margin: 15px 0;
    }
    .faction-node {
      border: 1px solid;
      display: flex;
      flex-direction: column;
    }
    .node-header {
      color: #000;
      font-weight: 900;
      font-size: 0.7rem;
      text-align: center;
      padding: 2px;
    }
    .node-body { padding: 5px; text-align: center; }
    .inf-bar {
      height: 4px; background: rgba(255, 255, 255, 0.1);
      margin-bottom: 5px;
    }
    .inf-fill { height: 100%; transition: width 0.5s ease; }
    .inf-value { font-size: 0.6rem; opacity: 0.8; }
    
    .ai-diplomat {
      border-top: 1px dashed rgba(191, 64, 255, 0.3);
      padding-top: 10px;
    }
    .advice-text {
      font-size: 0.7rem; font-style: italic; color: var(--neon-violet);
    }
  `
})
export class InfluenceMatrixComponent {
  factionService = inject(FactionService);

  getFaction(id: string) {
    return this.factionService.factions().find(f => f.id === id);
  }

  getAdvisory() {
    const factions = this.factionService.influenceMatrix();
    if (factions.length === 0) return "Calculating political drift...";
    
    const maxInf = [...factions].sort((a, b) => b.influence - a.influence)[0];
    const topFaction = this.getFaction(maxInf.factionId);
    
    return `NEURAL_ADVISORY: ${topFaction?.name} is currently dominating the grid with ${Math.floor(maxInf.influence)}% influence. Aligning with their rivals might yield higher rewards but carries extreme trace risk.`;
  }
}
