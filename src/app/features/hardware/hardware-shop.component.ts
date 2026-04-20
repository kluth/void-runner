import { Component, inject, signal } from '@angular/core';
import { GameService, HardwareItem } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hardware-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shop-container">
      <div class="shop-header">
         <span class="title">BLACK_MARKET // MODULE_VEND</span>
         <div class="power-telemetry">
            <span class="label">NEURAL_CAPACITY:</span>
            <div class="p-bar"><div class="p-fill" [style.width.%]="gameService.currentPowerUsage()"></div></div>
            <span class="p-val">{{ gameService.currentPowerUsage() }}/{{ gameService.totalPowerCapacity() }}W</span>
         </div>
      </div>

      <div class="rig-blueprint-sector">
         <div class="blueprint-noise">X: 12.44 Y: 88.12</div>
         <div class="rig-grid">
            @for (slot of gameService.mountedHardware(); track $index) {
               <div class="rig-slot" [class.occupied]="!!slot" (click)="selectSlot($index)">
                  <span class="slot-id">S_0{{ $index }}</span>
                  @if (slot) {
                     <div class="mounted-info">
                        <div class="m-name">{{ slot.name }}</div>
                        <div class="m-power">{{ slot.powerDraw }}W</div>
                     </div>
                  } @else {
                     <span class="empty-tag">[ VACANT ]</span>
                  }
               </div>
            }
         </div>
      </div>

      <div class="market-split">
         <div class="inventory-pane">
            <div class="sec-label">OPERATIVE_STASH</div>
            <div class="stash-list">
               @for (item of gameService.inventory(); track item.id) {
                  <div class="stash-item" (click)="selectedInventoryItem = item" [class.active]="selectedInventoryItem?.id === item.id">
                     <span class="i-name">{{ item.name }}</span>
                     <span class="i-type">[{{ item.bonusType.toUpperCase() }}]</span>
                  </div>
               } @empty {
                  <div class="empty-noise">VAULT_EMPTY</div>
               }
            </div>
         </div>

         <div class="shop-pane">
            <div class="sec-label">MARKET_LISTINGS</div>
            <div class="hw-list">
               @for (item of gameService.availableHardware(); track item.id) {
                  <div class="hw-card" [class.locked]="!item.unlocked" (click)="buyItem(item)">
                     <div class="h-top">
                        <span class="h-name">{{ item.name }}</span>
                        <span class="h-price">{{ item.price }}cr</span>
                     </div>
                     <div class="h-desc">{{ item.description }}</div>
                     <div class="h-stats">
                        <span>PWR: {{ item.powerDraw }}W</span>
                        <span>MOD: +{{ item.bonusValue }}</span>
                     </div>
                  </div>
               }
            </div>
         </div>
      </div>

      @if (selectedSlot !== null && selectedInventoryItem) {
         <div class="mount-overlay glass-overlay">
            <div class="mount-box">
               <div class="m-title">CONFIRM_SYNC</div>
               <p>Mount {{ selectedInventoryItem.name }} to Slot S_0{{ selectedSlot }}?</p>
               <div class="m-actions">
                  <button class="primary" (click)="confirmMount()">EXECUTE</button>
                  <button (click)="selectedSlot = null">ABORT</button>
               </div>
            </div>
         </div>
      }
    </div>
  `,
  styles: `
    .shop-container {
      background: var(--layer-1);
      height: 100%;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
    }

    .shop-header {
      background: var(--layer-2);
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title { font-size: 0.8rem; font-weight: 900; letter-spacing: 2px; }

    .power-telemetry { display: flex; align-items: center; gap: 15px; }
    .label { font-size: 0.5rem; opacity: 0.4; font-weight: 900; }
    .p-bar { width: 100px; height: 2px; background: var(--layer-0); }
    .p-fill { height: 100%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }
    .p-val { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--primary); }

    .rig-blueprint-sector {
       background: var(--layer-0);
       padding: 2rem;
       position: relative;
       background-image: radial-gradient(rgba(13, 242, 242, 0.05) 1px, transparent 1px);
       background-size: 30px 30px;
    }
    .blueprint-noise { position: absolute; top: 10px; left: 15px; font-size: 0.45rem; opacity: 0.2; font-family: 'JetBrains Mono', monospace; }

    .rig-grid {
       display: grid;
       grid-template-columns: repeat(3, 1fr);
       gap: 1.5rem;
    }
    .rig-slot {
       background: var(--layer-2);
       height: 80px;
       padding: 10px;
       position: relative;
       cursor: pointer;
       transition: all 0.05s steps(2);
    }
    .rig-slot:hover { background: var(--layer-4); box-shadow: var(--neon-shadow); }
    .rig-slot.occupied { background: var(--layer-3); border-left: 2px solid var(--primary); }
    .slot-id { position: absolute; bottom: 4px; right: 6px; font-size: 0.45rem; opacity: 0.3; font-weight: 900; }
    .empty-tag { font-size: 0.55rem; color: var(--primary); opacity: 0.2; font-weight: 900; letter-spacing: 1px; }

    .m-name { font-size: 0.65rem; font-weight: 900; color: #fff; margin-bottom: 4px; }
    .m-power { font-size: 0.5rem; color: var(--primary); opacity: 0.6; }

    .market-split {
       display: grid;
       grid-template-columns: 0.8fr 1.2fr;
       gap: 1.5rem;
       flex-grow: 1;
       min-height: 0;
    }

    .inventory-pane, .shop-pane {
       display: flex;
       flex-direction: column;
       gap: 1rem;
    }

    .sec-label { font-size: 0.6rem; font-weight: 900; opacity: 0.4; letter-spacing: 2px; }

    .stash-list, .hw-list {
       background: var(--layer-0);
       flex-grow: 1;
       overflow-y: auto;
       padding: 10px;
       display: flex;
       flex-direction: column;
       gap: 8px;
    }

    .stash-item {
       background: var(--layer-2);
       padding: 10px;
       font-size: 0.65rem;
       display: flex;
       justify-content: space-between;
       cursor: pointer;
    }
    .stash-item.active { background: var(--layer-4); border-right: 2px solid var(--primary); }

    .hw-card {
       background: var(--layer-2);
       padding: 15px;
       cursor: pointer;
       transition: all 0.05s steps(2);
    }
    .hw-card:hover:not(.locked) { background: var(--layer-4); transform: translateX(4px); }
    .hw-card.locked { opacity: 0.2; cursor: not-allowed; }

    .h-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .h-name { font-size: 0.8rem; font-weight: 900; color: #fff; }
    .h-price { color: var(--secondary); font-weight: 900; }
    .h-desc { font-size: 0.65rem; color: #fff; opacity: 0.5; margin-bottom: 12px; line-height: 1.4; }
    .h-stats { display: flex; gap: 15px; font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--primary); }

    .mount-overlay {
       position: absolute; top: 0; left: 0; width: 100%; height: 100%;
       z-index: 10; display: flex; align-items: center; justify-content: center;
    }
    .mount-box {
       background: var(--layer-5);
       padding: 2.5rem;
       text-align: center;
       box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }
    .m-title { font-size: 1rem; font-weight: 900; margin-bottom: 1rem; color: var(--primary); }
    .m-actions { display: flex; gap: 15px; margin-top: 2rem; }
  `
})
export class HardwareShopComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  selectedInventoryItem: HardwareItem | null = null;
  selectedSlot: number | null = null;

  buyItem(item: HardwareItem) {
    if (!item.unlocked) return;
    this.gameService.buyHardware(item);
  }

  selectSlot(index: number) {
     if (this.selectedInventoryItem) {
        this.selectedSlot = index;
     } else {
        this.gameService.unmountHardware(index);
     }
  }

  confirmMount() {
     if (this.selectedInventoryItem && this.selectedSlot !== null) {
        this.gameService.mountHardware(this.selectedInventoryItem, this.selectedSlot);
        this.selectedSlot = null;
        this.selectedInventoryItem = null;
     }
  }
}
