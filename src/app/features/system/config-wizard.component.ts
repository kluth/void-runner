import { Component, inject, signal, OnInit } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-config-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wizard-overlay">
      <div class="wizard-box">
        <div class="header">VOID_RUNNER // SYSTEM_INITIALIZATION</div>
        <div class="desc">System requires critical configuration before deployment. All keys will be stored in the persistent neural database and synced to environment variables.</div>
        
        <div class="form">
          <div class="field">
            <label>JWT_SECRET (Neural Encryption Key)</label>
            <input type="text" [(ngModel)]="config['JWT_SECRET']" placeholder="Enter high-entropy secret...">
          </div>
          <div class="field">
            <label>SESSION_SECRET (Darknet Session Key)</label>
            <input type="text" [(ngModel)]="config['SESSION_SECRET']" placeholder="Enter random session secret...">
          </div>
          
          <div class="divider">OPTIONAL_OAUTH_UPLINKS</div>
          
          <div class="field">
            <label>GOOGLE_CLIENT_ID</label>
            <input type="text" [(ngModel)]="config['GOOGLE_CLIENT_ID']">
          </div>
          <div class="field">
            <label>GOOGLE_CLIENT_SECRET</label>
            <input type="password" [(ngModel)]="config['GOOGLE_CLIENT_SECRET']">
          </div>
          
          <div class="field">
            <label>GITHUB_CLIENT_ID</label>
            <input type="text" [(ngModel)]="config['GITHUB_CLIENT_ID']">
          </div>
          <div class="field">
            <label>GITHUB_CLIENT_SECRET</label>
            <input type="password" [(ngModel)]="config['GITHUB_CLIENT_SECRET']">
          </div>

          <div class="actions">
            <button class="setup-btn" (click)="submit()" [disabled]="!config['JWT_SECRET'] || !config['SESSION_SECRET']">
              FINALIZE_SYSTEM_BUILD
            </button>
            <button class="skip-btn" (click)="skip()">
              SKIP_INITIALIZATION (BASIC_MODE)
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .wizard-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: var(--layer-0); z-index: 30000; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; padding: 1rem; }
    .wizard-box { width: 100%; max-width: 35rem; padding: 2.5rem; border: var(--ghost-border); box-shadow: var(--neon-shadow); background: var(--layer-1); max-height: 90dvh; overflow-y: auto; }
    .header { font-family: 'Space Grotesk', sans-serif; color: var(--primary); font-size: 1.2rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: 2px; text-align: center; }
    .desc { font-size: 0.65rem; color: var(--primary); opacity: 0.4; margin-bottom: 2rem; line-height: 1.6; text-align: center; }
    
    .form { display: flex; flex-direction: column; gap: 1.5rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-size: 0.55rem; color: var(--primary); font-weight: 900; letter-spacing: 1px; }
    input { background: var(--layer-2); border: var(--ghost-border); color: #fff; padding: 1rem; font-size: 0.75rem; font-family: inherit; outline: none; transition: all 0.05s steps(2); }
    input:focus { border-color: var(--primary); box-shadow: 0 0 15px rgba(13, 242, 242, 0.1); }
    
    .divider { font-family: 'Space Grotesk', sans-serif; font-size: 0.6rem; color: var(--primary); opacity: 0.3; border-bottom: var(--ghost-border); padding-bottom: 0.5rem; margin-top: 1rem; font-weight: 900; letter-spacing: 1px; }
    
    .actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
    .setup-btn { background: var(--primary); color: var(--on-primary); border: none; padding: 1rem; font-size: 0.8rem; font-weight: 900; cursor: pointer; transition: all 0.05s steps(2); }
    .setup-btn:hover:not(:disabled) { filter: brightness(1.2); box-shadow: 0 0 30px var(--primary); }
    .setup-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .skip-btn { background: transparent; border: var(--ghost-border); color: var(--primary); opacity: 0.4; padding: 0.75rem; font-size: 0.6rem; cursor: pointer; transition: all 0.05s steps(2); font-weight: 900; }
    .skip-btn:hover { opacity: 1; background: var(--layer-2); }
  `
})
export class ConfigWizardComponent implements OnInit {
  gameService = inject(GameService);
  private http = inject(HttpClient);

  config: Record<string, string> = {
    JWT_SECRET: '',
    SESSION_SECRET: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GITHUB_CLIENT_ID: '',
    GITHUB_CLIENT_SECRET: ''
  };

  ngOnInit() {}

  submit() {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const apiUrl = isProd ? '/api/config/setup' : 'http://localhost:3000/api/config/setup';

    this.http.post(apiUrl, this.config).subscribe(() => {
        window.location.reload();
    });
  }

  skip() {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const apiUrl = isProd ? '/api/config/skip' : 'http://localhost:3000/api/config/skip';

    this.http.post(apiUrl, {}).subscribe(() => {
        window.location.reload();
    });
  }
}
