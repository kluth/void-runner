import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="terminal-window">
      <div class="header">
        ┌── 0x_THREAT_DATABASE // CLASSIFIED ──────────────────────────────────────────┐
      </div>
      
      <div class="threat-grid">
        @for (threat of threats(); track threat.id) {
          <div class="threat-card" [class]="threat.riskLevel.toLowerCase()">
            <div class="ascii-top">┌──────────────────────────────────┐</div>
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
              <button class="track-btn" (click)="trackThreat(threat)">[ INIT_TRACKING ]</button>
            </div>
            <div class="ascii-bottom">└──────────────────────────────────┘</div>
          </div>
        }
      </div>
      <div class="footer">
        └───────────────────────────────────────────────────────────────────────────────┘
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
      padding: 1rem;
    }

    .terminal-window {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .header, .footer {
      white-space: pre;
      color: var(--primary);
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .footer { margin-top: auto; margin-bottom: 0; }

    .threat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      gap: 1rem;
      flex: 1;
      overflow-y: auto;
      padding: 0 1rem;
      scrollbar-width: none;
    }

    .threat-grid::-webkit-scrollbar { display: none; }

    .threat-card {
      background: #000;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .ascii-top, .ascii-bottom {
      white-space: pre;
      line-height: 1;
      opacity: 0.8;
    }

    .card-content {
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      padding: 0.5rem 1rem;
      flex: 1;
    }

    .t-top { 
      display: flex; 
      justify-content: space-between; 
      font-size: 0.65rem; 
      margin-bottom: 0.5rem; 
      opacity: 0.8;
    }
    
    .t-risk { color: var(--primary); font-weight: bold; }
    .threat-card.high .t-risk { color: #ff5555; }
    .threat-card.extreme .t-risk { color: #ff0000; animation: blink 1s steps(2) infinite; }

    @keyframes blink { 50% { opacity: 0; } }

    .t-name { 
      font-size: 1rem; 
      font-weight: bold; 
      color: var(--primary); 
      margin-bottom: 0.25rem; 
      text-transform: uppercase;
    }

    .t-status { font-size: 0.6rem; margin-bottom: 0.75rem; opacity: 0.6; }
    .t-status .active { color: #ff5555; opacity: 1; }
    
    .t-desc { 
      font-size: 0.75rem; 
      line-height: 1.4; 
      margin-bottom: 1rem; 
      opacity: 0.9;
      height: 3rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    
    .t-vuln {
      background: rgba(0, 255, 65, 0.05);
      padding: 0.5rem;
      border: 1px dashed var(--primary);
      margin-bottom: 1rem;
    }
    
    .label-tactical { font-size: 0.6rem; opacity: 0.5; display: block; }
    .vuln-text { font-size: 0.7rem; color: var(--secondary); font-weight: bold; }

    .track-btn {
      width: 100%;
      background: transparent;
      border: none;
      color: var(--primary);
      padding: 0.5rem;
      font-family: inherit;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
    }

    .track-btn:hover {
      background: var(--primary);
      color: #000;
    }
  `
})
export class ThreatDatabaseComponent {
  gameService = inject(GameService);

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
}
