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
      <app-auth />
    }

    @if (gameService.matrixMode()) {
      <app-matrix-rain />
    }

    <app-intrusion-overlay />
    <app-hijack-overlay />
    <app-calibration-overlay />
    <app-walkthrough-overlay />
    
    <div class="game-wrapper" 
         [class.scanline]="gameService.settings().video.scanlines" 
         [class.matrix]="gameService.matrixMode()" 
         [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
         [class.trace-high-glitch]="gameService.detectionLevel() > 70"
         [class.walkthrough-active]="gameService.tutorialActive()"
         [class.tabbed-mode]="gameService.settings().video.view_mode === 'TABBED'"
         [class.os-android]="gameService.detectedOS() === 'ANDROID'"
         [class.os-ios]="gameService.detectedOS() === 'IOS'"
         [class.os-windows]="gameService.detectedOS() === 'WINDOWS'"
         [class.os-mac]="gameService.detectedOS() === 'MAC'"
         [class.os-linux]="gameService.detectedOS() === 'LINUX'">
         
      <header class="hud-panel" [class.neural-highlight]="gameService.currentTutorialSelector() === 'STATS'">
        <div class="logo-group">
          <div class="logo glitch-title" data-text="VOID_RUN">VOID_RUN</div>
          <div class="version">// NEURAL_VOID_OS_v4.0</div>
        </div>
        
        @if (gameService.settings().video.view_mode === 'TABBED') {
          <nav class="tactical-tabs">
            <button (click)="gameService.clearTabNotification('TERMINAL')" [class.active]="gameService.activeTab() === 'TERMINAL'">
              [ 0x_TERM ]
              @if (gameService.tabNotifications()['TERMINAL'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['TERMINAL'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('MISSIONS')" [class.active]="gameService.activeTab() === 'MISSIONS'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'MISSIONS'">
              [ 0x_OPS ]
              @if (gameService.tabNotifications()['MISSIONS'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['MISSIONS'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('HARDWARE')" [class.active]="gameService.activeTab() === 'HARDWARE'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'HARDWARE'">
              [ 0x_RIG ]
              @if (gameService.tabNotifications()['HARDWARE'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['HARDWARE'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('GRID')" [class.active]="gameService.activeTab() === 'GRID'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'GLOBE'">
              [ 0x_GRID ]
              @if (gameService.tabNotifications()['GRID'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['GRID'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('SOCIAL')" [class.active]="gameService.activeTab() === 'SOCIAL'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'SOCIAL'">
              [ 0x_NODE ]
              @if (gameService.tabNotifications()['SOCIAL'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['SOCIAL'] }}</span>
              }
            </button>
          </nav>
        }

        <div class="stats">
          <div class="stat-box">
            <span class="label">CREDITS</span>
            <span class="value">{{ gameService.credits() }}</span>
          </div>
          <div class="stat-box">
            <span class="label">DATA</span>
            <span class="value" style="color: var(--warning-magenta)">{{ gameService.experience() }}</span>
          </div>
          <div class="stat-box">
            <span class="label">REP</span>
            <span class="value" style="color: var(--tactical-cyan)">{{ gameService.reputation() }}</span>
          </div>
          <div class="stat-box" [class.warning]="gameService.detectionLevel() > 70">
            <span class="label">TRACE</span>
            <span class="value" [class.danger]="gameService.detectionLevel() > 50">{{ gameService.detectionLevel() }}%</span>
          </div>
          <div class="stat-box">
            <span class="label">UPLINK</span>
            @if (gameService.isAuthenticated()) {
              <span class="value" style="color: var(--secondary); text-shadow: 0 0 10px var(--secondary);">VERIFIED</span>
            } @else {
              <span class="value" style="color: #ffaa00">GHOST</span>
            }
          </div>
        </div>
      </header>

      @if (gameService.settings().video.view_mode === 'TABBED') {
        <div class="tab-viewport">
          @switch (gameService.activeTab()) {
            @case ('TERMINAL') {
              <div class="full-sector"><app-terminal /></div>
            }
            @case ('MISSIONS') {
              <div class="sector-split">
                <div class="mission-hub">
                  <app-missions />
                  <div class="mission-subs">
                    <app-bounty-board />
                    <app-threat-database />
                  </div>
                </div>
                <div class="sidebar">
                  <app-internal-network />
                  <app-malware-sandbox />
                </div>
              </div>
            }
            @case ('HARDWARE') {
              <div class="sector-split">
                <div class="hardware-hub">
                  <app-hardware-shop />
                  <div class="hardware-subs">
                    <app-overclock-station />
                    <app-asset-vault />
                  </div>
                </div>
                <div class="inventory-section highlighted">
                    <div class="sec-header">INSTALLED_MODULES</div>
                    <div class="inventory-list">
                    @for (item of gameService.inventory(); track $index) {
                        <div class="inventory-item">
                        <span class="name">{{ item.name }}</span>
                        <span class="tag">{{ item.bonusType.toUpperCase() }}</span>
                        </div>
                    } @empty {
                        <div class="empty-inv">NO MODULES CONNECTED</div>
                    }
                    </div>
                </div>
              </div>
            }
            @case ('GRID') {
              <div class="grid-sector">
                <div class="viz-card large"><app-globe /></div>
                <app-network />
                <app-live-events />
              </div>
            }
            @case ('SOCIAL') {
              <div class="social-sector">
                <app-darknet-node />
                <app-teams />
              </div>
            }
          }
        </div>
      } @else {
        <main>
            <div class="left-panel">
            <app-terminal [class.neural-highlight]="gameService.currentTutorialSelector() === 'TERMINAL'" />
            <app-teams />
            <app-darknet-node [class.neural-highlight]="gameService.currentTutorialSelector() === 'SOCIAL'" />
            <app-internal-network />
            <app-missions [class.neural-highlight]="gameService.currentTutorialSelector() === 'MISSIONS'" />
            </div>
            <div class="right-panel">
            <div class="viz-card" [class.neural-highlight]="gameService.currentTutorialSelector() === 'GLOBE'">
                <app-globe />
            </div>
            <app-live-events />
            <app-system-integrity />
            <app-malware-sandbox />
            <app-network />
            <app-hardware-shop [class.neural-highlight]="gameService.currentTutorialSelector() === 'HARDWARE'" />
            <div class="inventory-section">
                <div class="sec-header">INSTALLED_MODULES</div>
                <div class="inventory-list">
                @for (item of gameService.inventory(); track $index) {
                    <div class="inventory-item">
                    <span class="name">{{ item.name }}</span>
                    <span class="tag">{{ item.bonusType.toUpperCase() }}</span>
                    </div>
                } @empty {
                    <div class="empty-inv">NO MODULES CONNECTED</div>
                }
                </div>
            </div>
            </div>
        </main>
      }

      <div class="footer-bar">
        <div class="status-group">
          SYSTEM_STATUS: <span class="status-ok">OPERATIONAL</span> | ENCRYPTION: <span class="status-ok">AES-256</span> | SIGNAL: <span class="status-ok">STABLE</span>
          @if (gameService.matrixMode()) { | <span class="matrix-text">WAKE_UP_NEO</span> }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100dvh;
      background: var(--layer-0);
      color: var(--primary);
      font-family: 'Space Grotesk', sans-serif;
      overflow: hidden;
    }
    
    .game-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
      box-sizing: border-box;
      gap: 1.5rem; /* Increased gap for asymmetric feel */
      transition: all 1s steps(4);
      position: relative;
      overflow: hidden;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: var(--layer-2);
      border-bottom: var(--ghost-border);
      flex-wrap: wrap;
      gap: 2rem;
      flex-shrink: 0;
      position: relative;
      z-index: 100;
    }

    .tactical-tabs {
      display: flex;
      gap: 8px;
      flex-grow: 1;
      justify-content: center;
    }

    .tactical-tabs button {
      background: var(--layer-3);
      border: var(--ghost-border);
      color: var(--secondary);
      padding: 12px 20px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.7rem;
      font-weight: 900;
      cursor: pointer;
      position: relative;
      transition: all 0.05s steps(2);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .tactical-tabs button.active {
      background: var(--layer-5);
      color: var(--primary);
      border-color: var(--primary);
      box-shadow: var(--neon-shadow);
    }

    .tactical-tabs button .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--tertiary);
      color: #fff;
      font-size: 0.5rem;
      padding: 2px 4px;
      box-shadow: 0 0 10px var(--tertiary);
      z-index: 10;
    }

    .logo-group { flex-shrink: 0; }
    .logo { 
        font-family: 'Space Grotesk', sans-serif;
        font-size: clamp(1.4rem, 5vw, 2.2rem); 
        font-weight: 900; 
        color: var(--primary); 
        letter-spacing: -0.05em; 
    }
    .version { font-size: 0.55rem; color: var(--primary); margin-top: 4px; opacity: 0.4; font-family: 'JetBrains Mono', monospace; }

    .stats { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; flex-grow: 1; justify-content: flex-end; }
    .stat-box { display: flex; flex-direction: column; align-items: flex-end; min-width: 4rem; }
    .stat-box .label { font-size: 0.55rem; color: var(--primary); opacity: 0.5; margin-bottom: 2px; font-weight: 900; }
    .stat-box .value { font-size: 0.9rem; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; }
    .stat-box.warning .value { animation: pulse 0.5s steps(2) infinite alternate; color: var(--tertiary); }

    @keyframes pulse { from { opacity: 1; } to { opacity: 0.5; } }

    main, .tab-viewport {
      display: grid;
      gap: 1.5rem;
      flex-grow: 1;
      overflow: hidden;
      min-height: 0;
    }

    /* ASYMMETRIC GRID: 1.2fr / 0.8fr split */
    main {
      grid-template-columns: 1.2fr 0.8fr;
    }

    .full-sector { height: 100%; overflow: hidden; }
    .sector-split { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; height: 100%; }
    
    .left-panel, .right-panel, .sidebar {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 1.5rem;
      min-height: 0;
    }

    .viz-card { background: var(--layer-1); border: var(--ghost-border); padding: 0.5rem; width: 100%; box-sizing: border-box; }
    
    .inventory-section { background: var(--layer-2); padding: 1rem; border: var(--ghost-border); }
    .sec-header { font-size: 0.6rem; color: var(--primary); opacity: 0.4; border-bottom: var(--ghost-border); padding-bottom: 0.5rem; margin-bottom: 0.75rem; letter-spacing: 2px; font-weight: 900; }
    
    .footer-bar { font-size: 0.55rem; color: var(--primary); padding: 0.75rem; background: var(--layer-0); border-top: var(--ghost-border); flex-shrink: 0; opacity: 0.6; font-family: 'JetBrains Mono', monospace; }
    .status-ok { color: var(--secondary); font-weight: 900; }
    
    /* Global Scanline Integration */
    .scanline::after {
      content: " ";
      display: block;
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
      z-index: 2000;
      background-size: 100% 2px;
      pointer-events: none;
      opacity: var(--scanline-opacity);
    }
  `

})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Neural Link: Global Token Extraction Protocol
    // Detects tokens from OAuth redirects even if AuthComponent isn't rendered
    this.route.queryParamMap.subscribe(params => {
        const token = params.get('token');
        if (token) {
            console.log('[UPLINK] Neural token detected in global sector.');
            this.gameService.handleOAuthToken(token);
        }
    });
  }
}
