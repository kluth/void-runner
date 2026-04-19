import { Component, inject } from '@angular/core';
import { GameService } from './core/services/game.service';
import { AudioService } from './core/services/audio.service';
import { StreamerIntegrationService } from './core/services/streamer-integration.service';
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
    WalkthroughOverlayComponent
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
         [class.walkthrough-active]="gameService.tutorialActive()"
         [class.tabbed-mode]="gameService.settings().video.view_mode === 'TABBED'">
         
      <header [class.neural-highlight]="gameService.currentTutorialSelector() === 'STATS'">
        <div class="logo-group">
          <div class="logo glitch" data-text="VOID_RUNNER">VOID_RUNNER</div>
          <div class="version">// OMEGA_PHASE_v0.5.1</div>
        </div>
        
        @if (gameService.settings().video.view_mode === 'TABBED') {
          <nav class="tactical-tabs">
            <button (click)="gameService.clearTabNotification('TERMINAL')" [class.active]="gameService.activeTab() === 'TERMINAL'">
              TERMINAL
              @if (gameService.tabNotifications()['TERMINAL'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['TERMINAL'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('MISSIONS')" [class.active]="gameService.activeTab() === 'MISSIONS'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'MISSIONS'">
              MISSIONS
              @if (gameService.tabNotifications()['MISSIONS'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['MISSIONS'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('HARDWARE')" [class.active]="gameService.activeTab() === 'HARDWARE'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'HARDWARE'">
              MARKET
              @if (gameService.tabNotifications()['HARDWARE'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['HARDWARE'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('GRID')" [class.active]="gameService.activeTab() === 'GRID'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'GLOBE'">
              GRID
              @if (gameService.tabNotifications()['GRID'] > 0) {
                <span class="badge">{{ gameService.tabNotifications()['GRID'] }}</span>
              }
            </button>
            <button (click)="gameService.clearTabNotification('SOCIAL')" [class.active]="gameService.activeTab() === 'SOCIAL'" [class.neural-highlight]="gameService.currentTutorialSelector() === 'SOCIAL'">
              SOCIAL
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
            <span class="value research">{{ gameService.experience() }}</span>
          </div>
          <div class="stat-box">
            <span class="label">REP (WHITE-HAT)</span>
            <span class="value" style="color: #00ffff">{{ gameService.reputation() }}</span>
          </div>
          <div class="stat-box" [class.warning]="gameService.detectionLevel() > 70">
            <span class="label">TRACE</span>
            <span class="value" [class.danger]="gameService.detectionLevel() > 50">{{ gameService.detectionLevel() }}%</span>
          </div>
          <div class="stat-box">
            <span class="label">OPERATIVES</span>
            <span class="value" style="color: #00ff00">{{ gameService.activeOperatives() }}</span>
          </div>
          <div class="stat-box">
            <span class="label">IDENTITY_UPLINK</span>
            @if (gameService.isAuthenticated()) {
              <span class="value" style="color: #00ff00; text-shadow: 0 0 10px #0f0;">VERIFIED [{{ gameService.playerData()?.username }}]</span>
            } @else {
              <span class="value" style="color: #ffaa00">GHOST (UNSYNCED)</span>
            }
          </div>
          <div class="music-player">
            <span class="label">NEURAL_AUDIO_STREAM</span>
            <span class="track-name">{{ audioService.currentTrack() }}</span>
            <button class="audio-toggle" (click)="audioService.toggleMusic()">
              <span class="icon">🔊</span> <span class="btn-text">TOGGLE</span>
            </button>
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
                <app-missions />
                <div class="sidebar">
                  <app-internal-network />
                  <app-malware-sandbox />
                </div>
              </div>
            }
            @case ('HARDWARE') {
              <div class="sector-split">
                <app-hardware-shop />
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
      background: #030303;
      color: #00ff00;
      font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
      overflow: hidden;
    }
    
    .scanline::before {
      content: " ";
      display: block;
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
      z-index: 2000;
      background-size: 100% 2px, 3px 100%;
      pointer-events: none;
    }

    .game-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
      box-sizing: border-box;
      gap: 1rem;
      transition: all 1s ease;
      position: relative;
      overflow: hidden;
    }

    .game-wrapper.walkthrough-active main > div > *,
    .game-wrapper.walkthrough-active .tab-viewport > *,
    .game-wrapper.walkthrough-active header {
      opacity: 0.15;
      filter: grayscale(1) blur(2px);
      transition: all 0.5s ease;
      pointer-events: none;
    }

    .game-wrapper.walkthrough-active .neural-highlight {
      opacity: 1 !important;
      filter: grayscale(0) blur(0) !important;
      box-shadow: 0 0 40px rgba(0, 255, 0, 0.3);
      border: 1px solid #00ff00;
      z-index: 100;
      transform: scale(1.02);
      background: rgba(0, 20, 0, 0.9);
    }

    .game-wrapper.matrix { filter: sepia(1) saturate(2) hue-rotate(80deg); }
    .game-wrapper.distorted { 
      filter: contrast(1.2) brightness(1.2) hue-rotate(5deg);
      animation: stress-shake 0.2s infinite;
    }

    @keyframes stress-shake {
      0% { transform: translate(0,0); }
      25% { transform: translate(2px, -1px); }
      50% { transform: translate(-1px, 2px); }
      75% { transform: translate(-2px, -1px); }
      100% { transform: translate(0,0); }
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(10, 10, 10, 0.8);
      border: 1px solid #111;
      flex-wrap: wrap;
      gap: 1rem;
      flex-shrink: 0;
    }

    .tactical-tabs {
      display: flex;
      gap: 5px;
      flex-grow: 1;
      justify-content: center;
    }

    .tactical-tabs button {
      background: transparent;
      border: 1px solid #111;
      color: #008800;
      padding: 10px 20px;
      font-family: inherit;
      font-size: 0.7rem;
      font-weight: bold;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
    }

    .tactical-tabs button.active {
      border-color: #00ff00;
      color: #00ff00;
      background: rgba(0, 255, 0, 0.05);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.1);
    }

    .tactical-tabs button .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff0000;
      color: #fff;
      font-size: 0.6rem;
      padding: 2px 5px;
      border-radius: 10px;
      box-shadow: 0 0 10px #f00;
    }

    .logo-group { flex-shrink: 0; }
    .logo { font-size: clamp(1.2rem, 4vw, 1.8rem); font-weight: 900; color: #00ff00; letter-spacing: 4px; }
    .version { font-size: 0.6rem; color: #006600; margin-top: 2px; }

    .stats { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; flex-grow: 1; justify-content: flex-end; }
    .stat-box { display: flex; flex-direction: column; align-items: flex-end; min-width: 4rem; }
    .stat-box .label { font-size: 0.5rem; color: #008800; white-space: nowrap; }
    .stat-box .value { font-size: 0.9rem; font-weight: bold; color: #fff; }
    .stat-box .value.research { color: #ff00ff; }
    .stat-box .value.danger { color: #ff0000; text-shadow: 0 0 8px #f00; }
    .stat-box.warning .value { animation: pulse 0.5s infinite alternate; }

    @keyframes pulse { from { opacity: 1; } to { opacity: 0.5; } }

    .music-player {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #001100;
      border: 1px solid #00ff00;
      padding: 0.25rem 0.5rem;
      min-width: 8rem;
    }
    .music-player .label { font-size: 0.4rem; color: #00ff00; letter-spacing: 1px; margin-bottom: 2px; }
    .music-player .track-name { font-size: 0.6rem; color: #fff; font-weight: bold; margin-bottom: 5px; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 10rem; }

    .audio-toggle {
      background: #003300;
      border: 1px solid #00ff00;
      color: #00ff00;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.5rem;
      text-transform: uppercase;
      width: 100%;
    }

    main, .tab-viewport {
      display: grid;
      gap: 1rem;
      flex-grow: 1;
      overflow: hidden;
      min-height: 0;
    }

    main {
      grid-template-columns: 1fr 25rem;
    }

    .full-sector { height: 100%; overflow: hidden; }
    .sector-split { display: grid; grid-template-columns: 1fr 25rem; gap: 1rem; height: 100%; }
    .grid-sector { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 1rem; height: 100%; }
    .grid-sector .large { grid-row: span 2; }
    .social-sector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 100%; }

    @media (max-width: 1200px) {
      main, .sector-split {
        grid-template-columns: 1fr 20rem;
      }
    }

    @media (max-width: 1024px) {
      main, .sector-split, .grid-sector, .social-sector {
        grid-template-columns: 1fr !important;
        grid-template-rows: auto !important;
        overflow-y: auto;
      }
      :host { overflow-y: auto; }
      .game-wrapper { height: auto; min-height: 100dvh; overflow: visible; }
      .left-panel, .right-panel, .sidebar { overflow-y: visible !important; height: auto !important; }
      .stats { justify-content: flex-start; }
    }

    @media (max-width: 600px) {
      .btn-text { display: none; }
      .music-player { min-width: 3rem; width: auto; }
      header { flex-direction: column; align-items: center; text-align: center; }
      .logo-group { width: 100%; }
      .stats { justify-content: center; gap: 0.75rem; width: 100%; }
      .stat-box { align-items: center; min-width: 3.5rem; }
      .stat-box .value { font-size: 0.8rem; }
      .tactical-tabs { overflow-x: auto; width: 100%; padding-bottom: 5px; }
      .tactical-tabs button { padding: 5px 10px; font-size: 0.6rem; }
    }

    .left-panel, .right-panel, .sidebar {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 1rem;
      min-height: 0;
    }

    .viz-card { background: #000; border: 1px solid #1a1a1a; padding: 0.25rem; width: 100%; box-sizing: border-box; }
    app-globe { display: block; width: 100%; aspect-ratio: 1; }

    .inventory-section { background: rgba(15, 15, 15, 0.9); border: 1px solid #222; padding: 1rem; }
    .sec-header { font-size: 0.6rem; color: #555; border-bottom: 1px solid #222; padding-bottom: 0.5rem; margin-bottom: 0.75rem; letter-spacing: 2px; }
    .inventory-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: 0.5rem; }
    .inventory-item { background: #000; border-left: 3px solid #00ff00; padding: 0.5rem; display: flex; flex-direction: column; font-size: 0.6rem; }
    .inventory-item .name { color: #fff; font-weight: bold; }
    .inventory-item .tag { color: #00aa00; font-size: 0.8em; margin-top: 2px; }
    .empty-inv { font-size: 0.6rem; color: #333; text-align: center; padding: 0.5rem; }

    .footer-bar { font-size: 0.5rem; color: #333; padding: 0.5rem; border-top: 1px solid #111; flex-shrink: 0; }
    .status-ok { color: #008800; }
    .matrix-text { color: #00ff00; font-weight: bold; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #1a1a1a; }

    /* Glitch Effect */
    .glitch { position: relative; }
    .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .glitch::before { left: 2px; text-shadow: -2px 0 #ff00ff; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 5s infinite linear alternate-reverse; }
    .glitch::after { left: -2px; text-shadow: -2px 0 #00ffff; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim2 5s infinite linear alternate-reverse; }
    @keyframes glitch-anim { 0% { clip: rect(31px, 9999px, 94px, 0); } 20% { clip: rect(62px, 9999px, 42px, 0); } 100% { clip: rect(89px, 9999px, 98px, 0); } }
    @keyframes glitch-anim2 { 0% { clip: rect(10px, 9999px, 30px, 0); } 20% { clip: rect(40px, 9999px, 10px, 0); } 100% { clip: rect(80px, 9999px, 20px, 0); } }
  `
})
export class AppComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
}
