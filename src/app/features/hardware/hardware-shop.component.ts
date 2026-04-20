import { Component, inject, signal } from '@angular/core';
import { GameService, HardwareItem } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hardware-shop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shop-container">
      <div class="shop-header">
        <span class="title">NEURAL_RIG // MODULAR_INTERFACE</span>
        <div class="power-telemetry">
          <span class="label">NEURAL_LOAD:</span>
          <div class="power-bar">
            <div class="power-fill" 
                 [style.width.%]="(gameService.currentPowerUsage() / gameService.totalPowerCapacity()) * 100"
                 [class.warning]="(gameService.currentPowerUsage() / gameService.totalPowerCapacity()) > 0.8">
            </div>
          </div>
          <span class="value">{{ gameService.currentPowerUsage() }}/{{ gameService.totalPowerCapacity() }} NW</span>
        </div>
      </div>

      <!-- VISUAL RIG BLUEPRINT -->
      <div class="rig-blueprint" [class.power-surge-glitch]="(gameService.currentPowerUsage() / gameService.totalPowerCapacity()) > 0.85">
        <div class="blueprint-bg"></div>
        <div class="slots-container">
          @for (slot of gameService.mountedHardware(); track $index) {
            <div class="rig-slot" 
                 [class.occupied]="slot !== null"
                 (click)="handleSlotClick($index)"
                 [attr.data-slot]="$index">
              <div class="slot-label">SLOT_0{{ $index + 1 }}</div>
              @if (slot) {
                <div class="mounted-item" [class]="slot.bonusType">
                  <div class="item-name">{{ slot.name }}</div>
                  <div class="item-power">-{{ slot.powerDraw }}NW</div>
                </div>
              } @else {
                <div class="empty-prompt">EMPTY_LINK</div>
              }
            </div>
          }
        </div>
      </div>

      <div class="interface-split">
        <!-- BLACK MARKET DRAWER -->
        <div class="market-sector">
          <div class="sec-header">AVAIL_MODULES</div>
          <div class="hardware-grid">
            @for (item of gameService.availableHardware(); track item.id) {
              <div class="hw-mini-card" 
                   [class.locked]="!item.unlocked"
                   [class.owned]="isOwned(item)"
                   (click)="handleMarketAction(item)">
                <div class="mini-top">
                  <span class="name">{{ item.name }}</span>
                  <span class="cost">{{ item.unlocked ? item.price + 'cr' : 'LOCKED' }}</span>
                </div>
                <div class="mini-stats">
                  <span>{{ item.bonusValue }} {{ item.bonusType.substring(0,3).toUpperCase() }}</span>
                  <span>{{ item.powerDraw }}NW</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- LOCAL INVENTORY -->
        <div class="inventory-sector">
          <div class="sec-header">LOCAL_STORAGE</div>
          <div class="inventory-list">
            @for (item of gameService.inventory(); track $index) {
              <div class="inv-item" 
                   [class.active]="selectedInventoryItem === item"
                   (click)="selectedInventoryItem = item">
                <span class="name">{{ item.name }}</span>
                <span class="type">{{ item.bonusType.toUpperCase() }}</span>
              </div>
            } @empty {
              <div class="empty-msg">NO_UNLINKED_MODULES</div>
            }
          </div>
          @if (selectedInventoryItem) {
            <div class="item-detail-popup">
               <div class="popup-title">{{ selectedInventoryItem.name }}</div>
               <div class="popup-desc">{{ selectedInventoryItem.description }}</div>
               <div class="popup-actions">
                  <button (click)="selectedInventoryItem = null">CANCEL</button>
                  <div class="slot-selector">
                     @for (s of [0,1,2,3,4,5]; track s) {
                       <button class="slot-btn" (click)="mountToSlot(s)">MOUNT_0{{ s+1 }}</button>
                     }
                  </div>
               </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .shop-container { 
      background: var(--surface-lowest); 
      border: var(--ghost-border); 
      padding: 24px; 
      color: var(--primary); 
      font-family: 'JetBrains Mono', monospace; 
      box-shadow: var(--neon-shadow);
    }
    .shop-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2rem; 
      background: var(--surface-low);
      padding: 12px 20px;
      border: var(--ghost-border);
    }
    .title { font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 900; letter-spacing: 4px; }

    .power-telemetry { display: flex; align-items: center; gap: 15px; font-size: 0.65rem; font-weight: 700; }
    .power-bar { width: 120px; height: 8px; background: var(--surface-high); border: 0.5px solid rgba(0,255,0,0.2); border-radius: 0px; }
    .power-fill { height: 100%; background: var(--primary); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .power-fill.warning { background: var(--tertiary); box-shadow: 0 0 15px var(--tertiary); }

    /* RIG BLUEPRINT */
    .rig-blueprint { 
      background: #000; border: var(--ghost-border); height: 200px; margin-bottom: 2rem; position: relative; 
      display: flex; align-items: center; justify-content: center;
      background-image: radial-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px);
      background-size: 25px 25px;
    }
    .slots-container { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 20px; width: 92%; height: 85%; }
    @media (max-width: 600px) {
        .slots-container { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; }
        .rig-blueprint { height: 280px; }
    }
    .power-surge-glitch { animation: power-glitch 0.1s infinite; }
    @keyframes power-glitch {
        0% { filter: invert(0) contrast(1); }
        50% { filter: invert(0.1) contrast(1.5); transform: scale(1.005); }
        100% { filter: invert(0) contrast(1); }
    }
    .rig-slot { 
      border: 1px solid rgba(0, 255, 0, 0.1); 
      background: var(--surface-low); 
      display: flex; flex-direction: column; 
      align-items: center; justify-content: center; position: relative; cursor: pointer; transition: all 0.2s;
    }
    .rig-slot:hover { background: var(--surface-high); border-color: var(--primary); box-shadow: var(--neon-shadow); }
    .rig-slot.occupied { border-color: var(--primary); background: rgba(0, 255, 0, 0.05); }
    .slot-label { position: absolute; top: 4px; left: 6px; font-size: 0.45rem; opacity: 0.4; font-weight: 700; }
    .empty-prompt { font-size: 0.55rem; color: #004400; font-weight: 900; letter-spacing: 1px; }
    
    .mounted-item { text-align: center; }
    .mounted-item .item-name { font-size: 0.65rem; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; }
    .mounted-item .item-power { font-size: 0.5rem; opacity: 0.6; font-weight: 700; }
    .mounted-item.recon { color: var(--secondary); }
    .mounted-item.exploit { color: var(--tertiary); }
    .mounted-item.stealth { color: #ffffff; }

    .interface-split { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; }
    @media (max-width: 800px) { .interface-split { grid-template-columns: 1fr; } }

    .sec-header { font-size: 0.6rem; color: var(--primary); background: var(--surface-high); padding: 6px 12px; margin-bottom: 12px; font-weight: 900; letter-spacing: 2px; }

    .hardware-grid { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding-right: 5px; }
    .hw-mini-card { 
      background: var(--surface-low); border: var(--ghost-border); padding: 12px; cursor: pointer; transition: all 0.2s;
    }
    .hw-mini-card:hover:not(.locked) { border-color: var(--primary); background: var(--surface-high); transform: translateX(5px); }
    .hw-mini-card.locked { opacity: 0.3; filter: grayscale(1); }
    .hw-mini-card.owned { border-color: rgba(0, 255, 0, 0.3); background: rgba(0, 255, 0, 0.02); }
    .mini-top { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 900; margin-bottom: 6px; }
    .mini-stats { display: flex; gap: 15px; font-size: 0.55rem; color: #008800; font-weight: 700; }

    .inventory-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
    .inv-item { background: var(--surface-mid); border: var(--ghost-border); padding: 12px; display: flex; justify-content: space-between; font-size: 0.65rem; cursor: pointer; font-weight: 700; }
    .inv-item:hover { background: var(--surface-high); border-color: var(--secondary); }
    .inv-item.active { border-color: var(--primary); box-shadow: var(--neon-shadow); }
    .empty-msg { font-size: 0.6rem; color: #333; text-align: center; margin-top: 3rem; font-style: italic; }

    .item-detail-popup { 
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
      background: var(--surface-high); border: 2px solid var(--primary); padding: 24px; z-index: 1000; width: 320px;
      box-shadow: 0 0 150px rgba(0,255,0,0.3);
      border-radius: 0px;
    }
    .popup-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; font-weight: 900; margin-bottom: 12px; border-bottom: 1px solid var(--primary); padding-bottom: 8px; }
    .popup-desc { font-size: 0.7rem; color: #ccc; margin-bottom: 24px; line-height: 1.6; }
    .popup-actions { display: flex; flex-direction: column; gap: 20px; }
    .slot-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .slot-btn { font-size: 0.55rem; padding: 8px 4px; background: var(--surface-low); color: var(--primary); border: 1px solid rgba(0,255,0,0.3); cursor: pointer; font-weight: 900; }
    .slot-btn:hover { background: var(--primary); color: var(--surface-lowest); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--surface-lowest); }
    ::-webkit-scrollbar-thumb { background: var(--surface-high); }
  `
})
export class HardwareShopComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  
  selectedInventoryItem: HardwareItem | null = null;

  isOwned(item: HardwareItem): boolean {
    return this.gameService.inventory().some(i => i.id === item.id) || 
           this.gameService.mountedHardware().some(m => m?.id === item.id);
  }

  handleMarketAction(item: HardwareItem) {
    if (!item.unlocked) {
        const cost = item.price * 2;
        if (this.gameService.experience() >= cost) {
            this.gameService.unlockHardware(item.id, cost);
            this.audioService.playSuccess();
        } else {
            this.audioService.playError();
        }
    } else if (!this.isOwned(item)) {
        if (this.gameService.credits() >= item.price) {
            this.gameService.buyHardware(item);
        } else {
            this.audioService.playError();
        }
    }
  }

  handleSlotClick(slotIndex: number) {
      const item = this.gameService.mountedHardware()[slotIndex];
      if (item) {
          this.gameService.unmountHardware(slotIndex);
          this.audioService.playClick();
      }
  }

  mountToSlot(slotIndex: number) {
      if (this.selectedInventoryItem) {
          this.gameService.mountHardware(this.selectedInventoryItem, slotIndex);
          this.selectedInventoryItem = null;
      }
  }
}
