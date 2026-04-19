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
      <div class="rig-blueprint">
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
    .shop-container { background: rgba(5, 5, 5, 0.95); border: 1px solid #00ff00; padding: 1rem; color: #00ff00; font-family: 'JetBrains Mono', monospace; }
    .shop-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #004400; padding-bottom: 0.5rem; }
    .title { font-size: 0.8rem; font-weight: 900; letter-spacing: 3px; }

    .power-telemetry { display: flex; align-items: center; gap: 10px; font-size: 0.6rem; }
    .power-bar { width: 100px; height: 10px; background: #002200; border: 1px solid #004400; }
    .power-fill { height: 100%; background: #00ff00; transition: width 0.5s ease; }
    .power-fill.warning { background: #ffaa00; box-shadow: 0 0 10px #ffaa00; }

    /* RIG BLUEPRINT */
    .rig-blueprint { 
      background: #000; border: 1px solid #004400; height: 180px; margin-bottom: 1.5rem; position: relative; 
      display: flex; align-items: center; justify-content: center;
      background-image: radial-gradient(#002200 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .slots-container { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 15px; width: 90%; height: 80%; }
    .rig-slot { 
      border: 1px dashed #004400; background: rgba(0, 255, 0, 0.02); display: flex; flex-direction: column; 
      align-items: center; justify-content: center; position: relative; cursor: pointer; transition: all 0.2s;
    }
    .rig-slot:hover { background: rgba(0, 255, 0, 0.05); border-style: solid; border-color: #00ff00; }
    .rig-slot.occupied { border-style: solid; border-color: #00ff00; background: rgba(0, 255, 0, 0.1); }
    .slot-label { position: absolute; top: 2px; left: 4px; font-size: 0.4rem; opacity: 0.5; }
    .empty-prompt { font-size: 0.5rem; color: #004400; font-weight: bold; }
    
    .mounted-item { text-align: center; }
    .mounted-item .item-name { font-size: 0.6rem; font-weight: bold; margin-bottom: 2px; }
    .mounted-item .item-power { font-size: 0.5rem; opacity: 0.7; }
    .mounted-item.recon { color: #00ffff; }
    .mounted-item.exploit { color: #ff00ff; }
    .mounted-item.stealth { color: #ffffff; }

    .interface-split { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 800px) { .interface-split { grid-template-columns: 1fr; } }

    .sec-header { font-size: 0.6rem; color: #004400; background: #001100; padding: 4px 10px; margin-bottom: 10px; font-weight: bold; }

    .hardware-grid { display: flex; flex-direction: column; gap: 5px; max-height: 250px; overflow-y: auto; }
    .hw-mini-card { 
      background: #000; border: 1px solid #111; padding: 8px; cursor: pointer; transition: all 0.2s;
    }
    .hw-mini-card:hover:not(.locked) { border-color: #00ff00; background: #001100; }
    .hw-mini-card.locked { opacity: 0.4; filter: grayscale(1); }
    .hw-mini-card.owned { border-color: #004400; }
    .mini-top { display: flex; justify-content: space-between; font-size: 0.6rem; font-weight: bold; margin-bottom: 4px; }
    .mini-stats { display: flex; gap: 10px; font-size: 0.5rem; color: #008800; }

    .inventory-list { display: flex; flex-direction: column; gap: 5px; max-height: 250px; overflow-y: auto; }
    .inv-item { background: #000; border: 1px solid #004400; padding: 8px; display: flex; justify-content: space-between; font-size: 0.6rem; cursor: pointer; }
    .inv-item:hover { background: #002200; }
    .inv-item.active { border-color: #00ff00; box-shadow: 0 0 10px #0f0; }
    .empty-msg { font-size: 0.6rem; color: #002200; text-align: center; margin-top: 2rem; }

    .item-detail-popup { 
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
      background: #000; border: 2px solid #00ff00; padding: 20px; z-index: 1000; width: 300px;
      box-shadow: 0 0 100px rgba(0,255,0,0.4);
    }
    .popup-title { font-size: 0.8rem; font-weight: 900; margin-bottom: 10px; border-bottom: 1px solid #004400; }
    .popup-desc { font-size: 0.6rem; color: #888; margin-bottom: 20px; line-height: 1.4; }
    .popup-actions { display: flex; flex-direction: column; gap: 15px; }
    .slot-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .slot-btn { font-size: 0.5rem; padding: 5px; background: #002200; color: #00ff00; border: 1px solid #00ff00; cursor: pointer; }
    .slot-btn:hover { background: #00ff00; color: #000; }
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
