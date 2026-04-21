import { Component, inject, signal } from '@angular/core';
import { GameService, Bounty } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bounty-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-window">
      <div class="header">
        ┌── DARKNET_EXCHANGE // BOUNTY_BOARD ───────────────────────────────────────────┐
      </div>
      
      <div class="bounty-list">
        @for (bounty of bounties(); track bounty.id) {
          <div class="bounty-wrapper">
            <div class="ascii-top">┌──────────────────────────────────────────────────────────────────────────────┐</div>
            <div class="bounty-content">
              <div class="b-main">
                <div class="b-target">> TARGET: {{ bounty.target }}</div>
                <div class="b-meta">
                  <span>TYPE: {{ bounty.type }}</span>
                  <span>ISSUER: {{ bounty.issuer }}</span>
                </div>
              </div>
              <div class="b-stats">
                <div class="b-reward">REWARD: {{ bounty.reward }}cr</div>
                <div class="b-diff" [class]="bounty.difficulty.toLowerCase()">DIFF: [{{ bounty.difficulty }}]</div>
                <div class="b-timer">TTL: {{ bounty.expiresIn }}</div>
              </div>
              <button class="accept-btn" (click)="acceptBounty(bounty)">[ ACCEPT_CONTRACT ]</button>
            </div>
            <div class="ascii-bottom">└──────────────────────────────────────────────────────────────────────────────┘</div>
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
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
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
    }

    .bounty-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 1rem;
      scrollbar-width: none;
    }

    .bounty-list::-webkit-scrollbar { display: none; }

    .bounty-wrapper {
      margin-bottom: 1rem;
      white-space: pre;
    }

    .ascii-top, .ascii-bottom {
      line-height: 1;
      opacity: 0.8;
    }

    .bounty-content {
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      background: #000;
    }

    .b-main { flex: 1; }
    .b-target { 
      font-size: 1.1rem; 
      color: var(--primary); 
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }
    .b-meta { 
      font-size: 0.7rem; 
      display: flex; 
      gap: 1.5rem; 
      opacity: 0.7;
    }

    .b-stats { 
      display: flex; 
      flex-direction: column; 
      align-items: flex-start; 
      gap: 2px; 
      min-width: 150px;
      font-size: 0.75rem;
    }
    
    .b-reward { color: var(--secondary); font-weight: bold; }
    .b-diff.hard { color: #ff5555; }
    .b-diff.elite { color: #ff55ff; }
    .b-timer { opacity: 0.5; }

    .accept-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      padding: 0.5rem 1rem;
      font-family: inherit;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.1s;
    }

    .accept-btn:hover {
      background: var(--primary);
      color: #000;
      box-shadow: 0 0 10px var(--primary);
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
    this.gameService.acceptBounty(bounty);
  }
}
