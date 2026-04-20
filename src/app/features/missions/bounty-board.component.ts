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
      height: 100%;
      overflow-y: auto;
    }

    .sec-header {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--primary);
      background: var(--layer-2);
      padding: 0.75rem;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }

    .bounty-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .bounty-item {
      background: var(--layer-2);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      transition: all 0.05s steps(2);
    }

    .bounty-item:hover {
      background: var(--layer-4);
      box-shadow: var(--neon-shadow);
    }

    .b-main { flex: 1; }
    .b-target { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
    .b-meta { font-size: 0.6rem; color: var(--primary); opacity: 0.4; font-weight: 900; display: flex; gap: 1.5rem; font-family: 'JetBrains Mono', monospace; }
    .b-type { color: var(--secondary); opacity: 1; }

    .b-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 120px; }
    .b-reward { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 900; color: var(--secondary); }
    .b-diff { font-size: 0.55rem; font-weight: 900; padding: 4px 8px; background: var(--layer-0); color: var(--primary); }
    .b-diff.hard { color: #ffaa00; box-shadow: inset 0 0 5px #ffaa00; }
    .b-diff.elite { color: var(--tertiary); box-shadow: inset 0 0 5px var(--tertiary); }
    .b-timer { font-size: 0.55rem; color: var(--primary); opacity: 0.3; font-family: 'JetBrains Mono', monospace; }

    .accept-btn {
      background: var(--layer-4);
      border: var(--ghost-border);
      color: var(--primary);
      padding: 1rem 2rem;
      font-size: 0.65rem;
      font-weight: 900;
      cursor: pointer;
      font-family: 'Space Grotesk', sans-serif;
      transition: all 0.05s steps(2);
    }

    .accept-btn:hover {
      background: var(--primary);
      color: var(--on-primary);
      box-shadow: 0 0 20px var(--primary);
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
