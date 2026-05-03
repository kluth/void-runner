import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team.component';
import { DarknetNodeComponent } from './darknet-node.component';
import { SocialExploitComponent } from './social-exploit.component';
import { PresenceMeshComponent } from './presence-mesh.component';
import { InfluenceMatrixComponent } from './influence-matrix.component';
import { SocialHeatmapComponent } from './social-heatmap.component';

@Component({
  selector: 'app-social-hub',
  standalone: true,
  imports: [CommonModule, TeamComponent, DarknetNodeComponent, SocialExploitComponent, PresenceMeshComponent, InfluenceMatrixComponent, SocialHeatmapComponent],
  template: `
    <div class="hub-container">
      <nav class="hub-nav">
        <button (click)="subTab.set('teams')" [class.active]="subTab() === 'teams'">[ SYNDICATES ]</button>
        <button (click)="subTab.set('darknet')" [class.active]="subTab() === 'darknet'">[ DARKNET_CHAT ]</button>
        <button (click)="subTab.set('exploit')" [class.active]="subTab() === 'exploit'">[ SOCIAL_GRAPH ]</button>
        <button (click)="subTab.set('matrix')" [class.active]="subTab() === 'matrix'">[ FACTION_INTEL ]</button>
        <button (click)="subTab.set('presence')" [class.active]="subTab() === 'presence'">[ TEAM_MESH ]</button>
      </nav>

      <div class="hub-content">
        @switch (subTab()) {
          @case ('teams') { <app-teams /> }
          @case ('darknet') { <app-darknet-node /> }
          @case ('exploit') { <app-social-exploit /> }
          @case ('matrix') {
            <div class="matrix-view">
              <app-influence-matrix />
              <div class="h-divider"></div>
              <app-social-heatmap />
            </div>
          }
          @case ('presence') { <app-presence-mesh /> }
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .hub-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .hub-nav { 
      display: flex; gap: 10px; padding: 10px; 
      background: rgba(255, 0, 85, 0.05); 
      border-bottom: 1px solid rgba(255, 0, 85, 0.1);
      flex-wrap: wrap;
    }
    .hub-nav button {
      padding: 6px 12px; font-size: 0.65rem; border-color: rgba(255, 0, 85, 0.2); color: rgba(255, 0, 85, 0.6);
    }
    .hub-nav button.active { background: var(--neon-magenta); color: #000; border-color: var(--neon-magenta); box-shadow: 0 0 10px var(--neon-magenta); }
    .hub-content { flex: 1; overflow-y: auto; padding: 15px; min-height: 0; }
    
    .matrix-view { display: flex; flex-direction: column; gap: 1.5rem; }
  `
})
export class SocialHubComponent {
  subTab = signal('teams');
}
