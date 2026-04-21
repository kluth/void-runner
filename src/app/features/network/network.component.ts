import { Component, inject } from '@angular/core';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-network">
      <!-- BOTNET SECTION -->
      <div class="ascii-window">
        <div class="ascii-header">┌── BOTNET_RESOURCES ──────────────────────────────────────────┐</div>
        <div class="ascii-body">
          <div class="botnet-stats">
             <span class="b-val">{{ gameService.botnetSize() }}</span>
             <span class="b-unit">NODES_UNDER_CONTROL</span>
          </div>
          <div class="botnet-actions">
             <button class="terminal-btn ddos" (click)="launchDDoS()">
               <span class="btn-bracket">[</span> LAUNCH_DDOS <span class="btn-bracket">]</span>
             </button>
             <button class="terminal-btn" (click)="deployRansomware()">
               <span class="btn-bracket">[</span> DEPLOY_RANSOM <span class="btn-bracket">]</span>
             </button>
          </div>
        </div>
        <div class="ascii-footer">└─────────────────────────────────────────────────────────────┘</div>
      </div>

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
    :host {
      display: block;
      height: 100%;
      background: #000;
    }

    .terminal-network {
      background: #000;
      color: var(--primary);
      padding: 1.5rem;
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      height: 100%;
      overflow-y: auto;
    }

    .ascii-window {
      display: flex;
      flex-direction: column;
    }

    .ascii-header, .ascii-footer {
      white-space: pre;
      font-size: 0.85rem;
      line-height: 1.2;
      color: var(--primary);
      opacity: 0.9;
    }

    .ascii-body {
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      padding: 1.5rem;
      background: rgba(0, 255, 65, 0.01);
    }

    .botnet-stats { 
      display: flex; 
      align-items: baseline; 
      gap: 15px; 
      margin-bottom: 1.5rem; 
    }
    
    .b-val { 
      font-size: 3rem; 
      font-weight: bold; 
      color: var(--primary);
      text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
    }
    
    .b-unit { 
      font-size: 0.75rem; 
      letter-spacing: 2px;
      opacity: 0.7; 
    }

    .botnet-actions { 
      display: flex;
      gap: 1.5rem; 
    }

    .terminal-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      font-family: inherit;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 0.4rem 0.8rem;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
    }

    .terminal-btn:hover {
      background: var(--primary);
      color: #000;
    }
    
    .terminal-btn:hover .btn-bracket {
      color: #000;
    }

    .btn-bracket {
      color: var(--primary);
      opacity: 0.5;
    }

    .ddos:hover {
      background: var(--error, #ff4444);
      color: #fff;
    }

    .routing-grid { 
      display: flex; 
      flex-direction: column; 
      gap: 10px; 
    }

    .terminal-btn.item {
      width: 100%;
      justify-content: flex-start;
      border: 1px solid transparent;
    }

    .terminal-btn.item.active {
      background: var(--primary);
      color: #000;
    }

    .path-readout {
      font-family: inherit;
    }

    .path-nodes { 
      font-size: 0.85rem; 
      display: flex; 
      flex-wrap: wrap; 
      align-items: center;
      gap: 10px; 
    }

    .p-node {
      padding: 2px 6px;
      border: 1px solid rgba(0, 255, 65, 0.3);
    }

    .arrow { 
      opacity: 0.5;
      font-weight: bold;
    }

    /* Scrollbar Styling */
    .terminal-network::-webkit-scrollbar {
      width: 8px;
    }
    .terminal-network::-webkit-scrollbar-track {
      background: #000;
    }
    .terminal-network::-webkit-scrollbar-thumb {
      background: var(--primary);
      border: 2px solid #000;
    }
  `
})
export class NetworkComponent {
  networkService = inject(NetworkService);
  gameService = inject(GameService);
  audioService = inject(AudioService);

  launchDDoS() {
    if (this.gameService.launchDDoS()) {
      this.audioService.playSuccess();
    } else {
      this.audioService.playError();
    }
  }

  deployRansomware() {
    if (this.gameService.deployRansomware()) {
      this.audioService.playSuccess();
    } else {
      this.audioService.playError();
    }
  }
}
