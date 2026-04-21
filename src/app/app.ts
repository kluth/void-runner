import { Component, inject, OnInit, signal } from '@angular/core';
import { GameService } from './core/services/game.service';
import { AudioService } from './core/services/audio.service';
import { StreamerIntegrationService } from './core/services/streamer-integration.service';
import { ActivatedRoute } from '@angular/router';
import { TerminalComponent } from './features/terminal/terminal.component';
import { HardwareShopComponent } from './features/hardware/hardware-shop.component';
import { MissionComponent } from './features/missions/missions.component';
import { GlobeComponent } from './features/network/globe.component';
import { NetworkComponent } from './features/network/network.component';
import { MatrixRainComponent } from './features/system/matrix-rain.component';
import { LiveEventsComponent } from './features/social/live-events.component';
import { MalwareSandboxComponent } from './features/missions/malware-sandbox.component';
import { InternalNetworkComponent } from './features/missions/internal-network.component';
import { IntrusionOverlayComponent } from './features/system/intrusion-overlay.component';
import { TeamComponent } from './features/social/team.component';
import { DarknetNodeComponent } from './features/social/darknet-node.component';
import { SystemIntegrityComponent } from './features/system/system-integrity.component';
import { HijackOverlayComponent } from './features/terminal/hijack-overlay.component';
import { CalibrationOverlayComponent } from './features/system/calibration-overlay.component';
import { AuthComponent } from './features/system/auth.component';
import { BootScreenComponent } from './features/system/boot-screen.component';
import { ConfigWizardComponent } from './features/system/config-wizard.component';
import { WalkthroughOverlayComponent } from './features/system/walkthrough-overlay.component';
import { ThreatDatabaseComponent } from './features/missions/threat-database.component';
import { BountyBoardComponent } from './features/missions/bounty-board.component';
import { OverclockStationComponent } from './features/hardware/overclock-station.component';
import { AssetVaultComponent } from './features/hardware/asset-vault.component';
import { PurgeOverlayComponent } from './features/system/purge-overlay.component';
import { LockoutOverlayComponent } from './features/system/lockout-overlay.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TerminalComponent, 
    HardwareShopComponent, 
    MissionComponent, 
    GlobeComponent, 
    NetworkComponent, 
    MatrixRainComponent, 
    LiveEventsComponent,
    MalwareSandboxComponent,
    InternalNetworkComponent,
    IntrusionOverlayComponent,
    TeamComponent,
    DarknetNodeComponent,
    SystemIntegrityComponent,
    HijackOverlayComponent,
    CalibrationOverlayComponent,
    AuthComponent,
    BootScreenComponent,
    ConfigWizardComponent,
    WalkthroughOverlayComponent,
    ThreatDatabaseComponent,
    BountyBoardComponent,
    OverclockStationComponent,
    AssetVaultComponent,
    PurgeOverlayComponent,
    LockoutOverlayComponent
  ],
  template: `
    <h1 class="sr-only">VOID_RUN Protocol - High Density Operational Interface</h1>

    @if (!gameService.isConfigured()) {
      <app-config-wizard />
    }

    @if (gameService.isBooting()) {
      <app-boot-screen />
    }

    @if (gameService.authRequired()) {
      <app-auth class="glass-overlay" role="dialog" aria-modal="true" />
    }

    @if (gameService.matrixMode()) {
      <app-matrix-rain aria-hidden="true" />
    }

    <app-intrusion-overlay />
    <app-hijack-overlay />
    <app-calibration-overlay />
    <app-walkthrough-overlay />
    <app-purge-overlay />
    <app-lockout-overlay />
    
    <div class="game-wrapper" 
         [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
         [class.trace-high-glitch]="gameService.detectionLevel() > 70"
         [class.walkthrough-active]="gameService.tutorialActive()"
         [class.mobile-sidebar-open]="mobileSidebarOpen()"
         [class.stability-mode]="gameService.settings().general.stability_mode">
         
      <!-- MAIN OPERATIONAL GRID -->
      <main class="operational-grid">
        <div class="primary-sector" role="main">
          @switch (gameService.activeTab()) {
            @case ('TERMINAL') {
              <div class="sector-panel terminal-wrapper">
                 <app-terminal />
              </div>
            }
            @case ('MISSIONS') {
              <div class="sector-panel">
                <app-missions />
                <div class="sub-split">
                   <app-bounty-board />
                   <app-threat-database />
                </div>
              </div>
            }
            @case ('HARDWARE') {
               <div class="sector-panel">
                  <app-hardware-shop />
                  <div class="sub-split">
                     <app-overclock-station />
                     <app-asset-vault />
                  </div>
               </div>
            }
            @case ('GRID') {
               <div class="sector-panel holographic-viz">
                  <app-globe />
                  <app-network />
               </div>
            }
            @case ('SOCIAL') {
               <div class="sector-panel">
                  <app-darknet-node />
                  <app-teams />
               </div>
            }
          }
        </div>

        <aside id="sidebar-sector" class="secondary-sector sidebar" [class.visible]="mobileSidebarOpen()" role="complementary">
          <div class="hud-panel-nested telemetry-card">
            <h2 class="sec-title">┌─ SYSTEM_TELEMETRY ────</h2>
            <app-system-integrity />
          </div>
          
          <div class="hud-panel-nested events-card">
            <h2 class="sec-title">├─ GLOBAL_NET_EVENTS ───</h2>
            <app-live-events />
          </div>

          <div class="hud-panel-nested inventory-card">
            <h2 class="sec-title">└─ INSTALLED_MODULES ───</h2>
            <div class="module-list">
               @for (item of gameService.inventory(); track $index) {
                  <div class="module-item">
                     <span class="m-code" aria-hidden="true">[M_{{ $index }}]</span>
                     <span class="m-name">{{ item.name }}</span>
                  </div>
               } @empty {
                  <div class="empty-status">NO MODULES CONNECTED</div>
               }
            </div>
          </div>
          <button class="mobile-close-sidebar" (click)="mobileSidebarOpen.set(false)">CLOSE_TELEMETRY</button>
        </aside>
      </main>

      <!-- TMUX STATUS BAR (Footer) -->
      <footer class="tmux-status-bar" role="banner">
        <div class="tmux-left">
          <span class="tmux-session-name">[VOID_RUN]</span>
          <nav class="tactical-tabs" role="tablist" aria-label="Primary Sectors">
            @for (tab of ['TERMINAL', 'MISSIONS', 'HARDWARE', 'GRID', 'SOCIAL']; track tab; let i = $index) {
              <button role="tab"
                      [attr.aria-selected]="gameService.activeTab() === tab"
                      (click)="gameService.clearTabNotification(tab)" 
                      [class.active]="gameService.activeTab() === tab"
                      [class.notified]="gameService.tabNotifications()[tab] > 0">
                {{ i }}:{{ tab.toLowerCase() }}{{ gameService.activeTab() === tab ? '*' : '-' }}
                @if (gameService.tabNotifications()[tab] > 0) {
                  <span class="badge" aria-label="{{ gameService.tabNotifications()[tab] }} new notifications">+{{ gameService.tabNotifications()[tab] }}</span>
                }
              </button>
            }
          </nav>
        </div>

        <div class="tmux-right" aria-label="System Statistics">
          <span class="stat" [attr.aria-label]="gameService.credits() + ' credits'">CR:{{ gameService.credits() }}</span> │
          <span class="stat" [attr.aria-label]="gameService.reputation() + ' reputation'">REP:{{ gameService.reputation() }}</span> │
          <span class="stat" [class.danger]="gameService.detectionLevel() > 60" [attr.aria-label]="gameService.detectionLevel() + ' percent trace detection'">TRACE:{{ gameService.detectionLevel() }}%</span> │
          <span class="stat active-val">UPLINK:72.61.80.234</span>
        </div>

        <button class="mobile-sidebar-toggle" (click)="toggleMobileSidebar()" [attr.aria-expanded]="mobileSidebarOpen()" aria-controls="sidebar-sector">
           [ TELEMETRY ]
        </button>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100dvh;
      background: var(--layer-0);
      overflow: hidden;
      color: var(--primary);
    }
    
    .game-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0;
      gap: 0;
      position: relative;
    }

    .tmux-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--primary);
      color: var(--layer-0);
      padding: 2px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-sm);
      font-weight: 700;
      flex-shrink: 0;
      z-index: 100;
      white-space: nowrap;
      overflow-x: auto;
    }

    .tmux-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .tmux-session-name {
      font-weight: 900;
    }

    .tactical-tabs {
      display: flex;
      gap: 10px;
    }

    .tactical-tabs button {
      background: transparent;
      border: none;
      color: var(--layer-0);
      padding: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-sm);
      cursor: pointer;
      position: relative;
    }

    .tactical-tabs button.active {
      font-weight: 900;
      text-decoration: underline;
    }

    .tmux-right {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .tmux-right .stat {
      font-weight: 700;
    }
    
    .tmux-right .stat.danger {
      color: var(--tertiary);
      background: var(--layer-0);
      padding: 0 4px;
    }

    .operational-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      flex-grow: 1;
      min-height: 0;
      border-bottom: 1px solid var(--primary);
    }

    .primary-sector {
      display: flex;
      flex-direction: column;
      min-height: 0;
      border-right: 1px solid var(--primary);
    }

    .sector-panel {
      background: var(--layer-0);
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .sector-panel > * {
       flex-grow: 1;
       overflow-y: auto;
       min-height: 0;
    }

    .sub-split {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
       border-top: 1px solid var(--primary);
    }

    .secondary-sector {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      min-height: 0;
      background: var(--layer-0);
    }

    .sec-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      font-weight: 900;
      color: var(--primary);
      padding: 4px 8px;
      margin: 0;
    }

    .telemetry-card, .events-card, .inventory-card {
      padding: 0.5rem;
      border-bottom: 1px dashed var(--primary);
    }

    .module-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; padding: 0 10px; }
    .module-item { 
       display: flex; 
       gap: 10px; 
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.75rem;
    }

    .mobile-sidebar-toggle, .mobile-close-sidebar { display: none; }

    /* RESPONSIVE OVERRIDES */
    @media (max-width: 1200px) {
      .operational-grid { grid-template-columns: 1fr; border-right: none; }
      .secondary-sector:not(.visible) { display: none; }
      
      .mobile-sidebar-toggle {
         display: block;
         background: var(--layer-0);
         color: var(--primary);
         border: 1px solid var(--layer-0);
         font-size: 0.7rem;
         padding: 2px 8px;
      }

      .secondary-sector.sidebar.visible {
         display: flex;
         position: fixed;
         top: 0; right: 0;
         width: 100%; height: calc(100dvh - 25px);
         background: var(--layer-0);
         z-index: 1000;
         padding: 1rem;
      }

      .mobile-close-sidebar {
         display: block;
         margin-top: auto;
         background: var(--tertiary);
         color: #fff;
         border: none;
      }
    }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  private route = inject(ActivatedRoute);

  mobileSidebarOpen = signal(false);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
        const token = params.get('token');
        if (token) {
            this.gameService.handleOAuthToken(token);
        }
    });
  }

  toggleMobileSidebar() {
     this.mobileSidebarOpen.update(v => !v);
     this.audioService.playClick();
  }
}
