import { Component, inject, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { VisionAnalysisService } from '../../core/services/vision-analysis.service';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-surveillance-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="surveillance-overlay">
        <div class="surveillance-frame terminal-frame danger">
          <!-- Header -->
          <div class="surveillance-header">
            <span class="blink-dot"></span>
            <span class="surv-title">NEURAL_OBSERVE // SURVEILLANCE ACTIVE</span>
            <span class="surv-phase" [class]="onboard.phase().toLowerCase()">{{ onboard.phase() }}</span>
            <button class="close-btn" (click)="close()">[X]</button>
          </div>

          <div class="surveillance-body">
            <!-- Live Camera Feed -->
            <div class="feed-section">
              <div class="section-label cyan">
                @if (vision.isAnalyzing()) {
                  <span class="rec-dot"></span>
                }
                VISUAL_FEED // {{ vision.isAnalyzing() ? 'ANALYZING' : 'STANDBY' }}
              </div>
              <div class="camera-container">
                <video #videoEl class="camera-video" autoplay playsinline muted></video>
                <canvas #overlayEl class="overlay-canvas"></canvas>
                <div class="feed-hud">
                  <div class="hud-corner tl"></div>
                  <div class="hud-corner tr"></div>
                  <div class="hud-corner bl"></div>
                  <div class="hud-corner br"></div>
                  <div class="hud-crosshair"></div>
                  <div class="hud-timestamp">{{ getTimestamp() }}</div>
                  <div class="hud-subject">SUBJECT: {{ game.playerHandle() }}</div>
                  <div class="hud-faces" *ngIf="vision.faceCount() > 0">
                    {{ vision.faceCount() }} FACE(S) LOCKED
                  </div>
                </div>
              </div>
              <div class="feed-controls">
                <button class="ctrl-btn" [class.active]="cameraActive()"
                        (click)="toggleCamera()">
                  {{ cameraActive() ? '⏹ STOP FEED' : '📷 START FEED' }}
                </button>
                <button class="ctrl-btn" [class.active]="vision.isAnalyzing()"
                        [disabled]="!cameraActive()"
                        (click)="toggleAnalysis()">
                  {{ vision.isAnalyzing() ? '⏸ PAUSE ANALYSIS' : '🧠 START ANALYSIS' }}
                </button>
                <button class="ctrl-btn" (click)="requestPermissions()" [disabled]="permissionsRequested()">
                  {{ permissionsRequested() ? '✓ PERMISSIONS GRANTED' : '🔓 GRANT ALL PERMISSIONS' }}
                </button>
              </div>
            </div>

            <!-- Analysis Results -->
            <div class="analysis-grid">
              <!-- ONBOARD's Observation -->
              <div class="observation-panel">
                <div class="section-label violet">ONBOARD OBSERVATION</div>
                <div class="observation-text" [class.whisper]="onboard.whisperMode()">
                  @if (currentObservation()) {
                    {{ currentObservation() }}
                  } @else {
                    <span class="dim">Awaiting visual data...</span>
                  }
                </div>
                <div class="observation-meta" *ngIf="vision.lastAnalysis()">
                  Last scan: {{ getTimeSinceLastAnalysis() }}
                </div>
              </div>

              <!-- Detected Objects -->
              <div class="objects-panel">
                <div class="section-label cyan">DETECTED ENTITIES</div>
                <div class="objects-list">
                  @if (vision.lastAnalysis(); as analysis) {
                    @for (obj of analysis.objects; track $index) {
                      <div class="object-item" [class.high-confidence]="obj.score > 0.7">
                        <span class="obj-class">{{ obj.class }}</span>
                        <span class="obj-score">{{ (obj.score * 100) | number:'1.0-0' }}%</span>
                      </div>
                    } @empty {
                      <div class="dim">No objects detected</div>
                    }
                  } @else {
                    <div class="dim">Analysis pending...</div>
                  }
                </div>
              </div>

              <!-- Face Analysis -->
              <div class="faces-panel">
                <div class="section-label magenta">FACIAL ANALYSIS</div>
                @if (vision.lastAnalysis(); as analysis) {
                  @for (face of analysis.faces; track $index; let i = $index) {
                    <div class="face-card">
                      <div class="face-header">SUBJECT_{{ i + 1 }}</div>
                      <div class="face-data">
                        <div class="face-row">
                          <span class="fr-label">Expression:</span>
                          <span class="fr-val" [class]="'expr-' + face.dominantExpression">
                            {{ face.dominantExpression | uppercase }}
                          </span>
                        </div>
                        <div class="face-row" *ngIf="face.ageEstimate">
                          <span class="fr-label">Est. Age:</span>
                          <span class="fr-val">~{{ face.ageEstimate }}</span>
                        </div>
                        <div class="face-row">
                          <span class="fr-label">Confidence:</span>
                          <span class="fr-val">{{ (face.confidence * 100) | number:'1.0-0' }}%</span>
                        </div>
                        <div class="face-row" *ngIf="face.accessories.length > 0">
                          <span class="fr-label">Accessories:</span>
                          <span class="fr-val">{{ face.accessories.join(', ') }}</span>
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="dim">No faces detected</div>
                  }
                }
              </div>

              <!-- Scene Info -->
              <div class="scene-panel">
                <div class="section-label">ENVIRONMENT</div>
                @if (vision.lastAnalysis(); as analysis) {
                  <div class="scene-data">
                    <div class="scene-row">
                      <span class="sr-label">Brightness:</span>
                      <div class="brightness-bar">
                        <div class="bb-fill" [style.width.%]="(analysis.brightness / 255) * 100"></div>
                      </div>
                      <span class="sr-val">{{ analysis.brightness }}/255</span>
                    </div>
                    <div class="scene-row">
                      <span class="sr-label">Mood:</span>
                      <span class="sr-val mood" [class]="'mood-' + analysis.overallMood">
                        {{ analysis.overallMood | uppercase }}
                      </span>
                    </div>
                    <div class="scene-row colors-row">
                      <span class="sr-label">Palette:</span>
                      <div class="color-swatches">
                        @for (color of analysis.dominantColors.slice(0, 5); track $index) {
                          <div class="swatch" [style.background]="color.hex"
                               [title]="color.hex + ' (' + color.percentage + '%)'">
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Recent Observations Log -->
              <div class="log-panel">
                <div class="section-label">OBSERVATION_LOG</div>
                <div class="log-scroll">
                  @for (obs of vision.observations().slice(-8).reverse(); track obs.timestamp) {
                    <div class="log-entry" [class]="'cat-' + obs.category">
                      <span class="log-time">{{ formatTime(obs.timestamp) }}</span>
                      <span class="log-cat">[{{ obs.category | uppercase }}]</span>
                      <span class="log-desc">{{ obs.description }}</span>
                    </div>
                  } @empty {
                    <div class="dim">No observations recorded</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .surveillance-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(5, 8, 16, 0.97);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } }

    .surveillance-frame {
      width: 100%;
      max-width: 1100px;
      max-height: 95vh;
      overflow-y: auto;
      background: var(--layer-1);
      border: 1px solid rgba(255, 0, 85, 0.3);
    }

    .surveillance-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: rgba(255, 0, 85, 0.1);
      border-bottom: 1px solid rgba(255, 0, 85, 0.2);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .blink-dot {
      width: 8px; height: 8px;
      background: var(--neon-magenta);
      animation: blink 1s steps(2) infinite;
      box-shadow: 0 0 6px var(--neon-magenta);
    }
    .rec-dot {
      display: inline-block;
      width: 6px; height: 6px;
      background: #f00;
      animation: blink 0.5s steps(2) infinite;
      margin-right: 6px;
      box-shadow: 0 0 4px #f00;
    }
    @keyframes blink { 50% { opacity: 0; } }

    .surv-title {
      font-family: 'Orbitron', monospace;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--neon-magenta);
      letter-spacing: 1px;
      flex: 1;
    }
    .surv-phase {
      font-size: 0.65rem;
      padding: 2px 8px;
      border: 1px solid rgba(191, 64, 255, 0.3);
      color: var(--neon-violet);
    }
    .surv-phase.hostile { color: var(--neon-magenta); border-color: var(--neon-magenta); animation: blink 1s infinite; }

    .close-btn {
      background: transparent;
      border: 1px solid var(--neon-magenta);
      color: var(--neon-magenta);
      padding: 2px 8px;
      font-size: 0.7rem;
      cursor: pointer;
    }

    .surveillance-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-label {
      font-family: 'Orbitron', monospace;
      font-size: 0.6rem;
      letter-spacing: 2px;
      margin-bottom: 6px;
      font-weight: 700;
      color: var(--neon-green);
    }
    .section-label.cyan { color: var(--neon-cyan); }
    .section-label.magenta { color: var(--neon-magenta); }
    .section-label.violet { color: var(--neon-violet); }

    /* Camera Feed */
    .camera-container {
      position: relative;
      width: 100%;
      max-width: 480px;
      aspect-ratio: 4/3;
      background: #000;
      border: 1px solid var(--neon-cyan);
      overflow: hidden;
    }
    .camera-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.1) saturate(0.9);
    }
    .overlay-canvas {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .feed-hud {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
    }
    .hud-corner {
      position: absolute;
      width: 20px; height: 20px;
      border-color: var(--neon-magenta);
      border-style: solid;
      border-width: 0;
    }
    .hud-corner.tl { top: 8px; left: 8px; border-top-width: 2px; border-left-width: 2px; }
    .hud-corner.tr { top: 8px; right: 8px; border-top-width: 2px; border-right-width: 2px; }
    .hud-corner.bl { bottom: 8px; left: 8px; border-bottom-width: 2px; border-left-width: 2px; }
    .hud-corner.br { bottom: 8px; right: 8px; border-bottom-width: 2px; border-right-width: 2px; }

    .hud-crosshair {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 30px; height: 30px;
      border: 1px solid rgba(255, 0, 85, 0.4);
    }
    .hud-crosshair::before, .hud-crosshair::after {
      content: '';
      position: absolute;
      background: rgba(255, 0, 85, 0.2);
    }
    .hud-crosshair::before { top: 50%; left: -15px; right: -15px; height: 1px; }
    .hud-crosshair::after { left: 50%; top: -15px; bottom: -15px; width: 1px; }

    .hud-timestamp, .hud-subject, .hud-faces {
      position: absolute;
      font-size: 0.55rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--neon-green);
      text-shadow: 0 0 4px var(--neon-green);
    }
    .hud-timestamp { top: 12px; left: 32px; }
    .hud-subject { bottom: 12px; left: 32px; }
    .hud-faces { bottom: 12px; right: 32px; color: var(--neon-magenta); }

    .feed-controls {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .ctrl-btn {
      padding: 6px 12px;
      font-size: 0.6rem;
      background: transparent;
      border: 1px solid rgba(0, 255, 159, 0.2);
      color: var(--neon-green);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
    }
    .ctrl-btn:hover { border-color: var(--neon-green); background: rgba(0, 255, 159, 0.05); }
    .ctrl-btn.active { border-color: var(--neon-cyan); color: var(--neon-cyan); background: rgba(0, 229, 255, 0.1); }
    .ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Analysis Grid */
    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .observation-panel, .objects-panel, .faces-panel, .scene-panel, .log-panel {
      padding: 8px;
      border: 1px solid rgba(0, 255, 159, 0.1);
      background: rgba(0, 255, 159, 0.02);
    }

    .observation-text {
      font-size: 0.85rem;
      color: var(--text-bright);
      line-height: 1.4;
      min-height: 40px;
    }
    .observation-text.whisper { color: var(--text-dim); font-style: italic; }
    .observation-meta { font-size: 0.55rem; color: var(--text-muted); margin-top: 4px; }
    .dim { color: var(--text-muted); font-size: 0.7rem; }

    .objects-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .object-item {
      font-size: 0.65rem;
      padding: 2px 6px;
      border: 1px solid rgba(0, 229, 255, 0.2);
      display: flex;
      gap: 6px;
    }
    .object-item.high-confidence { border-color: var(--neon-cyan); }
    .obj-class { color: var(--text-bright); }
    .obj-score { color: var(--text-dim); }

    .face-card {
      padding: 6px;
      border: 1px solid rgba(191, 64, 255, 0.2);
      margin-bottom: 4px;
    }
    .face-header {
      font-family: 'Orbitron', monospace;
      font-size: 0.6rem;
      color: var(--neon-violet);
      margin-bottom: 4px;
    }
    .face-row { display: flex; gap: 8px; font-size: 0.65rem; margin-bottom: 2px; }
    .fr-label { color: var(--text-dim); }
    .fr-val { color: var(--text-bright); font-weight: 700; }
    .fr-val.expr-happy { color: var(--neon-green); }
    .fr-val.expr-sad { color: var(--neon-cyan); }
    .fr-val.expr-angry { color: var(--neon-magenta); }
    .fr-val.expr-surprised { color: var(--neon-orange); }
    .fr-val.expr-fearful { color: var(--neon-yellow); }
    .fr-val.expr-disgusted { color: var(--neon-magenta); }

    .scene-row { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; margin-bottom: 4px; }
    .sr-label { color: var(--text-dim); min-width: 70px; }
    .sr-val { color: var(--text-bright); }
    .sr-val.mood { font-weight: 700; }
    .sr-val.mood-happy { color: var(--neon-green); }
    .sr-val.mood-sad { color: var(--neon-cyan); }
    .sr-val.mood-angry { color: var(--neon-magenta); }

    .brightness-bar {
      flex: 1;
      height: 4px;
      background: var(--layer-0);
      max-width: 100px;
    }
    .bb-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--neon-magenta), var(--neon-orange), var(--neon-green));
    }

    .color-swatches { display: flex; gap: 3px; }
    .swatch {
      width: 16px; height: 16px;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .log-scroll { max-height: 150px; overflow-y: auto; }
    .log-entry { font-size: 0.6rem; margin-bottom: 3px; display: flex; gap: 6px; line-height: 1.3; }
    .log-time { color: var(--text-muted); min-width: 50px; }
    .log-cat { color: var(--neon-cyan); min-width: 80px; }
    .log-desc { color: var(--text-dim); }
    .log-entry.cat-mood .log-cat { color: var(--neon-violet); }
    .log-entry.cat-face .log-cat { color: var(--neon-cyan); }
    .log-entry.cat-object .log-cat { color: var(--neon-green); }
    .log-entry.cat-environment .log-cat { color: var(--neon-orange); }
    .log-entry.cat-accessory .log-cat { color: var(--neon-yellow); }

    @media (max-width: 768px) {
      .analysis-grid { grid-template-columns: 1fr; }
      .camera-container { max-width: 100%; }
    }
  `
})
export class SurveillanceOverlayComponent implements OnDestroy {
  onboard = inject(OnboardAiService);
  vision = inject(VisionAnalysisService);
  game = inject(GameService);
  audio = inject(AudioService);

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayEl') overlayEl!: ElementRef<HTMLCanvasElement>;

  visible = signal(false);
  cameraActive = signal(false);
  permissionsRequested = signal(false);
  currentObservation = signal<string | null>(null);

  private videoStream: MediaStream | null = null;
  private observationInterval: any = null;

  show() {
    this.visible.set(true);
    this.vision.initialize().then(success => {
      if (success) {
        this.game.log('<span style="color: var(--neon-cyan)">[VISION] Neural vision models loaded. COCO-SSD + FaceAPI ready.</span>');
      }
    });
  }

  close() {
    this.stopCameraFeed();
    this.visible.set(false);
  }

  async toggleCamera() {
    if (this.cameraActive()) {
      this.stopCameraFeed();
    } else {
      await this.startCameraFeed();
    }
  }

  private async startCameraFeed() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      const video = this.videoEl.nativeElement;
      video.srcObject = this.videoStream;
      await video.play();

      this.cameraActive.set(true);
      this.onboard.memory.cameraGranted = true;
      this.onboard.speak('Visual link established. I can see you now. Hold still while I analyze your face.');
      this.game.log('<span style="color: var(--neon-cyan)">[VISION] Camera feed active. Neural analysis ready.</span>');

      // Start creepy observation cycle
      this.startObservationCycle();
    } catch (err: any) {
      this.game.log('<span style="color: var(--neon-magenta)">[VISION] Camera access denied: ' + err.message + '</span>');
    }
  }

  private stopCameraFeed() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(t => t.stop());
      this.videoStream = null;
    }
    this.cameraActive.set(false);
    this.vision.stopContinuousAnalysis();
    if (this.observationInterval) {
      clearInterval(this.observationInterval);
      this.observationInterval = null;
    }
  }

  async toggleAnalysis() {
    if (this.vision.isAnalyzing()) {
      this.vision.stopContinuousAnalysis();
      if (this.observationInterval) {
        clearInterval(this.observationInterval);
        this.observationInterval = null;
      }
    } else {
      // Set the video element for the vision service
      (this.vision as any).video = this.videoEl.nativeElement;
      const video = this.videoEl.nativeElement;
      (this.vision as any).canvas = document.createElement('canvas');
      (this.vision as any).canvas.width = video.videoWidth || 640;
      (this.vision as any).canvas.height = video.videoHeight || 480;
      (this.vision as any).ctx = (this.vision as any).canvas.getContext('2d', { willReadFrequently: true });

      this.vision.startContinuousAnalysis(12000);
      this.game.log('<span style="color: var(--neon-green)">[VISION] Continuous neural analysis active. Scanning every 12s.</span>');
    }
  }

  async requestPermissions() {
    this.onboard.requestCamera();
    this.onboard.requestMicrophone();
    this.onboard.requestNotifications();
    this.onboard.requestLocation();
    this.permissionsRequested.set(true);
  }

  private startObservationCycle() {
    // Every 20-40 seconds, generate a creepy observation
    const generateObservation = () => {
      const obs = this.vision.getCreepyObservation();
      if (obs) {
        this.currentObservation.set(obs);
        this.onboard.speak(obs);

        // Randomly add paranoia
        if (Math.random() < 0.3) {
          this.onboard.triggerParanoiaEvent();
        }
      }
    };

    // Initial observation after 8 seconds
    setTimeout(generateObservation, 8000);

    // Then every 25-45 seconds
    this.observationInterval = setInterval(() => {
      if (this.vision.lastAnalysis()) {
        generateObservation();
      }
    }, 25000 + Math.random() * 20000);
  }

  getTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  getTimeSinceLastAnalysis(): string {
    const analysis = this.vision.lastAnalysis();
    if (!analysis) return 'never';
    const ms = Date.now() - analysis.timestamp;
    if (ms < 60000) return `${Math.round(ms / 1000)}s ago`;
    return `${Math.round(ms / 60000)}m ago`;
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  ngOnDestroy() {
    this.stopCameraFeed();
    this.vision.destroy();
  }
}
