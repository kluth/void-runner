import { Component, inject, OnInit } from '@angular/core';
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
    AssetVaultComponent
  ],
  template: `
    @if (!gameService.isConfigured()) {
      <app-config-wizard />
    }

    @if (gameService.isBooting()) {
      <app-boot-screen />
    }

    @if (gameService.authRequired()) {
      <app-auth class="glass-overlay" />
    }

    @if (gameService.matrixMode()) {
      <app-matrix-rain />
    }

    <app-intrusion-overlay />
    <app-hijack-overlay />
    <app-calibration-overlay />
    <app-walkthrough-overlay />
    
    <div class="game-wrapper" 
         [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
         [class.trace-high-glitch]="gameService.detectionLevel() > 70"
         [class.walkthrough-active]="gameService.tutorialActive()">
         
      <header class="hud-panel" [class.neural-highlight]="gameService.currentTutorialSelector() === 'STATS'">
        <div class="noise-data" style="top:4px; left:6px;">0x00219FF</div>
        
        <div class="logo-group">
          <div class="logo glitch-title" data-text="VOID_RUN">VOID_RUN</div>
          <div class="version">// PROTOCOL_OS_v4.0_STABLE</div>
        </div>
        
        <nav class="tactical-tabs">
          @for (tab of ['TERMINAL', 'MISSIONS', 'HARDWARE', 'GRID', 'SOCIAL']; track tab) {
            <button (click)="gameService.clearTabNotification(tab)" 
                    [class.active]="gameService.activeTab() === tab"
                    [class.notified]="gameService.tabNotifications()[tab] > 0">
              [ 0x_{{ tab.substring(0,4) }} ]
              @if (gameService.tabNotifications()[tab] > 0) {
                <span class="badge">{{ gameService.tabNotifications()[tab] }}</span>
              }
            </button>
          }
        </nav>

        <div class="stats-monolith">
          <div class="stat-unit">
            <span class="label">CREDITS</span>
            <span class="value">{{ gameService.credits() }}</span>
          </div>
          <div class="stat-unit">
            <span class="label">REP</span>
            <span class="value" style="color: var(--secondary)">{{ gameService.reputation() }}</span>
          </div>
          <div class="stat-unit" [class.danger]="gameService.detectionLevel() > 60">
            <span class="label">TRACE</span>
            <span class="value">{{ gameService.detectionLevel() }}%</span>
          </div>
        </div>
      </header>

      <main class="operational-grid">
        <div class="primary-sector">
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

        <div class="secondary-sector sidebar">
          <div class="hud-panel-nested telemetry-card">
            <div class="noise-data" style="bottom:4px; right:6px;">LOG_STREAM_CONNECTED</div>
            <div class="sec-title">SYSTEM_TELEMETRY</div>
            <app-system-integrity />
          </div>
          
          <div class="hud-panel-nested events-card">
            <div class="sec-title">GLOBAL_NET_EVENTS</div>
            <app-live-events />
          </div>

          <div class="hud-panel-nested inventory-card">
            <div class="sec-title">INSTALLED_MODULES</div>
            <div class="module-list">
               @for (item of gameService.inventory(); track $index) {
                  <div class="module-item">
                     <span class="m-code">[M_{{ $index }}]</span>
                     <span class="m-name">{{ item.name }}</span>
                  </div>
               } @empty {
                  <div class="empty-status">NO MODULES CONNECTED</div>
               }
            </div>
          </div>
        </div>
      </main>

      <footer class="system-footer">
        <div class="status-group">
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
      padding: 1.5rem;
      gap: 1.5rem;
      position: relative;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--layer-2);
      flex-shrink: 0;
      z-index: 100;
      gap: 3rem;
    }

    .logo-group { flex-shrink: 0; }
    .logo { 
      font-size: 2rem; 
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
    }

    .tactical-tabs button {
      background: var(--layer-3);
      border: var(--ghost-border);
      color: var(--primary);
      opacity: 0.5;
      padding: 14px 20px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.7rem;
      font-weight: 900;
      cursor: pointer;
      position: relative;
      transition: all 0.05s steps(2);
    }

    .tactical-tabs button.active {
      background: var(--layer-5);
      opacity: 1;
      color: #fff;
      box-shadow: var(--neon-shadow);
      transform: translateY(-2px);
    }

    .stats-monolith { display: flex; gap: 2.5rem; }
    .stat-unit { display: flex; flex-direction: column; align-items: flex-end; }
    .stat-unit .label { font-size: 0.5rem; color: var(--primary); opacity: 0.4; font-weight: 900; letter-spacing: 1px; }
    .stat-unit .value { font-size: 1.1rem; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; }
    .stat-unit.danger .value { color: var(--tertiary); animation: flicker 0.1s infinite; }

    .operational-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 1.5rem;
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
       grid-template-columns: 1fr 1fr;
       gap: 1rem;
       margin-top: 1rem;
    }

    .secondary-sector {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      overflow-y: auto;
      min-height: 0;
    }

    .sec-title {
      font-family: 'Space Grotesk', sans-serif;
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
      padding: 1rem 1.5rem;
      background: var(--layer-0);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.55rem;
      color: var(--primary);
      opacity: 0.4;
    }
    .active-val { color: var(--secondary); font-weight: 900; }

    @media (max-width: 1200px) {
      .operational-grid { grid-template-columns: 1fr; }
      .secondary-sector { display: none; }
    }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
        const token = params.get('token');
        if (token) {
            this.gameService.handleOAuthToken(token);
        }
    });
  }
}
