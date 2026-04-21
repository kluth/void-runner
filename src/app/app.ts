import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
    <div [style.--singularity-decay]="decayFactor()" 
         [class.stability-mode]="gameService.settings().general.stability_mode">
         
      <h1 class="sr-only">VOID_RUN Protocol - Neural Nvim Session</h1>

      @if (!gameService.isConfigured()) { <app-config-wizard /> }
      @if (gameService.isBooting()) { <app-boot-screen /> }
      @if (gameService.authRequired()) { <app-auth class="glass-overlay" /> }
      @if (gameService.matrixMode()) { <app-matrix-rain /> }

      <!-- OVERLAYS -->
      <app-intrusion-overlay />
      <app-hijack-overlay />
      <app-calibration-overlay />
      <app-walkthrough-overlay />
      <app-purge-overlay />
      <app-lockout-overlay />

      <!-- HALLUCINATION LAYER -->
      @if (decayFactor() > 0.5) {
         <div class="ghost-whisper" [style.top.%]="randomY()" [style.left.%]="randomX()">
            LOOK_BEHIND_YOU
         </div>
         <div class="ghost-whisper" [style.top.%]="randomY2()" [style.right.%]="randomX2()">
            THE_VOID_IS_WATCHING
         </div>
      }

      <div class="game-wrapper" 
           [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
           [class.trace-high-glitch]="gameService.detectionLevel() > 70">
           
        <!-- MAIN TILING GRID -->
        <main class="nvim-grid">
          
          <!-- LEFT SIDEBAR: MISSION MANIFEST -->
          <aside class="sidebar-manifest v-divider">
            <div class="pane-header">[ 0:CONTRACTS ]</div>
            <div class="pane-content">
               <app-missions />
               <div class="h-divider"></div>
               <app-bounty-board />
               <div class="h-divider"></div>
               <app-threat-database />
            </div>
          </aside>

          <!-- CENTER: MAIN BUFFER (TERMINAL / HARDWARE / GRID) -->
          <section class="main-buffer">
             <div class="pane-header">
                [ 1:{{ gameService.activeTab().toLowerCase() }}* ]
                <span class="active-op-tag hidden-mobile">NODE: 72.61.80.234 // {{ gameService.playerHandle() }}</span>
             </div>
             
             <div class="buffer-content">
                @switch (gameService.activeTab()) {
                   @case ('TERMINAL') { <app-terminal /> }
                   @case ('HARDWARE') { 
                      <app-hardware-shop />
                      <div class="h-divider"></div>
                      <app-overclock-station />
                      <div class="h-divider"></div>
                      <app-asset-vault />
                   }
                   @case ('GRID') {
                      <div class="holographic-preview" (click)="toggleGlobeModal()">
                         <div class="preview-noise">HOLOGRAPHIC_GRID_UPLINK [ESTABLISHED]</div>
                         <app-globe />
                      </div>
                      <app-network />
                   }
                   @case ('SOCIAL') {
                      <app-darknet-node />
                      <div class="h-divider"></div>
                      <app-teams />
                   }
                }
             </div>
          </section>

          <!-- RIGHT SIDEBAR: TELEMETRY & ALERTS -->
          <aside class="sidebar-telemetry hidden-tablet">
            <div class="pane-header">[ 2:SYSTEM ]</div>
            <div class="pane-content">
               <app-system-integrity />
               <div class="h-divider"></div>
               <app-live-events />
               <div class="h-divider"></div>
               <div class="module-manifest">
                  <div class="sec-label">INSTALLED_MODULES</div>
                  <div class="module-list">
                     @for (item of gameService.inventory(); track $index) {
                        <div class="module-item">0{{ $index }}: {{ item.name }}</div>
                     }
                  </div>
               </div>
            </div>
          </aside>
        </main>

        <!-- TMUX STATUS BAR -->
        <footer class="tmux-bar" role="navigation">
          <div class="tmux-left">
            <span class="session-label hidden-mobile">[VOID_RUN]</span>
            <nav class="tactical-tabs">
              @for (tab of ['TERMINAL', 'MISSIONS', 'HARDWARE', 'GRID', 'SOCIAL']; track tab; let i = $index) {
                <button (click)="gameService.clearTabNotification(tab)" 
                        [class.active]="gameService.activeTab() === tab">
                  {{ i }}:{{ tab.toLowerCase() }}{{ gameService.activeTab() === tab ? '*' : '-' }}
                </button>
              }
            </nav>
          </div>

          <div class="tmux-right">
             <span class="stat">CR:{{ gameService.credits() }}</span> |
             <span class="stat" style="color: var(--neon-cyan)">REP:{{ gameService.reputation() }}</span> |
             <span class="stat" [class.trace-alert]="gameService.detectionLevel() > 60">TR:{{ gameService.detectionLevel() }}%</span>
             <button class="mobile-telemetry-toggle" (click)="toggleMobileTelemetry()">[ TEL ]</button>
          </div>
        </footer>

        @if (mobileTelemetryOpen()) {
           <div class="mobile-telemetry-overlay glass-overlay" (click)="toggleMobileTelemetry()">
              <div class="telemetry-box" (click)="$event.stopPropagation()">
                 <app-system-integrity />
                 <app-live-events />
                 <button (click)="toggleMobileTelemetry()">[ DISMISS ]</button>
              </div>
           </div>
        }

        @if (globeModalOpen()) {
           <div class="globe-modal glass-overlay" (click)="toggleGlobeModal()">
              <div class="modal-content terminal-frame" (click)="$event.stopPropagation()">
                 <app-globe />
                 <button class="close-btn" (click)="toggleGlobeModal()">[ CLOSE_GRID ]</button>
              </div>
           </div>
        }
      </div>
    </div>
  `,
  styles: `
    .game-wrapper {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      background: var(--layer-0);
      position: relative;
    }

    .nvim-grid {
      display: grid;
      grid-template-columns: 250px 1fr 280px;
      flex-grow: 1;
      min-height: 0;
      border: 1px solid var(--primary);
    }

    .pane-header {
      background: var(--primary);
      color: var(--layer-0);
      font-size: 0.65rem;
      font-weight: 900;
      padding: 2px 8px;
      display: flex;
      justify-content: space-between;
      white-space: nowrap;
    }

    .pane-content, .buffer-content {
      flex-grow: 1;
      overflow-y: auto;
      background: var(--layer-0);
      min-height: 0;
    }

    .sidebar-manifest, .sidebar-telemetry, .main-buffer {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .module-manifest { padding: 10px; }
    .sec-label { font-size: 0.6rem; opacity: 0.5; margin-bottom: 8px; font-weight: 900; }
    .module-item { font-size: 0.7rem; color: var(--primary); opacity: 0.8; margin-bottom: 4px; }

    .holographic-preview { height: 200px; cursor: pointer; position: relative; }
    .preview-noise { position: absolute; top: 5px; left: 10px; font-size: 0.5rem; opacity: 0.3; z-index: 10; }
    .holographic-preview app-globe { height: 100%; pointer-events: none; opacity: 0.4; }

    .tactical-tabs { display: flex; gap: 10px; }
    .tactical-tabs button {
      background: transparent; border: none; color: var(--layer-0);
      font-family: inherit; font-size: inherit; cursor: pointer; padding: 0;
    }
    .tactical-tabs button.active { font-weight: 900; text-decoration: underline; }

    .trace-alert { background: var(--layer-0); color: var(--tertiary); padding: 0 4px; }
    .mobile-telemetry-toggle { display: none; margin-left: 10px; }

    /* MODALS */
    .globe-modal, .mobile-telemetry-overlay {
       position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
       z-index: 10000; display: flex; align-items: center; justify-content: center;
       padding: 2rem;
    }
    .modal-content { background: var(--layer-0); border: 1px solid var(--primary); width: 100%; max-width: 1000px; padding: 1rem; position: relative; }
    .modal-content app-globe { height: 70vh; }
    .close-btn { width: 100%; margin-top: 1rem; }

    .telemetry-box { background: var(--layer-0); border: 1px solid var(--primary); padding: 2rem; width: 90%; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }

    @media (max-width: 1200px) {
       .nvim-grid { grid-template-columns: 200px 1fr; }
       .sidebar-telemetry { display: none; }
       .hidden-tablet { display: none; }
    }

    @media (max-width: 768px) {
       .nvim-grid { grid-template-columns: 1fr; }
       .sidebar-manifest { display: none; }
       .mobile-telemetry-toggle { display: block; }
       .hidden-mobile { display: none; }
    }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  private route = inject(ActivatedRoute);

  globeModalOpen = signal(false);
  mobileTelemetryOpen = signal(false);

  // Random coordinates for hallucinations
  randomX = signal(Math.random() * 80);
  randomY = signal(Math.random() * 80);
  randomX2 = signal(Math.random() * 80);
  randomY2 = signal(Math.random() * 80);

  decayFactor = computed(() => {
     const rep = this.gameService.reputation();
     return Math.min(1, rep / 5000);
  });

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
        const token = params.get('token');
        if (token) {
            this.gameService.handleOAuthToken(token);
        }
    });

    // Refresh hallucinations
    setInterval(() => {
       this.randomX.set(Math.random() * 80);
       this.randomY.set(Math.random() * 80);
       this.randomX2.set(Math.random() * 80);
       this.randomY2.set(Math.random() * 80);
    }, 5000);
  }

  toggleGlobeModal() {
     this.globeModalOpen.update(v => !v);
     this.audioService.playClick();
  }

  toggleMobileTelemetry() {
     this.mobileTelemetryOpen.update(v => !v);
     this.audioService.playClick();
  }
}
