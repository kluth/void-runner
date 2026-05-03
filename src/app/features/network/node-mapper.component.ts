import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-node-mapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapper-container">
      <div class="terminal-frame">
        <div class="ascii-line">NEURAL_LINK_NODE_MAPPER_v1.0</div>
        
        <div class="tactical-grid">
          @for (node of networkService.nodes(); track node.id) {
            <div class="node-hex" 
                 [class.active]="isNodeInPath(node)"
                 [style.left.%]="getNodeX(node)"
                 [style.top.%]="getNodeY(node)">
              <div class="node-dot"></div>
              <div class="node-label">{{ node.name }}</div>
              <div class="node-coords">[{{ node.lat }}, {{ node.lng }}]</div>
            </div>
          }

          <svg class="connections-svg">
            @for (link of activeLinks(); track $index) {
              <line [attr.x1]="link.x1 + '%'" [attr.y1]="link.y1 + '%'"
                    [attr.x2]="link.x2 + '%'" [attr.y2]="link.y2 + '%'"
                    class="link-line" />
            }
          </svg>
        </div>

        <div class="mapper-footer">
          <div class="stat">LINKS_ACTIVE: {{ activeLinks().length }}</div>
          <div class="stat">SYNC_QUALITY: 94%</div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .mapper-container {
      height: 100%;
      background: #000;
      color: var(--neon-cyan);
      font-family: 'JetBrains Mono', monospace;
      padding: 10px;
    }
    .tactical-grid {
      height: 300px;
      max-height: 30dvh;
      min-height: 200px;
      position: relative;
      background: radial-gradient(circle, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      border: 1px solid rgba(0, 229, 255, 0.2);
      margin: 10px 0;
      overflow: hidden;
    }
    .node-hex {
      position: absolute;
      width: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .node-dot {
      width: 8px;
      height: 8px;
      background: var(--neon-cyan);
      box-shadow: 0 0 10px var(--neon-cyan);
      margin-bottom: 5px;
    }
    .node-hex.active .node-dot {
      background: var(--neon-green);
      box-shadow: 0 0 15px var(--neon-green);
      animation: pulse 1.5s infinite;
    }
    .node-label { font-size: 0.6rem; text-align: center; white-space: nowrap; }
    .node-coords { font-size: 0.5rem; opacity: 0.5; }

    .connections-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .link-line {
      stroke: var(--neon-green);
      stroke-width: 1;
      stroke-dasharray: 4;
      animation: dash 5s linear infinite;
      opacity: 0.4;
    }

    @keyframes dash {
      to { stroke-dashoffset: -20; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.7; }
    }

    .mapper-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      border-top: 1px solid rgba(0, 229, 255, 0.2);
      padding-top: 5px;
    }
  `
})
export class NodeMapperComponent {
  networkService = inject(NetworkService);
  gameService = inject(GameService);

  isNodeInPath(node: any) {
    return this.networkService.currentPath().some(n => n.id === node.id);
  }

  getNodeX(node: any) {
    return ((node.lng + 180) / 360) * 100;
  }

  getNodeY(node: any) {
    return ((90 - node.lat) / 180) * 100;
  }

  activeLinks = computed(() => {
    const path = this.networkService.currentPath();
    const links = [];
    for (let i = 0; i < path.length - 1; i++) {
      links.push({
        x1: this.getNodeX(path[i]),
        y1: this.getNodeY(path[i]),
        x2: this.getNodeX(path[i+1]),
        y2: this.getNodeY(path[i+1])
      });
    }
    return links;
  });
}
