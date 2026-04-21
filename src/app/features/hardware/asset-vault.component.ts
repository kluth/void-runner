import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-vault',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-vault terminal-frame">
      <div class="ascii-line">OFFLINE_STORAGE // ASSET_VAULT</div>
      
      <div class="main-grid">
        <div class="vault-section main-panel">
          <div class="section-header">COLLECTED_ARTIFACTS</div>
          <div class="artifact-list">
            @for (art of gameService.artifacts(); track art.id) {
              <div class="art-entry" [class.analyzed]="art.analyzed">
                <div class="art-row">> {{ art.name | uppercase }}</div>
                <div class="art-row type">TYPE: {{ art.type }}</div>
                @if (!art.analyzed) {
                  <div class="art-row progress">
                    PROG: [{{ getProgressBar(art.analysisProgress) }}] {{ art.analysisProgress }}%
                  </div>
                } @else {
                  <div class="art-row status-ready">STATUS: DECRYPTED // {{ art.rewardType | uppercase }}</div>
                }
                <div class="art-sep"></div>
              </div>
            }
            @if (gameService.artifacts().length === 0) {
              <div class="empty-msg">NO_ARTIFACTS_DETECTED</div>
            }
          </div>
          <div class="action-row">
            <button class="terminal-btn sync-btn" (click)="gameService.craftArtifacts()">
              [ SYNC_ARTIFACTS ]
            </button>
          </div>
        </div>

        <div class="vault-section side-panel">
          <div class="section-header">DATA_SHARDS</div>
          <div class="shard-data">
            <div class="data-line">
              <span class="label">ZERO_DAYS:</span>
              <span class="value">{{ gameService.zeroDays() | number:'3.0' }}</span>
            </div>
            <div class="data-line">
              <span class="label">PUBLIC_EXPLOITS:</span>
              <span class="value">{{ gameService.publicExploits().length | number:'3.0' }}</span>
            </div>
            <div class="data-line">
              <span class="label">BOTNET_NODES:</span>
              <span class="value">{{ gameService.botnetSize() | number:'3.0' }}</span>
            </div>
          </div>
          
          <div class="section-header actions-header">ACTIONS</div>
          <div class="vault-actions">
            <button (click)="gameService.sellZeroDay()" class="terminal-btn action-item">> SELL_0-DAY (+CR)</button>
            <button (click)="gameService.discloseZeroDay()" class="terminal-btn action-item">> DISCLOSE_0-DAY (+REP)</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      padding: 1rem;
    }

    .terminal-vault {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .main-grid {
      display: flex;
      gap: 2rem;
    }

    .vault-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .main-panel { flex: 2; }
    .side-panel { flex: 1; border-left: 1px solid rgba(0, 255, 0, 0.1); padding-left: 1.5rem; }

    .section-header {
      font-weight: bold;
      font-size: 0.8rem;
      opacity: 0.7;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid rgba(0, 255, 0, 0.2);
      padding-bottom: 0.2rem;
    }

    .artifact-list {
      max-height: 450px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    .artifact-list::-webkit-scrollbar { width: 4px; }
    .artifact-list::-webkit-scrollbar-thumb { background: var(--primary); }

    .art-entry {
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-left: 2px solid transparent;
      transition: all 0.2s ease;
    }
    .art-entry:hover {
      background: rgba(0, 255, 0, 0.05);
      border-left-color: var(--primary);
    }
    .art-entry.analyzed { color: var(--secondary, #00ffff); }

    .art-row { font-size: 0.9rem; line-height: 1.4; }
    .art-row.type { font-size: 0.75rem; opacity: 0.6; }
    .art-row.progress { font-size: 0.8rem; font-family: monospace; color: var(--primary); }

    .status-ready {
      font-weight: bold;
      text-shadow: 0 0 5px var(--secondary, #00ffff);
      color: var(--secondary, #00ffff);
    }

    .terminal-btn {
      background: transparent;
      border: 1px solid var(--primary);
      color: inherit;
      font-family: inherit;
      font-size: 0.9rem;
      text-align: center;
      cursor: pointer;
      padding: 0.5rem;
      transition: all 0.2s ease;
    }

    .terminal-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .sync-btn { width: 100%; margin-top: 1rem; }

    .shard-data { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.5rem; }
    .data-line { display: flex; justify-content: space-between; font-size: 0.85rem; }
    .data-line .label { opacity: 0.7; }
    .data-line .value { font-weight: bold; }

    .actions-header { margin-top: 1rem; }
    .vault-actions { display: flex; flex-direction: column; gap: 0.5rem; }
    .action-item { text-align: left; border: none; padding: 0.3rem 0; opacity: 0.8; }
    .action-item:hover { background: transparent; color: var(--primary); text-decoration: underline; opacity: 1; }

    .empty-msg { opacity: 0.4; text-align: center; padding: 2rem; font-style: italic; }

    @media (max-width: 700px) {
      .main-grid { flex-direction: column; }
      .side-panel { border-left: none; border-top: 1px solid rgba(0, 255, 0, 0.1); padding-left: 0; padding-top: 1.5rem; }
    }
  `
})
export class AssetVaultComponent {
  gameService = inject(GameService);

  getProgressBar(progress: number): string {
    const total = 15;
    const filled = Math.floor((progress / 100) * total);
    return '█'.repeat(filled) + '░'.repeat(total - filled);
  }
}
