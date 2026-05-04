import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionComponent } from './missions.component';
import { BountyBoardComponent } from './bounty-board.component';
import { ThreatDatabaseComponent } from './threat-database.component';
import { MalwareSandboxComponent } from './malware-sandbox.component';
import { InternalNetworkComponent } from './internal-network.component';
import { InfoOverlayService } from '../../core/services/info-overlay.service';

@Component({
  selector: 'app-operations-hub',
  standalone: true,
  imports: [CommonModule, MissionComponent, BountyBoardComponent, ThreatDatabaseComponent, MalwareSandboxComponent, InternalNetworkComponent],
  template: `
    <div class="hub-container">
      <nav class="hub-nav">
        <button (click)="subTab.set('active')" [class.active]="subTab() === 'active'">[ ACTIVE_MISSIONS ]</button>
        <button (click)="subTab.set('bounties')" [class.active]="subTab() === 'bounties'">[ BOUNTY_BOARD ]</button>
        <button (click)="subTab.set('threats')" [class.active]="subTab() === 'threats'">[ THREAT_INTEL ]</button>
        <button (click)="subTab.set('sandbox')" [class.active]="subTab() === 'sandbox'">[ MALWARE_LAB ]</button>
        <button (click)="subTab.set('pivot')" [class.active]="subTab() === 'pivot'">[ NETWORK_PIVOT ]</button>
        <div style="flex: 1;"></div>
        <button class="info-btn" (click)="showInfo()">[ ? ]</button>
      </nav>

      <div class="hub-content">
        @switch (subTab()) {
          @case ('active') { <app-missions /> }
          @case ('bounties') { <app-bounty-board /> }
          @case ('threats') { <app-threat-database /> }
          @case ('sandbox') { <app-malware-sandbox /> }
          @case ('pivot') { <app-internal-network /> }
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .hub-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .hub-nav { 
      display: flex; gap: 10px; padding: 10px; 
      background: rgba(0, 255, 159, 0.05); 
      border-bottom: 1px solid rgba(0, 255, 159, 0.1);
      flex-wrap: wrap;
    }
    .hub-nav button {
      padding: 6px 12px; font-size: 0.65rem; color: rgba(0, 255, 159, 0.6);
    }
    .hub-nav button.active { background: var(--primary); color: #000; box-shadow: 0 0 10px var(--primary); }
    .hub-content { flex: 1; overflow-y: auto; padding: 15px; min-height: 0; }
    .info-btn { color: var(--secondary); background: transparent; border: 1px solid var(--secondary); padding: 2px 6px; font-size: 0.6rem; margin-left: 10px; cursor: pointer; }
    .info-btn:hover { background: rgba(0, 229, 255, 0.1); }
  `
})
export class OperationsHubComponent {
  subTab = signal('active');
  info = inject(InfoOverlayService);

  showInfo() {
    this.info.open(
      'OPERATIONS HUB // FIELD TACTICS',
      `<p><strong>[ ACTIVE_MISSIONS ]:</strong> Engage in tactical breaches (brute-force, port-scans). Completing these grants Credits and Reputation.</p>
       <p><strong>[ BOUNTY_BOARD ]:</strong> High-value targets posted by factions or the system. Highly rewarding but extremely risky. Requires alignment matching.</p>
       <p><strong>[ THREAT_INTEL ]:</strong> Monitor the megacorporations and syndicates tracking you. You can intercept them to reduce your trace level.</p>
       <p><strong>[ MALWARE_LAB ]:</strong> Analyze raw artifact data to discover zero-day exploits. You can manually override to speed up the process.</p>`
    );
  }
}
