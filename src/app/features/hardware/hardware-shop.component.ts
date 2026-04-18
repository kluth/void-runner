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
      padding: 1rem;
    }
    .shop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #222;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    .shop-header .title { font-size: 0.8rem; color: #00ff00; letter-spacing: 2px; }
    .shop-header .status { font-size: 0.6rem; color: #004400; }

    .zero-day-market {
      background: #050505;
      border: 1px dashed #ff00ff;
      padding: 1rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .zd-info { flex: 1; min-width: 15rem; }
    .zd-info h4 { margin: 0 0 0.25rem 0; color: #ff00ff; font-size: 0.8rem; text-shadow: 0 0 5px #ff00ff; }
    .zd-info p { margin: 0; color: #888; font-size: 0.6rem; max-width: 100%; }
    
    .zd-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; justify-content: flex-end; flex: 1; min-width: 15rem; }
    .zd-choice { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .zd-stat { font-size: 0.7rem; color: #fff; }
    .highlight { color: #ff00ff; font-weight: bold; }

    @media (max-width: 600px) {
      .zero-day-market { flex-direction: column; align-items: stretch; }
      .zd-actions { justify-content: flex-start; align-items: stretch; min-width: 0; }
      .zd-choice { width: 100%; }
      .zd-choice .zd-btn { flex: 1; min-width: 0; }
      .zd-btn.research { width: 100%; }
    }

    .hardware-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: 1rem;
    }

    .hw-card {
      background: #000;
      border: 1px solid #222;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      min-height: 12rem;
    }

    .hw-card.affordable { border-color: #008800; }
    .hw-card:hover:not(.locked) { border-color: #00ff00; transform: translateY(-2px); box-shadow: 0 0 15px rgba(0, 255, 0, 0.1); }
    .hw-card.locked { border-color: #300; opacity: 0.8; }

    .hw-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .hw-name { font-size: 0.7rem; font-weight: bold; color: #fff; line-height: 1.2; }
    .hw-type { font-size: 0.5rem; color: #00ff00; background: #002200; padding: 0.1rem 0.25rem; border: 1px solid #004400; white-space: nowrap; }

    .hw-desc { font-size: 0.6rem; color: #666; margin-bottom: 0.75rem; flex-grow: 1; min-height: 2.5rem; }
    .hw-desc.locked { color: #400; font-style: italic; }

    .hw-stat { font-size: 0.6rem; color: #00ff00; margin-bottom: 0.5rem; font-family: monospace; }
    .hw-price, .research-cost { font-size: 0.8rem; font-weight: 900; margin-bottom: 0.75rem; }
    .hw-price { color: #fff; }
    .research-cost { color: #ff00ff; }

    .zd-btn, .buy-btn, .research-btn {
      border: none;
      padding: 0.5rem;
      font-family: inherit;
      font-size: 0.6rem;
      font-weight: bold;
      cursor: pointer;
      text-transform: uppercase;
      transition: all 0.2s;
    }

    .zd-btn.research { background: #ff00ff; color: #fff; }
    .zd-btn.sell { background: #003333; color: #00ffff; border: 1px solid #00ffff; }
    .zd-btn.disclose { background: #333; color: #fff; }
    .zd-btn:disabled { opacity: 0.3; cursor: not-allowed; }

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
