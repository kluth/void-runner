import { Component, inject, signal } from '@angular/core';
import { GameService, Bounty } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bounty-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-window">
      <div class="ascii-line header">DARKNET_EXCHANGE // BOUNTY_BOARD</div>
      
      <div class="bounty-list">
        @for (bounty of bounties(); track bounty.id) {
          <div class="terminal-frame bounty-card">
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
          </div>
        }
      </div>
      <div class="ascii-line footer" dir="rtl">PROTOCOL_v5.0.2</div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
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
      margin-bottom: var(--spacing-sm);
    }

    .bounty-list {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
      gap: var(--spacing-md);
      padding: 0 var(--spacing-xs);
      scrollbar-width: none;
    }

    .bounty-list::-webkit-scrollbar { display: none; }

    .bounty-card {
      background: var(--layer-1);
      transition: transform 0.2s ease;
    }
    
    .bounty-card:hover {
      transform: translateY(-2px);
      background: var(--layer-2);
    }

    .bounty-content {
      padding: var(--spacing-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .b-main { flex: 1; min-width: 200px; }
    .b-target { 
      font-size: var(--font-size-base); 
      color: var(--primary); 
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }
    .b-meta { 
      font-size: var(--font-size-xs); 
      display: flex; 
      gap: 1.5rem; 
      opacity: 0.7;
    }

    .b-stats { 
      display: flex; 
      flex-direction: column; 
      align-items: flex-start; 
      gap: 2px; 
      min-width: 120px;
      font-size: var(--font-size-sm);
    }
    
    .b-reward { color: var(--secondary); font-weight: bold; }
    .b-diff.hard { color: #ff5555; }
    .b-diff.elite { color: #ff55ff; }
    .b-timer { opacity: 0.5; }

    .accept-btn {
      flex-shrink: 0;
      white-space: nowrap;
    }

    .footer {
      margin-top: auto;
      opacity: 0.5;
    }

    @media (max-width: 600px) {
      .bounty-content {
        flex-direction: column;
        align-items: flex-start;
      }
      .b-stats {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        border-top: 1px dashed var(--primary);
        padding-top: var(--spacing-xs);
      }
      .accept-btn {
        width: 100%;
      }
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
