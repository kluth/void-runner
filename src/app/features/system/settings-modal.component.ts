import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { FactionService } from '../../core/services/faction.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-overlay glass-overlay" (click)="close()">
      <div class="modal-box terminal-frame" (click)="$event.stopPropagation()">
        <div class="ascii-line cyan">SYSTEM_CONFIGURATION // OMNI_LINK</div>
        
        <div class="settings-content">
          <!-- AUDIO SETTINGS -->
          <section class="settings-sec">
            <div class="sec-header">AUDIO_PROCESSING</div>
            <div class="sec-body">
              <div class="setting-item">
                 <label>MASTER_VOLUME: {{ gameService.settings().audio.volume }}%</label>
                 <input type="range" min="0" max="100" [value]="gameService.settings().audio.volume" 
                        (input)="update('audio.volume', $any($event.target).value)">
              </div>
              <div class="btn-group">
                <button [class.active]="gameService.settings().audio.music_enabled" (click)="update('audio.music_enabled', (!gameService.settings().audio.music_enabled).toString())">
                   MUSIC: {{ gameService.settings().audio.music_enabled ? 'ON' : 'OFF' }}
                </button>
                <button [class.active]="gameService.settings().audio.speech" (click)="update('audio.speech', (!gameService.settings().audio.speech).toString())">
                   SPEECH: {{ gameService.settings().audio.speech ? 'ON' : 'OFF' }}
                </button>
                <button [class.active]="gameService.settings().audio.glitch_tts" (click)="update('audio.glitch_tts', (!gameService.settings().audio.glitch_tts).toString())">
                   GLITCH_TTS: {{ gameService.settings().audio.glitch_tts ? 'ON' : 'OFF' }}
                </button>
              </div>
            </div>
          </section>

          <!-- VIDEO SETTINGS -->
          <section class="settings-sec">
            <div class="sec-header">VISUAL_CORTEX_CALIBRATION</div>
            <div class="sec-body">
              <div class="setting-item">
                 <label>GLITCH_INTENSITY: {{ gameService.settings().video.glitch_intensity }}%</label>
                 <input type="range" min="0" max="100" [value]="gameService.settings().video.glitch_intensity" 
                        (input)="update('video.glitch_intensity', $any($event.target).value)">
              </div>
              <div class="btn-group">
                <button [class.active]="gameService.settings().video.matrix" (click)="update('video.matrix', (!gameService.settings().video.matrix).toString())">
                   MATRIX: {{ gameService.settings().video.matrix ? 'ON' : 'OFF' }}
                </button>
                <button [class.active]="gameService.settings().video.crt_curvature" (click)="update('video.crt_curvature', (!gameService.settings().video.crt_curvature).toString())">
                   CRT_WARP: {{ gameService.settings().video.crt_curvature ? 'ON' : 'OFF' }}
                </button>
                <button [class.active]="gameService.settings().video.scanlines" (click)="update('video.scanlines', (!gameService.settings().video.scanlines).toString())">
                   SCANLINES: {{ gameService.settings().video.scanlines ? 'ON' : 'OFF' }}
                </button>
              </div>
            </div>
          </section>

          <!-- NETWORK SETTINGS -->
          <section class="settings-sec">
            <div class="sec-header">NETWORK_STABILITY</div>
            <div class="sec-body">
              <div class="btn-group">
                @for (type of ['AES', 'RSA', 'QUANTUM']; track type) {
                  <button [class.active]="gameService.settings().network.encryption_type === type"
                          (click)="update('network.encryption_type', type)">
                    {{ type }}
                  </button>
                }
              </div>
              <button class="w-full mt-2" [class.active]="gameService.settings().network.auto_reconnect" (click)="update('network.auto_reconnect', (!gameService.settings().network.auto_reconnect).toString())">
                 AUTO_RECONNECT: {{ gameService.settings().network.auto_reconnect ? 'ENABLED' : 'DISABLED' }}
              </button>
            </div>
          </section>

          <!-- SOCIAL & COMMUNITY -->
          <section class="settings-sec">
            <div class="sec-header">NEURAL_SOCIAL_UPLINK</div>
            <div class="sec-body">
              <div class="btn-group mb-4">
                <button class="social-btn discord" (click)="linkSocial('discord')">[ LINK_DISCORD ]</button>
                <button class="social-btn twitter" (click)="linkSocial('twitter')">[ LINK_X_CORP ]</button>
              </div>
              <div class="community-goal">
                 <div class="g-header">GLOBAL_LORE_DECRYPTION: 64%</div>
                 <div class="g-bar"><div class="fill" style="width: 64%"></div></div>
                 <button class="primary w-full mt-2" (click)="contributeMine()">[ REDIRECT_MINE_TO_COMMUNITY ]</button>
              </div>
              <button class="cyan w-full mt-4" (click)="shareSession()">[ BROADCAST_UPLINK_URL ]</button>
            </div>
          </section>

          <!-- BETA & OVERRIDES -->
          <section class="settings-sec">
            <div class="sec-header">BETA_PROTOCOL_OVERRIDES</div>
            <div class="sec-body">
              <div class="btn-group">
                <button [class.active]="gameService.settings().beta.ai_insights" (click)="update('beta.ai_insights', (!gameService.settings().beta.ai_insights).toString())">
                   AI_INSIGHTS
                </button>
                <button [class.active]="gameService.settings().beta.experimental_shaders" (click)="update('beta.experimental_shaders', (!gameService.settings().beta.experimental_shaders).toString())">
                   FX_SHADERS
                </button>
              </div>
              <div class="density-selector mt-2">
                 <label>HUD_DENSITY:</label>
                 <div class="btn-group">
                    @for (d of ['AUTO', 'LOW', 'MED', 'HIGH']; track d) {
                      <button [class.active]="gameService.settings().video.hud_density === d" (click)="update('video.hud_density', d)">{{ d }}</button>
                    }
                 </div>
              </div>
            </div>
          </section>
        </div>

        <button class="magenta w-full mt-4" (click)="close()">[ DISCONNECT_INTERFACE ]</button>
      </div>
    </div>
  `,
  styles: `
    .settings-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .modal-box { 
      background: var(--layer-1); 
      width: 100%; max-width: 600px; max-height: 90dvh;
      display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem;
    }
    .settings-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; padding-right: 10px; }
    .settings-content::-webkit-scrollbar { width: 4px; }
    .settings-content::-webkit-scrollbar-thumb { background: var(--primary); }
    
    .settings-sec { margin-bottom: 5px; }
    .sec-header { font-size: 0.6rem; color: var(--secondary); font-weight: 900; margin-bottom: 12px; border-bottom: 1px solid rgba(0, 229, 255, 0.2); padding-bottom: 4px; }
    
    .setting-item { margin-bottom: 12px; }
    .setting-item label { display: block; font-size: 0.6rem; opacity: 0.7; margin-bottom: 4px; }
    .setting-item input[type="range"] { width: 100%; height: 4px; appearance: none; background: rgba(255, 255, 255, 0.1); outline: none; }
    .setting-item input[type="range"]::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; background: var(--primary); cursor: pointer; }

    .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-group button { flex: 1; min-width: 80px; padding: 6px; font-size: 0.55rem; white-space: nowrap; }
    .btn-group button.active { background: var(--primary); color: #000; box-shadow: 0 0 10px var(--primary); }

    .social-btn { flex: 1; }
    .discord { border-color: #5865F2; color: #5865F2; }
    .twitter { border-color: #1DA1F2; color: #1DA1F2; }

    .community-goal { background: rgba(0, 255, 159, 0.05); padding: 10px; border: 1px dashed var(--primary); }
    .g-header { font-size: 0.6rem; font-weight: bold; }
    .g-bar { height: 6px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--primary); margin-top: 5px; }
    .g-bar .fill { height: 100%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }

    .density-selector { display: flex; align-items: center; gap: 10px; }
    .density-selector label { font-size: 0.6rem; opacity: 0.6; }
  `
})
export class SettingsModalComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  factionService = inject(FactionService);

  close() {
    this.gameService.settingsModalOpen.set(false);
  }

  update(path: string, val: string) {
    this.gameService.updateSetting(path, val);
    this.audioService.playClick();
  }

  linkSocial(platform: string) {
    this.gameService.log(`[SOCIAL] Initiating OAuth handshake for ${platform.toUpperCase()}...`);
    this.audioService.playClick();
  }

  contributeMine() {
    this.gameService.log(`[COMMUNITY] Mining cycles redirected to GLOBAL_LORE_DECRYPTION.`);
    this.audioService.playSuccess();
  }

  shareSession() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'VOID_RUN Protocol', url });
    } else {
      navigator.clipboard.writeText(url);
      this.gameService.log(`[UPLINK] URL copied to neural clipboard.`);
    }
  }
}
