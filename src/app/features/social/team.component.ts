import { Component, inject, signal } from '@angular/core';
import { GameService, Team } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="teams-container">
      <div class="sec-header">OPERATIVE_SYNDICATES // AFFILIATIONS</div>
      
      <div class="handle-config">
        <label>IDENTITY_HANDLE:</label>
        <input type="text" [(ngModel)]="newHandle" [placeholder]="gameService.playerHandle()">
        <button (click)="updateHandle()">REMAP</button>
      </div>

      @if (!gameService.activeTeam()) {
        <div class="teams-list">
          @for (team of availableTeams; track team.id) {
            <div class="team-card" [class.locked]="gameService.reputation() < (team.reqRep || 0)">
              <div class="team-top">
                <span class="team-name">{{ team.name }}</span>
                <span class="req">REQ: {{ team.reqRep || 0 }} REP</span>
              </div>
              <div class="team-desc">{{ team.description }}</div>
              <div class="team-bonus">BONUS: {{ team.bonus || 'NONE' }}</div>
              <button class="join-btn" 
                      [disabled]="gameService.reputation() < (team.reqRep || 0)"
                      (click)="joinTeam(team)">
                JOIN_SYNDICATE
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="active-team">
          <div class="at-top">
            <span class="at-name">{{ gameService.activeTeam()?.name }}</span>
            <div class="at-actions">
              <button class="mfa-btn" (click)="gameService.setup2fa()">SETUP_MFA</button>
              <button class="leave-btn" (click)="leaveTeam()">LEAVE</button>
            </div>
          </div>
          <div class="at-bonus">ACTIVE_BONUS: {{ gameService.activeTeam()?.bonus }}</div>
          <div class="team-comms">
            <div class="comms-header">ENCRYPTED_COMMS_LINK</div>
            <div class="comms-log">
              @for (msg of gameService.teamMessages(); track $index) {
                <div class="comms-msg">
                  <span class="sender">[{{ msg.sender }}]</span>: {{ msg.text }}
                </div>
              }
            </div>
            <div class="chat-input">
              <input type="text" [(ngModel)]="chatText" placeholder="BROADCAST_MSG..." (keyup.enter)="sendMessage()">
              <button (click)="sendMessage()">SEND</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .teams-container { background: var(--layer-1); padding: 1rem; margin-bottom: 1rem; box-shadow: var(--neon-shadow); }
    .sec-header { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 900; color: var(--primary); background: var(--layer-2); padding: 0.75rem; margin-bottom: 1.5rem; letter-spacing: 2px; text-transform: uppercase; }
    
    .handle-config { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem; background: var(--layer-2); padding: 1rem; flex-wrap: wrap; }
    .handle-config label { font-size: 0.5rem; color: var(--primary); opacity: 0.5; font-weight: 900; }
    .handle-config input { background: var(--layer-0); border: var(--ghost-border); color: #fff; font-size: 0.7rem; padding: 0.5rem; flex-grow: 1; font-family: 'JetBrains Mono', monospace; outline: none; }
    .handle-config button { background: var(--layer-4); color: var(--primary); border: var(--ghost-border); font-size: 0.6rem; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.05s steps(2); font-weight: 900; }
    .handle-config button:hover { background: var(--primary); color: var(--on-primary); }

    .teams-list { display: flex; flex-direction: column; gap: 1rem; }
    .team-card { background: var(--layer-2); padding: 1.5rem; transition: all 0.05s steps(2); }
    .team-card.locked { opacity: 0.3; }
    .team-card:hover:not(.locked) { background: var(--layer-4); box-shadow: var(--neon-shadow); }
    
    .team-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
    .team-name { font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; font-weight: 900; color: var(--primary); }
    .req { font-size: 0.55rem; color: var(--primary); opacity: 0.4; font-weight: 900; }
    
    .team-desc { font-size: 0.65rem; color: #fff; opacity: 0.6; margin-bottom: 0.5rem; line-height: 1.4; }
    .team-bonus { font-size: 0.6rem; color: var(--secondary); font-family: 'JetBrains Mono', monospace; margin-bottom: 1.5rem; font-weight: 900; }
    
    .join-btn { width: 100%; background: var(--secondary); color: var(--on-primary); border: none; padding: 0.75rem; font-size: 0.65rem; font-weight: 900; cursor: pointer; transition: all 0.05s steps(2); }
    .join-btn:hover:not(:disabled) { box-shadow: 0 0 15px var(--secondary); }
    
    .active-team { background: var(--layer-2); padding: 1.5rem; }
    .at-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .at-name { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 900; color: var(--primary); }
    
    .mfa-btn { background: var(--layer-4); border: var(--ghost-border); color: var(--secondary); font-size: 0.55rem; padding: 0.5rem 1rem; cursor: pointer; font-weight: 900; }
    .leave-btn { background: transparent; border: var(--ghost-border); color: var(--tertiary); font-size: 0.55rem; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.05s steps(2); font-weight: 900; }
    .leave-btn:hover { background: var(--tertiary); color: #fff; }
    
    .team-comms { background: var(--layer-0); padding: 1rem; display: flex; flex-direction: column; }
    .comms-header { font-size: 0.55rem; color: var(--primary); opacity: 0.4; margin-bottom: 0.5rem; letter-spacing: 1px; font-weight: 900; }
    .comms-log { height: 10rem; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 0.5rem; margin-bottom: 1rem; padding: 0.5rem; background: rgba(0,0,0,0.3); }
    .comms-msg { font-size: 0.6rem; color: var(--secondary); line-height: 1.4; word-break: break-all; font-family: 'JetBrains Mono', monospace; }
    .comms-msg .sender { color: var(--primary); font-weight: 900; }

    .chat-input { display: flex; gap: 0.5rem; }
    .chat-input input { background: var(--layer-2); border: var(--ghost-border); color: var(--secondary); font-size: 0.65rem; padding: 0.5rem; flex-grow: 1; font-family: 'JetBrains Mono', monospace; outline: none; }
    .chat-input button { background: var(--layer-4); color: var(--secondary); border: var(--ghost-border); font-size: 0.6rem; padding: 0.5rem 1.5rem; cursor: pointer; transition: all 0.05s steps(2); font-weight: 900; }
  `
})
export class TeamComponent {
  gameService = inject(GameService);
  newHandle = '';
  chatText = '';

  availableTeams: Team[] = [
    { id: 'ccc', name: 'CHAOS_COMM_CLUB', description: 'Ethical hackers focused on transparency.', bonus: '+25% REPUTATION GAIN', reqRep: 50 },
    { id: 'lod', name: 'LEGION_OF_DOOM', description: 'Old school phreakers and system explorers.', bonus: '+20% STEALTH MULTIPLIER', reqRep: 150 },
    { id: 'fsociety', name: 'F_SOCIETY', description: 'Revolutionary group targeting corporate debt.', bonus: '+30% RANSOMWARE PAYOUT', reqRep: 300 },
    { id: 'anonymous', name: 'ANONYMOUS', description: 'Decentralized collective of hacktivists.', bonus: '+15% BOTNET MINING SPEED', reqRep: 500 }
  ];

  updateHandle() {
    if (this.newHandle.trim()) {
      this.gameService.playerHandle.set(this.newHandle.trim().toUpperCase());
      this.gameService.log(`IDENTITY REMAPPED: ${this.gameService.playerHandle()}`);
      this.newHandle = '';
    }
  }

  sendMessage() {
    if (this.chatText.trim()) {
      this.gameService.sendTeamMessage(this.chatText.trim());
      this.chatText = '';
    }
  }

  joinTeam(team: Team) {
    this.gameService.isCalibrating.set(true);
    this.gameService.activeTeam.set(team);
    this.gameService.log(`JOINED SYNDICATE: ${team.name}. INITIALIZING CALIBRATION...`);
  }

  leaveTeam() {
    this.gameService.activeTeam.set(null);
    this.gameService.log('LEFT SYNDICATE.');
  }
}
