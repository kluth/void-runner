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
    <h1 class="sr-only">VOID_RUN Protocol - High Fidelity Terminal Session</h1>

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
         
      <main class="operational-grid">
        <div class="primary-sector" role="main">
          @switch (gameService.activeTab()) {
            @case ('TERMINAL') {
              <div class="sector-panel">
                 <app-terminal />
              </div>
            }
            @case ('MISSIONS') {
              <div class="sector-panel">
                <app-missions />
              </div>
            }
            @case ('HARDWARE') {
               <div class="sector-panel">
                  <app-hardware-shop />
               </div>
            }
            @case ('GRID') {
               <div class="sector-panel">
                  <div class="holographic-preview terminal-frame" (click)="toggleGlobeModal()" role="button" aria-label="Expand Globe">
                     <div class="ascii-line">HOLOGRAPHIC_GRID_UPLINK</div>
                     <app-globe />
                  </div>
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
          <div class="telemetry-card terminal-frame">
            <h2 class="ascii-line">SYSTEM_TELEMETRY</h2>
            <app-system-integrity />
          </div>
          
          <div class="events-card terminal-frame">
            <h2 class="ascii-line">GLOBAL_NET_EVENTS</h2>
            <app-live-events />
          </div>

          <div class="inventory-card terminal-frame">
            <h2 class="ascii-line">INSTALLED_MODULES</h2>
            <div class="module-list">
               @for (item of gameService.inventory(); track $index) {
                  <div class="module-item">
                     <span class="m-code">0{{ $index }}:</span>
                     <span class="m-name">{{ item.name }}</span>
                  </div>
               } @empty {
                  <div class="empty-status">NO_CONNECTED_MODULES</div>
               }
            </div>
          </div>
          <button class="mobile-close-sidebar primary" (click)="mobileSidebarOpen.set(false)">[ CLOSE_TELEMETRY ]</button>
        </aside>
      </main>

      <!-- TMUX STATUS BAR -->
      <footer class="tmux-status-bar" role="navigation">
        <div class="tmux-left">
          <span class="session-label hidden-xs">[VOID_RUN]</span>
          <nav class="tactical-tabs" role="tablist">
            @for (tab of ['TERMINAL', 'MISSIONS', 'HARDWARE', 'GRID', 'SOCIAL']; track tab; let i = $index) {
              <button role="tab"
                      [attr.aria-selected]="gameService.activeTab() === tab"
                      (click)="gameService.clearTabNotification(tab)" 
                      [class.active]="gameService.activeTab() === tab">
                {{ i }}:{{ tab.toLowerCase() }}{{ gameService.activeTab() === tab ? '*' : '-' }}
              </button>
            }
          </nav>
        </div>

        <div class="tmux-right">
          <span class="stat">CR:{{ gameService.credits() }}</span>
          <span class="stat-sep">|</span>
          <span class="stat">REP:{{ gameService.reputation() }}</span>
          <span class="stat-sep">|</span>
          <span class="stat" [class.danger]="gameService.detectionLevel() > 60">TR:{{ gameService.detectionLevel() }}%</span>
          <span class="stat-sep hidden-xs">|</span>
          <span class="stat hidden-xs">IP:72.61.80.234</span>
        </div>

        <button class="mobile-sidebar-toggle primary" (click)="toggleMobileSidebar()" [attr.aria-expanded]="mobileSidebarOpen()" aria-label="Toggle Telemetry">
           [ T ]
        </button>
      </footer>

      @if (globeModalOpen()) {
         <div class="globe-modal-overlay glass-overlay" (click)="toggleGlobeModal()" role="dialog" aria-modal="true">
            <div class="modal-content terminal-frame" (click)="$event.stopPropagation()">
               <div class="modal-header">
                  <span class="ascii-line">HOLOGRAPHIC_GRID_MAP_FULL</span>
                  <button (click)="toggleGlobeModal()">[ X ]</button>
               </div>
               <app-globe />
            </div>
         </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh; height: 100dvh;
      background: var(--layer-0);
      overflow: hidden;
      color: var(--primary);
    }
    
    .game-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0;
    }

    .operational-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      flex-grow: 1;
      min-height: 0;
    }

    .primary-sector {
      display: flex;
      flex-direction: column;
      min-height: 0;
      border-right: 1px solid var(--primary);
      min-width: 0;
    }

    .sector-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .sector-panel > * {
       flex-grow: 1;
       overflow-y: auto;
       min-height: 0;
    }

    .holographic-preview {
       height: 25vh;
       min-height: 150px;
       margin: 10px;
       cursor: pointer;
    }
    .holographic-preview app-globe { height: 100%; pointer-events: none; opacity: 0.6; }

    .secondary-sector {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      overflow-y: auto;
      min-height: 0;
      background: var(--layer-0);
    }

    .module-list { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
    .module-item { font-size: 0.75rem; opacity: 0.8; display: flex; gap: 10px; }
    .m-code { color: var(--secondary); font-weight: bold; }

    .tmux-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--primary);
      color: var(--layer-0);
      padding: 2px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
      z-index: 100;
      white-space: nowrap;
    }

    .tmux-left, .tmux-right { display: flex; align-items: center; gap: 12px; }
    .session-label { font-weight: 900; }
    .tactical-tabs { display: flex; gap: 10px; }
    .tactical-tabs button {
      background: transparent; border: none; color: var(--layer-0);
      padding: 0; font-family: inherit; font-size: inherit; cursor: pointer;
    }
    .tactical-tabs button.active { font-weight: 900; text-decoration: underline; }

    .stat.danger { background: var(--layer-0); color: var(--tertiary); padding: 0 4px; }
    .stat-sep { opacity: 0.5; }

    .mobile-sidebar-toggle, .mobile-close-sidebar { display: none; }

    .globe-modal-overlay {
       position: fixed; top: 0; left: 0; width: 100%; height: 100%;
       display: flex; align-items: center; justify-content: center;
       padding: var(--spacing-md);
    }
    .modal-content { width: 100%; max-width: 900px; padding: var(--spacing-md); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .modal-content app-globe { height: 60vh; min-height: 300px; }

    @media (max-width: 1200px) {
      .operational-grid { grid-template-columns: 1fr; border-right: none; }
      .primary-sector { border-right: none; }
      .secondary-sector:not(.visible) { display: none; }
      
      .mobile-sidebar-toggle { display: block; height: 18px; padding: 0 6px; line-height: 1; margin-left: 10px; }

      .secondary-sector.sidebar.visible {
         display: flex;
         position: fixed;
         top: 0; left: 0;
         width: 100%; height: calc(100vh - 24px);
         background: var(--layer-0);
         z-index: 1000;
         padding: var(--spacing-md);
      }
      .mobile-close-sidebar { display: block; }
    }

    @media (max-width: 600px) {
       .hidden-xs { display: none; }
       .tmux-left, .tmux-right { gap: 6px; }
       .tactical-tabs { gap: 6px; }
       .stat { font-size: 0.7rem; }
    }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  private route = inject(ActivatedRoute);

  mobileSidebarOpen = signal(false);
  globeModalOpen = signal(false);

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

  toggleGlobeModal() {
     this.globeModalOpen.update(v => !v);
     this.audioService.playClick();
  }
}
