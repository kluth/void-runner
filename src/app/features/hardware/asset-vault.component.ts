import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-vault',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-vault">
      <div class="ascii-border">┌────────────────────────────────────────────────────────────────────────────┐</div>
      <div class="ascii-line">│ <span class="blink">>></span> OFFLINE_STORAGE // ASSET_VAULT                                        │</div>
      <div class="ascii-border">├──────────────────────────────────────┬─────────────────────────────────────┤</div>
      <div class="main-grid">
        <div class="vault-section">
          <div class="section-header">│ [ COLLECTED_ARTIFACTS ]              │</div>
          <div class="artifact-list">
            @for (art of gameService.artifacts(); track art.id) {
              <div class="art-entry" [class.analyzed]="art.analyzed">
                <div class="art-row">│ > {{ art.name | uppercase }}</div>
                <div class="art-row">│   TYPE: {{ art.type }}</div>
                @if (!art.analyzed) {
                  <div class="art-row">│   PROG: [{{ getProgressBar(art.analysisProgress) }}] {{ art.analysisProgress }}%</div>
                } @else {
                  <div class="art-row status-ready">│   STATUS: DECRYPTED // {{ art.rewardType | uppercase }}</div>
                }
                <div class="art-sep">│                                      │</div>
              </div>
            }
            @if (gameService.artifacts().length === 0) {
              <div class="art-row empty">│   NO_ARTIFACTS_DETECTED              │</div>
            }
          </div>
          <div class="action-row">
            <button class="terminal-btn" (click)="gameService.craftArtifacts()">
              │ [ SYNC_ARTIFACTS ]                   │
            </button>
          </div>
        </div>

        <div class="vault-section side-panel">
          <div class="section-header"> [ DATA_SHARDS ]                    │</div>
          <div class="shard-data">
            <div class="data-line">│ ZERO_DAYS:       {{ gameService.zeroDays() | number:'3.0' }}            │</div>
            <div class="data-line">│ PUBLIC_EXPLOITS: {{ gameService.publicExploits().length | number:'3.0' }}            │</div>
            <div class="data-line">│ BOTNET_NODES:    {{ gameService.botnetSize() | number:'3.0' }}            │</div>
          </div>
          <div class="ascii-border">├─────────────────────────────────────┤</div>
          <div class="section-header">│ [ ACTIONS ]                          │</div>
          <div class="vault-actions">
            <button (click)="gameService.sellZeroDay()" class="terminal-btn">│ > SELL_0-DAY (+CR)                 │</button>
            <button (click)="gameService.discloseZeroDay()" class="terminal-btn">│ > DISCLOSE_0-DAY (+REP)            │</button>
          </div>
        </div>
      </div>
      <div class="ascii-border">└──────────────────────────────────────┴─────────────────────────────────────┘</div>
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
      display: inline-block;
      white-space: pre;
    }

    .ascii-border, .ascii-line, .section-header, .art-row, .art-sep, .data-line {
      line-height: 1.2;
    }

    .main-grid {
      display: flex;
    }

    .vault-section {
      display: flex;
      flex-direction: column;
    }

    .artifact-list {
      max-height: 400px;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .artifact-list::-webkit-scrollbar { display: none; }

    .art-entry.analyzed {
      color: var(--secondary);
    }

    .status-ready {
      font-weight: bold;
      text-shadow: 0 0 5px var(--secondary);
    }

    .terminal-btn {
      background: transparent;
      border: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      text-align: left;
      cursor: pointer;
      padding: 0;
      width: 100%;
    }

    .terminal-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .side-panel .terminal-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .blink {
      animation: blink 1s steps(2) infinite;
    }

    @keyframes blink {
      to { visibility: hidden; }
    }

    .status-ready {
      color: var(--secondary);
    }

    .empty {
      opacity: 0.5;
    }
  `
})
export class AssetVaultComponent {
  gameService = inject(GameService);

  getProgressBar(progress: number): string {
    const total = 20;
    const filled = Math.floor((progress / 100) * total);
    return '='.repeat(filled) + ' '.repeat(total - filled);
  }
}
