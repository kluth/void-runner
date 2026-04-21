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
         [class.stability-mode]="gameService.settings().general.stability_mode"
         class="h-full">
         
      <h1 class="sr-only">VOID_RUN Protocol - Cyber-Terminal Session</h1>

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

      <div class="game-wrapper" 
           [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
           [class.trace-high-glitch]="gameService.detectionLevel() > 70">
           
        <!-- MAIN TILING GRID (NVIM STYLE) -->
        <main class="nvim-grid">
          
          <!-- LEFT SIDEBAR: MISSION MANIFEST -->
          <aside class="sidebar-manifest terminal-frame corner-tl corner-bl">
            <div class="ascii-line">0:OPERATIONS</div>
            <div class="pane-content">
               <app-missions />
               <div class="h-divider"></div>
               <app-bounty-board />
               <div class="h-divider"></div>
               <app-threat-database />
            </div>
          </aside>

          <!-- CENTER: MAIN BUFFER -->
          <section class="main-buffer terminal-frame">
             <div class="ascii-line cyan">1:{{ gameService.activeTab().toLowerCase() }}*</div>
             
             <div class="buffer-content">
                @switch (gameService.activeTab()) {
                   @case ('TERMINAL') { <app-terminal /> }
                   @case ('HARDWARE') { 
                      <div class="hardware-hub">
                         <app-hardware-shop />
                         <div class="h-divider"></div>
                         <app-overclock-station />
                         <div class="h-divider"></div>
                         <app-asset-vault />
                      </div>
                   }
                   @case ('GRID') {
                      <div class="grid-hub">
                         <div class="holographic-preview terminal-frame" (click)="toggleGlobeModal()">
                            <div class="ascii-line cyan">HOLOGRAPHIC_GRID_UPLINK</div>
                            <app-globe />
                         </div>
                         <app-network />
                      </div>
                   }
                   @case ('SOCIAL') {
                      <div class="social-hub">
                         <app-darknet-node />
                         <div class="h-divider"></div>
                         <app-teams />
                      </div>
                   }
                }
             </div>
          </section>

          <!-- RIGHT SIDEBAR: TELEMETRY -->
          <aside class="sidebar-telemetry terminal-frame corner-tr corner-br hidden-tablet">
            <div class="ascii-line magenta">2:SYSTEM_DATA</div>
            <div class="pane-content">
               <app-system-integrity />
               <div class="h-divider"></div>
               <app-live-events />
               <div class="h-divider"></div>
               <div class="module-manifest">
                  <div class="sec-label">INSTALLED_MODULES</div>
                  <div class="module-list" role="list">
                     @for (item of gameService.inventory(); track $index) {
                        <div class="module-item" role="listitem">
                           <span class="m-code">0{{ $index }}:</span>
                           <span class="m-name">{{ item.name }}</span>
                        </div>
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
             <span class="stat">CR:{{ gameService.credits() }}</span>
             <span class="stat-sep">│</span>
             <span class="stat" style="color: var(--neon-cyan)">REP:{{ gameService.reputation() }}</span>
             <span class="stat-sep">│</span>
             <span class="stat" [class.trace-alert]="gameService.detectionLevel() > 60">TR:{{ gameService.detectionLevel() }}%</span>
             <button class="mobile-telemetry-toggle" (click)="toggleMobileTelemetry()">[ SYSTEM ]</button>
          </div>
        </footer>

        <!-- MODAL OVERLAYS -->
        @if (mobileTelemetryOpen()) {
           <div class="mobile-telemetry-overlay glass-overlay" (click)="toggleMobileTelemetry()">
              <div class="telemetry-box terminal-frame" (click)="$event.stopPropagation()">
                 <div class="ascii-line magenta">EMERGENCY_TELEMETRY</div>
                 <app-system-integrity />
                 <app-live-events />
                 <button class="magenta" (click)="toggleMobileTelemetry()">[ DISMISS ]</button>
              </div>
           </div>
        }

        @if (globeModalOpen()) {
           <div class="globe-modal glass-overlay" (click)="toggleGlobeModal()">
              <div class="modal-content terminal-frame" (click)="$event.stopPropagation()">
                 <div class="ascii-line cyan">GRID_MAP_FULL_RESOLUTION</div>
                 <app-globe />
                 <button class="cyan" (click)="toggleGlobeModal()">[ CLOSE_GRID ]</button>
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
      grid-template-columns: 280px 1fr 300px;
      flex-grow: 1;
      min-height: 0;
      gap: 2px;
      padding: 2px;
    }

    .pane-content, .buffer-content {
      flex-grow: 1;
      overflow-y: auto;
      background: var(--layer-1);
      min-height: 0;
    }

    .sidebar-manifest, .sidebar-telemetry, .main-buffer {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .module-manifest { padding: 15px; }
    .sec-label { font-size: 0.6rem; opacity: 0.5; margin-bottom: 10px; font-weight: 900; color: var(--neon-yellow); }
    .module-item { font-size: 0.75rem; color: var(--neon-green); margin-bottom: 6px; }
    .m-code { opacity: 0.5; margin-right: 8px; }

    .holographic-preview { height: 250px; cursor: pointer; position: relative; margin: 10px; flex-shrink: 0; }
    .holographic-preview app-globe { height: 100%; pointer-events: none; opacity: 0.6; }

    .tactical-tabs { display: flex; gap: 12px; }
    .tactical-tabs button {
      background: transparent; border: none; color: var(--layer-0);
      font-family: inherit; font-size: inherit; cursor: pointer; padding: 0;
    }
    .tactical-tabs button.active { font-weight: 900; text-decoration: underline; }

    .stat-sep { opacity: 0.3; margin: 0 4px; }
    .trace-alert { background: var(--layer-0); color: var(--neon-magenta); padding: 0 4px; }
    .mobile-telemetry-toggle { display: none; margin-left: 15px; height: 18px; line-height: 1; padding: 0 8px; font-size: 0.6rem; }

    .globe-modal, .mobile-telemetry-overlay {
       position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
       z-index: 10000; display: flex; align-items: center; justify-content: center;
       padding: 2rem;
    }
    .modal-content { background: var(--layer-0); width: 100%; max-width: 1000px; padding: 1.5rem; }
    .modal-content app-globe { height: 65vh; min-height: 400px; }
    .modal-content button { width: 100%; margin-top: 1.5rem; }

    .telemetry-box { background: var(--layer-1); padding: 2rem; width: 95%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }

    @media (max-width: 1300px) {
       .nvim-grid { grid-template-columns: 240px 1fr; }
       .sidebar-telemetry { display: none; }
    }

    @media (max-width: 850px) {
       .nvim-grid { grid-template-columns: 1fr; }
       .sidebar-manifest { display: none; }
       .mobile-telemetry-toggle { display: block; }
       .hidden-mobile { display: none; }
    }

    @media (max-width: 480px) {
       .tmux-bar { font-size: 0.65rem; }
       .tactical-tabs { gap: 6px; }
       .tmux-right { gap: 4px; }
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

  decayFactor = computed(() => {
     const rep = this.gameService.reputation();
     return Math.min(1, rep / 5000);
  });

  ngOnInit() {

    // Defer all initialization to after the first change detection cycle
    // to avoid NG0200 (ExpressionChangedAfterItHasBeenCheckedError)
    queueMicrotask(() => {
      this.onboard.initialize();
      this.pvp.initialize();
      this.factions.initialize();
      this.creepyAudio.initialize();
      this.route.queryParamMap.subscribe(params => {
          const token = params.get('token');
          if (token) {
              this.gameService.handleOAuthToken(token);
          }
      });
 15143c8 (feat: Enhanced CI/CD pipeline with comprehensive quality gates)
    });
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
