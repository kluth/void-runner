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
      <div class="main-split">
        <!-- MARKET LISTINGS -->
        <div class="terminal-frame market-box">
          <div class="ascii-line">MARKET_LISTINGS</div>
          <div class="hw-list-terminal">
             @for (item of gameService.availableHardware(); track item.id) {
                <button class="hw-card-terminal" 
                        [class.locked]="!item.unlocked" 
                        (click)="buyItem(item)">
                   <div class="h-row">
                      <span class="h-name">{{ item.name }}</span>
                      <span class="h-price" [class.discount]="(gameService.marketVolatility()[item.id] || 1) < 0.9">
                         {{ gameService.getAdjustedPrice(item) }} CR
                         @if ((gameService.marketVolatility()[item.id] || 1) < 0.9) { <span>▼</span> }
                         @if ((gameService.marketVolatility()[item.id] || 1) > 1.1) { <span>▲</span> }
                      </span>
                   </div>
                   <div class="h-desc">> {{ item.description }}</div>
                   <div class="h-stats">
                      [ PWR: {{ item.powerDraw }}W | MOD: +{{ item.bonusValue }} ]
                   </div>
                </button>
             }
          </div>
        </div>

        <!-- RIG CONFIGURATION -->
        <div class="terminal-frame rig-box" [class.quantum-layout]="gameService.hudVariant() === 'QUANTUM'">
          <div class="ascii-line">CURRENT_RIG_CONFIGURATION</div>
          <div class="rig-grid">
            @for (slot of gameService.mountedHardware(); track $index) {
               <button class="rig-slot-terminal" 
                       [class.occupied]="!!slot" 
                       [style.--slot-index]="$index"
                       (click)="selectSlot($index)">
                  <div class="slot-header">SLOT_0{{ $index }}</div>
                  @if (slot) {
                     <div class="slot-content">
                        <div class="m-name">{{ slot.name }}</div>
                        <div class="m-power">PWR: {{ slot.powerDraw }}W</div>
                     </div>
                  } @else {
                     <div class="slot-empty">[ EMPTY_SLOT ]</div>
                  }
               </button>
            }
          </div>
          
          <div class="power-readout">
             POWER_LOAD: [{{ getPowerBar() }}] {{ gameService.currentPowerUsage() }}/{{ gameService.totalPowerCapacity() }}W
          </div>
        </div>
      </div>

      <!-- INVENTORY -->
      <div class="terminal-frame inventory-box mt-4">
        <div class="ascii-line magenta">LOCAL_INVENTORY</div>
        <div class="inventory-grid">
           @for (item of gameService.inventory(); track $index) {
              <div class="inv-item" (click)="selectInventoryItem(item)">
                 <span class="i-name">{{ item.name }}</span>
                 <span class="i-type">[{{ item.bonusType }}]</span>
              </div>
           }
           @if (gameService.inventory().length === 0) {
              <div class="empty-msg">NO_UNMOUNTED_HARDWARE_FOUND</div>
           }
        </div>
      </div>

      <!-- MOUNT MODAL -->
      <div class="modal-overlay glass-overlay" *ngIf="selectedInventoryItem">
         <div class="modal-box terminal-frame">
            <div class="ascii-line">MOUNT_HARDWARE</div>
            <div class="modal-content">
               <p>SELECT TARGET SLOT FOR: {{ selectedInventoryItem.name }}</p>
               <div class="slot-selector">
                  @for (slot of gameService.mountedHardware(); track $index) {
                     <button (click)="confirmMount($index)" [class.busy]="!!slot">SLOT_0{{ $index }}</button>
                  }
               </div>
               <button class="magenta w-full" (click)="selectedInventoryItem = null">[ CANCEL ]</button>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: `
    .shop-container { display: flex; flex-direction: column; gap: 1rem; }
    .main-split { display: flex; gap: 1rem; flex-wrap: wrap; }
    .market-box { flex: 2; min-width: 350px; padding: 10px; }
    .rig-box { flex: 1.5; min-width: 300px; padding: 10px; display: flex; flex-direction: column; }
    
    .hw-list-terminal { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .hw-card-terminal {
      width: 100%; background: transparent; border: 1px solid rgba(0, 255, 159, 0.2);
      text-align: left; padding: 10px; cursor: pointer;
    }
    .hw-card-terminal:hover:not(.locked) { border-color: var(--primary); background: rgba(0, 255, 159, 0.05); }
    .locked { opacity: 0.3; cursor: not-allowed; }

    .h-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; font-size: 0.75rem; }
    .h-price { color: var(--neon-cyan); }
    .h-price.discount { color: var(--neon-green); }
    .h-desc { font-size: 0.65rem; opacity: 0.6; font-style: italic; }
    .h-stats { font-size: 0.6rem; color: var(--neon-yellow); margin-top: 5px; }

    .rig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; flex: 1; }
    .rig-slot-terminal { 
      background: rgba(0, 0, 0, 0.3); border: 1px dashed rgba(0, 255, 159, 0.2); 
      padding: 10px; text-align: left; cursor: pointer; min-height: 60px;
    }
    .rig-slot-terminal.occupied { border: 1px solid var(--primary); background: rgba(0, 255, 159, 0.05); }

    .quantum-layout .rig-grid { height: 300px; position: relative; display: block; }
    .quantum-layout .rig-slot-terminal {
      position: absolute; width: 120px; left: 50%; top: 50%;
      --angle: calc(var(--slot-index) * 60deg);
      transform: translate(-50%, -50%) rotate(var(--angle)) translate(100px) rotate(calc(-1 * var(--angle)));
    }

    .slot-header { font-size: 0.5rem; opacity: 0.4; }
    .m-name { font-size: 0.7rem; font-weight: bold; color: var(--primary); }
    .m-power { font-size: 0.6rem; color: var(--neon-cyan); }
    .power-readout { font-size: 0.6rem; margin-top: 15px; text-align: center; color: var(--neon-yellow); }

    .inventory-box { padding: 10px; }
    .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top: 10px; }
    .inv-item { border: 1px solid rgba(255, 0, 85, 0.2); padding: 8px; cursor: pointer; display: flex; justify-content: space-between; }
    .inv-item:hover { border-color: var(--tertiary); background: rgba(255, 0, 85, 0.05); }
    .i-name { font-size: 0.7rem; color: var(--tertiary); }
    .i-type { font-size: 0.55rem; opacity: 0.5; }
    .empty-msg { grid-column: 1 / -1; text-align: center; padding: 1rem; opacity: 0.2; font-size: 0.7rem; }

    .modal-overlay {
       position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
       z-index: 10000; display: flex; align-items: center; justify-content: center;
       background: rgba(0,0,0,0.8);
    }
    .modal-box { width: 320px; max-width: 90vw; background: var(--layer-1); padding: 1rem; }
    .slot-selector { display: flex; flex-direction: column; gap: 8px; margin: 15px 0; }
    .slot-selector button { padding: 10px; }
    .slot-selector button.busy { border-color: var(--tertiary); color: var(--tertiary); }

    @keyframes blink { 50% { opacity: 0.3; } }
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

  selectInventoryItem(item: HardwareItem) {
    this.selectedInventoryItem = item;
    this.audioService.playClick();
  }

  selectSlot(index: number) {
     if (this.selectedInventoryItem) {
        this.selectedSlot = index;
     } else {
        this.gameService.unmountHardware(index);
     }
  }

  confirmMount(index: number) {
     if (this.selectedInventoryItem) {
        this.gameService.mountHardware(this.selectedInventoryItem, index);
        this.selectedSlot = null;
        this.selectedInventoryItem = null;
     }
  }

  getPowerBar() {
     const val = this.gameService.currentPowerUsage();
     const cap = this.gameService.totalPowerCapacity();
     const total = 20;
     const filled = Math.floor((val / cap) * total);
     return '█'.repeat(filled) + '░'.repeat(total - filled);
  }

  getEmptyPowerBar() { return ''; }
}
