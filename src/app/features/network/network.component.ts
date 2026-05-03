import { Component, inject, signal } from '@angular/core';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { DataStreamComponent } from './data-stream.component';
import { GhostProbeComponent } from './ghost-probe.component';
import { TopologyMapComponent } from './topology-map.component';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, DataStreamComponent, GhostProbeComponent, TopologyMapComponent],
  template: `
    <div class="terminal-network">
      <app-topology-map />
      <app-data-stream />
      <app-ghost-probe />
      
      <!-- BOTNET SECTION -->
      <div class="ascii-window">
        <div class="ascii-header">┌── BOTNET_RESOURCES ──────────────────────────────────────────┐</div>
        <div class="ascii-body">
          <div class="botnet-stats">
             <span class="b-val">{{ gameService.botnetSize() }}</span>
             <span class="b-unit">NODES_UNDER_CONTROL</span>
          </div>
          <div class="botnet-actions">
             <button class="terminal-btn ddos" (click)="initAttack('DDOS')">
               <span class="btn-bracket">[</span> LAUNCH_DDOS <span class="btn-bracket">]</span>
             </button>
             <button class="terminal-btn" (click)="initAttack('RANSOM')">
               <span class="btn-bracket">[</span> DEPLOY_RANSOM <span class="btn-bracket">]</span>
             </button>
          </div>
        </div>
        <div class="ascii-footer">└─────────────────────────────────────────────────────────────┘</div>
      </div>

      <!-- ATTACK OVERLAY -->
      @if (activeAttack()) {
        <div class="attack-modal glass-overlay">
           <div class="terminal-frame attack-box">
              <div class="ascii-line magenta">{{ activeAttack() }}_SEQUENCE_ACTIVE</div>
              <div class="a-grid">
                 @for (cell of attackCells(); track $index) {
                   <div class="a-cell" [class.target]="cell.isTarget" (click)="clickCell(cell)">
                      {{ cell.isTarget ? 'X' : '·' }}
                   </div>
                 }
              </div>
              <div class="a-footer">
                 <span>ALIGNMENT: {{ attackProgress() }}%</span>
                 <button (click)="activeAttack.set(null)">[ ABORT ]</button>
              </div>
           </div>
        </div>
      }

      <!-- ROUTING SECTION -->
      <div class="ascii-window">
        <div class="ascii-header">┌── ROUTING_PROTOCOLS ─────────────────────────────────────────┐</div>
        <div class="ascii-body">
           <div class="routing-grid">
              <button class="terminal-btn item" [class.active]="gameService.routingMode() === 'DIRECT'" (click)="gameService.setRouting('DIRECT')">
                 {{ gameService.routingMode() === 'DIRECT' ? ' ● ' : ' ○ ' }} DIRECT_LINK [0cr]
              </button>
              <button class="terminal-btn item" [class.active]="gameService.routingMode() === 'VPN'" (click)="gameService.setRouting('VPN')">
                 {{ gameService.routingMode() === 'VPN' ? ' ● ' : ' ○ ' }} SECURE_VPN  [20cr]
              </button>
              <button class="terminal-btn item" [class.active]="gameService.routingMode() === 'ONION'" (click)="gameService.setRouting('ONION')">
                 {{ gameService.routingMode() === 'ONION' ? ' ● ' : ' ○ ' }} ONION_ROUTER [50cr]
              </button>
           </div>
        </div>
        <div class="ascii-footer">└─────────────────────────────────────────────────────────────┘</div>
      </div>

      <!-- TRACE PATH SECTION -->
      <div class="ascii-window">
        <div class="ascii-header">┌── ACTIVE_TRACE_PATH ─────────────────────────────────────────┐</div>
        <div class="ascii-body">
           <div class="path-readout">
              <div class="path-nodes">
                 @for (node of networkService.currentPath(); track node.id) {
                    <span class="p-node">{{ node.name }}</span>
                    @if (!$last) { <span class="arrow">───></span> }
                 }
              </div>
           </div>
        </div>
        <div class="ascii-footer">└─────────────────────────────────────────────────────────────┘</div>
      </div>
    </div>
  `,
  styles: `
    .terminal-network { display: flex; flex-direction: column; gap: 20px; padding: 20px; }
    .ascii-window { background: rgba(0, 20, 10, 0.4); border: 1px solid rgba(0, 255, 159, 0.1); }
    .ascii-header, .ascii-footer { font-family: monospace; font-size: 0.7rem; color: var(--primary); padding: 5px 10px; opacity: 0.5; }
    .ascii-body { padding: 15px; }

    .botnet-stats { margin-bottom: 10px; }
    .b-val { font-size: 2rem; font-weight: bold; color: var(--primary); margin-right: 10px; }
    .b-unit { font-size: 0.7rem; opacity: 0.6; }
    .botnet-actions { display: flex; gap: 10px; }

    .attack-modal { position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh; z-index: 10000; display: flex; align-items: center; justify-content: center; }
    .attack-box { background: var(--layer-1); padding: 1.5rem; width: 350px; text-align: center; }
    .a-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 1.5rem 0; }
    .a-cell { height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 255, 159, 0.2); cursor: pointer; font-family: monospace; }
    .a-cell.target { color: var(--neon-magenta); border-color: var(--neon-magenta); font-weight: bold; }
    .a-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.6rem; }

    .routing-grid { display: flex; flex-direction: column; gap: 8px; }
    .terminal-btn.item { text-align: left; padding: 8px; font-size: 0.7rem; }
    .terminal-btn.active { border-color: var(--primary); background: rgba(0, 255, 159, 0.1); }

    .path-nodes { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.65rem; color: var(--neon-cyan); }
    .arrow { opacity: 0.3; }
  `
})
export class NetworkComponent {
  networkService = inject(NetworkService);
  gameService = inject(GameService);
  audioService = inject(AudioService);

  activeAttack = signal<'DDOS' | 'RANSOM' | null>(null);
  attackCells = signal<{isTarget: boolean, clicked: boolean}[]>([]);
  attackProgress = signal(0);

  initAttack(type: 'DDOS' | 'RANSOM') {
    this.activeAttack.set(type);
    this.attackProgress.set(0);
    this.generateCells();
  }

  generateCells() {
    const cells = [];
    for (let i = 0; i < 25; i++) {
      cells.push({ isTarget: Math.random() > 0.8, clicked: false });
    }
    if (!cells.some(c => c.isTarget)) cells[0].isTarget = true;
    this.attackCells.set(cells);
  }

  clickCell(cell: any) {
    if (cell.isTarget) {
      this.attackProgress.update(v => Math.min(100, v + 25));
      this.audioService.playClick();
      if (this.attackProgress() === 100) {
         if (this.activeAttack() === 'DDOS') this.gameService.launchDDoS();
         else this.gameService.deployRansomware();
         this.activeAttack.set(null);
      } else {
         this.generateCells();
      }
    } else {
      this.gameService.increaseDetection(5);
      this.audioService.playError();
    }
  }
}
