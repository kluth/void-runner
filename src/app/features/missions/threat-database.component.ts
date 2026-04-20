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
    <div class="threat-container hud-panel">
      <div class="sec-header">0x_THREAT_DATABASE // CLASSIFIED</div>
      
      <div class="threat-grid">
        @for (threat of threats(); track threat.id) {
          <div class="threat-card" [class]="threat.riskLevel.toLowerCase()">
            <div class="risk-indicator"></div>
            <div class="threat-info">
              <div class="t-top">
                <span class="t-type">[{{ threat.type }}]</span>
                <span class="t-risk">RISK: {{ threat.riskLevel }}</span>
              </div>
              <div class="t-name">{{ threat.name }}</div>
              <div class="t-status">STATUS: <span [class.active]="threat.status === 'ACTIVE_THREAT'">{{ threat.status }}</span></div>
              <p class="t-desc">{{ threat.description }}</p>
              <div class="t-vuln">
                <span class="label-tactical">VULNERABILITY:</span>
                <span class="vuln-text">{{ threat.vulnerability }}</span>
              </div>
            </div>
            <div class="action-overlay">
                <button class="primary" (click)="trackThreat(threat)">INIT_TRACKING</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .threat-container {
      padding: 1.5rem;
      background: var(--layer-1);
      height: 100%;
      overflow-y: auto;
    }

    .sec-header {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--tertiary);
      margin-bottom: 1.5rem;
      background: var(--layer-2);
      padding: 0.75rem;
      text-transform: uppercase;
    }

    .threat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
      gap: 1.5rem;
    }

    .threat-card {
      background: var(--layer-2);
      position: relative;
      padding: 1.5rem;
      display: flex;
      gap: 1.5rem;
      transition: all 0.05s steps(2);
      overflow: hidden;
    }

    .threat-card:hover {
      background: var(--layer-4);
      box-shadow: var(--neon-shadow);
    }

    .risk-indicator {
      width: 4px;
      height: 100%;
      background: var(--secondary);
      position: absolute;
      left: 0;
      top: 0;
    }

    .threat-card.high .risk-indicator { background: var(--tertiary); opacity: 0.6; }
    .threat-card.extreme .risk-indicator { background: var(--tertiary); animation: pulse 0.5s steps(2) infinite alternate; }

    @keyframes pulse { from { opacity: 1; } to { opacity: 0.3; } }

    .threat-info { flex: 1; }
    .t-top { display: flex; justify-content: space-between; font-size: 0.6rem; font-weight: 900; margin-bottom: 0.75rem; font-family: 'JetBrains Mono', monospace; }
    .t-type { color: var(--primary); opacity: 0.5; }
    .t-risk { color: var(--tertiary); }
    .t-name { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    .t-status { font-size: 0.6rem; color: var(--primary); opacity: 0.4; margin-bottom: 1rem; font-weight: 900; }
    .t-status .active { color: var(--tertiary); opacity: 1; }
    .t-desc { font-size: 0.7rem; color: #fff; opacity: 0.6; line-height: 1.6; margin-bottom: 1.5rem; }
    
    .t-vuln {
      background: var(--layer-0);
      padding: 1rem;
      border-left: 2px solid var(--secondary);
    }
    .vuln-text { font-size: 0.65rem; color: var(--secondary); display: block; margin-top: 4px; font-weight: 900; font-family: 'JetBrains Mono', monospace; }

    .action-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(14,14,14,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.1s steps(2);
    }

    .threat-card:hover .action-overlay { opacity: 1; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--layer-0); }
    ::-webkit-scrollbar-thumb { background: var(--layer-5); }
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
