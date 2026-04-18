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
    .events-container { background: rgba(10, 10, 10, 0.9); border: 1px solid #1a1a1a; padding: 1rem; margin-bottom: 1rem; }
    .event-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
    .title { font-size: 0.8rem; color: #00ff00; letter-spacing: 2px; }
    .status { font-size: 0.6rem; color: #004400; }
    .pulse { color: #ff00ff; animation: pulse 1.5s infinite alternate; font-weight: bold; }
    @keyframes pulse { from { opacity: 1; text-shadow: 0 0 5px #ff00ff; } to { opacity: 0.5; text-shadow: none; } }

    .active-event-card { background: #050505; border: 1px solid #222; padding: 1rem; margin-bottom: 1rem; transition: all 0.3s; }
    .event-name { font-size: 0.8rem; font-weight: bold; color: #fff; margin-bottom: 0.5rem; }
    .event-desc { font-size: 0.6rem; color: #888; line-height: 1.4; }
    
    .active-event-card.CTF_ACTIVE { border-color: #00ffff; box-shadow: 0 0 10px rgba(0, 255, 255, 0.1); }
    .active-event-card.CTF_ACTIVE .event-name { color: #00ffff; }
    
    .active-event-card.PATCH_TUESDAY { border-color: #ffaa00; box-shadow: 0 0 10px rgba(255, 170, 0, 0.1); }
    .active-event-card.PATCH_TUESDAY .event-name { color: #ffaa00; }

    .active-event-card.ZERO_DAY_PANIC { border-color: #ff0000; box-shadow: 0 0 10px rgba(255, 0, 0, 0.1); }
    .active-event-card.ZERO_DAY_PANIC .event-name { color: #ff0000; }

    .exploit-db { background: #001111; border: 1px solid #004444; padding: 1rem; margin-bottom: 1rem; }
    .db-header { font-size: 0.65rem; color: #00ffff; margin-bottom: 0.5rem; font-weight: bold; letter-spacing: 1px; }
    .db-info { font-size: 0.55rem; color: #008888; margin-bottom: 1rem; line-height: 1.4; }
    .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: 0.5rem; }
    .db-btn { background: #002222; border: 1px solid #005555; color: #00ffff; font-size: 0.6rem; padding: 0.5rem; cursor: pointer; font-family: inherit; transition: all 0.2s; }
    .db-btn:hover:not(:disabled) { background: #00ffff; color: #000; }
    .db-btn:disabled { color: #003333; border-color: #002222; cursor: default; }

    .leaderboard { background: #000; border: 1px solid #111; padding: 1rem; }
    .lb-header { font-size: 0.6rem; color: #555; margin-bottom: 0.75rem; border-bottom: 1px dashed #222; padding-bottom: 0.5rem; letter-spacing: 1px; }
    .lb-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .lb-row { display: flex; font-size: 0.7rem; padding: 0.5rem; border: 1px solid transparent; align-items: center; }
    .lb-row .rank { color: #444; width: 2rem; flex-shrink: 0; }
    .lb-row .name { color: #888; flex-grow: 1; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 0.5rem; }
    .lb-row .score { color: #00aa00; font-weight: bold; flex-shrink: 0; }
    
    .lb-row.is-player { border-color: #00ff00; background: #001100; box-shadow: inset 0 0 5px rgba(0, 255, 0, 0.1); }
    .lb-row.is-player .rank, .lb-row.is-player .name { color: #00ff00; }
    .lb-row.is-player .score { color: #fff; }
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
