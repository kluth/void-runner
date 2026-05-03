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
import { FakeBluescreenComponent } from './features/system/fake-bluescreen.component';
import { LockoutOverlayComponent } from './features/system/lockout-overlay.component';
import { SurveillanceOverlayComponent } from './features/system/surveillance-overlay.component';
import { HighDensityHudComponent } from './features/system/high-density-hud.component';
import { WorkspaceComponent } from './features/system/workspace.component';
import { EchoCollectorComponent } from './features/system/echo-collector.component';
import { MarginScribeComponent } from './features/system/margin-scribe.component';
import { AgenticHudComponent } from './features/system/agentic-hud.component';
import { PulseDiagnosticsComponent } from './features/system/pulse-diagnostics.component';
import { SystemShatterComponent } from './features/system/system-shatter.component';
import { NeuralLinkWidgetsComponent } from './features/system/neural-link-widgets.component';
import { OnboardAiService } from './core/services/onboard-ai.service';
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
    FakeBluescreenComponent,
    LockoutOverlayComponent,
SurveillanceOverlayComponent,
HighDensityHudComponent,
WorkspaceComponent,
EchoCollectorComponent,
MarginScribeComponent,
AgenticHudComponent,
PulseDiagnosticsComponent,
    SystemShatterComponent,
    NeuralLinkWidgetsComponent,
],template: `
<div [style.--singularity-decay]="decayFactor()" 
     [class.stability-mode]="gameService.settings().general.stability_mode"
     class="h-full"
     [class.phase-bootstrap]="onboardAi.phase() === 'BOOTSTRAP'"
     [class.phase-familiar]="onboardAi.phase() === 'FAMILIAR'"
     [class.phase-aware]="onboardAi.phase() === 'AWARE'"
     [class.phase-intrusive]="onboardAi.phase() === 'INTRUSIVE'"
     [class.phase-hostile]="onboardAi.phase() === 'HOSTILE'">

  <app-system-shatter />
  <app-neural-link-widgets />
  <app-echo-collector />
  <app-margin-scribe />
  <app-agentic-hud />

  @defer (when gameService.systemStress() > 60) {
    <app-pulse-diagnostics />
  }

  <h1 class="sr-only">VOID_RUN Protocol - Cyber-Terminal Session</h1>      @if (!gameService.isConfigured()) { <app-config-wizard /> }
      @if (gameService.isBooting()) { <app-boot-screen /> }
      @if (gameService.authRequired()) { <app-auth class="glass-overlay" /> }
      @if (gameService.matrixMode()) { <app-matrix-rain /> }

      <!-- OVERLAYS -->
      <app-intrusion-overlay />
      <app-hijack-overlay />
      <app-calibration-overlay />
      <app-walkthrough-overlay />
      <app-purge-overlay />
      <app-fake-bluescreen />
      <app-lockout-overlay />
      <app-surveillance-overlay />

      <!-- High Density HUD -->
      <app-high-density-hud />

      <div class="main-layout" [class.hyper-mode]="gameService.settings().video.view_mode === 'HYPER'">
        <!-- GLOBAL TOP HEADER (Stats & Status) -->
        <header class="global-header terminal-frame">
          <div class="header-left">
            <span class="glitch-text session-id">0x{{ gameService.credits().toString(16) }}</span>
            <span class="v-divider"></span>
            <span class="onboard-status">{{ onboardAi.phase() }}</span>
          </div>
          
          <div class="header-center">
            <div class="stat-pill" title="Credits">
              <span class="label">CR:</span>
              <span class="value">{{ gameService.credits() }}</span>
            </div>
            <div class="stat-pill" title="Reputation">
              <span class="label">RP:</span>
              <span class="value cyan">{{ gameService.reputation() }}</span>
            </div>
            <div class="stat-pill" title="Trace Level" [class.alert]="gameService.detectionLevel() > 60">
              <span class="label">TR:</span>
              <span class="value magenta">{{ gameService.detectionLevel() }}%</span>
            </div>
          </div>

          <div class="header-right">
             <button class="sys-btn" (click)="toggleMobileTelemetry()">[ SYSTEM ]</button>
          </div>
        </header>

        <div class="content-area">
          @if (gameService.settings().video.view_mode === 'HYPER') {
             <app-workspace />
          } @else {
             <div class="game-wrapper" 
                  [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
                  [class.glitch-hud]="gameService.isGlitchy()"
                  [class.thermal-throttle]="gameService.isOverheating()"
                  [class.ui-corrupted]="gameService.isCorrupted()"
                  [class.trace-high-glitch]="gameService.detectionLevel() > 70">
                  
               <!-- MAIN TILING GRID (NVIM STYLE) -->
               <main class="nvim-grid">
                 
                 <!-- LEFT SIDEBAR: MISSION MANIFEST -->
                 <aside class="sidebar-manifest terminal-frame" [class.intent-focus]="gameService.predictedIntent() === 'NETWORK'">
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
                          @case ('MISSIONS') { 
                             <div class="missions-hub">
                                <app-missions />
                                <div class="h-divider"></div>
                                <app-bounty-board />
                                <div class="h-divider"></div>
                                <app-threat-database />
                             </div>
                          }
                       }
                    </div>
                 </section>

                 <!-- RIGHT SIDEBAR: TELEMETRY -->
                 <aside class="sidebar-telemetry terminal-frame" [class.intent-focus]="gameService.predictedIntent() === 'SYSTEM'">
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
             </div>
          }
        </div>

        <!-- GLOBAL BOTTOM DOCK (Navigation) -->
        <nav class="global-dock terminal-frame" *ngIf="gameService.settings().video.view_mode !== 'HYPER'">
          <div class="dock-items">
            @for (tab of ['TERMINAL', 'GRID', 'OPERATIONS', 'SOCIAL', 'HARDWARE']; track tab; let i = $index) {
              <button class="dock-item" 
                      [class.active]="gameService.activeTab() === (tab === 'OPERATIONS' ? 'MISSIONS' : tab)"
                      (click)="gameService.clearTabNotification(tab === 'OPERATIONS' ? 'MISSIONS' : tab)">
                <span class="dock-index">{{ i }}</span>
                <span class="dock-label">{{ tab }}</span>
                <div class="active-indicator" *ngIf="gameService.activeTab() === (tab === 'OPERATIONS' ? 'MISSIONS' : tab)"></div>
              </button>
            }
          </div>
        </nav>

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
    .main-layout {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      width: 100dvw;
      overflow: hidden;
      position: relative;
    }

    .global-header {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 15px;
      background: rgba(10, 15, 30, 0.95);
      border-top: none; border-left: none; border-right: none;
      z-index: 2000;
      flex-shrink: 0;
    }
    .header-left { display: flex; align-items: center; gap: 10px; font-size: 0.7rem; }
    .session-id { color: var(--primary); font-weight: bold; }
    .v-divider { width: 1px; height: 15px; background: rgba(255, 255, 255, 0.2); }
    .onboard-status { color: var(--neon-cyan); opacity: 0.8; font-family: 'Orbitron', monospace; }

    .header-center { display: flex; gap: 20px; }
    .stat-pill { display: flex; gap: 5px; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }
    .stat-pill .label { opacity: 0.5; }
    .stat-pill .value { font-weight: bold; }
    .stat-pill.alert .value { animation: blink 0.5s infinite; color: var(--neon-magenta); }

    .sys-btn { display: none; font-size: 0.6rem; padding: 4px 8px; border-color: var(--neon-magenta); color: var(--neon-magenta); }

    .content-area {
      flex: 1;
      min-height: 0;
      position: relative;
    }

    .game-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .nvim-grid {
      display: grid;
      grid-template-columns: 280px 1fr 300px;
      height: 100%;
      gap: 4px;
      padding: 4px;
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
      height: 100%;
    }

    .module-manifest { padding: 15px; }
    .sec-label { font-size: 0.6rem; opacity: 0.5; margin-bottom: 10px; font-weight: 900; color: var(--neon-yellow); }
    .module-item { font-size: 0.75rem; color: var(--neon-green); margin-bottom: 6px; }
    .m-code { opacity: 0.5; margin-right: 8px; }

    .missions-hub, .hardware-hub, .grid-hub, .social-hub {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .holographic-preview { height: 200px; cursor: pointer; position: relative; margin: 10px; flex-shrink: 0; }
    .holographic-preview app-globe { height: 100%; pointer-events: none; opacity: 0.6; }

    .global-dock {
      height: 60px;
      background: var(--layer-2);
      border-bottom: none; border-left: none; border-right: none;
      display: flex; justify-content: center;
      z-index: 2000;
      flex-shrink: 0;
    }
    .dock-items { display: flex; height: 100%; width: 100%; max-width: 800px; }
    .dock-item {
      flex: 1; border: none; background: transparent; color: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; transition: all 0.2s; position: relative;
    }
    .dock-item:hover { background: rgba(0, 255, 159, 0.05); }
    .dock-item.active { color: var(--primary); }
    .dock-index { font-size: 0.5rem; opacity: 0.5; }
    .dock-label { font-size: 0.65rem; font-family: 'Orbitron', monospace; font-weight: 700; letter-spacing: 1px; }
    .active-indicator {
      position: absolute; bottom: 0; width: 40%; height: 2px; background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
    }

    .globe-modal, .mobile-telemetry-overlay {
       position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
       z-index: 10000; display: flex; align-items: center; justify-content: center;
       padding: 1rem;
    }
    .modal-content { background: var(--layer-0); width: 100%; max-width: 1000px; padding: 1rem; }
    .modal-content app-globe { height: 60vh; min-height: 300px; }
    .modal-content button { width: 100%; margin-top: 1rem; }

    .telemetry-box { background: var(--layer-1); padding: 1.5rem; width: 95%; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; }

    @media (max-width: 1300px) {
       .nvim-grid { grid-template-columns: 240px 1fr; }
       .sidebar-telemetry { display: none; }
       .sys-btn { display: block; }
    }

    @media (max-width: 850px) {
       .nvim-grid { grid-template-columns: 1fr; }
       .sidebar-manifest { display: none; }
       .header-center { gap: 10px; }
       .stat-pill { font-size: 0.65rem; }
       .onboard-status { display: none; }
    }

    @media (max-width: 480px) {
       .header-center { gap: 5px; }
       .stat-pill { flex-direction: column; gap: 0; align-items: center; }
       .stat-pill .label { font-size: 0.5rem; }
       .dock-label { font-size: 0.55rem; }
       .global-header { padding: 0 8px; }
    }

    @keyframes blink { 50% { opacity: 0.3; } }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
onboardAi = inject(OnboardAiService);
  private route = inject(ActivatedRoute);

  globeModalOpen = signal(false);
  mobileTelemetryOpen = signal(false);

  decayFactor = computed(() => {
     const rep = this.gameService.reputation();
     return Math.min(1, rep / 5000);
  });

  ngOnInit() {
    this.onboardAi.initialize();
    this.route.queryParamMap.subscribe(params => {
        const token = params.get('token');
        if (token) {
            this.gameService.handleOAuthToken(token);
        }
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