import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

export interface Bounty {
  id: string;
  target: string;
  reward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE' | 'IMPOSSIBLE';
  type: string;
  issuer: string;
  expiresIn: string;
}

@Component({
  selector: 'app-bounty-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bounty-container hud-panel">
      <div class="sec-header">DARKNET_EXCHANGE // BOUNTY_BOARD</div>
      
      <div class="bounty-list">
        @for (bounty of bounties(); track bounty.id) {
          <div class="bounty-item">
            <div class="b-main">
              <div class="b-target">{{ bounty.target }}</div>
              <div class="b-meta">
                <span class="b-type">{{ bounty.type }}</span>
                <span class="b-issuer">ISSUER: {{ bounty.issuer }}</span>
              </div>
            </div>
            <div class="b-stats">
              <div class="b-reward">{{ bounty.reward }}cr</div>
              <div class="b-diff" [class]="bounty.difficulty.toLowerCase()">{{ bounty.difficulty }}</div>
              <div class="b-timer">{{ bounty.expiresIn }}</div>
            </div>
            <button class="accept-btn" (click)="acceptBounty(bounty)">ACCEPT_CONTRACT</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .bounty-container {
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
      color: var(--tactical-cyan);
      margin-bottom: 1.5rem;
      border-bottom: var(--ghost-border);
      padding-bottom: 0.5rem;
    }

    .bounty-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bounty-item {
      background: var(--layer-0);
      border: var(--ghost-border);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      transition: all 0.2s ease;
    }

    .bounty-item:hover {
      border-color: var(--tactical-cyan);
      background: var(--layer-2);
    }

    .b-main { flex: 1; }
    .b-target { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 900; color: #fff; letter-spacing: 1px; margin-bottom: 0.25rem; }
    .b-meta { font-size: 0.6rem; color: #666; font-weight: 700; display: flex; gap: 1rem; }
    .b-type { color: var(--matrix-green); }

    .b-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 100px; }
    .b-reward { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 900; color: var(--matrix-green); }
    .b-diff { font-size: 0.55rem; font-weight: 900; padding: 2px 6px; background: #222; }
    .b-diff.hard { color: var(--warning-magenta); border: 1px solid var(--warning-magenta); }
    .b-diff.elite { color: var(--critical-error); border: 1px solid var(--critical-error); }
    .b-timer { font-size: 0.5rem; color: #444; }

    .accept-btn {
      background: transparent;
      border: 1px solid var(--tactical-cyan);
      color: var(--tactical-cyan);
      padding: 0.75rem 1.5rem;
      font-size: 0.65rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s;
    }

    .accept-btn:hover {
      background: var(--tactical-cyan);
      color: #000;
      box-shadow: 0 0 15px rgba(0, 251, 251, 0.4);
    }
  `
})
export class BountyBoardComponent {
  gameService = inject(GameService);

  bounties = signal<Bounty[]>([
    { id: 'b1', target: 'CORP_EXECUTIVE_88', reward: 5000, difficulty: 'HARD', type: 'INTEL_THEFT', issuer: 'THE_FIXER', expiresIn: '12:44' },
    { id: 'b2', target: 'VAULT_771_NODE', reward: 12000, difficulty: 'ELITE', type: 'DATA_DESTRUCTION', issuer: 'ANON_ENTITY', expiresIn: '04:12' },
    { id: 'b3', target: 'NEURAL_BRIDGE_ALPHA', reward: 25000, difficulty: 'IMPOSSIBLE', type: 'SYSTEM_TAKEDOWN', issuer: 'VOID_RUNNER_GHOST', expiresIn: '01:55' },
    { id: 'b4', target: 'SECURE_MAIL_RELAY', reward: 1500, difficulty: 'MEDIUM', type: 'SPOOFING', issuer: 'THE_FIXER', expiresIn: '48:00' }
  ]);

  acceptBounty(bounty: Bounty) {
    this.gameService.log(`CONTRACT_ACCEPTED: Target ${bounty.target}. Deployment initiated.`);
  }
}
