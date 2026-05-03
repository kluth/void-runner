import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemIntegrityComponent } from './system-integrity.component';
import { SkillTreeComponent } from './skill-tree.component';
import { Web3MiningComponent } from './web3-mining.component';

@Component({
  selector: 'app-system-hub',
  standalone: true,
  imports: [CommonModule, SystemIntegrityComponent, SkillTreeComponent, Web3MiningComponent],
  template: `
    <div class="hub-container">
      <nav class="hub-nav">
        <button (click)="subTab.set('integrity')" [class.active]="subTab() === 'integrity'">[ SYSTEM_HEALTH ]</button>
        <button (click)="subTab.set('skills')" [class.active]="subTab() === 'skills'">[ NEURAL_TREE ]</button>
        <button (click)="subTab.set('mining')" [class.active]="subTab() === 'mining'">[ VOID_MINE ]</button>
      </nav>

      <div class="hub-content">
        @switch (subTab()) {
          @case ('integrity') { <app-system-integrity /> }
          @case ('skills') { <app-skill-tree /> }
          @case ('mining') { <app-web3-mining /> }
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .hub-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .hub-nav { 
      display: flex; gap: 10px; padding: 10px; 
      background: rgba(191, 64, 255, 0.05); 
      border-bottom: 1px solid rgba(191, 64, 255, 0.1);
      flex-wrap: wrap;
    }
    .hub-nav button {
      padding: 6px 12px; font-size: 0.65rem; border-color: rgba(191, 64, 255, 0.2); color: rgba(191, 64, 255, 0.6);
    }
    .hub-nav button.active { background: var(--neon-violet); color: #000; border-color: var(--neon-violet); box-shadow: 0 0 10px var(--neon-violet); }
    .hub-content { flex: 1; overflow-y: auto; padding: 15px; min-height: 0; }
  `
})
export class SystemHubComponent {
  subTab = signal('integrity');
}
