import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { WindowComponent } from './window.component';
import { TerminalComponent } from '../terminal/terminal.component';
import { NetworkComponent } from '../network/network.component';
import { HardwareShopComponent } from '../hardware/hardware-shop.component';
import { DarknetNodeComponent } from '../social/darknet-node.component';
import { Web3MiningComponent } from './web3-mining.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, WindowComponent, TerminalComponent, NetworkComponent, HardwareShopComponent, DarknetNodeComponent, Web3MiningComponent],
  template: `
    <div class="workspace-container">
      @for (win of gameService.windows(); track win.id) {
        <app-window [win]="win">
          @switch (win.id) {
            @case ('TERMINAL') {
              @defer (on viewport) { <app-terminal /> } @placeholder { <div class="loading-app">INITIALIZING_TERMINAL...</div> }
            }
            @case ('GRID') {
              @defer (on viewport) { <app-network /> } @placeholder { <div class="loading-app">CONNECTING_TO_GRID...</div> }
            }
            @case ('HARDWARE') {
              @defer (on viewport) { <app-hardware-shop /> } @placeholder { <div class="loading-app">SCANNING_HARDWARE...</div> }
            }
            @case ('SOCIAL') {
              @defer (on viewport) { <app-darknet-node /> } @placeholder { <div class="loading-app">ACCESSING_DARKNET...</div> }
            }
            @case ('MINING') {
              @defer (on viewport) { <app-web3-mining /> } @placeholder { <div class="loading-app">BOOTING_CONSENSUS...</div> }
            }
          }
        </app-window>
      }

      <div class="app-launcher">
        <button (click)="gameService.openWindow('TERMINAL', 'TERMINAL_CORE')">[T]</button>
        <button (click)="gameService.openWindow('GRID', 'GRID_UPLINK')">[G]</button>
        <button (click)="gameService.openWindow('HARDWARE', 'HARDWARE_MGR')">[H]</button>
        <button (click)="gameService.openWindow('SOCIAL', 'DARKNET_NODE')">[S]</button>
        <button (click)="gameService.openWindow('MINING', 'VOID_MINE')">[M]</button>
      </div>
    </div>
  `,
  styles: `
    .workspace-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(0, 255, 159, 0.02) 1px, transparent 1px);
      background-size: 30px 30px;
      overflow: hidden;
    }
    .app-launcher {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border: 1px solid var(--primary);
      z-index: 10000;
    }
  `
})
export class WorkspaceComponent {
  gameService = inject(GameService);
}
