import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-vault',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vault-container hud-panel">
      <div class="sec-header">OFFLINE_STORAGE // ASSET_VAULT</div>
      
      <div class="vault-grid">
        <div class="v-section">
          <div class="v-title">COLLECTED_ARTIFACTS</div>
          <div class="art-list">
            @for (art of gameService.artifacts(); track art.id) {
              <div class="art-item" [class.analyzed]="art.analyzed">
                <div class="a-name">{{ art.name }}</div>
                <div class="a-type">{{ art.type }}</div>
                @if (!art.analyzed) {
                  <div class="a-prog">
                    <div class="bar-bg"><div class="bar-fg" [style.width.%]="art.analysisProgress"></div></div>
                  </div>
                } @else {
                  <div class="a-ready">DECRYPTED // {{ art.rewardType.toUpperCase() }}</div>
                }
              </div>
            }
          </div>
          <button class="craft-btn" (click)="gameService.craftArtifacts()">SYNC_ARTIFACTS (3) -> 0-DAY</button>
        </div>
        
        <div class="v-section">
          <div class="v-title">DATA_SHARDS</div>
          <div class="shard-stats">
            <div class="s-card">
              <span class="l">ZERO_DAYS</span>
              <span class="v">{{ gameService.zeroDays() }}</span>
            </div>
            <div class="s-card">
              <span class="l">PUBLIC_EXPLOITS</span>
              <span class="v">{{ gameService.publicExploits().length }}</span>
            </div>
            <div class="s-card">
              <span class="l">BOTNET_NODES</span>
              <span class="v">{{ gameService.botnetSize() }}</span>
            </div>
          </div>
          
          <div class="vault-actions">
            <button (click)="gameService.sellZeroDay()">SELL_0-DAY (+CR)</button>
            <button (click)="gameService.discloseZeroDay()">DISCLOSE_0-DAY (+REP)</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .vault-container {
      padding: 1.5rem;
      background: var(--layer-1);
    }
    .sec-header {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--primary);
      background: var(--layer-2);
      padding: 0.75rem;
      margin-bottom: 2rem;
      text-transform: uppercase;
    }
    .vault-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 800px) { .vault-grid { grid-template-columns: 1fr; } }
    
    .v-section { display: flex; flex-direction: column; gap: 1rem; }
    .v-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.65rem; font-weight: 900; color: var(--primary); opacity: 0.4; letter-spacing: 2px; border-bottom: var(--ghost-border); padding-bottom: 0.5rem; }
    
    .art-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto; }
    .art-item { background: var(--layer-2); padding: 1.25rem; transition: all 0.05s steps(2); }
    .art-item.analyzed { border-left: 2px solid var(--secondary); background: var(--layer-3); }
    .a-name { font-size: 0.75rem; font-weight: 900; color: #fff; }
    .a-type { font-size: 0.55rem; color: var(--primary); opacity: 0.4; margin-bottom: 0.75rem; font-family: 'JetBrains Mono', monospace; font-weight: 900; }
    .bar-bg { width: 100%; height: 2px; background: var(--layer-0); }
    .bar-fg { height: 100%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }
    .a-ready { font-size: 0.6rem; color: var(--secondary); font-weight: 900; margin-top: 0.5rem; font-family: 'JetBrains Mono', monospace; }
    
    .shard-stats { display: grid; grid-template-columns: 1fr; gap: 0.5rem; }
    .s-card { background: var(--layer-2); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
    .s-card .l { font-size: 0.6rem; font-weight: 900; color: var(--primary); opacity: 0.5; }
    .s-card .v { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 900; color: var(--secondary); }
    
    .vault-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 1rem; }
    .vault-actions button { 
      background: var(--layer-4); border: var(--ghost-border); color: var(--primary); 
      padding: 1rem; font-size: 0.65rem; font-weight: 900; cursor: pointer;
      font-family: 'Space Grotesk', sans-serif; transition: all 0.05s steps(2);
    }
    .vault-actions button:hover { background: var(--primary); color: var(--on-primary); }
    
    .craft-btn {
      background: var(--tertiary); color: #fff; border: none; padding: 1.25rem; font-size: 0.65rem; font-weight: 900; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.05s steps(2);
    }
    .craft-btn:hover { box-shadow: 0 0 20px var(--tertiary); }
  `
})
export class AssetVaultComponent {
  gameService = inject(GameService);
}
