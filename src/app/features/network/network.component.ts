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
    <div class="network-monolith">
      <div class="botnet-card hud-panel-nested">
        <div class="sec-label">BOTNET_RESOURCES</div>
        <div class="botnet-stats">
           <span class="b-val">{{ gameService.botnetSize() }}</span>
           <span class="b-unit">NODES_CONTROLLED</span>
        </div>
        <div class="botnet-actions">
           <button class="ddos-btn" (click)="launchDDoS()">LAUNCH_DDOS</button>
           <button (click)="deployRansomware()">DEPLOY_RANSOM</button>
        </div>
      </div>

      <div class="routing-card hud-panel-nested">
         <div class="sec-label">ROUTING_PROTOCOLS</div>
         <div class="routing-grid">
            <button [class.active]="gameService.routingMode() === 'DIRECT'" (click)="gameService.setRouting('DIRECT')">
               DIRECT [0cr]
            </button>
            <button [class.active]="gameService.routingMode() === 'VPN'" (click)="gameService.setRouting('VPN')">
               VPN [20cr]
            </button>
            <button [class.active]="gameService.routingMode() === 'ONION'" (click)="gameService.setRouting('ONION')">
               ONION [50cr]
            </button>
         </div>
      </div>

      <div class="path-readout">
         <div class="noise-line">ACTIVE_TRACE_PATH:</div>
         <div class="path-nodes">
            @for (node of networkService.currentPath(); track $index) {
               <span class="p-node">{{ node }}</span>
               @if (!$last) { <span class="arrow">>></span> }
            }
         </div>
      </div>
    </div>
  `,
  styles: `
    .network-monolith {
      background: var(--layer-1);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .sec-label { font-size: 0.5rem; opacity: 0.4; font-weight: 900; letter-spacing: 2px; margin-bottom: 10px; }

    .botnet-card, .routing-card {
       padding: 1.5rem;
    }

    .botnet-stats { display: flex; align-items: baseline; gap: 10px; margin-bottom: 1.5rem; }
    .b-val { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; font-weight: 900; color: #fff; }
    .b-unit { font-size: 0.6rem; opacity: 0.4; font-weight: 900; }

    .botnet-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ddos-btn { background: var(--tertiary); color: #fff; border: none; }

    .routing-grid { display: flex; flex-direction: column; gap: 8px; }
    .routing-grid button { 
       text-align: left; 
       font-size: 0.65rem; 
       background: var(--layer-2); 
    }
    .routing-grid button.active { background: var(--primary); color: #000; border: none; }

    .path-readout {
       background: var(--layer-0);
       padding: 1rem;
       font-family: 'JetBrains Mono', monospace;
    }
    .noise-line { font-size: 0.5rem; opacity: 0.2; margin-bottom: 5px; }
    .path-nodes { font-size: 0.6rem; color: var(--secondary); display: flex; flex-wrap: wrap; gap: 8px; }
    .arrow { opacity: 0.2; }
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
