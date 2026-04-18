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
    .wizard-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 30000; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; }
    .wizard-box { width: 500px; padding: 40px; border: 2px solid #00ffff; box-shadow: 0 0 50px rgba(0, 255, 255, 0.1); background: #050505; max-height: 90vh; overflow-y: auto; }
    .header { color: #00ffff; font-size: 1em; font-weight: bold; margin-bottom: 10px; letter-spacing: 3px; }
    .desc { font-size: 0.6em; color: #008888; margin-bottom: 30px; line-height: 1.5; }
    
    .form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 0.5em; color: #00ffff; font-weight: bold; }
    input { background: #000; border: 1px solid #004444; color: #fff; padding: 10px; font-size: 0.7em; font-family: inherit; outline: none; }
    input:focus { border-color: #00ffff; box-shadow: 0 0 10px rgba(0, 255, 255, 0.2); }
    
    .divider { font-size: 0.5em; color: #004444; border-bottom: 1px solid #111; padding-bottom: 5px; margin-top: 10px; }
    
    .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
    .setup-btn { background: #004444; border: 1px solid #00ffff; color: #00ffff; padding: 15px; font-size: 0.8em; font-weight: bold; cursor: pointer; font-family: inherit; }
    .setup-btn:hover:not(:disabled) { background: #00ffff; color: #000; }
    .setup-btn:disabled { opacity: 0.3; cursor: not-allowed; border-color: #004444; }

    .skip-btn { background: transparent; border: 1px solid #444; color: #666; padding: 10px; font-size: 0.6em; cursor: pointer; font-family: inherit; }
    .skip-btn:hover { border-color: #888; color: #888; }
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
