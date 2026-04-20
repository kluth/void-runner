import { Component, inject, signal, OnInit } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="header">VOID_RUNNER // NEURAL_HANDSHAKE</div>
        
        @if (gameService.twoFactorUserId()) {
          <div class="auth-form">
            <div class="label">MFA_VALIDATION_REQUIRED</div>
            <input type="text" [(ngModel)]="otpCode" placeholder="ENTER_TOTP_CODE" (keyup.enter)="verify2fa()">
            <button class="auth-btn" (click)="verify2fa()">VALIDATE_IDENTITY</button>
          </div>
        } @else {
          <div class="auth-desc">
            GRID_SECURITY_ENFORCED: Standard authentication vectors are currently offline. 
            Google Neural Synchronization is required for identity verification.
          </div>

          <div class="oauth-buttons">
            <button class="oa-btn google active-uplink" (click)="loginOAuth('google')">SYNC_VIA_GOOGLE</button>
          </div>
        }

        @if (gameService.qrCode()) {
          <div class="mfa-setup">
            <div class="label">MFA_UPLINK_READY</div>
            <img [src]="gameService.qrCode()" alt="QR Code">
            <p>Scan this with Google Authenticator to secure your node.</p>
            <button class="auth-btn" (click)="closeMfa()">ACKNOWLEDGE</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .auth-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(14, 14, 14, 0.95); z-index: 12000;
      display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      padding: 20px;
      box-sizing: border-box;
    }
    .auth-box {
      width: 100%;
      max-width: 400px; padding: 2.5rem; border: var(--ghost-border);
      box-shadow: var(--neon-shadow); background: var(--layer-1);
    }
    .header { font-family: 'Space Grotesk', sans-serif; color: var(--primary); font-size: 1rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: 2px; text-align: center; }
    .auth-desc { font-size: 0.6rem; color: var(--primary); opacity: 0.4; text-align: center; margin-bottom: 2rem; line-height: 1.6; }
    
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    input { background: var(--layer-0); border: var(--ghost-border); color: #fff; padding: 12px; font-size: 0.75rem; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
    input:focus { border-color: var(--primary); }
    
    .auth-btn { background: var(--layer-4); color: var(--primary); border: var(--ghost-border); padding: 12px; font-size: 0.65rem; font-weight: 900; cursor: pointer; transition: all 0.05s steps(2); }
    .auth-btn:hover { background: var(--primary); color: var(--on-primary); }
    
    .oauth-buttons { display: flex; flex-direction: column; gap: 10px; margin-top: 2rem; }
    .oa-btn { background: var(--layer-2); border: var(--ghost-border); color: var(--primary); padding: 1rem; font-size: 0.7rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 900; letter-spacing: 1px; transition: all 0.05s steps(2); }
    
    .oa-btn.google.active-uplink { 
      background: var(--layer-4); border-color: #4285F4; color: #fff;
    }
    .oa-btn.google.active-uplink:hover { 
      background: #4285F4; box-shadow: 0 0 30px rgba(66, 133, 244, 0.4);
    }

    .label { font-size: 0.6rem; color: var(--secondary); margin-bottom: 8px; font-weight: 900; }
    .mfa-setup { margin-top: 2rem; text-align: center; border-top: var(--ghost-border); padding-top: 2rem; }
    .mfa-setup img { width: 150px; height: 150px; margin-bottom: 1.5rem; filter: brightness(0.8) contrast(1.2); }
    .mfa-setup p { font-size: 0.6rem; color: var(--primary); opacity: 0.5; margin-bottom: 1.5rem; }
  `
})
export class AuthComponent implements OnInit {
  gameService = inject(GameService);
  private route = inject(ActivatedRoute);

  mode: 'login' | 'register' = 'login';
  username = '';
  password = '';
  otpCode = '';

  ngOnInit() {
    // Check for token in URL (post-OAuth redirect)
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.gameService.handleOAuthToken(token);
    }
  }

  submit() {
    if (this.mode === 'login') {
      this.gameService.login(this.username, this.password);
    } else {
      this.gameService.register(this.username, this.password);
    }
  }

  loginOAuth(provider: string) {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const baseUrl = isProd ? window.location.origin : 'http://localhost:3000';
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  }

  verify2fa() {
    this.gameService.verify2fa(this.otpCode);
  }

  closeMfa() {
    this.gameService.qrCode.set(null);
  }
}
