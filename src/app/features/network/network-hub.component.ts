import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobeComponent } from './globe.component';
import { NetworkComponent } from './network.component';
import { NodeMapperComponent } from './node-mapper.component';
import { TopologyMapComponent } from './topology-map.component';
import { GhostProbeComponent } from './ghost-probe.component';
import { DataStreamComponent } from './data-stream.component';
import { InfoOverlayService } from '../../core/services/info-overlay.service';

@Component({
  selector: 'app-network-hub',
  standalone: true,
  imports: [CommonModule, GlobeComponent, NetworkComponent, NodeMapperComponent, TopologyMapComponent, GhostProbeComponent, DataStreamComponent],
  template: `
    <div class="hub-container">
      <nav class="hub-nav">
        <button (click)="subTab.set('uplink')" [class.active]="subTab() === 'uplink'">[ GLOBAL_UPLINK ]</button>
        <button (click)="subTab.set('nodes')" [class.active]="subTab() === 'nodes'">[ NODE_ANALYSIS ]</button>
        <button (click)="subTab.set('botnet')" [class.active]="subTab() === 'botnet'">[ BOTNET_MGMT ]</button>
        <button (click)="subTab.set('probes')" [class.active]="subTab() === 'probes'">[ GHOST_PROBES ]</button>
        <div style="flex: 1;"></div>
        <button class="info-btn" (click)="showInfo()">[ ? ]</button>
      </nav>

      <div class="hub-content">
        @switch (subTab()) {
          @case ('uplink') {
             <div class="uplink-view">
               <app-globe />
               <div class="h-divider"></div>
               <app-data-stream />
             </div>
          }
          @case ('nodes') {
            <div class="nodes-view">
              <app-node-mapper />
              <div class="h-divider"></div>
              <app-topology-map />
            </div>
          }
          @case ('botnet') { <app-network /> }
          @case ('probes') { <app-ghost-probe /> }
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .hub-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .hub-nav { 
      display: flex; gap: 10px; padding: 10px; 
      background: rgba(0, 229, 255, 0.05); 
      border-bottom: 1px solid rgba(0, 229, 255, 0.1);
      flex-wrap: wrap;
    }
    .hub-nav button {
      padding: 6px 12px; font-size: 0.65rem; border-color: rgba(0, 229, 255, 0.2); color: rgba(0, 229, 255, 0.6);
    }
    .hub-nav button.active { background: var(--neon-cyan); color: #000; border-color: var(--neon-cyan); box-shadow: 0 0 10px var(--neon-cyan); }
    .hub-content { flex: 1; overflow-y: auto; padding: 15px; min-height: 0; }
    
    .uplink-view, .nodes-view { display: flex; flex-direction: column; gap: 1.5rem; height: 100%; }
    app-globe { height: 400px; flex-shrink: 0; }
    .info-btn { color: var(--neon-cyan); background: transparent; border: 1px solid var(--neon-cyan); padding: 2px 6px; font-size: 0.6rem; margin-left: 10px; cursor: pointer; }
    .info-btn:hover { background: rgba(0, 229, 255, 0.1); }
  `
})
export class NetworkHubComponent {
  subTab = signal('uplink');
  info = inject(InfoOverlayService);

  showInfo() {
    this.info.open(
      'NETWORK HUB // GRID TOPOLOGY',
      `<p><strong>[ GLOBAL_UPLINK ]:</strong> Visualize real-time connection paths and encrypted data streams crossing the globe.</p>
       <p><strong>[ NODE_ANALYSIS ]:</strong> Inspect specific server clusters and map their internal topologies for vulnerabilities.</p>
       <p><strong>[ BOTNET_MGMT ]:</strong> Coordinate your hijacked resources. Launch massive DDoS attacks or deploy Ransomware to gain credits.</p>
       <p><strong>[ GHOST_PROBES ]:</strong> Deploy autonomous agents to gather intelligence passively, uncovering new mission vectors.</p>`
    );
  }
}
