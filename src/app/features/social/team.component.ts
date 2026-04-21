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
      <div class="terminal-frame mb-4">
        <div class="ascii-line">SYNDICATE_NODE // FACTION_ALIGNMENT</div>
      </div>
      
      @if (!gameService.activeTeam()) {
        <div class="faction-browser">
          <div class="status-line text-xs opacity-70 mb-4">SCANNING_ACTIVE_CELLS... [OK]</div>
          
          <div class="teams-list grid gap-6" role="list">
            @for (team of gameService.availableTeams(); track team.id) {
              <div class="terminal-frame" role="listitem" [class.locked]="(team.reqRep || 0) > gameService.reputation()">
                <div class="ascii-line mb-3">{{ team.name }}</div>
                
                <div class="c-content flex flex-col gap-2">
                  <div class="c-row flex justify-between text-xs opacity-80">
                    <span>REQ: {{ team.reqRep || 0 }} REP</span>
                    <span class="text-secondary">BONUS: {{ team.bonus }}</span>
                  </div>
                  <div class="c-desc text-sm leading-relaxed my-2">{{ team.description }}</div>
                  
                  <div class="c-actions mt-2 flex justify-end">
                    <button [disabled]="(team.reqRep || 0) > gameService.reputation()" 
                            (click)="gameService.joinTeam(team.id)"
                            class="primary text-xs">
                       [ JOIN_CELL ]
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-cell-view flex flex-col h-full gap-4" role="region" [attr.aria-label]="'Connected to ' + gameService.activeTeam()?.name">
          <div class="terminal-frame">
             <div class="ascii-line">CONNECTED_TO: {{ gameService.activeTeam()?.name }}</div>
             <div class="flex justify-end mt-2">
               <button class="text-xs border-tertiary text-tertiary" (click)="leave()">[ DISCONNECT ]</button>
             </div>
          </div>

          <div class="terminal-frame flex-grow flex flex-col overflow-hidden min-h-[300px]">
             <div class="ascii-line mb-2">CELL_COMMUNICATIONS</div>
             <div class="comms-log flex-grow overflow-y-auto p-2 flex flex-col gap-2 border-b border-dashed border-primary mb-2" aria-live="polite">
                @for (msg of gameService.teamMessages(); track $index) {
                   <div class="msg text-sm">
                      <span class="m-sender font-bold text-secondary">[{{ msg.sender }}]</span>: {{ msg.text }}
                   </div>
                }
             </div>
             <div class="comms-input flex items-center gap-3 p-1">
                <span class="prompt font-bold text-secondary">></span>
                <input type="text" [(ngModel)]="chatText" 
                       (keyup.enter)="send()" 
                       placeholder="SIGNAL_BROADCAST..."
                       class="flex-grow bg-transparent border-none outline-none text-primary text-sm font-mono">
                <button (click)="send()" class="text-xs">[ SEND ]</button>
             </div>
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
      padding: var(--spacing-md);
      height: 100%;
      overflow-y: auto;
    }

    .locked {
      opacity: 0.4;
      filter: grayscale(1);
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
