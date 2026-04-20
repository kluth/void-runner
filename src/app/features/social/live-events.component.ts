import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="events-container">
      <div class="event-header">
        <span class="title">GLOBAL_NETWORK // LIVE_FEED</span>
        @if (gameService.globalEvent() !== 'NONE') {
          <span class="status pulse">ACTIVE_EVENT [{{ gameService.eventTimer() }}s]</span>
        } @else {
          <span class="status">MONITORING</span>
        }
      </div>

      <div class="active-event-card" [ngClass]="gameService.globalEvent()">
        <div class="event-name">{{ getEventName() }}</div>
        <div class="event-desc">{{ getEventDesc() }}</div>
      </div>

      <div class="exploit-db">
        <div class="db-header">EXPLOIT_DATABASE // PUBLIC_VULNS</div>
        <div class="db-info">Acquire known 1-Day exploits for 100cr. These provide a guaranteed success for a single mission of that type.</div>
        <div class="db-grid">
          @for (type of exploitTypes; track type) {
            <button class="db-btn" 
                    [disabled]="gameService.credits() < 100 || gameService.publicExploits().includes(type)"
                    (click)="buyExploit(type)">
              {{ type.replace('-', '_').toUpperCase() }} 
              @if (gameService.publicExploits().includes(type)) { [READY] }
            </button>
          }
        </div>
      </div>

      <div class="leaderboard">
        <div class="lb-header">TOP_OPERATIVES (GLOBAL_RANKING)</div>
        <div class="lb-list">
          @for (player of gameService.leaderboard(); track player.name) {
            <div class="lb-row" [class.is-player]="player.isPlayer">
              <span class="rank">#{{ $index + 1 }}</span>
              <span class="name">{{ player.name }}</span>
              <span class="score">{{ player.score }} REP</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .events-container { background: var(--layer-1); padding: 1rem; margin-bottom: 1rem; box-shadow: var(--neon-shadow); }
    .event-header { display: flex; justify-content: space-between; align-items: center; background: var(--layer-2); padding: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
    .title { font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; font-weight: 900; color: var(--primary); letter-spacing: 2px; }
    .status { font-size: 0.6rem; color: var(--primary); opacity: 0.4; font-weight: 900; }
    .pulse { color: var(--secondary); animation: pulse 1s steps(2) infinite alternate; opacity: 1 !important; }
    @keyframes pulse { from { opacity: 1; } to { opacity: 0.3; } }

    .active-event-card { background: var(--layer-2); padding: 1.5rem; margin-bottom: 1.5rem; transition: all 0.05s steps(2); }
    .event-name { font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem; letter-spacing: 1px; }
    .event-desc { font-size: 0.65rem; color: #fff; opacity: 0.6; line-height: 1.4; }
    
    .active-event-card.CTF_ACTIVE { background: var(--layer-4); border-left: 4px solid var(--secondary); }
    .active-event-card.CTF_ACTIVE .event-name { color: var(--secondary); }
    
    .active-event-card.PATCH_TUESDAY { background: var(--layer-4); border-left: 4px solid #ffaa00; }
    .active-event-card.PATCH_TUESDAY .event-name { color: #ffaa00; }

    .active-event-card.ZERO_DAY_PANIC { background: var(--layer-4); border-left: 4px solid var(--tertiary); }
    .active-event-card.ZERO_DAY_PANIC .event-name { color: var(--tertiary); }

    .exploit-db { background: var(--layer-0); padding: 1.5rem; margin-bottom: 1.5rem; }
    .db-header { font-family: 'Space Grotesk', sans-serif; font-size: 0.7rem; color: var(--primary); margin-bottom: 0.75rem; font-weight: 900; letter-spacing: 1px; }
    .db-info { font-size: 0.55rem; color: var(--primary); opacity: 0.4; margin-bottom: 1.5rem; line-height: 1.4; }
    .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: 10px; }
    .db-btn { background: var(--layer-2); border: var(--ghost-border); color: var(--primary); font-size: 0.6rem; padding: 12px; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 900; transition: all 0.05s steps(2); }
    .db-btn:hover:not(:disabled) { background: var(--primary); color: var(--on-primary); }
    .db-btn:disabled { opacity: 0.2; }

    .leaderboard { background: var(--layer-0); padding: 1.5rem; }
    .lb-header { font-family: 'Space Grotesk', sans-serif; font-size: 0.65rem; color: var(--primary); opacity: 0.4; margin-bottom: 1rem; border-bottom: var(--ghost-border); padding-bottom: 0.5rem; letter-spacing: 1px; font-weight: 900; }
    .lb-list { display: flex; flex-direction: column; gap: 4px; }
    .lb-row { display: flex; font-size: 0.7rem; padding: 0.75rem; align-items: center; background: var(--layer-2); }
    .lb-row .rank { color: var(--primary); opacity: 0.3; width: 2.5rem; flex-shrink: 0; font-weight: 900; }
    .lb-row .name { color: #fff; flex-grow: 1; font-family: 'JetBrains Mono', monospace; }
    .lb-row .score { color: var(--secondary); font-weight: 900; flex-shrink: 0; }
    
    .lb-row.is-player { background: var(--layer-4); box-shadow: inset 0 0 10px rgba(13, 242, 242, 0.1); }
    .lb-row.is-player .rank { color: var(--primary); opacity: 1; }
    .lb-row.is-player .name { color: var(--primary); font-weight: 900; }
  `
})
export class LiveEventsComponent {
  gameService = inject(GameService);

  exploitTypes: any[] = ['port-scan', 'sql-injection', 'buffer-overflow', 'xss-injection'];

  buyExploit(type: any) {
    this.gameService.buyPublicExploit(type);
  }

  getEventName(): string {
    switch (this.gameService.globalEvent()) {
      case 'CTF_ACTIVE': return 'GLOBAL CTF QUALIFIER';
      case 'PATCH_TUESDAY': return 'VENDOR PATCH ROLLOUT';
      case 'ZERO_DAY_PANIC': return 'CRITICAL CVE DISCLOSED';
      default: return 'NO ACTIVE THREATS';
    }
  }

  getEventDesc(): string {
    switch (this.gameService.globalEvent()) {
      case 'CTF_ACTIVE': return 'A massive Capture-The-Flag tournament is live. Missions grant double Experience and Reputation.';
      case 'PATCH_TUESDAY': return 'Major tech vendors are pushing updates. 0-Day research is 50% less likely to succeed.';
      case 'ZERO_DAY_PANIC': return 'A high-profile vulnerability is in the wild! Mission rewards doubled, but Trace increases 2x faster.';
      default: return 'Network traffic is stable. Routine operations advised.';
    }
  }
}
