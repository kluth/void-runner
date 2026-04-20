import { Component, inject } from '@angular/core';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-network',
  standalone: true,
  template: `
    <div class="network-container">
      <h3>NETWORK_ROUTING & C2</h3>
      
      <div class="botnet-panel">
        <div class="botnet-stats">
          <span class="botnet-label">ZOMBIE_NODES:</span>
          <span class="botnet-count">{{ gameService.botnetSize() }}</span>
        </div>
        <button class="ddos-btn" 
                [disabled]="gameService.botnetSize() < 10" 
                (click)="launchDDoS()">
          INITIATE DDoS (COST: {{ ddosCost() }} NODES)
        </button>
      </div>

      <div class="routing-modes">
        <button class="routing-btn" [class.active]="gameService.routingMode() === 'DIRECT'" (click)="gameService.setRouting('DIRECT')">
          <span class="btn-label">DIRECT</span>
          <span class="sub">LATENCY: LOW</span>
        </button>
        <button class="routing-btn" [class.active]="gameService.routingMode() === 'VPN'" (click)="gameService.setRouting('VPN')">
          <span class="btn-label">VPN [20cr]</span>
          <span class="sub">STEALTH: 1.5x</span>
        </button>
        <button class="routing-btn" [class.active]="gameService.routingMode() === 'ONION'" (click)="gameService.setRouting('ONION')">
          <span class="btn-label">ONION [50cr]</span>
          <span class="sub">STEALTH: 3.0x</span>
        </button>
      </div>
      <div class="active-path-wrapper">
        <div class="active-path">
            <span class="path-label">PATH:</span>
            @for (node of networkService.currentPath(); track node.id) {
            <span class="path-node">{{ node.country }}</span>
            @if (!$last) { <span class="arrow">>></span> }
            }
        </div>
      </div>
    </div>
  `,
  styles: `
    .network-container {
      background: var(--layer-1);
      color: var(--primary);
      padding: 15px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    h3 { margin-top: 0; background: var(--layer-2); padding: 10px; margin-bottom: 15px; font-size: 0.75rem; letter-spacing: 1px; font-family: 'Space Grotesk', sans-serif; font-weight: 900; }
    
    .botnet-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--layer-2);
      padding: 12px;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .botnet-stats { font-family: 'JetBrains Mono', monospace; }
    .botnet-label { color: var(--primary); opacity: 0.5; font-size: 0.6em; }
    .botnet-count { color: #fff; font-size: 1em; font-weight: bold; margin-left: 5px; }
    .ddos-btn {
      background: var(--tertiary);
      color: #fff;
      border: none;
      padding: 8px 16px;
      font-size: 0.5rem;
      font-weight: 900;
      cursor: pointer;
      font-family: 'Space Grotesk', sans-serif;
      flex-grow: 1;
    }

    .routing-modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px; }
    button.routing-btn {
      background: var(--layer-2);
      border: var(--ghost-border);
      color: var(--primary);
      padding: 12px 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      transition: all 0.05s steps(2);
      min-width: 0;
    }
    button.active {
      background: var(--layer-5);
      color: #fff;
      box-shadow: var(--neon-shadow);
    }
    .btn-label { font-size: 0.55rem; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-transform: uppercase; }
    .sub { font-size: 0.45rem; margin-top: 4px; opacity: 0.4; white-space: nowrap; }

    .active-path-wrapper { background: var(--layer-0); padding: 10px; overflow: hidden; }
    .active-path { font-size: 0.6rem; color: #fff; font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow-x: auto; display: flex; align-items: center; gap: 8px; }
    .path-label { color: var(--primary); opacity: 0.5; font-weight: bold; }
    .path-node { color: var(--secondary); }
    .arrow { color: var(--layer-4); font-size: 0.5rem; }
  `
})
export class NetworkComponent {
  networkService = inject(NetworkService);
  gameService = inject(GameService);
  audioService = inject(AudioService);

  ddosCost() {
    return Math.floor(this.gameService.botnetSize() * 0.5);
  }

  launchDDoS() {
    if (this.gameService.launchDDoS()) {
      this.audioService.playGlitch();
    } else {
      this.audioService.playError();
    }
  }

  installSupplyChain() {
    if (this.gameService.installSupplyChain()) {
      this.audioService.playSuccess();
    } else {
      this.audioService.playError();
    }
  }

  deployRansomware() {
    if (this.gameService.deployRansomware()) {
      this.audioService.playGlitch();
    } else {
      this.audioService.playError();
    }
  }

  cashOutRansomware() {
    if (this.gameService.cashOutRansomware()) {
      this.audioService.playSuccess();
    } else {
      this.audioService.playError();
    }
  }
}