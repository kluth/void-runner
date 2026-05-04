import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { GameService } from './core/services/game.service';
import { AudioService } from './core/services/audio.service';
import { StreamerIntegrationService } from './core/services/streamer-integration.service';
import { ActivatedRoute } from '@angular/router';
import { TerminalComponent } from './features/terminal/terminal.component';
import { MatrixRainComponent } from './features/system/matrix-rain.component';
import { IntrusionOverlayComponent } from './features/system/intrusion-overlay.component';
import { HijackOverlayComponent } from './features/terminal/hijack-overlay.component';
import { CalibrationOverlayComponent } from './features/system/calibration-overlay.component';
import { AuthComponent } from './features/system/auth.component';
import { BootScreenComponent } from './features/system/boot-screen.component';
import { ConfigWizardComponent } from './features/system/config-wizard.component';
import { WalkthroughOverlayComponent } from './features/system/walkthrough-overlay.component';
import { PurgeOverlayComponent } from './features/system/purge-overlay.component';
import { FakeBluescreenComponent } from './features/system/fake-bluescreen.component';
import { LockoutOverlayComponent } from './features/system/lockout-overlay.component';
import { SurveillanceOverlayComponent } from './features/system/surveillance-overlay.component';
import { WorkspaceComponent } from './features/system/workspace.component';
import { SystemShatterComponent } from './features/system/system-shatter.component';
import { NeuralOverlayComponent } from './features/system/neural-overlay.component';
import { OperationsHubComponent } from './features/missions/operations-hub.component';
import { NetworkHubComponent } from './features/network/network-hub.component';
import { SocialHubComponent } from './features/social/social-hub.component';
import { HardwareHubComponent } from './features/hardware/hardware-hub.component';
import { SystemHubComponent } from './features/system/system-hub.component';
import { SettingsModalComponent } from './features/system/settings-modal.component';
import { OnboardAiService } from './core/services/onboard-ai.service';
import { NeuralNightmareService } from './core/services/neural-nightmare.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TerminalComponent, 
    MatrixRainComponent,
    IntrusionOverlayComponent,
    HijackOverlayComponent,
    CalibrationOverlayComponent,
    AuthComponent,
    BootScreenComponent,
    ConfigWizardComponent,
    WalkthroughOverlayComponent,
    PurgeOverlayComponent,
    FakeBluescreenComponent,
    LockoutOverlayComponent,
    SurveillanceOverlayComponent,
    WorkspaceComponent,
    SystemShatterComponent,
    NeuralOverlayComponent,
    OperationsHubComponent,
    NetworkHubComponent,
    SocialHubComponent,
    HardwareHubComponent,
    SystemHubComponent,
    SettingsModalComponent,
  ],
  template: `
    <div [style.--singularity-decay]="decayFactor()" 
         class="main-layout"
         [class.shaking]="nightmare.isShaking()"
         [class.burning]="gameService.neuralLoad() > 70"
         [class.phase-bootstrap]="onboardAi.phase() === 'BOOTSTRAP'"
         [class.phase-familiar]="onboardAi.phase() === 'FAMILIAR'"
         [class.phase-aware]="onboardAi.phase() === 'AWARE'"
         [class.phase-intrusive]="onboardAi.phase() === 'INTRUSIVE'"
         [class.phase-hostile]="onboardAi.phase() === 'HOSTILE'">
         
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
      <app-fake-bluescreen />
      <app-lockout-overlay />
      <app-surveillance-overlay />
      <app-system-shatter />

      <!-- PASSIVE HUD LAYER -->
      <app-neural-overlay />

      <div class="neural-blackout" [class.active]="gameService.detectionLevel() === 100"></div>

      <!-- GLOBAL TOP HEADER -->
      <header class="global-header terminal-frame">
        <div class="header-left">
          <span class="glitch-text session-id">0x{{ gameService.credits().toString(16) }}</span>
          <span class="v-divider"></span>
          <span class="onboard-status">{{ onboardAi.phase() }}</span>
        </div>
        
        <div class="header-center">
          <div class="stat-pill">
            <span class="label">CR:</span>
            <span class="value">{{ gameService.credits() }}</span>
          </div>
          <div class="stat-pill">
            <span class="label">RP:</span>
            <span class="value cyan">{{ gameService.reputation() }}</span>
          </div>
          <div class="stat-pill" [class.alert]="gameService.detectionLevel() > 60">
            <span class="label">TR:</span>
            <span class="value magenta">{{ gameService.detectionLevel() }}%</span>
          </div>
        </div>

        <div class="header-right">
           <button class="sys-btn" (click)="gameService.settingsModalOpen.set(true)">[ SYSTEM ]</button>
        </div>
      </header>

      <main class="content-area">
        @if (gameService.settings().video.view_mode === 'HYPER') {
           <app-workspace />
        } @else {
           <div class="game-wrapper" 
                [class.distorted]="gameService.settings().video.glitch && gameService.isDistorted()"
                [class.glitch-hud]="gameService.isGlitchy()"
                [class.thermal-throttle]="gameService.isOverheating()"
                [class.ui-corrupted]="gameService.isCorrupted()"
                [class.trace-high-glitch]="gameService.detectionLevel() > 70">
                
             @switch (gameService.activeTab()) {
                @case ('TERMINAL') { <app-terminal /> }
                @case ('GRID') { <app-network-hub /> }
                @case ('MISSIONS') { <app-operations-hub /> }
                @case ('SOCIAL') { <app-social-hub /> }
                @case ('HARDWARE') { <app-hardware-hub /> }
                @case ('SYSTEM') { <app-system-hub /> }
             }
           </div>
        }
      </main>

      <!-- GLOBAL NAVIGATION DOCK -->
      <nav class="global-dock terminal-frame" *ngIf="gameService.settings().video.view_mode !== 'HYPER'">
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

      <!-- SYSTEM SETTINGS OVERLAY -->
      @if (gameService.settingsModalOpen()) {
         <app-settings-modal />
      }
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
      background: rgba(10, 15, 30, 0.95);
      border: none;
      border-bottom: 1px solid rgba(0, 255, 159, 0.1);
      z-index: 2000;
      flex-shrink: 0;
    }

    .header-left { display: flex; align-items: center; gap: 12px; font-size: 0.75rem; }
    .header-center { display: flex; gap: 1.5rem; }
    .stat-pill { display: flex; gap: 6px; font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; }
    .stat-pill .label { opacity: 0.4; }
    .stat-pill .value { font-weight: bold; }
    .stat-pill .value.cyan { color: var(--neon-cyan); }
    .stat-pill .value.magenta { color: var(--neon-magenta); }
    .stat-pill.alert .value { animation: blink 0.5s infinite; }

    .content-area {
      flex: 1;
      min-height: 0;
      position: relative;
      background: var(--layer-0);
    }

    .game-wrapper {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding-top: 28px;
    }

    .global-dock {
      height: 64px;
      background: rgba(13, 21, 32, 0.98);
      border: none;
      border-top: 1px solid rgba(0, 255, 159, 0.1);
      display: flex;
      justify-content: center;
      z-index: 2000;
      flex-shrink: 0;
    }
    .dock-inner { display: flex; width: 100%; max-width: 900px; }
    .dock-btn {
      flex: 1; border: none; background: transparent; color: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
    }
    .dock-btn:hover { background: rgba(0, 255, 159, 0.05); }
    .dock-btn.active { color: var(--primary); }
    .d-label { font-size: 0.6rem; font-family: 'Orbitron', monospace; font-weight: 700; letter-spacing: 1px; }
    .d-active-bar {
      position: absolute; bottom: 0; width: 40%; height: 2px; background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
    }

    .telemetry-modal {
       position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
       z-index: 10000; display: flex; align-items: center; justify-content: center;
       padding: 1rem;
    }
    .modal-box { 
      background: var(--layer-1); 
      width: 95%; 
      max-width: 600px; 
      max-height: calc(100dvh - 120px); 
      display: flex; 
      flex-direction: column; 
      gap: 1rem; 
      padding: 1rem;
    }
    .log-content { flex: 1; overflow-y: auto; }

    @media (max-width: 850px) {
       .header-center { gap: 10px; }
       .onboard-status { display: none; }
    }

    @media (max-width: 480px) {
       .global-header { height: 50px; }
       .stat-pill { flex-direction: column; gap: 0; align-items: center; }
       .d-label { font-size: 0.5rem; letter-spacing: 0; }
    }

    @keyframes blink { 50% { opacity: 0.2; } }
  `
})
export class AppComponent implements OnInit {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  streamerService = inject(StreamerIntegrationService);
  onboardAi = inject(OnboardAiService);
  nightmare = inject(NeuralNightmareService);
  private route = inject(ActivatedRoute);

  globeModalOpen = signal(false);

  decayFactor = computed(() => {
     const rep = this.gameService.reputation();
     return Math.min(1, rep / 5000);
  });

  ngOnInit() {
    this.onboardAi.initialize();
    this.nightmare.bindToTerminal();
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
}
