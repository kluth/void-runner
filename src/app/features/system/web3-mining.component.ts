import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3MiningService } from '../../core/services/web3-mining.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-web3-mining',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mining-container terminal-frame">
      <div class="ascii-line cyan">VOID_MINE // CONSENSUS_ENGINE</div>
      
      <div class="mining-status">
        <div class="status-row">
          <span>ENGINE_STATE:</span>
          <span [class.active]="mining.isMining()">{{ mining.isMining() ? 'ENGAGED' : 'IDLE' }}</span>
        </div>
        <div class="status-row">
          <span>WEB3_VAULT:</span>
          <span [class.active]="mining.secureModeActive()">{{ mining.secureModeActive() ? 'SECURED' : 'INACTIVE' }}</span>
        </div>
        <div class="status-row">
          <span>VOID_CREDITS:</span>
          <span class="v-cred">{{ mining.voidCredits() }} VC</span>
        </div>
        <div class="status-row">
          <span>HASH_CONTRIB:</span>
          <span>{{ mining.hashesContributed() }} H/s</span>
        </div>
      </div>

      <div class="heat-warning" *ngIf="game.systemHeat() > 80">
        !! THERMAL_CRITICAL: {{ game.systemHeat() }}% !!
      </div>

      <div class="mining-actions">
        <button *ngIf="!mining.isMining()" class="primary" (click)="mining.startMining()">
          [ ENGAGE_CONSENSUS ]
        </button>
        <button *ngIf="mining.isMining()" class="magenta" (click)="mining.stopMining()">
          [ DISENGAGE_ENGINE ]
        </button>
        <button class="cyan" style="margin-top: 10px;" (click)="mining.toggleSecureMode()">
          {{ mining.secureModeActive() ? '[ DISABLE_WEB3_VAULT ]' : '[ ENABLE_WEB3_VAULT ]' }}
        </button>
      </div>

      <div class="cosmetic-shop">
        <div class="ascii-line">NEURAL_VAULT_MARKET</div>
        <div class="shop-grid">
          @for (item of mining.availableCosmetics(); track item.id) {
            <div class="cosmetic-card" [class.owned]="isUnlocked(item.id)">
              <div class="c-info">
                <span class="c-name">{{ item.name }}</span>
                <span class="c-price">{{ item.price }} VC</span>
              </div>
              <p class="c-desc">{{ item.description }}</p>
              <button class="buy-btn" 
                      [disabled]="isUnlocked(item.id) || mining.voidCredits() < item.price"
                      (click)="mining.purchaseCosmetic(item.id, item.price)">
                {{ isUnlocked(item.id) ? '[ OWNED ]' : '[ PURCHASE ]' }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .mining-container { padding: 15px; background: rgba(10, 15, 30, 0.9); height: 100%; overflow-y: auto; }
    .mining-status { margin: 15px 0; display: flex; flex-direction: column; gap: 8px; }
    .status-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
    .active { color: var(--neon-cyan); text-shadow: 0 0 10px var(--neon-cyan); }
    .v-cred { color: var(--neon-yellow); font-weight: bold; }
    
    .heat-warning { 
      color: var(--neon-magenta); font-weight: bold; text-align: center; 
      margin: 10px 0; animation: blink 0.5s infinite; font-size: 0.7rem;
    }
    .mining-actions button { width: 100%; margin-bottom: 20px; }

    .cosmetic-shop { border-top: 1px dashed rgba(0, 229, 255, 0.3); padding-top: 15px; }
    .shop-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .cosmetic-card { border: 1px solid rgba(0, 255, 159, 0.2); padding: 10px; }
    .cosmetic-card.owned { border-color: var(--neon-cyan); background: rgba(0, 229, 255, 0.05); }
    .c-info { display: flex; justify-content: space-between; font-weight: bold; font-size: 0.75rem; }
    .c-name { color: var(--primary); }
    .c-price { color: var(--neon-yellow); }
    .c-desc { font-size: 0.65rem; color: #ccc; font-style: italic; margin: 5px 0; }
    .buy-btn { width: 100%; font-size: 0.65rem; }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `
})
export class Web3MiningComponent {
  mining = inject(Web3MiningService);
  game = inject(GameService);

  isUnlocked(id: string) {
    return this.mining.unlockedCosmetics().includes(id);
  }
}
