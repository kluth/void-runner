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
      <div class="terminal-frame header-box">
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
      </div>

      <!-- RIG CONFIGURATION -->
      <div class="terminal-frame rig-box">
        <div class="ascii-line">CURRENT_RIG_CONFIGURATION</div>
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
      </div>

      <div class="main-split">
        <!-- INVENTORY -->
        <div class="terminal-frame inventory-box">
          <div class="ascii-line">OPERATIVE_STASH</div>
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
        </div>

        <!-- MARKET -->
        <div class="terminal-frame market-box">
          <div class="ascii-line">MARKET_LISTINGS</div>
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
        </div>
      </div>

      <!-- MODAL OVERLAY -->
      @if (selectedSlot !== null && selectedInventoryItem) {
         <div class="terminal-modal-overlay">
            <div class="terminal-frame modal-box">
              <div class="ascii-line">CONFIRM_SYNC</div>
              <div class="modal-content">
                <p>MOUNT: {{ selectedInventoryItem.name }}</p>
                <p>TARGET: SLOT_0{{ selectedSlot }}</p>
                <div class="modal-actions">
                  <button class="term-btn cyan" (click)="confirmMount()">[ EXECUTE ]</button>
                  <button class="term-btn magenta" (click)="selectedSlot = null">[ ABORT ]</button>
                </div>
              </div>
            </div>
         </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: var(--layer-0);
      color: var(--neon-green);
      font-family: 'JetBrains Mono', monospace;
    }

    .terminal-root {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .header-box .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      padding: 0.5rem;
    }

    .title { margin: 0; font-size: 1.1rem; font-weight: bold; text-shadow: 0 0 5px var(--neon-green); font-family: 'Orbitron', monospace; }

    .power-telemetry { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; }
    .p-bar-ascii { color: var(--neon-green); display: flex; }
    .p-fill-ascii { letter-spacing: -1px; }
    .p-empty-ascii { opacity: 0.2; letter-spacing: -1px; }

    .rig-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .rig-slot-terminal {
      background: transparent;
      border: 1px dashed rgba(0, 255, 159, 0.3);
      color: var(--neon-green);
      padding: 0.8rem;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      clip-path: var(--clip-notch);
    }
    .rig-slot-terminal:hover {
      background: rgba(0, 255, 159, 0.1);
      border-style: solid;
      border-color: var(--neon-green);
    }
    .rig-slot-terminal.occupied {
      border: 1px solid var(--neon-green);
      background: rgba(0, 255, 159, 0.05);
    }

    .slot-header { font-size: 0.65rem; color: rgba(0, 255, 159, 0.5); margin-bottom: 4px; }
    .slot-empty { font-size: 0.75rem; opacity: 0.4; text-align: center; margin-top: 5px; }
    .m-name { font-weight: bold; font-size: 0.85rem; margin-bottom: 2px; }
    .m-power { font-size: 0.7rem; color: var(--neon-cyan); }

    .main-split {
      display: flex;
      gap: 1rem;
      flex-grow: 1;
      min-height: 0;
    }

    .inventory-box { flex: 1; min-width: 250px; }
    .market-box { flex: 2; min-width: 350px; }

    .stash-list-terminal, .hw-list-terminal {
      height: 40vh;
      overflow-y: auto;
      padding: 0.5rem 0;
    }

    .terminal-item {
      display: flex;
      width: 100%;
      background: transparent;
      border: none;
      color: var(--neon-green);
      font-family: inherit;
      padding: 6px 12px;
      cursor: pointer;
      text-align: left;
      gap: 10px;
      border-left: 2px solid transparent;
    }
    .terminal-item:hover { background: rgba(0, 255, 159, 0.1); border-left-color: var(--neon-green); }
    .terminal-item.active { background: var(--neon-green); color: var(--layer-0); }
    .i-prefix { font-weight: bold; opacity: 0.7; }
    .i-type { margin-left: auto; font-size: 0.7rem; opacity: 0.6; }

    .hw-card-terminal {
      display: block;
      width: 100%;
      background: transparent;
      border: 1px solid rgba(0, 255, 159, 0.2);
      color: var(--neon-green);
      font-family: inherit;
      padding: 10px 15px;
      cursor: pointer;
      text-align: left;
      margin-bottom: 8px;
      transition: all 0.2s ease;
      clip-path: var(--clip-notch);
    }
    .hw-card-terminal:hover:not(.locked) {
      border-color: var(--neon-green);
      background: rgba(0, 255, 159, 0.08);
      transform: translateX(4px);
    }
    .hw-card-terminal.locked { opacity: 0.3; cursor: not-allowed; }

    .h-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; font-size: 0.9rem; font-family: 'Orbitron', monospace; }
    .h-price { color: var(--neon-cyan); }
    .h-desc { font-size: 0.8rem; margin-bottom: 6px; color: rgba(0, 255, 159, 0.8); }
    .h-stats { font-size: 0.75rem; color: rgba(0, 255, 159, 0.5); }

    .terminal-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(5, 8, 16, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(8px);
    }

    .modal-box {
      width: 320px;
    }

    .modal-content {
      padding: 1.5rem;
      text-align: center;
    }
    .modal-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .term-btn {
      background: transparent;
      border: 1px solid var(--neon-green);
      color: var(--neon-green);
      font-family: 'Orbitron', monospace;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 8px 16px;
      transition: all 0.2s ease;
      clip-path: var(--clip-notch);
    }
    .term-btn:hover {
      background: rgba(0, 255, 159, 0.1);
      box-shadow: 0 0 10px rgba(0, 255, 159, 0.3);
    }
    .term-btn.cyan { border-color: var(--neon-cyan); color: var(--neon-cyan); }
    .term-btn.cyan:hover { background: rgba(0, 229, 255, 0.1); box-shadow: 0 0 10px rgba(0, 229, 255, 0.3); }
    .term-btn.magenta { border-color: var(--neon-magenta); color: var(--neon-magenta); }
    .term-btn.magenta:hover { background: rgba(255, 0, 85, 0.1); box-shadow: 0 0 10px rgba(255, 0, 85, 0.3); }

    .empty-msg { opacity: 0.4; text-align: center; padding: 2rem; font-style: italic; font-size: 0.8rem; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
    ::-webkit-scrollbar-thumb { background: var(--neon-green); }

    @media (max-width: 800px) {
      .main-split {
        flex-direction: column;
      }
      .inventory-box, .market-box {
        min-width: 0;
      }
    }
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
