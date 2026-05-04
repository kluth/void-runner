import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HardwareShopComponent } from './hardware-shop.component';
import { OverclockStationComponent } from './overclock-station.component';
import { AssetVaultComponent } from './asset-vault.component';
import { InfoOverlayService } from '../../core/services/info-overlay.service';

@Component({
  selector: 'app-hardware-hub',
  standalone: true,
  imports: [CommonModule, HardwareShopComponent, OverclockStationComponent, AssetVaultComponent],
  template: `
    <div class="hub-container">
      <nav class="hub-nav">
        <button (click)="subTab.set('market')" [class.active]="subTab() === 'market'">[ BLACK_MARKET ]</button>
        <button (click)="subTab.set('overclock')" [class.active]="subTab() === 'overclock'">[ TUNING_LAB ]</button>
        <button (click)="subTab.set('vault')" [class.active]="subTab() === 'vault'">[ SECURE_VAULT ]</button>
        <div style="flex: 1;"></div>
        <button class="info-btn" (click)="showInfo()">[ ? ]</button>
      </nav>

      <div class="hub-content">
        @switch (subTab()) {
          @case ('market') { <app-hardware-shop /> }
          @case ('overclock') { <app-overclock-station /> }
          @case ('vault') { <app-asset-vault /> }
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .hub-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .hub-nav { 
      display: flex; gap: 10px; padding: 10px; 
      background: rgba(252, 238, 9, 0.05); 
      border-bottom: 1px solid rgba(252, 238, 9, 0.1);
      flex-wrap: wrap;
    }
    .hub-nav button {
      padding: 6px 12px; font-size: 0.65rem; border-color: rgba(252, 238, 9, 0.2); color: rgba(252, 238, 9, 0.6);
    }
    .hub-nav button.active { background: var(--neon-yellow); color: #000; border-color: var(--neon-yellow); box-shadow: 0 0 10px var(--neon-yellow); }
    .hub-content { flex: 1; overflow-y: auto; padding: 15px; min-height: 0; }
    .info-btn { color: var(--neon-yellow); background: transparent; border: 1px solid var(--neon-yellow); padding: 2px 6px; font-size: 0.6rem; margin-left: 10px; cursor: pointer; }
    .info-btn:hover { background: rgba(252, 238, 9, 0.1); }
  `
})
export class HardwareHubComponent {
  subTab = signal('market');
  info = inject(InfoOverlayService);

  showInfo() {
    this.info.open(
      'HARDWARE HUB // PHYSICAL LAYER',
      `<p><strong>[ BLACK_MARKET ]:</strong> Purchase physical gear to upgrade your rig. Better gear requires more power but grants significant tactical advantages.</p>
       <p><strong>[ TUNING_LAB ]:</strong> Overclock your hardware to push it beyond factory limits, increasing performance at the cost of heat and potential system damage.</p>
       <p><strong>[ SECURE_VAULT ]:</strong> Store your most valuable encrypted artifacts. You can also initiate 'Neural Crack' sequences to manually decrypt artifacts.</p>`
    );
  }
}
