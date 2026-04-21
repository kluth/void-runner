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
    <div class="terminal-root" role="region" aria-label="Hardware Shop">
      <!-- HEADER SECTION -->
      <div class="ascii-box header-box">
        <div class="t">┌────────────────────────────────────────────────────────────────────────────────┐</div>
        <div class="m">
          <span class="l">│</span>
          <div class="content">
            <h3 class="title">BLACK_MARKET // MODULE_VEND [v2.0.4]</h3>
            <div class="power-telemetry">
              <span>NEURAL_CAPACITY: [</span>
              <div class="p-bar-ascii">
                <span class="p-fill-ascii">{{ getPowerBar() }}</span>
                <span class="p-empty-ascii">{{ getEmptyPowerBar() }}</span>
              </div>
              <span>] {{ gameService.currentPowerUsage() }}/{{ gameService.totalPowerCapacity() }}W</span>
            </div>
          </div>
          <span class="r">│</span>
        </div>
        <div class="b">└────────────────────────────────────────────────────────────────────────────────┘</div>
      </div>

      <!-- RIG CONFIGURATION -->
      <div class="ascii-box rig-box">
        <div class="t">┌── CURRENT_RIG_CONFIGURATION ───────────────────────────────────────────────────┐</div>
        <div class="m">
          <span class="l">│</span>
          <div class="rig-grid">
            @for (slot of gameService.mountedHardware(); track $index) {
               <button class="rig-slot-terminal" 
                       [class.occupied]="!!slot" 
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
          <span class="r">│</span>
        </div>
        <div class="b">└────────────────────────────────────────────────────────────────────────────────┘</div>
      </div>

      <div class="main-split">
        <!-- INVENTORY -->
        <div class="ascii-box inventory-box">
          <div class="t">┌── OPERATIVE_STASH ────────────────────────┐</div>
          <div class="m">
            <span class="l">│</span>
            <div class="stash-list-terminal">
               @for (item of gameService.inventory(); track item.id) {
                  <button class="terminal-item" 
                          (click)="selectedInventoryItem = item" 
                          [class.active]="selectedInventoryItem?.id === item.id">
                     <span class="i-prefix">>></span>
                     <span class="i-name">{{ item.name }}</span>
                     <span class="i-type">[{{ item.bonusType.substring(0,3).toUpperCase() }}]</span>
                  </button>
               } @empty {
                  <div class="empty-msg">NO_ASSETS_DETECTED</div>
               }
            </div>
            <span class="r">│</span>
          </div>
          <div class="b">└───────────────────────────────────────────┘</div>
        </div>

        <!-- MARKET -->
        <div class="ascii-box market-box">
          <div class="t">┌── MARKET_LISTINGS ─────────────────────────────────────────────────────────────┐</div>
          <div class="m">
            <span class="l">│</span>
            <div class="hw-list-terminal">
               @for (item of gameService.availableHardware(); track item.id) {
                  <button class="hw-card-terminal" 
                          [class.locked]="!item.unlocked" 
                          (click)="buyItem(item)">
                     <div class="h-row">
                        <span class="h-name">{{ item.name }}</span>
                        <span class="h-price">{{ item.price }} CR</span>
                     </div>
                     <div class="h-desc">> {{ item.description }}</div>
                     <div class="h-stats">
                        [ PWR: {{ item.powerDraw }}W | MOD: +{{ item.bonusValue }} ]
                     </div>
                  </button>
               }
            </div>
            <span class="r">│</span>
          </div>
          <div class="b">└────────────────────────────────────────────────────────────────────────────────┘</div>
        </div>
      </div>

      <!-- MODAL OVERLAY -->
      @if (selectedSlot !== null && selectedInventoryItem) {
         <div class="terminal-modal-overlay">
            <div class="ascii-box modal-box">
              <div class="t">┌── CONFIRM_SYNC ───────────────────────────┐</div>
              <div class="m">
                <span class="l">│</span>
                <div class="modal-content">
                  <p>MOUNT: {{ selectedInventoryItem.name }}</p>
                  <p>TARGET: SLOT_0{{ selectedSlot }}</p>
                  <div class="modal-actions">
                    <button class="term-btn" (click)="confirmMount()">[ EXECUTE ]</button>
                    <button class="term-btn" (click)="selectedSlot = null">[ ABORT ]</button>
                  </div>
                </div>
                <span class="r">│</span>
              </div>
              <div class="b">└───────────────────────────────────────────┘</div>
            </div>
         </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      --primary: #00ff00; /* Fallback if not defined */
    }

    .terminal-root {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .ascii-box {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .ascii-box .t, .ascii-box .b {
      white-space: pre;
      font-size: 14px;
      letter-spacing: -1px;
    }

    .ascii-box .m {
      display: flex;
      flex-direction: row;
    }

    .ascii-box .m .content, .ascii-box .m .rig-grid, .ascii-box .m .stash-list-terminal, .ascii-box .m .hw-list-terminal, .ascii-box .m .modal-content {
      flex-grow: 1;
      padding: 0 15px;
    }

    .header-box .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    .title { margin: 0; font-size: 1.2rem; font-weight: bold; text-shadow: 0 0 5px var(--primary); }

    .power-telemetry { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .p-bar-ascii { color: var(--primary); }
    .p-fill-ascii { letter-spacing: -2px; }
    .p-empty-ascii { opacity: 0.3; letter-spacing: -2px; }

    .rig-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      padding-top: 10px !important;
      padding-bottom: 10px !important;
    }

    .rig-slot-terminal {
      background: transparent;
      border: 1px dashed var(--primary);
      color: var(--primary);
      padding: 10px;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
    }
    .rig-slot-terminal:hover {
      background: var(--primary);
      color: #000;
    }
    .rig-slot-terminal.occupied {
      border: 1px solid var(--primary);
    }

    .slot-header { font-size: 0.7rem; opacity: 0.7; margin-bottom: 5px; }
    .slot-empty { font-size: 0.8rem; opacity: 0.4; text-align: center; margin-top: 5px; }
    .m-name { font-weight: bold; font-size: 0.9rem; margin-bottom: 2px; }
    .m-power { font-size: 0.75rem; }

    .main-split {
      display: flex;
      gap: 15px;
      flex-grow: 1;
      min-height: 0;
    }

    .inventory-box { flex: 1; }
    .market-box { flex: 2; }

    .stash-list-terminal, .hw-list-terminal {
      height: 300px;
      overflow-y: auto;
      padding-top: 10px !important;
      padding-bottom: 10px !important;
    }

    .terminal-item {
      display: flex;
      width: 100%;
      background: transparent;
      border: none;
      color: var(--primary);
      font-family: inherit;
      padding: 5px 0;
      cursor: pointer;
      text-align: left;
      gap: 10px;
    }
    .terminal-item:hover { background: rgba(0, 255, 0, 0.1); }
    .terminal-item.active { background: var(--primary); color: #000; }
    .i-prefix { font-weight: bold; }
    .i-type { margin-left: auto; opacity: 0.7; }

    .hw-card-terminal {
      display: block;
      width: 100%;
      background: transparent;
      border: 1px solid transparent;
      color: var(--primary);
      font-family: inherit;
      padding: 10px;
      cursor: pointer;
      text-align: left;
      margin-bottom: 5px;
    }
    .hw-card-terminal:hover:not(.locked) {
      border-color: var(--primary);
      background: rgba(0, 255, 0, 0.05);
    }
    .hw-card-terminal.locked { opacity: 0.3; cursor: not-allowed; }

    .h-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; }
    .h-desc { font-size: 0.85rem; margin-bottom: 5px; }
    .h-stats { font-size: 0.8rem; opacity: 0.8; }

    .terminal-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      padding: 20px !important;
      text-align: center;
    }
    .modal-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }

    .term-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      font-family: inherit;
      font-size: 1rem;
      cursor: pointer;
      padding: 5px 10px;
    }
    .term-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .empty-msg { opacity: 0.4; text-align: center; padding: 20px; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: var(--primary); }
  `
})
export class HardwareShopComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  selectedInventoryItem: HardwareItem | null = null;
  selectedSlot: number | null = null;

  getPowerBar() {
    const ratio = this.gameService.currentPowerUsage() / this.gameService.totalPowerCapacity();
    const bars = Math.floor(ratio * 20);
    return '█'.repeat(bars);
  }

  getEmptyPowerBar() {
    const ratio = this.gameService.currentPowerUsage() / this.gameService.totalPowerCapacity();
    const bars = 20 - Math.floor(ratio * 20);
    return '░'.repeat(bars);
  }

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
