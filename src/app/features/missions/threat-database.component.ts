import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Threat {
  id: string;
  name: string;
  type: 'CORPORATE' | 'SYNDICATE' | 'GHOST';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' | 'UNKNOWN';
  status: 'MONITORING' | 'NEUTRALIZED' | 'ACTIVE_THREAT';
  description: string;
  vulnerability: string;
}

@Component({
  selector: 'app-threat-database',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-window">
      <div class="ascii-line header">0x_THREAT_DATABASE // CLASSIFIED</div>
      
      <div class="threat-layout">
        <!-- Threat Map (Heavy) -->
        <div class="threat-map terminal-frame">
          <div class="ascii-line cyan">THREAT_INTEL_MAP</div>
          @defer (on viewport) {
            <svg class="map-svg" viewBox="0 0 100 100">
               @for (threat of threats(); track threat.id) {
                 <circle [attr.cx]="getX(threat.id)" [attr.cy]="getY(threat.id)" r="3" 
                         [attr.fill]="getColor(threat.riskLevel)" class="threat-node"
                         (click)="selectedThreat.set(threat)" />
               }
            </svg>
          } @placeholder {
            <div class="loading-map">LOADING_INTEL_LAYER...</div>
          }
        </div>

        <!-- Bento Grid 2.0 Profiles -->
        <div class="threat-grid">
        @for (threat of threats(); track threat.id) {
          <div class="terminal-frame threat-card" [class]="threat.riskLevel.toLowerCase()">
            <div class="card-content">
              <div class="t-top">
                <span class="t-type">[{{ threat.type }}]</span>
                <span class="t-risk">! {{ threat.riskLevel }} !</span>
              </div>
              <div class="t-name">> {{ threat.name }}</div>
              <div class="t-status">STATUS: <span [class.active]="threat.status === 'ACTIVE_THREAT'">[{{ threat.status }}]</span></div>
              <p class="t-desc">{{ threat.description }}</p>
              <div class="t-vuln">
                <span class="label-tactical">VULN_VEC:</span>
                <span class="vuln-text">{{ threat.vulnerability }}</span>
              </div>
              <div class="threat-actions">
                <button class="track-btn" (click)="trackThreat(threat)">[ TRACK ]</button>
                <button class="intercept-btn magenta" (click)="interceptThreat(threat)">[ INTERCEPT ]</button>
              </div>
            </div>
          </div>
        }
      </div>
      </div>
      <div class="ascii-line footer" dir="rtl">SECURE_ACCESS_ONLY</div>

      <!-- INTERCEPT MISSION OVERLAY -->
      @if (activeIntercept()) {
        <div class="intercept-modal glass-overlay">
           <div class="terminal-frame intercept-box">
              <div class="ascii-line magenta">INTERCEPT_MISSION // {{ activeIntercept()?.name }}</div>
              <div class="i-task">BYPASS_LOCAL_SENTINEL</div>
              <div class="puzzle-area">
                 <div class="puzzle-string">{{ currentPuzzle() }}</div>
                 <input type="text" [(ngModel)]="puzzleInput" (keyup.enter)="checkPuzzle()" placeholder="SYNC_PATTERN..." autofocus>
              </div>
              <div class="i-footer">
                <span>REWARD: 500 CR | -10% DETECTION</span>
                <button (click)="activeIntercept.set(null)">[ ABORT ]</button>
              </div>
           </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
      padding: var(--spacing-md);
    }

    .terminal-window {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .threat-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
      flex: 1;
      overflow: hidden;
    }
    .threat-map { height: 100%; position: relative; background: rgba(0,0,0,0.5); }
    .map-svg { width: 100%; height: 100%; }
    .threat-node { cursor: pointer; animation: pulse 2s infinite; stroke: rgba(255,255,255,0.2); stroke-width: 1; }
    .loading-map { display: flex; align-items: center; justify-content: center; height: 100%; opacity: 0.5; }
    
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 0.4; } }

    .threat-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
      overflow-y: auto;
      padding: 0 var(--spacing-xs);
    }

    .threat-card {
      background: var(--layer-1);
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .card-content {
      padding: var(--spacing-sm);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .threat-actions { display: flex; gap: 8px; margin-top: auto; }
    .track-btn, .intercept-btn { flex: 1; font-size: 0.6rem; }

    .intercept-modal { position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh; z-index: 10000; display: flex; align-items: center; justify-content: center; }
    .intercept-box { background: var(--layer-1); padding: 1.5rem; width: 400px; text-align: center; }
    .i-task { font-size: 0.6rem; color: var(--neon-magenta); margin: 1rem 0; }
    .puzzle-area { margin: 2rem 0; }
    .puzzle-string { font-size: 2rem; letter-spacing: 5px; color: var(--primary); margin-bottom: 1rem; text-shadow: 0 0 10px var(--primary); }
    .puzzle-area input { background: #000; border: 1px solid var(--primary); color: var(--primary); padding: 10px; width: 100%; text-align: center; }
    .i-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.6rem; margin-top: 1rem; }

    .t-top { display: flex; justify-content: space-between; font-size: 0.6rem; margin-bottom: 0.5rem; }
    .t-risk { font-weight: bold; color: var(--neon-orange); }
    .t-name { font-size: 0.8rem; font-weight: bold; color: var(--primary); margin-bottom: 0.5rem; }
    .t-status { font-size: 0.6rem; opacity: 0.6; }
    .t-desc { font-size: 0.65rem; opacity: 0.8; margin-bottom: 1rem; }
    .t-vuln { background: rgba(0, 255, 65, 0.05); padding: 0.5rem; border: 1px dashed var(--primary); margin-bottom: 1rem; }
    .label-tactical { font-size: 0.5rem; opacity: 0.5; }
    .vuln-text { font-size: 0.6rem; color: var(--secondary); font-weight: bold; }

    .footer { opacity: 0.5; font-size: 0.6rem; }
  `
})
export class ThreatDatabaseComponent {
  gameService = inject(GameService);

  selectedThreat = signal<Threat | null>(null);
  activeIntercept = signal<Threat | null>(null);
  currentPuzzle = signal('');
  puzzleInput = '';

  getX(id: string) { return (id.charCodeAt(0) * 13) % 80 + 10; }
  getY(id: string) { return (id.charCodeAt(1) * 17) % 80 + 10; }
  getColor(risk: string) {
    if (risk === 'HIGH') return 'var(--neon-orange)';
    if (risk === 'EXTREME') return 'var(--neon-magenta)';
    return 'var(--neon-green)';
  }

  threats = signal<Threat[]>([
    {
      id: 't1',
      name: 'OMNICORP_SEC_OPS',
      type: 'CORPORATE',
      riskLevel: 'HIGH',
      status: 'ACTIVE_THREAT',
      description: 'The primary security arm of OmniCorp. Known for rapid retaliation and advanced trace algorithms.',
      vulnerability: 'HEURISTIC_BYPASS_v4.2'
    },
    {
      id: 't2',
      name: 'THE_PHANTOMS',
      type: 'SYNDICATE',
      riskLevel: 'EXTREME',
      status: 'ACTIVE_THREAT',
      description: 'A shadowy collective of high-tier hackers. Specializes in zero-day exploits and neural hijacking.',
      vulnerability: 'UNKNOWN_ENTROPY'
    },
    {
      id: 't3',
      name: 'VOID_STALKER',
      type: 'GHOST',
      riskLevel: 'UNKNOWN',
      status: 'MONITORING',
      description: 'A rogue AI believed to be living in the deep sea cables. Purpose unknown.',
      vulnerability: 'QUANTUM_DECOHERENCE'
    },
    {
      id: 't4',
      name: 'NEO_GOTHAM_PD',
      type: 'CORPORATE',
      riskLevel: 'MEDIUM',
      status: 'ACTIVE_THREAT',
      description: 'Standard law enforcement. Predictable but persistent.',
      vulnerability: 'SOCIAL_ENGINEERING_L3'
    }
  ]);

  trackThreat(threat: Threat) {
    this.gameService.log(`INITIATING_TRACKING: ${threat.name}. Analyzers active.`);
  }

  interceptThreat(threat: Threat) {
    this.activeIntercept.set(threat);
    this.generatePuzzle();
  }

  generatePuzzle() {
    this.currentPuzzle.set(Math.random().toString(36).substring(7).toUpperCase());
    this.puzzleInput = '';
  }

  checkPuzzle() {
    if (this.puzzleInput.toUpperCase() === this.currentPuzzle()) {
      this.gameService.log(`INTERCEPT_SUCCESS: Threat ${this.activeIntercept()?.name} diverted. 500 CR acquired.`);
      this.gameService.credits.update(c => c + 500);
      this.gameService.detectionLevel.update(d => Math.max(0, d - 10));
      this.activeIntercept.set(null);
    } else {
      this.gameService.log(`INTERCEPT_FAILURE: Alert triggered!`);
      this.gameService.detectionLevel.update(d => d + 15);
      this.generatePuzzle();
    }
  }
}
