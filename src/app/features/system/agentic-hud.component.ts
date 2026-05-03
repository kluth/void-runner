import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-agentic-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agentic-overlay" *ngIf="visible() && ai.agenticInsights().length > 0 && game.settings().beta.ai_insights">
      <div class="glass-container" [style.backdrop-filter]="getBlur()">
        <div class="hud-header">
          <div class="ascii-line cyan">AMBIENT_AI_INSIGHTS</div>
          <button class="close-btn" (click)="close()">[X]</button>
        </div>
        
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
      position: fixed; top: 180px; right: 170px;
      width: 300px; max-width: 90vw; z-index: 5000; pointer-events: none;
    }
    .glass-container {
      background: rgba(10, 15, 30, 0.7);
      border: 1px solid rgba(0, 229, 255, 0.2);
      padding: 12px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
      pointer-events: auto;
    }
    .hud-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .close-btn { 
      background: transparent; border: none; color: var(--primary); 
      font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; cursor: pointer;
      padding: 0 4px;
    }
    .close-btn:hover { color: var(--neon-magenta); }

    .insights-list { display: flex; flex-direction: column; gap: 8px; }
    .insight-item {
      display: flex; gap: 8px; align-items: baseline;
      font-size: 0.65rem; border-left: 2px solid; padding-left: 6px;
      background: rgba(0, 229, 255, 0.05);
    }
    .info { border-color: var(--neon-cyan); color: var(--neon-cyan); }
    .warning { border-color: var(--neon-orange); color: var(--neon-orange); }
    .critical { border-color: var(--neon-magenta); color: var(--neon-magenta); animation: blink 0.5s infinite; }
    
    .type-badge { font-weight: 900; opacity: 0.8; font-size: 0.5rem; }
    .insight-text { font-family: 'JetBrains Mono', monospace; }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    @media (max-width: 1200px) {
      .agentic-overlay { right: 20px; top: 120px; }
    }
    @media (max-width: 850px) {
      .agentic-overlay { display: none; }
    }
  `
})
export class AgenticHudComponent {
  ai = inject(OnboardAiService);
  game = inject(GameService);
  visible = signal(true);

  getBlur() {
    const stress = this.game.systemStress();
    const blur = Math.floor(stress / 10);
    return `blur(${blur}px)`;
  }

  close() {
    this.visible.set(false);
  }
}
