import { Component, inject, signal } from '@angular/core';
import { GameService, Bounty } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bounty-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bounty-container">
      <div class="ascii-line header">BOUNTY_EXCHANGE // HIGH_VALUE_TARGETS</div>
      
      <div class="bounty-list">
        @for (bounty of gameService.availableBounties(); track bounty.id) {
          <div class="terminal-frame bounty-card" [class.claimed]="bounty.status === 'CLAIMED'">
            <div class="b-top">
              <span class="b-target">{{ bounty.target }}</span>
              <span class="b-reward">{{ bounty.reward }} CR</span>
            </div>
            <div class="b-mid">
              <span class="b-diff" [class]="bounty.difficulty.toLowerCase()">LEVEL: {{ bounty.difficulty }}</span>
              <span class="b-type">{{ bounty.type }}</span>
            </div>
            <div class="b-footer">
              <span class="b-issuer">ISSUER: {{ bounty.issuer }}</span>
              <button [disabled]="bounty.status === 'CLAIMED'" (click)="acceptBounty(bounty)">
                {{ bounty.status === 'CLAIMED' ? '[ CLAIMED ]' : '[ ACCEPT_CONTRACT ]' }}
              </button>
            </div>
          </div>
        }
        @if (gameService.availableBounties().length === 0) {
          <div class="empty-msg">SCANNING_ENCRYPTED_NETWORKS... [NO_CONTRACTS_FOUND]</div>
        }
      </div>
    </div>
  `,
  styles: `
    .bounty-container { display: flex; flex-direction: column; gap: 1rem; }
    .bounty-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .bounty-card { padding: 12px; border-color: rgba(0, 255, 159, 0.2); }
    .bounty-card.claimed { opacity: 0.4; filter: grayscale(1); }
    
    .b-top { display: flex; justify-content: space-between; font-weight: 900; font-size: 0.8rem; color: var(--primary); }
    .b-reward { color: var(--neon-yellow); }
    
    .b-mid { display: flex; gap: 15px; font-size: 0.6rem; margin: 8px 0; }
    .easy { color: var(--neon-green); }
    .medium { color: var(--neon-yellow); }
    .hard { color: var(--neon-orange); }
    .elite { color: var(--neon-magenta); animation: pulse 1s infinite; }
    
    .b-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; opacity: 0.7; }
    .empty-msg { text-align: center; padding: 2rem; opacity: 0.2; font-size: 0.65rem; }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `
})
export class BountyBoardComponent {
  gameService = inject(GameService);

  acceptBounty(bounty: Bounty) {
    this.gameService.acceptBounty(bounty);
  }
}
