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
import { NodeMapperComponent } from './features/network/node-mapper.component';
import { TopologyMapComponent } from './features/network/topology-map.component';
import { GhostProbeComponent } from './features/network/ghost-probe.component';
import { DataStreamComponent } from './features/network/data-stream.component';
import { GlobalFeedComponent } from './features/social/global-feed.component';
import { DarknetPredictorComponent } from './features/social/darknet-predictor.component';
import { PresenceMeshComponent } from './features/social/presence-mesh.component';
import { SocialExploitComponent } from './features/social/social-exploit.component';
import { InfluenceMatrixComponent } from './features/social/influence-matrix.component';
import { SocialHeatmapComponent } from './features/social/social-heatmap.component';
import { TeamComponent } from './features/social/team.component';
import { DarknetNodeComponent } from './features/social/darknet-node.component';
import { SkillTreeComponent } from './features/system/skill-tree.component';
import { Web3MiningComponent } from './features/system/web3-mining.component';
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
    NodeMapperComponent,
    TopologyMapComponent,
    GhostProbeComponent,
    DataStreamComponent,
    GlobalFeedComponent,
    DarknetPredictorComponent,
    PresenceMeshComponent,
    SocialExploitComponent,
    InfluenceMatrixComponent,
    SocialHeatmapComponent,
    SkillTreeComponent,
    Web3MiningComponent,
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

      <!-- High Density HUD (Positioned below header) -->
      <app-high-density-hud style="top: 44px;" />

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
                  
               <!-- DYNAMIC CONTENT GRID -->
               <main class="dynamic-layout">
                 
                 <!-- PERSISTENT SIDEBAR (Optional on large screens) -->
                 <aside class="sidebar fixed-info hidden-tablet" 
                        *ngIf="gameService.activeTab() === 'TERMINAL' || gameService.activeTab() === 'GRID'">
                    <div class="terminal-frame h-full">
                       <div class="ascii-line">0:OPERATIONS</div>
                       <div class="pane-content">
                          <app-missions />
                          <div class="h-divider"></div>
                          <app-bounty-board />
                       </div>
                    </div>
                 </aside>

                 <!-- PRIMARY BUFFER (Center) -->
                 <section class="main-buffer terminal-frame">
                    <div class="ascii-line cyan">1:{{ gameService.activeTab().toLowerCase() }}*</div>
                    
                    <div class="buffer-content">
                       @switch (gameService.activeTab()) {
                          @case ('TERMINAL') { <app-terminal /> }
                          
                          @case ('GRID') {
                             <div class="hub-layout">
                                <div class="hub-nav">
                                   <button (click)="subTab = 'uplink'" [class.active]="subTab === 'uplink'">[ UPLINK ]</button>
                                   <button (click)="subTab = 'nodes'" [class.active]="subTab === 'nodes'">[ NODES ]</button>
                                   <button (click)="subTab = 'botnet'" [class.active]="subTab === 'botnet'">[ BOTNET ]</button>
                                   <button (click)="subTab = 'probes'" [class.active]="subTab === 'probes'">[ PROBES ]</button>
                                </div>
                                
                                <div class="hub-view">
                                   @if (subTab === 'uplink') {
                                      <div class="holographic-preview terminal-frame" (click)="toggleGlobeModal()">
                                         <div class="ascii-line cyan">HOLOGRAPHIC_GRID_UPLINK</div>
                                         <app-globe />
                                      </div>
                                   }
                                   @if (subTab === 'nodes') {
                                      <app-node-mapper />
                                      <div class="h-divider"></div>
                                      <app-topology-map />
                                   }
                                   @if (subTab === 'botnet') { <app-network /> }
                                   @if (subTab === 'probes') {
                                      <app-ghost-probe />
                                      <div class="h-divider"></div>
                                      <app-data-stream />
                                   }
                                </div>
                             </div>
                          }

                          @case ('MISSIONS') { 
                             <div class="hub-layout">
                                <div class="hub-nav">
                                   <button (click)="subTab = 'active'" [class.active]="subTab === 'active'">[ ACTIVE ]</button>
                                   <button (click)="subTab = 'bounties'" [class.active]="subTab === 'bounties'">[ BOUNTIES ]</button>
                                   <button (click)="subTab = 'threats'" [class.active]="subTab === 'threats'">[ THREATS ]</button>
                                   <button (click)="subTab = 'sandbox'" [class.active]="subTab === 'sandbox'">[ SANDBOX ]</button>
                                   <button (click)="subTab = 'pivot'" [class.active]="subTab === 'pivot'">[ PIVOT ]</button>
                                </div>
                                
                                <div class="hub-view">
                                   @if (subTab === 'active') { <app-missions /> }
                                   @if (subTab === 'bounties') { <app-bounty-board /> }
                                   @if (subTab === 'threats') { <app-threat-database /> }
                                   @if (subTab === 'sandbox') { <app-malware-sandbox /> }
                                   @if (subTab === 'pivot') { <app-internal-network /> }
                                </div>
                             </div>
                          }

                          @case ('SOCIAL') {
                             <div class="hub-layout">
                                <div class="hub-nav">
                                   <button (click)="subTab = 'teams'" [class.active]="subTab === 'teams'">[ TEAMS ]</button>
                                   <button (click)="subTab = 'darknet'" [class.active]="subTab === 'darknet'">[ DARKNET ]</button>
                                   <button (click)="subTab = 'exploit'" [class.active]="subTab === 'exploit'">[ EXPLOIT ]</button>
                                   <button (click)="subTab = 'matrix'" [class.active]="subTab === 'matrix'">[ MATRIX ]</button>
                                   <button (click)="subTab = 'mesh'" [class.active]="subTab === 'mesh'">[ MESH ]</button>
                                </div>
                                
                                <div class="hub-view">
                                   @if (subTab === 'teams') { <app-teams /> }
                                   @if (subTab === 'darknet') { <app-darknet-node /> }
                                   @if (subTab === 'exploit') { <app-social-exploit /> }
                                   @if (subTab === 'matrix') { <app-influence-matrix /> }
                                   @if (subTab === 'mesh') { <app-presence-mesh /> }
                                </div>
                             </div>
                          }

                          @case ('HARDWARE') { 
                             <div class="hub-layout">
                                <div class="hub-nav">
                                   <button (click)="subTab = 'market'" [class.active]="subTab === 'market'">[ MARKET ]</button>
                                   <button (click)="subTab = 'overclock'" [class.active]="subTab === 'overclock'">[ OVERCLOCK ]</button>
                                   <button (click)="subTab = 'vault'" [class.active]="subTab === 'vault'">[ VAULT ]</button>
                                </div>
                                
                                <div class="hub-view">
                                   @if (subTab === 'market') { <app-hardware-shop /> }
                                   @if (subTab === 'overclock') { <app-overclock-station /> }
                                   @if (subTab === 'vault') { <app-asset-vault /> }
                                </div>
                             </div>
                          }

                          @case ('SYSTEM') {
                             <div class="hub-layout">
                                <div class="hub-nav">
                                   <button (click)="subTab = 'integrity'" [class.active]="subTab === 'integrity'">[ INTEGRITY ]</button>
                                   <button (click)="subTab = 'skills'" [class.active]="subTab === 'skills'">[ SKILLS ]</button>
                                   <button (click)="subTab = 'mining'" [class.active]="subTab === 'mining'">[ VOID_MINE ]</button>
                                </div>
                                
                                <div class="hub-view">
                                   @if (subTab === 'integrity') { <app-system-integrity /> }
                                   @if (subTab === 'skills') { <app-skill-tree /> }
                                   @if (subTab === 'mining') { <app-web3-mining /> }
                                </div>
                             </div>
                          }
                       }
                    </div>
                 </section>

                 <!-- TELEMETRY SIDEBAR (Optional on large screens) -->
                 <aside class="sidebar fixed-telemetry hidden-laptop"
                        *ngIf="gameService.activeTab() === 'TERMINAL'">
                    <div class="terminal-frame h-full">
                       <div class="ascii-line magenta">2:SYSTEM_DATA</div>
                       <div class="pane-content">
                          <app-system-integrity />
                          <div class="h-divider"></div>
                          <app-live-events />
                       </div>
                    </div>
                 </aside>
               </main>
             </div>
          }
        </div>

        <!-- GLOBAL BOTTOM DOCK (Navigation) -->
        <nav class="global-dock" *ngIf="gameService.settings().video.view_mode !== 'HYPER'">
          <div class="dock-inner">
            @for (tab of ['TERMINAL', 'GRID', 'MISSIONS', 'SOCIAL', 'HARDWARE', 'SYSTEM']; track tab; let i = $index) {
              <button class="dock-btn" 
                      [class.active]="gameService.activeTab() === tab"
                      (click)="gameService.clearTabNotification(tab)">
                <span class="d-idx">{{ i }}</span>
                <span class="d-label">{{ tab === 'MISSIONS' ? 'OPERATIONS' : tab }}</span>
                <div class="d-active-bar" *ngIf="gameService.activeTab() === tab"></div>
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
      background: var(--layer-0);
      position: relative;
    }

    .global-header {
      height: 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
      background: rgba(10, 15, 30, 0.9);
      backdrop-filter: blur(10px);
      border: none;
      border-bottom: 1px solid rgba(0, 255, 159, 0.1);
      z-index: 2000;
      flex-shrink: 0;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .session-id { color: var(--primary); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: bold; }
    .v-divider { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.15); }
    .onboard-status { color: var(--neon-cyan); font-size: 0.65rem; font-family: 'Orbitron', monospace; letter-spacing: 1px; }

    .header-center { display: flex; gap: 1.5rem; }
    .stat-pill { display: flex; gap: 6px; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; }
    .stat-pill .label { opacity: 0.4; }
    .stat-pill .value { font-weight: 700; color: #fff; }
    .stat-pill .value.cyan { color: var(--neon-cyan); }
    .stat-pill .value.magenta { color: var(--neon-magenta); }
    .stat-pill.alert .value { animation: blink 0.5s infinite; }

    .sys-btn { display: none; font-size: 0.6rem; padding: 4px 10px; border-color: var(--neon-magenta); color: var(--neon-magenta); }

    .content-area {
      flex: 1;
      min-height: 0;
      position: relative;
    }

    .game-wrapper {
      height: 100%;
      width: 100%;
    }

    .dynamic-layout {
      display: grid;
      grid-template-columns: auto 1fr auto;
      height: 100%;
      min-height: 0;
      gap: 4px;
      padding: 4px;
    }

    .fixed-info { width: 300px; }
    .fixed-telemetry { width: 320px; }
    
    .pane-content, .buffer-content {
      flex: 1;
      overflow-y: auto;
      background: var(--layer-1);
      min-height: 0;
    }

    .sidebar, .main-buffer {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .hub-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      height: 100%;
    }

    .hub-nav {
      display: flex;
      gap: 8px;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 255, 159, 0.1);
      flex-wrap: wrap;
    }
    .hub-nav button {
      padding: 6px 12px;
      font-size: 0.65rem;
      border-color: rgba(0, 255, 159, 0.2);
      color: rgba(0, 255, 159, 0.6);
    }
    .hub-nav button:hover { border-color: var(--primary); color: var(--primary); }
    .hub-nav button.active { background: var(--primary); color: #000; border-color: var(--primary); box-shadow: 0 0 10px var(--primary); }

    .hub-view {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .module-manifest { padding: 1rem; }
    .sec-label { font-size: 0.6rem; opacity: 0.4; margin-bottom: 12px; font-weight: 900; color: var(--neon-yellow); }
    .module-item { font-size: 0.7rem; color: var(--neon-green); margin-bottom: 8px; display: flex; align-items: center; }
    .m-code { opacity: 0.3; margin-right: 10px; font-size: 0.6rem; }

    .holographic-preview { height: 220px; cursor: pointer; position: relative; flex-shrink: 0; }
    .holographic-preview app-globe { height: 100%; pointer-events: none; opacity: 0.5; }

    .global-dock {
      height: 64px;
      background: rgba(13, 21, 32, 0.95);
      backdrop-filter: blur(15px);
      border: none;
      border-top: 1px solid rgba(0, 255, 159, 0.1);
      display: flex; justify-content: center;
      z-index: 2000;
      flex-shrink: 0;
    }
    .dock-inner { display: flex; width: 100%; max-width: 900px; }
    .dock-btn {
      flex: 1; border: none; background: transparent; color: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
      padding: 0; margin: 0;
      clip-path: none !important;
    }
    .dock-btn:hover { background: rgba(0, 255, 159, 0.05); }
    .dock-btn.active { color: var(--primary); transform: translateY(-2px); }
    .d-idx { font-size: 0.5rem; opacity: 0.3; font-family: 'JetBrains Mono', monospace; }
    .d-label { font-size: 0.65rem; font-family: 'Orbitron', monospace; font-weight: 700; letter-spacing: 1.5px; }
    .d-active-bar {
      position: absolute; bottom: 0; width: 30%; height: 3px; background: var(--primary);
      box-shadow: 0 0 12px var(--primary);
    }

    .globe-modal, .mobile-telemetry-overlay {
       position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
       z-index: 10000; display: flex; align-items: center; justify-content: center;
       padding: 1.5rem; backdrop-filter: blur(8px);
    }
    .modal-content { background: var(--layer-0); width: 100%; max-width: 1000px; padding: 1rem; }
    .modal-content app-globe { height: 60vh; min-height: 300px; }
    .modal-content button { width: 100%; margin-top: 1.5rem; }

    .telemetry-box { background: var(--layer-1); padding: 1.5rem; width: 95%; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }

    @media (max-width: 1300px) {
       .dynamic-layout { grid-template-columns: 240px 1fr; }
       .fixed-telemetry { display: none; }
       .sys-btn { display: block; }
    }

    @media (max-width: 850px) {
       .dynamic-layout { grid-template-columns: 1fr; }
       .fixed-info { display: none; }
       .header-center { gap: 1rem; }
       .stat-pill { font-size: 0.65rem; }
       .onboard-status { display: none; }
       .hub-layout { padding: 1rem; gap: 1rem; }
    }

    @media (max-width: 480px) {
       .global-header { height: 50px; padding: 0 0.5rem; }
       .header-center { gap: 8px; }
       .stat-pill { flex-direction: column; gap: 0; align-items: center; }
       .stat-pill .label { font-size: 0.45rem; }
       .stat-pill .value { font-size: 0.6rem; }
       .d-label { font-size: 0.5rem; letter-spacing: 0.5px; }
       .sys-btn { padding: 3px 6px; font-size: 0.55rem; }
    }

    @keyframes blink { 50% { opacity: 0.2; } }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  onboardAi = inject(OnboardAiService);
  private route = inject(ActivatedRoute);

  subTab: string = 'active';
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