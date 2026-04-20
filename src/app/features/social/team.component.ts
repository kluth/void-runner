import { Component, inject, signal } from '@angular/core';
import { GameService, Team } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="syndicate-monolith" role="region" aria-label="Syndicate Faction Interface">
      <h3 class="sec-header">SYNDICATE_NODE // FACTION_ALIGNMENT</h3>
      
      @if (!gameService.activeTeam()) {
        <div class="faction-browser">
          <div class="noise-line" aria-hidden="true">SEARCHING_ACTIVE_CELLS...</div>
          <div class="teams-list" role="list">
            @for (team of gameService.availableTeams(); track team.id) {
              <div class="team-card" role="listitem" [class.locked]="(team.reqRep || 0) > gameService.reputation()">
                <div class="t-top">
                  <h4 class="t-name">{{ team.name }}</h4>
                  <span class="t-rep" [attr.aria-label]="'Requires ' + (team.reqRep || 0) + ' reputation'">REQ: {{ team.reqRep || 0 }} REP</span>
                </div>
                <p class="t-desc">{{ team.description }}</p>
                <div class="t-bonus" aria-label="Syndicate Bonus Protocol">BONUS_PROTOCOL: {{ team.bonus }}</div>
                
                <button [disabled]="(team.reqRep || 0) > gameService.reputation()" 
                        (click)="gameService.joinTeam(team.id)"
                        [attr.aria-label]="(team.reqRep || 0) > gameService.reputation() ? 'Reputation too low to join ' + team.name : 'Join ' + team.name">
                   JOIN_CELL
                </button>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-cell-view" role="region" [attr.aria-label]="'Connected to ' + gameService.activeTeam()?.name">
          <div class="cell-header">
            <div class="c-info">
               <span class="c-label">CONNECTED_TO:</span>
               <span class="c-name">{{ gameService.activeTeam()?.name }}</span>
            </div>
            <button class="leave-btn" (click)="leave()" aria-label="Disconnect from syndicate">DISCONNECT</button>
          </div>

          <div class="cell-comms">
             <div class="comms-log" aria-live="polite" aria-label="Syndicate communication log">
                @for (msg of gameService.teamMessages(); track $index) {
                   <div class="msg">
                      <span class="m-sender">[{{ msg.sender }}]</span>: {{ msg.text }}
                   </div>
                }
             </div>
             <div class="comms-input">
                <input type="text" [(ngModel)]="chatText" 
                       (keyup.enter)="send()" 
                       placeholder="SIGNAL_BROADCAST..."
                       aria-label="Send message to syndicate">
                <button (click)="send()" aria-label="Broadcast signal">SEND</button>
             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .syndicate-monolith {
      background: var(--layer-1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: 100%;
      overflow-y: auto;
      padding: var(--spacing-md);
    }

    .sec-header {
      font-size: var(--font-size-sm);
      font-weight: 900;
      color: var(--primary);
      opacity: 0.4;
      background: var(--layer-2);
      padding: 10px 15px;
      letter-spacing: 2px;
      margin: 0;
    }

    .faction-browser { display: flex; flex-direction: column; gap: 1rem; }
    .noise-line { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; opacity: 0.2; }

    .teams-list { display: flex; flex-direction: column; gap: 10px; }
    .team-card {
      background: var(--layer-2);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.05s steps(2);
    }
    .team-card:hover:not(.locked) { background: var(--layer-4); box-shadow: var(--neon-shadow); }
    .team-card.locked { opacity: 0.2; cursor: not-allowed; }

    .t-top { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; }
    .t-name { font-size: 1rem; font-weight: 900; margin: 0; color: #fff; }
    .t-rep { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--secondary); font-weight: 900; }
    .t-desc { font-size: 0.75rem; color: #fff; opacity: 0.6; line-height: 1.4; margin: 0; }
    .t-bonus { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--secondary); font-weight: 900; }

    .active-cell-view {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      flex-grow: 1;
    }

    .cell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--layer-2);
      padding: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .c-label { font-size: 0.5rem; opacity: 0.4; font-weight: 900; margin-right: 10px; }
    .c-name { font-size: 1.1rem; font-weight: 900; color: var(--secondary); }

    .leave-btn { background: transparent; color: var(--tertiary); border: 1px solid var(--tertiary); font-size: 0.65rem; padding: 8px 16px; }
    
    .cell-comms {
       background: var(--layer-0);
       padding: 1.5rem;
       display: flex;
       flex-direction: column;
       min-height: 300px;
       flex-grow: 1;
    }

    .comms-log {
       flex-grow: 1;
       overflow-y: auto;
       display: flex;
       flex-direction: column-reverse;
       gap: 10px;
       margin-bottom: 1.5rem;
       background: rgba(0,0,0,0.2);
       padding: 10px;
    }
    .msg { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--secondary); line-height: 1.4; word-break: break-all; }
    .m-sender { color: var(--primary); font-weight: 900; }

    .comms-input { display: flex; gap: 10px; flex-wrap: wrap; }
    .comms-input input { flex-grow: 1; font-size: 0.85rem; border-bottom: 2px solid var(--layer-3); padding: 8px 0; }
    .comms-input button { background: var(--layer-3); font-size: 0.7rem; padding: 10px 20px; }
  `
})
export class TeamComponent {
  gameService = inject(GameService);
  chatText = '';

  send() {
    if (this.chatText.trim()) {
      this.gameService.sendTeamMessage(this.chatText);
      this.chatText = '';
    }
  }

  leave() {
    this.gameService.activeTeam.set(null);
  }
}
