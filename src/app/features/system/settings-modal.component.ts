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
          <!-- SOCIAL LINKING -->
          <section class="settings-sec">
            <div class="sec-header">NEURAL_SOCIAL_UPLINK</div>
            <div class="sec-body">
              <button class="social-btn discord" (click)="linkSocial('discord')">
                 [ LINK_DISCORD ]
              </button>
              <button class="social-btn twitter" (click)="linkSocial('twitter')">
                 [ LINK_X_CORP ]
              </button>
            </div>
          </section>

          <!-- WEB3 COMMUNITY -->
          <section class="settings-sec">
            <div class="sec-header">VOID_COMMUNITY_CONSENSUS</div>
            <div class="sec-body">
              <div class="community-goal">
                 <div class="g-header">GLOBAL_LORE_DECRYPTION: 64%</div>
                 <div class="g-bar"><div class="fill" style="width: 64%"></div></div>
                 <button class="primary w-full mt-2" (click)="contributeMine()">[ REDIRECT_MINE_TO_COMMUNITY ]</button>
              </div>
            </div>
          </section>

          <!-- LINK SHARING -->
          <section class="settings-sec">
            <div class="sec-header">SIGNAL_BROADCAST</div>
            <div class="sec-body">
              <p class="text-xs opacity-60 mb-2">Share your session link to recruit other operatives.</p>
              <button class="cyan w-full" (click)="shareSession()">[ BROADCAST_UPLINK_URL ]</button>
            </div>
          </section>

          <!-- DENSITY OVERRIDE -->
          <section class="settings-sec">
            <div class="sec-header">HUD_DENSITY_OVERRIDE</div>
            <div class="sec-body density-btns">
              @for (d of ['AUTO', 'LOW', 'MED', 'HIGH']; track d) {
                <button [class.active]="gameService.settings().video.hud_density === d"
                        (click)="setDensity(d)">
                  {{ d }}
                </button>
              }
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
      width: 100%; max-width: 500px; 
      display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem;
    }
    .settings-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; }
    
    .sec-header { font-size: 0.6rem; color: var(--secondary); font-weight: 900; margin-bottom: 8px; border-bottom: 1px solid rgba(0, 229, 255, 0.2); }
    
    .social-btn { width: 100%; margin-bottom: 8px; text-align: left; }
    .discord { border-color: #5865F2; color: #5865F2; }
    .twitter { border-color: #1DA1F2; color: #1DA1F2; }

    .g-bar { height: 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--primary); margin-top: 5px; }
    .g-bar .fill { height: 100%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }
    
    .density-btns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
    .density-btns button { padding: 5px; font-size: 0.6rem; }
    .density-btns button.active { background: var(--primary); color: #000; }

    .community-goal { background: rgba(0, 255, 159, 0.05); padding: 10px; border: 1px dashed var(--primary); }
    .g-header { font-size: 0.6rem; font-weight: bold; }
  `
})
export class SettingsModalComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  factionService = inject(FactionService);

  close() {
    this.gameService.mobileTelemetryOpen.set(false);
  }

  linkSocial(platform: string) {
    this.gameService.log(`[SOCIAL] Initiating OAuth handshake for ${platform.toUpperCase()}...`);
    this.audioService.playClick();
    // In a real app, window.location.href = `/auth/${platform}`
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

  setDensity(d: string) {
    this.gameService.updateSetting('video.hud_density', d);
  }
}
