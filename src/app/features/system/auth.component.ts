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
          <div class="tabs">
            <div class="tab" [class.active]="mode === 'login'" (click)="mode = 'login'">LOGIN</div>
            <div class="tab" [class.active]="mode === 'register'" (click)="mode = 'register'">INITIALIZE_NODE</div>
          </div>

          <div class="auth-form">
            <input type="text" [(ngModel)]="username" placeholder="OPERATIVE_HANDLE">
            <input type="password" [(ngModel)]="password" placeholder="ENCRYPTION_KEY">
            <button class="auth-btn" (click)="submit()">
              {{ mode === 'login' ? 'ESTABLISH_LINK' : 'GENERATE_CREDENTIALS' }}
            </button>
          </div>

          <div class="oauth-divider">
            <span>OR_VIA_UPLINK</span>
          </div>

          <div class="oauth-buttons">
            <div class="oa-row">
              <button class="oa-btn google" (click)="loginOAuth('google')">GOOGLE</button>
              <button class="oa-btn github" (click)="loginOAuth('github')">GITHUB</button>
            </div>
            <div class="oa-row">
              <button class="oa-btn discord" (click)="loginOAuth('discord')">DISCORD</button>
              <button class="oa-btn facebook" (click)="loginOAuth('facebook')">FACEBOOK</button>
            </div>
            <div class="oa-row">
              <button class="oa-btn twitter" (click)="loginOAuth('twitter')">X/TWITTER</button>
              <button class="oa-btn microsoft" (click)="loginOAuth('microsoft')">MICROSOFT</button>
            </div>
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
      background: rgba(0, 0, 0, 0.9); z-index: 12000;
      display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      padding: 20px;
      box-sizing: border-box;
    }
    .auth-box {
      width: 100%;
      max-width: 400px; padding: clamp(15px, 5vw, 30px); border: 1px solid #00ff00;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.1); background: #050505;
      max-height: 90vh; overflow-y: auto;
    }
    .header { color: #00ff00; font-size: clamp(0.7em, 2vw, 0.9em); font-weight: bold; margin-bottom: 10px; letter-spacing: 2px; text-align: center; }
    .auth-desc { font-size: 0.5em; color: #008800; text-align: center; margin-bottom: 25px; line-height: 1.4; }
    
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #111; padding-bottom: 10px; }
    .tab { font-size: 0.6em; color: #004400; cursor: pointer; }
    .tab.active { color: #00ff00; font-weight: bold; }

    .auth-form { display: flex; flex-direction: column; gap: 15px; }
    input { background: #000; border: 1px solid #004444; color: #fff; padding: 10px; font-size: 0.7em; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
    input:focus { border-color: #00ff00; }
    
    .auth-btn { background: #004444; border: 1px solid #00ff00; color: #00ff00; padding: 12px; font-size: 0.6em; font-weight: bold; cursor: pointer; font-family: inherit; width: 100%; }
    .auth-btn:hover { background: #00ff00; color: #000; }
    
    .oauth-divider { margin: 20px 0; text-align: center; border-bottom: 1px solid #111; line-height: 0.1em; }
    .oauth-divider span { background: #050505; padding: 0 10px; font-size: 0.5em; color: #004400; }

    .oauth-buttons { display: flex; flex-direction: column; gap: 8px; }
    .oa-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .oa-btn { flex: 1; min-width: 100px; background: transparent; border: 1px solid #222; color: #888; padding: 8px; font-size: 0.45em; cursor: pointer; font-family: inherit; font-weight: bold; }
    .oa-btn:hover { border-color: #fff; color: #fff; }

    @media (max-width: 400px) {
      .oa-row { flex-direction: column; }
      .oa-btn { width: 100%; }
    }
    .oa-btn.google:hover { border-color: #4285F4; color: #4285F4; }
    .oa-btn.facebook:hover { border-color: #3b5998; color: #3b5998; }
    .oa-btn.twitter:hover { border-color: #1DA1F2; color: #1DA1F2; }
    .oa-btn.github:hover { border-color: #6e5494; color: #6e5494; }
    .oa-btn.discord:hover { border-color: #7289da; color: #7289da; }
    .oa-btn.microsoft:hover { border-color: #00a1f1; color: #00a1f1; }

    .label { font-size: 0.6em; color: #008800; margin-bottom: 5px; }
    .mfa-setup { margin-top: 20px; text-align: center; border-top: 1px dashed #004444; padding-top: 20px; }
    .mfa-setup img { width: 150px; height: 150px; border: 5px solid #fff; margin-bottom: 15px; }
    .mfa-setup p { font-size: 0.5em; color: #888; margin-bottom: 15px; }
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
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  }

  verify2fa() {
    this.gameService.verify2fa(this.otpCode);
  }

  closeMfa() {
    this.gameService.qrCode.set(null);
  }
}
