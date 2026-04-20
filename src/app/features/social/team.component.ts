import { Component, inject, signal } from '@angular/core';
import { GameService, Team } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="syndicate-monolith">
      <div class="sec-header">SYNDICATE_NODE // FACTION_ALIGNMENT</div>
      
      @if (!gameService.activeTeam()) {
        <div class="faction-browser">
          <div class="noise-line">SEARCHING_ACTIVE_CELLS...</div>
          <div class="teams-list">
            @for (team of gameService.availableTeams(); track team.id) {
              <div class="team-card" [class.locked]="(team.reqRep || 0) > gameService.reputation()">
                <div class="t-top">
                  <span class="t-name">{{ team.name }}</span>
                  <span class="t-rep">REQ: {{ team.reqRep || 0 }} REP</span>
                </div>
                <div class="t-desc">{{ team.description }}</div>
                <div class="t-bonus">BONUS_PROTOCOL: {{ team.bonus }}</div>
                
                <button [disabled]="(team.reqRep || 0) > gameService.reputation()" 
                        (click)="gameService.joinTeam(team.id)">
                   JOIN_CELL
                </button>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-cell-view">
          <div class="cell-header">
            <div class="c-info">
               <span class="c-label">CONNECTED_TO:</span>
               <span class="c-name">{{ gameService.activeTeam()?.name }}</span>
            </div>
            <button class="leave-btn" (click)="leave()">DISCONNECT</button>
          </div>

          <div class="cell-comms">
             <div class="comms-log">
                @for (msg of gameService.teamMessages(); track $index) {
                   <div class="msg">
                      <span class="m-sender">[{{ msg.sender }}]</span>: {{ msg.text }}
                   </div>
                }
             </div>
             <div class="comms-input">
                <input type="text" [(ngModel)]="chatText" (keyup.enter)="send()" placeholder="SIGNAL_BROADCAST...">
                <button (click)="send()">SEND</button>
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
    }

    .sec-header {
      font-size: 0.75rem;
      font-weight: 900;
      color: var(--primary);
      opacity: 0.4;
      background: var(--layer-2);
      padding: 10px 15px;
      letter-spacing: 2px;
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

    .t-top { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 900; }
    .t-rep { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--secondary); }
    .t-desc { font-size: 0.7rem; color: #fff; opacity: 0.6; line-height: 1.4; }
    .t-bonus { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--secondary); font-weight: 900; }

    .active-cell-view {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--layer-2);
      padding: 15px;
    }
    .c-label { font-size: 0.5rem; opacity: 0.4; font-weight: 900; margin-right: 10px; }
    .c-name { font-size: 1rem; font-weight: 900; color: var(--secondary); }

    .leave-btn { background: transparent; color: var(--tertiary); border: 1px solid var(--tertiary); font-size: 0.6rem; padding: 6px 12px; }
    
    .cell-comms {
       background: var(--layer-0);
       padding: 1.5rem;
       display: flex;
       flex-direction: column;
       height: 300px;
    }

    .comms-log {
       flex-grow: 1;
       overflow-y: auto;
       display: flex;
       flex-direction: column-reverse;
       gap: 8px;
       margin-bottom: 1.5rem;
    }
    .msg { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--secondary); line-height: 1.4; }
    .m-sender { color: var(--primary); font-weight: 900; }

    .comms-input { display: flex; gap: 10px; }
    .comms-input input { flex-grow: 1; font-size: 0.75rem; border-bottom: 2px solid var(--layer-3); }
    .comms-input button { background: var(--layer-3); font-size: 0.65rem; padding: 8px 16px; }
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
