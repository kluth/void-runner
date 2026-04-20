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
    PurgeOverlayComponent
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
    
    <div class="game-wrapper" 
         [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
         [class.trace-high-glitch]="gameService.detectionLevel() > 70"
         [class.walkthrough-active]="gameService.tutorialActive()"
         [class.mobile-sidebar-open]="mobileSidebarOpen()"
         [class.stability-mode]="gameService.settings().general.stability_mode">
         
      <!-- HUD HEADER -->
      <header class="hud-panel" [class.neural-highlight]="gameService.currentTutorialSelector() === 'STATS'" role="banner">
        <div class="noise-data" style="top:4px; left:6px;" aria-hidden="true">0x00219FF</div>
        
        <div class="logo-group">
          <div class="logo glitch-title" data-text="VOID_RUN">VOID_RUN</div>
          <div class="version" aria-label="Protocol Version 4.0 Stable">// PROTOCOL_OS_v4.0_STABLE</div>
        </div>
        
        <nav class="tactical-tabs" role="tablist" aria-label="Primary Sectors">
          @for (tab of ['TERMINAL', 'MISSIONS', 'HARDWARE', 'GRID', 'SOCIAL']; track tab) {
            <button role="tab"
                    [attr.aria-selected]="gameService.activeTab() === tab"
                    (click)="gameService.clearTabNotification(tab)" 
                    [class.active]="gameService.activeTab() === tab"
                    [class.notified]="gameService.tabNotifications()[tab] > 0">
              <span class="sr-only">Switch to </span>
              [ 0x_{{ tab.substring(0,4) }} ]
              @if (gameService.tabNotifications()[tab] > 0) {
                <span class="badge" aria-label="{{ gameService.tabNotifications()[tab] }} new notifications">{{ gameService.tabNotifications()[tab] }}</span>
              }
            </button>
          }
        </nav>

        <div class="stats-monolith" aria-label="System Statistics">
          <div class="stat-unit">
            <span class="label">CREDITS</span>
            <span class="value" [attr.aria-label]="gameService.credits() + ' credits'">{{ gameService.credits() }}</span>
          </div>
          <div class="stat-unit">
            <span class="label">REP</span>
            <span class="value" style="color: var(--secondary)" [attr.aria-label]="gameService.reputation() + ' reputation'">{{ gameService.reputation() }}</span>
          </div>
          <div class="stat-unit" [class.danger]="gameService.detectionLevel() > 60">
            <span class="label">TRACE</span>
            <span class="value" [attr.aria-label]="gameService.detectionLevel() + ' percent trace detection'">{{ gameService.detectionLevel() }}%</span>
          </div>
        </div>

        <button class="mobile-sidebar-toggle" (click)="toggleMobileSidebar()" [attr.aria-expanded]="mobileSidebarOpen()" aria-controls="sidebar-sector">
           [ 0x_TELEMETRY ]
        </button>
      </header>

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
            <div class="noise-data" style="bottom:4px; right:6px;" aria-hidden="true">LOG_STREAM_CONNECTED</div>
            <h2 class="sec-title">SYSTEM_TELEMETRY</h2>
            <app-system-integrity />
          </div>
          
          <div class="hud-panel-nested events-card">
            <h2 class="sec-title">GLOBAL_NET_EVENTS</h2>
            <app-live-events />
          </div>

          <div class="hud-panel-nested inventory-card">
            <h2 class="sec-title">INSTALLED_MODULES</h2>
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

      <footer class="system-footer" role="contentinfo">
        <div class="status-group" aria-label="System Uplink Status">
          UPLINK: <span class="active-val">CONNECTED_72.61.80.234</span> | 
          CORE: <span class="active-val">STABLE</span> | 
          HANDSHAKE: <span class="active-val">VERIFIED</span>
        </div>
        <div class="timestamp">{{ gameService.experience() }} DATA_SHARDS_RECOVERED</div>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100dvh;
      background: var(--layer-0);
      overflow: hidden;
    }
    
    .game-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--spacing-md);
      gap: var(--spacing-md);
      position: relative;
      transition: transform 0.3s steps(4);
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--layer-2);
      flex-shrink: 0;
      z-index: 100;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .logo-group { flex-shrink: 0; }
    .logo { 
      font-size: var(--font-size-lg); 
      font-weight: 900; 
      color: var(--primary); 
      letter-spacing: -0.05em; 
    }
    .version { font-size: 0.55rem; color: var(--primary); opacity: 0.4; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .tactical-tabs {
      display: flex;
      gap: 4px;
      flex-grow: 1;
      justify-content: center;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tactical-tabs::-webkit-scrollbar { display: none; }

    .tactical-tabs button {
      background: var(--layer-3);
      border: var(--ghost-border);
      color: var(--primary);
      opacity: 0.5;
      padding: 10px 14px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: var(--font-size-xs);
      font-weight: 900;
      cursor: pointer;
      position: relative;
      transition: all 0.05s steps(2);
      white-space: nowrap;
    }

    .tactical-tabs button.active {
      background: var(--layer-5);
      opacity: 1;
      color: #fff;
      box-shadow: var(--neon-shadow);
      transform: translateY(-2px);
    }

    .stats-monolith { display: flex; gap: var(--spacing-md); }
    .stat-unit { display: flex; flex-direction: column; align-items: flex-end; }
    .stat-unit .label { font-size: 0.5rem; color: var(--primary); opacity: 0.4; font-weight: 900; letter-spacing: 1px; }
    .stat-unit .value { font-size: var(--font-size-sm); font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; }
    .stat-unit.danger .value { color: var(--tertiary); animation: flicker 0.1s infinite; }

    .operational-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: var(--spacing-md);
      flex-grow: 1;
      min-height: 0;
    }

    .primary-sector {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .sector-panel {
      background: var(--layer-1);
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
       gap: var(--spacing-md);
       margin-top: 1rem;
    }

    .secondary-sector {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      overflow-y: auto;
      min-height: 0;
    }

    .sec-title {
      font-size: 0.65rem;
      font-weight: 900;
      color: var(--primary);
      opacity: 0.4;
      background: var(--layer-4);
      padding: 6px 12px;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }

    .telemetry-card, .events-card, .inventory-card {
      padding: 1rem;
    }

    .module-list { display: flex; flex-direction: column; gap: 8px; }
    .module-item { 
       background: var(--layer-4); 
       padding: 10px; 
       font-size: 0.65rem; 
       display: flex; 
       gap: 10px; 
       font-family: 'JetBrains Mono', monospace;
    }
    .m-code { color: var(--secondary); font-weight: 900; }
    .m-name { color: #fff; }

    .system-footer {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--layer-0);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.55rem;
      color: var(--primary);
      opacity: 0.4;
      flex-wrap: wrap;
      gap: 10px;
    }
    .active-val { color: var(--secondary); font-weight: 900; }

    .mobile-sidebar-toggle, .mobile-close-sidebar { display: none; }

    /* RESPONSIVE OVERRIDES */
    @media (max-width: 1200px) {
      .operational-grid { grid-template-columns: 1fr; }
      .secondary-sector:not(.visible) { display: none; }
      
      .mobile-sidebar-toggle {
         display: block;
         background: var(--layer-4);
         color: var(--secondary);
         font-size: 0.6rem;
         padding: 8px 12px;
      }

      .secondary-sector.sidebar.visible {
         display: flex;
         position: fixed;
         top: 0; right: 0;
         width: 100%; height: 100dvh;
         background: var(--layer-1);
         z-index: 1000;
         padding: 2rem;
         animation: slide-in 0.3s steps(4);
      }

      @keyframes slide-in {
         from { transform: translateX(100%); }
         to { transform: translateX(0); }
      }

      .mobile-close-sidebar {
         display: block;
         margin-top: auto;
         background: var(--tertiary);
         color: #fff;
         border: none;
      }
    }

    @media (max-width: 600px) {
       header { flex-direction: column; align-items: stretch; text-align: center; }
       .logo-group { margin-bottom: 10px; }
       .stats-monolith { justify-content: space-between; order: -1; margin-bottom: 15px; }
       .tactical-tabs { width: 100%; justify-content: flex-start; padding-bottom: 5px; }
       .mobile-sidebar-toggle { width: 100%; margin-top: 10px; }
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
