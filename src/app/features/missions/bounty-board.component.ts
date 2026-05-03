import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { Bounty } from '../../core/models/game.models';
import { FactionService } from '../../core/services/faction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bounty-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bounty-container">
      <div class="ascii-line header">BOUNTY_EXCHANGE // HIGH_VALUE_TARGETS</div>
      
      <div class="bounty-list">
        @for (bounty of factionService.bounties(); track bounty.id) {
          <div class="terminal-frame bounty-card" [class.claimed]="bounty.status === 'CLAIMED'">
            <div class="b-top">
              <span class="b-target">{{ bounty.target }}</span>
              <span class="b-reward">{{ bounty.reward }} CR</span>
            </div>
            <div class="b-mid">
              <span class="b-diff" [class]="bounty.difficultyLabel?.toLowerCase() || 'medium'">LEVEL: {{ bounty.difficultyLabel }}</span>
              <span class="b-type">{{ bounty.type }}</span>
            </div>
            <div class="b-footer">
              <span class="b-issuer">ISSUER: {{ bounty.issuer }}</span>
              <div class="b-actions">
                 <button class="verify-btn cyan" [disabled]="bounty.status === 'CLAIMED'" (click)="verifySource(bounty)">[ VERIFY_SOURCE ]</button>
                 <button [disabled]="bounty.status === 'CLAIMED'" (click)="acceptBounty(bounty)">
                   {{ bounty.status === 'CLAIMED' ? '[ CLAIMED ]' : '[ ACCEPT ]' }}
                 </button>
              </div>
            </div>
          </div>
        }
        @if (factionService.bounties().length === 0) {
          <div class="empty-msg">SCANNING_ENCRYPTED_NETWORKS... [NO_CONTRACTS_FOUND]</div>
        }
      </div>

      <!-- VERIFY MODAL -->
      @if (activeVerify()) {
        <div class="verify-modal glass-overlay">
           <div class="terminal-frame verify-box">
              <div class="ascii-line cyan">VERIFYING_SOURCE // {{ activeVerify()?.issuer }}</div>
              <div class="v-pattern">{{ verificationPattern() }}</div>
              <div class="v-controls">
                 <button (click)="shiftPattern(-1)"><</button>
                 <button (click)="checkVerification()" class="primary">[ SYNC_UPLINK ]</button>
                 <button (click)="shiftPattern(1)">></button>
              </div>
              <p class="text-xs opacity-50 mt-4">ALIGMENT_OFFSET: {{ patternOffset() }}</p>
           </div>
        </div>
      }
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
    .b-actions { display: flex; gap: 8px; }
    .verify-btn { font-size: 0.5rem; }

    .verify-modal { position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh; z-index: 10000; display: flex; align-items: center; justify-content: center; }
    .verify-box { background: var(--layer-1); padding: 1.5rem; width: 300px; text-align: center; }
    .v-pattern { font-size: 1.5rem; letter-spacing: 4px; color: var(--neon-cyan); margin: 1.5rem 0; font-family: monospace; }
    .v-controls { display: flex; justify-content: space-around; gap: 10px; }

    .empty-msg { text-align: center; padding: 2rem; opacity: 0.2; font-size: 0.65rem; }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `
})
export class BountyBoardComponent {
  gameService = inject(GameService);
  factionService = inject(FactionService);

  activeVerify = signal<Bounty | null>(null);
  verificationPattern = signal('');
  patternOffset = signal(0);

  acceptBounty(bounty: Bounty) {
    this.gameService.acceptBounty(bounty);
  }

  verifySource(bounty: Bounty) {
    this.activeVerify.set(bounty);
    this.patternOffset.set(Math.floor(Math.random() * 10) - 5);
    this.updatePattern();
  }

  shiftPattern(dir: number) {
    this.patternOffset.update(v => v + dir);
    this.updatePattern();
  }

  updatePattern() {
    const chars = '░▒▓█'.split('');
    let p = '';
    for (let i = 0; i < 8; i++) {
      p += chars[Math.abs(this.patternOffset() + i) % chars.length];
    }
    this.verificationPattern.set(p);
  }

  checkVerification() {
    if (this.patternOffset() === 0) {
      this.gameService.log(`SOURCE_VERIFIED: Bounty ${this.activeVerify()?.id} payload optimized. Reward +100 CR.`);
      this.gameService.credits.update(c => c + 100);
      this.activeVerify.set(null);
    } else {
      this.gameService.log(`VERIFICATION_FAILED: Signal noise detected.`);
      this.gameService.increaseDetection(5);
      this.activeVerify.set(null);
    }
  }
}
