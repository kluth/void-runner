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
      border: var(--ghost-border);
      height: 100%;
      overflow-y: auto;
    }

    .sec-header {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 4px;
      color: var(--warning-magenta);
      margin-bottom: 1.5rem;
      border-bottom: var(--ghost-border);
      padding-bottom: 0.5rem;
    }

    .threat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
      gap: 1.5rem;
    }

    .threat-card {
      background: var(--layer-0);
      border: var(--ghost-border);
      position: relative;
      padding: 1.5rem;
      display: flex;
      gap: 1.5rem;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .threat-card:hover {
      background: var(--layer-2);
      transform: scale(1.02);
      box-shadow: var(--neon-shadow);
    }

    .risk-indicator {
      width: 4px;
      height: 100%;
      background: var(--matrix-green);
      position: absolute;
      left: 0;
      top: 0;
    }

    .threat-card.high .risk-indicator { background: var(--warning-magenta); }
    .threat-card.extreme .risk-indicator { background: var(--critical-error); animation: pulse 0.5s infinite alternate; }

    @keyframes pulse { from { opacity: 1; } to { opacity: 0.4; } }

    .threat-info { flex: 1; }
    .t-top { display: flex; justify-content: space-between; font-size: 0.6rem; font-weight: 900; margin-bottom: 0.5rem; }
    .t-type { color: var(--tactical-cyan); }
    .t-risk { color: var(--warning-magenta); }
    .t-name { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem; letter-spacing: 1px; }
    .t-status { font-size: 0.65rem; color: #888; margin-bottom: 1rem; }
    .t-status .active { color: var(--critical-error); font-weight: 900; }
    .t-desc { font-size: 0.7rem; color: #ccc; line-height: 1.4; margin-bottom: 1rem; }
    
    .t-vuln {
      background: rgba(0, 255, 0, 0.05);
      padding: 0.5rem;
      border-left: 2px solid var(--matrix-green);
    }
    .vuln-text { font-size: 0.65rem; color: var(--matrix-green); display: block; margin-top: 4px; font-style: italic; }

    .action-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .threat-card:hover .action-overlay { opacity: 1; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--layer-0); }
    ::-webkit-scrollbar-thumb { background: var(--layer-3); }
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
