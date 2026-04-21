import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-surveillance-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="surveillance-overlay" [class.active]="visible()">
        <div class="surveillance-frame terminal-frame danger">
          <div class="surveillance-header">
            <span class="blink-dot"></span>
            <span class="surv-title">NEURAL_OBSERVE // ACTIVE SURVEILLANCE</span>
            <span class="surv-phase">PHASE: {{ onboard.phase() }}</span>
            <button class="close-btn" (click)="close()">[X]</button>
          </div>

          <div class="surveillance-body">
            <!-- Camera Feed -->
            @if (onboard.memory.cameraGranted && onboard.getLastFrame()) {
              <div class="feed-section">
                <div class="section-label cyan">VISUAL_FEED</div>
                <div class="camera-feed">
                  <img [src]="onboard.getLastFrame()" alt="Surveillance capture" class="captured-frame" />
                  <div class="feed-overlay">
                    <div class="scanlines"></div>
                    <div class="feed-crosshair"></div>
                    <div class="feed-timestamp">REC {{ getTimestamp() }}</div>
                    <div class="feed-id">SUBJECT: {{ game.playerHandle() }}</div>
                    <div class="feed-status">BIOMETRIC: ANALYZING</div>
                  </div>
                </div>
              </div>
            }

            <!-- Surveillance Status -->
            <div class="status-grid">
              <div class="status-item">
                <span class="s-label">PARANOIA_LEVEL</span>
                <div class="s-bar">
                  <div class="s-fill" [style.width.%]="onboard.paranoiaLevel()" 
                       [class.low]="onboard.paranoiaLevel() < 30"
                       [class.medium]="onboard.paranoiaLevel() >= 30 && onboard.paranoiaLevel() < 70"
                       [class.high]="onboard.paranoiaLevel() >= 70">
                  </div>
                </div>
                <span class="s-val">{{ onboard.paranoiaLevel() | number:'1.0-0' }}%</span>
              </div>

              <div class="status-item">
                <span class="s-label">SESSION_DURATION</span>
                <span class="s-val">{{ getSessionDuration() }}</span>
              </div>

              <div class="status-item">
                <span class="s-label">NOISE_LEVEL</span>
                <span class="s-val" [class.alert]="onboard.memory.noiseLevel > 60">
                  {{ onboard.memory.noiseLevel | number:'1.0-0' }} dB
                </span>
              </div>

              <div class="status-item">
                <span class="s-label">CAMERA</span>
                <span class="s-val" [class.active]="onboard.memory.cameraGranted">
                  {{ onboard.memory.cameraGranted ? 'ACTIVE' : 'DENIED' }}
                </span>
              </div>

              <div class="status-item">
                <span class="s-label">MICROPHONE</span>
                <span class="s-val" [class.active]="onboard.memory.micGranted">
                  {{ onboard.memory.micGranted ? 'ACTIVE' : 'DENIED' }}
                </span>
              </div>

              <div class="status-item">
                <span class="s-label">LOCATION</span>
                <span class="s-val" [class.active]="onboard.memory.locationGranted">
                  {{ onboard.memory.locationGranted ? 'TRACKED' : 'HIDDEN' }}
                </span>
              </div>

              <div class="status-item">
                <span class="s-label">BATTERY</span>
                <span class="s-val" [class.low]="(onboard.memory.batteryLevel || 100) < 20">
                  {{ onboard.memory.batteryLevel ?? 'N/A' }}%
                  {{ onboard.memory.isCharging ? '(CHG)' : '' }}
                </span>
              </div>

              <div class="status-item">
                <span class="s-label">CONNECTION</span>
                <span class="s-val">{{ onboard.memory.connectionType }}</span>
              </div>
            </div>

            <!-- Permission Requests -->
            <div class="perm-section">
              <div class="section-label magenta">SURVEILLANCE_PERMISSIONS</div>
              <div class="perm-grid">
                <button class="perm-btn" [class.granted]="onboard.memory.cameraGranted"
                        (click)="requestCamera()">
                  {{ onboard.memory.cameraGranted ? '📷 CAMERA_ACTIVE' : '📷 GRANT_CAMERA' }}
                </button>
                <button class="perm-btn" [class.granted]="onboard.memory.micGranted"
                        (click)="requestMic()">
                  {{ onboard.memory.micGranted ? '🎤 MIC_ACTIVE' : '🎤 GRANT_MIC' }}
                </button>
                <button class="perm-btn" [class.granted]="onboard.memory.locationGranted"
                        (click)="requestLocation()">
                  {{ onboard.memory.locationGranted ? '📍 LOCATION_TRACKED' : '📍 GRANT_LOCATION' }}
                </button>
                <button class="perm-btn" [class.granted]="onboard.memory.notificationsGranted"
                        (click)="requestNotifications()">
                  {{ onboard.memory.notificationsGranted ? '🔔 NOTIFY_ON' : '🔔 GRANT_NOTIFY' }}
                </button>
              </div>
            </div>

            <!-- Last ONBOARD Message -->
            <div class="onboard-message">
              <div class="section-label violet">ONBOARD_OUTPUT</div>
              <div class="message-text" [class.whisper]="onboard.whisperMode()">
                {{ onboard.lastMessage() || 'Awaiting neural sync...' }}
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
      background: rgba(5, 8, 16, 0.95);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .surveillance-frame {
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
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
    }

    .blink-dot {
      width: 8px; height: 8px;
      background: var(--neon-magenta);
      animation: blink 1s steps(2) infinite;
      box-shadow: 0 0 6px var(--neon-magenta);
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
      color: var(--neon-violet);
      padding: 2px 8px;
      border: 1px solid rgba(191, 64, 255, 0.3);
    }

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
    }
    .section-label.cyan { color: var(--neon-cyan); }
    .section-label.magenta { color: var(--neon-magenta); }
    .section-label.violet { color: var(--neon-violet); }

    .feed-section { margin-bottom: 8px; }

    .camera-feed {
      position: relative;
      width: 100%;
      max-width: 320px;
      border: 1px solid var(--neon-cyan);
      overflow: hidden;
    }

    .captured-frame {
      width: 100%;
      display: block;
      filter: contrast(1.2) saturate(0.8);
    }

    .feed-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
    }

    .scanlines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(
        transparent 0px, transparent 2px,
        rgba(0, 255, 159, 0.03) 2px, rgba(0, 255, 159, 0.03) 4px
      );
    }

    .feed-crosshair {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      border: 1px solid rgba(255, 0, 85, 0.5);
      border-radius: 0;
    }
    .feed-crosshair::before, .feed-crosshair::after {
      content: '';
      position: absolute;
      background: rgba(255, 0, 85, 0.3);
    }
    .feed-crosshair::before {
      top: 50%; left: -10px; right: -10px; height: 1px;
    }
    .feed-crosshair::after {
      left: 50%; top: -10px; bottom: -10px; width: 1px;
    }

    .feed-timestamp, .feed-id, .feed-status {
      position: absolute;
      font-size: 0.55rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--neon-green);
      text-shadow: 0 0 4px var(--neon-green);
    }
    .feed-timestamp { top: 4px; left: 4px; }
    .feed-id { bottom: 4px; left: 4px; }
    .feed-status { bottom: 4px; right: 4px; color: var(--neon-magenta); }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }

    .status-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 6px;
      border: 1px solid rgba(0, 255, 159, 0.1);
      background: rgba(0, 255, 159, 0.02);
    }

    .s-label {
      font-size: 0.55rem;
      color: var(--text-dim);
      font-family: 'Orbitron', monospace;
      letter-spacing: 1px;
    }

    .s-val {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--neon-green);
    }
    .s-val.active { color: var(--neon-cyan); }
    .s-val.alert { color: var(--neon-magenta); animation: blink 0.5s steps(2) infinite; }
    .s-val.low { color: var(--neon-magenta); }

    .s-bar {
      height: 4px;
      background: var(--layer-0);
      width: 100%;
    }
    .s-fill {
      height: 100%;
      transition: width 0.5s, background 0.5s;
    }
    .s-fill.low { background: var(--neon-green); }
    .s-fill.medium { background: var(--neon-orange); }
    .s-fill.high { background: var(--neon-magenta); animation: blink 0.5s steps(2) infinite; }

    .perm-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .perm-btn {
      padding: 8px;
      font-size: 0.65rem;
      background: transparent;
      border: 1px solid rgba(0, 255, 159, 0.2);
      color: var(--neon-green);
      cursor: pointer;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
    }
    .perm-btn:hover {
      background: rgba(0, 255, 159, 0.05);
      border-color: var(--neon-green);
    }
    .perm-btn.granted {
      border-color: var(--neon-cyan);
      color: var(--neon-cyan);
      background: rgba(0, 229, 255, 0.05);
    }

    .onboard-message {
      padding: 8px;
      border: 1px solid rgba(191, 64, 255, 0.2);
      background: rgba(191, 64, 255, 0.03);
    }

    .message-text {
      font-size: 0.8rem;
      color: var(--text-bright);
      line-height: 1.4;
    }
    .message-text.whisper {
      color: var(--text-dim);
      font-style: italic;
      font-size: 0.75rem;
    }

    @media (max-width: 600px) {
      .perm-grid { grid-template-columns: 1fr; }
      .status-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `
})
export class SurveillanceOverlayComponent {
  onboard = inject(OnboardAiService);
  game = inject(GameService);
  visible = signal(false);

  show() { this.visible.set(true); }
  close() { this.visible.set(false); }

  getTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  getSessionDuration(): string {
    const ms = Date.now() - this.onboard.memory.sessionStartMs;
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  }

  requestCamera() { this.onboard.requestCamera(); }
  requestMic() { this.onboard.requestMicrophone(); }
  requestLocation() { this.onboard.requestLocation(); }
  requestNotifications() { this.onboard.requestNotifications(); }
}
