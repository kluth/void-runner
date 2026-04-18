import { Component, inject } from '@angular/core';
import { GameService, HardwareItem } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-hardware-shop',
  standalone: true,
  template: `
    <div class="shop-container">
      <div class="shop-header">
        <span class="title">BLACK_MARKET // MODULES</span>
        <span class="status">TRADING_OPEN</span>
      </div>

      <div class="zero-day-market">
        <div class="zd-info">
          <h4>VULNERABILITY RESEARCH BROKER</h4>
          <p>Expend research data to discover unpatched 0-Day vulnerabilities. Highly illegal, highly profitable.</p>
        </div>
        <div class="zd-actions">
          <div class="zd-stat">OWNED: <span class="highlight">{{ gameService.zeroDays() }}</span></div>
          <button class="zd-btn research" 
                  [disabled]="gameService.experience() < 250"
                  (click)="researchZeroDay()">
            RESEARCH 0-DAY [250 DATA]
          </button>
          <div class="zd-choice">
            <button class="zd-btn sell" 
                    [disabled]="gameService.zeroDays() < 1"
                    (click)="sellZeroDay()">
              SELL ON DARKNET
            </button>
            <button class="zd-btn disclose" 
                    [disabled]="gameService.zeroDays() < 1"
                    (click)="discloseZeroDay()">
              BUG BOUNTY DISCLOSURE
            </button>
          </div>
        </div>
      </div>

      <div class="hardware-grid">
        @for (item of gameService.availableHardware(); track item.id) {
          <div class="hw-card" 
               [class.locked]="!item.unlocked" 
               [class.affordable]="item.unlocked && gameService.credits() >= item.price"
               (mouseenter)="audioService.playClick()">
            
            <div class="card-glow"></div>
            
            <div class="hw-top">
              <span class="hw-name">{{ item.name }}</span>
              <span class="hw-type">{{ item.bonusType.toUpperCase() }}</span>
            </div>

            @if (item.unlocked) {
              <div class="hw-desc">{{ item.description }}</div>
              <div class="hw-stat">+{{ item.bonusValue }} {{ item.bonusType.toUpperCase() }} power</div>
              <div class="hw-price">{{ item.price }}cr</div>
              <button class="buy-btn" 
                      (click)="buy(item)" 
                      [disabled]="gameService.credits() < item.price">
                INIT_PURCHASE
              </button>
            } @else {
              <div class="hw-desc locked">SCHEMA_ENCRYPTED</div>
              <div class="research-cost">DATA_REQD: {{ getResearchCost(item) }}</div>
              <button class="research-btn" 
                      (click)="unlock(item)" 
                      [disabled]="gameService.experience() < getResearchCost(item)">
                DECRYPT_SCHEMA
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .shop-container {
      background: rgba(10, 10, 10, 0.9);
      border: 1px solid #1a1a1a;
      padding: 15px;
    }
    .shop-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #222;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .shop-header .title { font-size: 0.8em; color: #00ff00; letter-spacing: 2px; }
    .shop-header .status { font-size: 0.6em; color: #004400; }

    .zero-day-market {
      background: #050505;
      border: 1px dashed #ff00ff;
      padding: 10px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .zd-info h4 { margin: 0 0 5px 0; color: #ff00ff; font-size: 0.8em; text-shadow: 0 0 5px #ff00ff; }
    .zd-info p { margin: 0; color: #888; font-size: 0.6em; max-width: 300px; }
    
    .zd-actions { display: flex; align-items: center; gap: 10px; }
    .zd-stat { font-size: 0.8em; color: #fff; font-weight: bold; }
    .zd-stat .highlight { color: #ff00ff; font-size: 1.2em; }

    .zd-btn { border: 1px solid #ff00ff; background: #110011; color: #ff00ff; padding: 6px 10px; font-size: 0.6em; cursor: pointer; font-family: inherit; font-weight: bold; }
    .zd-btn:hover:not(:disabled) { background: #ff00ff; color: #000; box-shadow: 0 0 10px #ff00ff; }
    .zd-btn:disabled { border-color: #303; color: #404; background: #000; cursor: not-allowed; }
    
    .zd-btn.sell { border-color: #00ff00; color: #00ff00; background: #001100; }
    .zd-btn.sell:hover:not(:disabled) { background: #00ff00; color: #000; box-shadow: 0 0 10px #00ff00; }
    .zd-btn.sell:disabled { border-color: #003300; color: #004400; }

    .hardware-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }

    .hw-card {
      background: #000;
      border: 1px solid #222;
      padding: 12px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
    }

    .hw-card.affordable { border-color: #008800; }
    .hw-card:hover:not(.locked) { border-color: #00ff00; transform: translateY(-2px); box-shadow: 0 0 15px rgba(0, 255, 0, 0.1); }
    .hw-card.locked { border-color: #300; opacity: 0.8; }

    .hw-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .hw-name { font-size: 0.75em; font-weight: bold; color: #fff; line-height: 1.2; }
    .hw-type { font-size: 0.55em; color: #00ff00; background: #002200; padding: 2px 4px; border: 1px solid #004400; }

    .hw-desc { font-size: 0.65em; color: #666; margin-bottom: 10px; flex-grow: 1; min-height: 35px; }
    .hw-desc.locked { color: #400; font-style: italic; }

    .hw-stat { font-size: 0.6em; color: #00ff00; margin-bottom: 8px; font-family: monospace; }
    .hw-price, .research-cost { font-size: 0.9em; font-weight: 900; margin-bottom: 10px; }
    .hw-price { color: #fff; }
    .research-cost { color: #ff00ff; }

    button {
      border: none;
      padding: 8px;
      font-family: inherit;
      font-size: 0.7em;
      font-weight: bold;
      cursor: pointer;
      text-transform: uppercase;
    }

    .buy-btn { background: #00ff00; color: #000; }
    .buy-btn:disabled { background: #111; color: #333; cursor: not-allowed; }
    .research-btn { background: #ff00ff; color: #000; }
    .research-btn:disabled { background: #111; color: #303; cursor: not-allowed; }
  `
})
export class HardwareShopComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  getResearchCost(item: HardwareItem): number {
    return item.price * 2;
  }

  buy(item: HardwareItem) {
    if (this.gameService.credits() >= item.price) {
      this.gameService.buyHardware(item);
      this.audioService.playSuccess();
    } else {
      this.audioService.playError();
    }
  }

  unlock(item: HardwareItem) {
    const cost = this.getResearchCost(item);
    if (this.gameService.unlockHardware(item.id, cost)) {
      this.audioService.playSuccess();
    } else {
      this.audioService.playError();
    }
  }

  researchZeroDay() {
    if (this.gameService.experience() >= 250) {
      if (this.gameService.researchZeroDay()) {
        this.audioService.playSuccess();
      } else {
        this.audioService.playError();
      }
    }
  }

  sellZeroDay() {
    if (this.gameService.zeroDays() > 0) {
      this.gameService.sellZeroDay();
      this.audioService.playSuccess();
    }
  }

  discloseZeroDay() {
    if (this.gameService.zeroDays() > 0) {
      this.gameService.discloseZeroDay();
      this.audioService.playSuccess();
    }
  }
}
