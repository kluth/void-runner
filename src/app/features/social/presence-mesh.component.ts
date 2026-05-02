import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-presence-mesh',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mesh-canvas terminal-frame">
      <div class="ascii-line">SYNDICATE_PRESENCE_MESH</div>
      
      <div class="spatial-grid">
        @for (member of members(); track member.id) {
          <div class="mesh-node" 
               [style.left.%]="member.x" 
               [style.top.%]="member.y"
               [class.active]="member.status === 'ACTIVE'"
               [class.glitching]="member.stress > 70">
            <div class="node-glass"></div>
            <div class="node-info">
              <span class="m-handle">{{ member.handle }}</span>
              <div class="m-status">{{ member.status }}</div>
            </div>
            
            <svg class="node-pulses">
              <circle cx="20" cy="20" r="15" class="pulse-ring" />
            </svg>
          </div>
        }

        <svg class="mesh-lines">
          @for (link of links(); track $index) {
            <line [attr.x1]="link.x1 + '%'" [attr.y1]="link.y1 + '%'"
                  [attr.x2]="link.x2 + '%'" [attr.y2]="link.y2 + '%'"
                  class="connection-line" />
          }
        </svg>
      </div>
    </div>
  `,
  styles: `
    .mesh-canvas { height: 400px; background: rgba(5, 8, 16, 0.4); backdrop-filter: blur(10px); }
    .spatial-grid { position: relative; height: 100%; width: 100%; overflow: hidden; }
    
    .mesh-node {
      position: absolute; width: 40px; height: 40px;
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .node-glass {
      width: 100%; height: 100%;
      background: rgba(0, 255, 159, 0.1);
      border: 1px solid rgba(0, 255, 159, 0.3);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0, 255, 159, 0.2);
    }
    .node-info {
      position: absolute; top: 45px; left: 50%; transform: translateX(-50%);
      text-align: center; white-space: nowrap;
    }
    .m-handle { font-size: 0.5rem; color: var(--primary); font-weight: bold; }
    .m-status { font-size: 0.4rem; opacity: 0.6; }

    .active .node-glass { background: rgba(0, 255, 159, 0.2); border-color: var(--primary); }
    .glitching { animation: node-glitch 0.2s infinite; }

    @keyframes node-glitch {
      0% { transform: translate(-50%, -50%) skew(0deg); }
      50% { transform: translate(-52%, -48%) skew(5deg); }
      100% { transform: translate(-50%, -50%) skew(0deg); }
    }

    .mesh-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
    .connection-line {
      stroke: var(--primary); stroke-width: 0.5; stroke-dasharray: 2;
      opacity: 0.2; animation: dash 10s linear infinite;
    }
    @keyframes dash { to { stroke-dashoffset: -50; } }

    .pulse-ring {
      fill: none; stroke: var(--primary); stroke-width: 1;
      opacity: 0; animation: pulse 3s infinite;
    }
    @keyframes pulse {
      0% { r: 5; opacity: 0.8; }
      100% { r: 30; opacity: 0; }
    }
  `
})
export class PresenceMeshComponent {
  game = inject(GameService);

  members = computed(() => {
    const team = this.game.teamProgress();
    return Object.entries(team).map(([handle, data], i) => ({
      id: handle,
      handle,
      status: data.progress > 0 ? 'ACTIVE' : 'IDLE',
      stress: data.progress,
      x: 20 + (i * 25) % 60,
      y: 30 + (i * 15) % 50
    }));
  });

  links = computed(() => {
    const m = this.members();
    const l = [];
    for (let i = 0; i < m.length - 1; i++) {
      l.push({ x1: m[i].x, y1: m[i].y, x2: m[i+1].x, y2: m[i+1].y });
    }
    return l;
  });
}
