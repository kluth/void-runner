import { Component, inject } from '@angular/core';
import { GameService } from './core/services/game.service';
import { AudioService } from './core/services/audio.service';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
    ConfigWizardComponent
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
    
    <div class="game-wrapper scanline" [class.matrix]="gameService.matrixMode()" [class.distorted]="gameService.isDistorted()">
      <header>
        <div class="logo-group">
          <div class="logo glitch" data-text="VOID_RUNNER">VOID_RUNNER</div>
          <div class="version">// OMEGA_PHASE_v0.5.1</div>
        </div>
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
          <div class="music-player">
            <span class="label">NEURAL_AUDIO_STREAM</span>
            <span class="track-name">{{ audioService.currentTrack() }}</span>
            <button class="audio-toggle" (click)="audioService.toggleMusic()">
              <span class="icon">🔊</span> <span class="btn-text">TOGGLE</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <div class="left-panel">
          <app-terminal />
          <app-teams />
          <app-darknet-node />
          <app-internal-network />
          <app-missions />
        </div>
        <div class="right-panel">
          <div class="viz-card">
            <app-globe />
          </div>
          <app-live-events />
          <app-system-integrity />
          <app-malware-sandbox />
          <app-network />
          <app-hardware-shop />
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
      height: 100vh;
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
      padding: 10px;
      box-sizing: border-box;
      gap: 10px;
      transition: all 1s ease;
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
      align-items: flex-start;
      padding: 12px;
      background: rgba(10, 10, 10, 0.8);
      border: 1px solid #111;
      flex-wrap: wrap;
      gap: 15px;
    }

    .logo { font-size: 1.5em; font-weight: 900; color: #00ff00; letter-spacing: 4px; }
    .version { font-size: 0.6em; color: #006600; margin-top: 2px; }

    .stats { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
    .stat-box { display: flex; flex-direction: column; align-items: flex-end; }
    .stat-box .label { font-size: 0.5em; color: #008800; }
    .stat-box .value { font-size: 1em; font-weight: bold; color: #fff; }
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
      padding: 4px 10px;
      min-width: 180px;
    }
    .music-player .label { font-size: 0.45em; color: #00ff00; letter-spacing: 1px; margin-bottom: 2px; }
    .music-player .track-name { font-size: 0.7em; color: #fff; font-weight: bold; margin-bottom: 5px; font-family: monospace; }

    .audio-toggle {
      background: #003300;
      border: 1px solid #00ff00;
      color: #00ff00;
      padding: 4px 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.5em;
      text-transform: uppercase;
      width: 100%;
    }

    main {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 15px;
      flex-grow: 1;
      overflow: hidden;
    }

    @media (max-width: 1100px) {
      main {
        grid-template-columns: 1fr;
        overflow-y: auto;
      }
      :host { overflow: auto; }
      .left-panel, .right-panel { overflow-y: visible !important; }
      .game-wrapper { height: auto; }
    }

    @media (max-width: 600px) {
      .btn-text { display: none; }
      header { flex-direction: column; align-items: center; }
      .stats { width: 100%; justify-content: center; }
    }

    .left-panel, .right-panel {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 15px;
    }

    .viz-card { background: #000; border: 1px solid #1a1a1a; padding: 5px; }

    .inventory-section { background: rgba(15, 15, 15, 0.9); border: 1px solid #222; padding: 15px; }
    .sec-header { font-size: 0.6em; color: #555; border-bottom: 1px solid #222; padding-bottom: 8px; margin-bottom: 10px; letter-spacing: 2px; }
    .inventory-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
    .inventory-item { background: #000; border-left: 3px solid #00ff00; padding: 8px; display: flex; flex-direction: column; font-size: 0.65em; }
    .inventory-item .name { color: #fff; font-weight: bold; }
    .inventory-item .tag { color: #00aa00; font-size: 0.8em; margin-top: 2px; }
    .empty-inv { font-size: 0.65em; color: #333; text-align: center; padding: 10px; }

    .footer-bar { font-size: 0.55em; color: #333; padding: 5px; border-top: 1px solid #111; }
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
}
