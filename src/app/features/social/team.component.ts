import { Component, inject, signal } from '@angular/core';
import { GameService, Team } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-container" role="region" aria-label="Syndicate Faction Interface">
      <div class="ascii-header">
        ┌──────────────────────────────────────────────────────────────────┐
        │ SYNDICATE_NODE // FACTION_ALIGNMENT                              │
        └──────────────────────────────────────────────────────────────────┘
      </div>
      
      @if (!gameService.activeTeam()) {
        <div class="faction-browser">
          <div class="status-line">SCANNING_ACTIVE_CELLS... [OK]</div>
          
          <div class="teams-list" role="list">
            @for (team of gameService.availableTeams(); track team.id) {
              <div class="team-card-ascii" role="listitem" [class.locked]="(team.reqRep || 0) > gameService.reputation()">
                <div class="c-border">┌── {{ team.name }} ───────────────────</div>
                <div class="c-content">
                  <div class="c-row">
                    <span class="c-label">REQ:</span> {{ team.reqRep || 0 }} REP
                    <span class="c-label" style="margin-left: 20px">BONUS:</span> {{ team.bonus }}
                  </div>
                  <div class="c-desc">{{ team.description }}</div>
                  
                  <div class="c-actions">
                    <button [disabled]="(team.reqRep || 0) > gameService.reputation()" 
                            (click)="gameService.joinTeam(team.id)"
                            class="term-btn">
                       [ JOIN_CELL ]
                    </button>
                  </div>
                </div>
                <div class="c-border">└──────────────────────────────────────</div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-cell-view" role="region" [attr.aria-label]="'Connected to ' + gameService.activeTeam()?.name">
          <div class="cell-status">
            <div class="status-line">
              <span class="c-label">CONNECTED_TO:</span> {{ gameService.activeTeam()?.name }}
              <button class="term-btn exit-btn" (click)="leave()">[ DISCONNECT ]</button>
            </div>
          </div>

          <div class="comms-window">
             <div class="w-border">┌── CELL_COMMUNICATIONS ────────────────────────────────────┐</div>
             <div class="comms-log" aria-live="polite">
                @for (msg of gameService.teamMessages(); track $index) {
                   <div class="msg">
                      <span class="m-sender">[{{ msg.sender }}]</span>: {{ msg.text }}
                   </div>
                }
             </div>
             <div class="w-border">├────────────────────────────────────────────────────────────┤</div>
             <div class="comms-input">
                <span class="prompt">></span>
                <input type="text" [(ngModel)]="chatText" 
                       (keyup.enter)="send()" 
                       placeholder="SIGNAL_BROADCAST..."
                       class="term-input">
                <button (click)="send()" class="term-btn">[ SEND ]</button>
             </div>
             <div class="w-border">└────────────────────────────────────────────────────────────┘</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .terminal-container {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
      overflow-y: auto;
    }

    .ascii-header {
      white-space: pre;
      line-height: 1;
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }

    .status-line {
      font-size: 0.75rem;
      margin-bottom: 1rem;
    }

    .teams-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .team-card-ascii {
      display: flex;
      flex-direction: column;
    }

    .team-card-ascii.locked {
      opacity: 0.3;
    }

    .c-border {
      white-space: pre;
      line-height: 1;
      font-size: 0.8rem;
    }

    .c-content {
      border-left: 1px solid var(--primary);
      padding: 0.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .c-row {
      font-size: 0.7rem;
    }

    .c-label {
      opacity: 0.6;
      margin-right: 5px;
    }

    .c-desc {
      font-size: 0.75rem;
      line-height: 1.4;
    }

    .term-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      font-family: inherit;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
    }

    .term-btn:hover:not(:disabled) {
      background: var(--primary);
      color: #000;
    }

    .term-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .active-cell-view {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }

    .exit-btn {
      margin-left: 20px;
      color: var(--tertiary);
    }

    .comms-window {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 400px;
    }

    .w-border {
      white-space: pre;
      line-height: 1;
      font-size: 0.8rem;
    }

    .comms-log {
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      flex-grow: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .msg {
      font-size: 0.75rem;
    }

    .m-sender {
      font-weight: bold;
    }

    .comms-input {
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .prompt {
      font-weight: bold;
    }

    .term-input {
      flex-grow: 1;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--primary);
      color: var(--primary);
      font-family: inherit;
      font-size: 0.75rem;
      outline: none;
    }
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
