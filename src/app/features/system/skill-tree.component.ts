import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-skill-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skills-container terminal-frame">
      <div class="ascii-line cyan">NEURAL_CAPABILITY_TREE</div>
      
      <div class="skills-list">
        @for (skill of game.skills(); track skill.id) {
          <div class="skill-card" [class.unlocked]="skill.unlocked">
            <div class="s-header">
              <span class="s-name">{{ skill.name }}</span>
              <span class="s-cost" *ngIf="!skill.unlocked">{{ skill.cost }} XP</span>
              <span class="s-tag" *ngIf="skill.unlocked">[ UNLOCKED ]</span>
            </div>
            <div class="s-unlocks">> UNLOCKS: {{ skill.unlocks }}</div>
            <button class="unlock-btn" *ngIf="!skill.unlocked" 
                    [disabled]="game.experience() < skill.cost"
                    (click)="game.unlockSkill(skill.id)">
              [ INITIALIZE_UPLOAD ]
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .skills-container { padding: 10px; background: rgba(0, 0, 0, 0.8); }
    .skills-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .skill-card { border: 1px solid rgba(0, 255, 159, 0.2); padding: 10px; opacity: 0.8; }
    .skill-card.unlocked { border-color: var(--primary); opacity: 1; background: rgba(0, 255, 159, 0.05); }
    .s-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 0.8rem; }
    .s-name { color: var(--primary); }
    .s-cost { color: var(--neon-cyan); }
    .s-tag { color: var(--neon-cyan); font-size: 0.6rem; }
    .s-unlocks { font-size: 0.65rem; color: #ccc; margin: 5px 0; }
    .unlock-btn { width: 100%; font-size: 0.7rem; }
  `
})
export class SkillTreeComponent {
  game = inject(GameService);
}
