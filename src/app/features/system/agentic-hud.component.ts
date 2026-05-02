import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-agentic-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agentic-overlay" *ngIf="ai.agenticInsights().length > 0">
      <div class="glass-container" [style.backdrop-filter]="getBlur()">
        <div class="ascii-line cyan">AMBIENT_AI_INSIGHTS</div>
        
        <div class="insights-list">
          @for (insight of ai.agenticInsights(); track insight.id) {
            <div class="insight-item" [class]="insight.type.toLowerCase()">
              <span class="type-badge">{{ insight.type }}</span>
              <span class="insight-text">{{ insight.text }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .agentic-overlay {
      position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
      width: 500px; z-index: 5000; pointer-events: none;
    }
    .glass-container {
      background: rgba(10, 15, 30, 0.6);
      border: 1px solid rgba(0, 229, 255, 0.3);
      padding: 15px;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    }
    .insights-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .insight-item {
      display: flex; gap: 10px; align-items: center;
      font-size: 0.7rem; border-left: 2px solid; padding-left: 8px;
    }
    .info { border-color: var(--neon-cyan); color: var(--neon-cyan); }
    .warning { border-color: var(--neon-orange); color: var(--neon-orange); }
    .critical { border-color: var(--neon-magenta); color: var(--neon-magenta); animation: blink 0.5s infinite; }
    
    .type-badge { font-weight: 900; opacity: 0.8; font-size: 0.5rem; }
    .insight-text { font-family: 'JetBrains Mono', monospace; }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `
})
export class AgenticHudComponent {
  ai = inject(OnboardAiService);
  game = inject(GameService);

  getBlur() {
    const stress = this.game.systemStress();
    const blur = Math.floor(stress / 10);
    return `blur(${blur}px)`;
  }
}
