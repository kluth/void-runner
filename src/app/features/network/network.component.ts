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
          DIRECT
          <span class="sub">Latency: LOW | Stealth: NONE</span>
        </button>
        <button class="routing-btn" [class.active]="gameService.routingMode() === 'VPN'" (click)="gameService.setRouting('VPN')">
          VPN [20cr]
          <span class="sub">Latency: MED | Stealth: 1.5x</span>
        </button>
        <button class="routing-btn" [class.active]="gameService.routingMode() === 'ONION'" (click)="gameService.setRouting('ONION')">
          ONION [50cr]
          <span class="sub">Latency: HIGH | Stealth: 3.0x</span>
        </button>
      </div>
      <div class="active-path">
        PATH: 
        @for (node of networkService.currentPath(); track node.id) {
          <span class="path-node">{{ node.country }} ({{ node.name }})</span>
          @if (!$last) { <span class="arrow">>></span> }
        }
      </div>
    </div>
  `,
  styles: `
    .network-container {
      background: #111;
      border: 1px solid #00ffff;
      color: #00ffff;
      padding: 15px;
    }
    h3 { margin-top: 0; border-bottom: 1px solid #00ffff; padding-bottom: 10px; margin-bottom: 15px;}
    
    .botnet-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #001111;
      border: 1px solid #008888;
      padding: 10px;
      margin-bottom: 15px;
    }
    .botnet-stats { font-family: monospace; }
    .botnet-label { color: #00ffff; font-size: 0.8em; }
    .botnet-count { color: #fff; font-size: 1.2em; font-weight: bold; margin-left: 10px; text-shadow: 0 0 5px #00ffff;}
    .ddos-btn {
      background: #ff0000;
      color: #fff;
      border: 1px solid #ff4444;
      padding: 6px 12px;
      font-size: 0.6em;
      font-weight: bold;
      cursor: pointer;
      font-family: inherit;
    }
    .ddos-btn:hover:not(:disabled) { background: #ff4444; box-shadow: 0 0 10px #ff0000; }
    .ddos-btn:disabled { background: #300; border-color: #400; color: #666; cursor: not-allowed; }

    .advanced-c2-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
    .apt-section, .ransomware-section { background: #050505; border: 1px dashed #ff00ff; padding: 10px; }
    .apt-section h4, .ransomware-section h4 { margin: 0 0 10px 0; font-size: 0.7em; color: #ff00ff; }
    
    .apt-btn { width: 100%; background: #202; color: #f0f; border: 1px solid #f0f; padding: 8px; font-size: 0.6em; font-family: inherit; font-weight: bold; cursor: pointer; }
    .apt-btn:hover:not(:disabled) { background: #f0f; color: #000; }
    .apt-btn:disabled { background: #101; border-color: #303; color: #404; cursor: not-allowed; }

    .ransom-stats { font-size: 0.7em; margin-bottom: 10px; color: #888; }
    .ransom-stats .highlight { color: #ff0000; font-weight: bold; font-size: 1.2em; }
    .ransom-actions { display: flex; gap: 5px; }
    .ransom-btn { flex: 1; padding: 8px; font-size: 0.55em; font-weight: bold; font-family: inherit; cursor: pointer; border: 1px solid #ff0000; }
    .ransom-btn.deploy { background: #200; color: #f00; }
    .ransom-btn.deploy:hover:not(:disabled) { background: #f00; color: #fff; }
    .ransom-btn.cashout { background: #020; color: #0f0; border-color: #0f0; }
    .ransom-btn.cashout:hover:not(:disabled) { background: #0f0; color: #000; }
    .ransom-btn:disabled { background: #111; border-color: #333; color: #444; cursor: not-allowed; }

    .routing-modes { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }
    button.routing-btn {
      background: #000;
      border: 1px solid #008888;
      color: #00ffff;
      padding: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: inherit;
    }
    button.active {
      background: #00ffff;
      color: #000;
      border-color: #fff;
    }
    .sub { font-size: 0.6em; margin-top: 5px; opacity: 0.8; }
    .active-path { font-size: 0.7em; color: #fff; font-family: monospace; white-space: nowrap; overflow-x: auto; padding-top: 10px; border-top: 1px dashed #333; }
    .path-node { color: #00ff00; }
    .arrow { margin: 0 5px; color: #666; }
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