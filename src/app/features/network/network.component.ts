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
      background: #050505;
      border: 1px solid #00ffff;
      color: #00ffff;
      padding: 15px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    h3 { margin-top: 0; border-bottom: 1px solid #00ffff; padding-bottom: 10px; margin-bottom: 15px; font-size: 0.75rem; letter-spacing: 1px;}
    
    .botnet-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #001111;
      border: 1px solid #008888;
      padding: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .botnet-stats { font-family: monospace; }
    .botnet-label { color: #00ffff; font-size: 0.6em; }
    .botnet-count { color: #fff; font-size: 1em; font-weight: bold; margin-left: 5px; text-shadow: 0 0 5px #00ffff;}
    .ddos-btn {
      background: #ff0000;
      color: #fff;
      border: 1px solid #ff4444;
      padding: 6px 12px;
      font-size: 0.5rem;
      font-weight: bold;
      cursor: pointer;
      font-family: inherit;
      flex-grow: 1;
    }

    .routing-modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 15px; }
    button.routing-btn {
      background: #000;
      border: 1px solid #004444;
      color: #00ffff;
      padding: 8px 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      transition: all 0.2s;
      min-width: 0;
    }
    button.active {
      background: #00ffff;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 10px rgba(0,255,255,0.3);
    }
    .btn-label { font-size: 0.55rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
    .sub { font-size: 0.45rem; margin-top: 4px; opacity: 0.7; white-space: nowrap; }

    .active-path-wrapper { border-top: 1px dashed #004444; padding-top: 10px; overflow: hidden; }
    .active-path { font-size: 0.6rem; color: #fff; font-family: monospace; white-space: nowrap; overflow-x: auto; display: flex; align-items: center; gap: 5px; }
    .path-label { color: #008888; font-weight: bold; margin-right: 5px; }
    .path-node { color: #00ff00; }
    .arrow { color: #444; font-size: 0.5rem; }

    @media (max-width: 400px) {
        .sub { display: none; }
        .routing-modes { gap: 2px; }
        button.routing-btn { padding: 12px 2px; }
    }
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