import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network.service';

@Component({
  selector: 'app-topology-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="topology-container terminal-frame">
      <div class="ascii-line cyan">INTERACTIVE_NETWORK_TOPOLOGY</div>
      
      <div class="topology-grid">
        @for (node of service.nodes(); track node.id) {
          <div class="topology-node" 
               [class.active]="isActive(node.id)"
               [style.left.%]="getX(node.id)"
               [style.top.%]="getY(node.id)">
            <div class="node-circle"></div>
            <span class="node-name">{{ node.name.substring(0, 12) }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .topology-container { height: 200px; max-height: 25dvh; min-height: 150px; padding: 10px; background: rgba(0, 0, 0, 0.4); margin-bottom: 20px; }
    .topology-grid { position: relative; height: 100%; width: 100%; }
    .topology-node { position: absolute; display: flex; flex-direction: column; align-items: center; }
    .node-circle { width: 10px; height: 10px; border: 1px solid var(--primary); border-radius: 50%; background: #000; }
    .active .node-circle { background: var(--primary); box-shadow: 0 0 10px var(--primary); }
    .node-name { font-size: 0.5rem; opacity: 0.7; margin-top: 2px; white-space: nowrap; }
  `
})
export class TopologyMapComponent {
  service = inject(NetworkService);

  isActive(id: string) {
    return this.service.currentPath().some(n => n.id === id);
  }

  getX(id: string) { return (id.charCodeAt(0) * 11) % 80 + 10; }
  getY(id: string) { return (id.charCodeAt(1) * 19) % 70 + 15; }
}
