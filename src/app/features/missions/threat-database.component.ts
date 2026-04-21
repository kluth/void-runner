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
      <div class="ascii-line header">0x_THREAT_DATABASE // CLASSIFIED</div>
      
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
              <button class="track-btn" (click)="trackThreat(threat)">[ INIT_TRACKING ]</button>
            </div>
          </div>
        }
      </div>
      <div class="ascii-line footer" dir="rtl">SECURE_ACCESS_ONLY</div>
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

    .header {
      font-weight: bold;
    }

    .threat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
      gap: var(--spacing-md);
      flex: 1;
      overflow-y: auto;
      padding: 0 var(--spacing-xs);
      scrollbar-width: none;
    }

    .threat-grid::-webkit-scrollbar { display: none; }

    .threat-card {
      background: var(--layer-1);
      display: flex;
      flex-direction: column;
    }

    .card-content {
      padding: var(--spacing-sm);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .t-top { 
      display: flex; 
      justify-content: space-between; 
      font-size: var(--font-size-xs); 
      margin-bottom: 0.5rem; 
      opacity: 0.8;
    }
    
    .t-risk { color: var(--primary); font-weight: bold; }
    .threat-card.high .t-risk { color: #ff5555; }
    .threat-card.extreme .t-risk { color: #ff0000; animation: blink 1s steps(2) infinite; }

    @keyframes blink { 50% { opacity: 0; } }

    .t-name { 
      font-size: var(--font-size-base); 
      font-weight: bold; 
      color: var(--primary); 
      margin-bottom: 0.25rem; 
      text-transform: uppercase;
    }

    .t-status { font-size: var(--font-size-xs); margin-bottom: 0.75rem; opacity: 0.6; }
    .t-status .active { color: #ff5555; opacity: 1; }
    
    .t-desc { 
      font-size: var(--font-size-sm); 
      line-height: 1.4; 
      margin-bottom: 1rem; 
      opacity: 0.9;
      min-height: 3rem;
    }
    
    .t-vuln {
      background: rgba(0, 255, 65, 0.05);
      padding: 0.5rem;
      border: 1px dashed var(--primary);
      margin-top: auto;
      margin-bottom: 1rem;
    }
    
    .label-tactical { font-size: var(--font-size-xs); opacity: 0.5; display: block; }
    .vuln-text { font-size: var(--font-size-sm); color: var(--secondary); font-weight: bold; }

    .track-btn {
      width: 100%;
    }

    .footer {
      margin-top: auto;
      opacity: 0.5;
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
