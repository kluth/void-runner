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
    .teams-container { background: rgba(10, 10, 10, 0.9); border: 1px solid #1a1a1a; padding: 15px; margin-bottom: 15px; }
    .sec-header { font-size: 0.7em; color: #00ffff; border-bottom: 1px solid #222; padding-bottom: 8px; margin-bottom: 12px; letter-spacing: 2px; }
    
    .handle-config { display: flex; gap: 5px; align-items: center; margin-bottom: 15px; background: #001111; padding: 8px; border: 1px solid #003333; }
    .handle-config label { font-size: 0.5em; color: #00ffff; }
    .handle-config input { background: #000; border: 1px solid #004444; color: #fff; font-size: 0.6em; padding: 4px; flex-grow: 1; font-family: inherit; }
    .handle-config button { background: #004444; color: #00ffff; border: 1px solid #00ffff; font-size: 0.5em; padding: 4px 8px; cursor: pointer; }

    .teams-list { display: flex; flex-direction: column; gap: 10px; }
    .team-card { background: #000; border: 1px solid #222; padding: 12px; }
    .team-card.locked { opacity: 0.5; border-style: dashed; }
    
    .team-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .team-name { font-size: 0.8em; font-weight: bold; color: #00ffff; }
    .req { font-size: 0.55em; color: #666; }
    
    .team-desc { font-size: 0.6em; color: #888; margin-bottom: 5px; }
    .team-bonus { font-size: 0.6em; color: #00ff00; font-family: monospace; margin-bottom: 10px; }
    
    .join-btn { width: 100%; background: #004444; color: #00ffff; border: 1px solid #00ffff; padding: 6px; font-size: 0.6em; cursor: pointer; font-family: inherit; }
    .join-btn:hover:not(:disabled) { background: #00ffff; color: #000; }
    
    .active-team { background: #001111; border: 1px solid #00ffff; padding: 12px; }
    .at-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .at-actions { display: flex; gap: 5px; }
    .at-name { font-size: 1em; font-weight: bold; color: #00ffff; }
    .at-bonus { font-size: 0.6em; color: #00ff00; margin-bottom: 15px; }
    
    .mfa-btn { background: #004444; border: 1px solid #00ff00; color: #00ff00; font-size: 0.5em; padding: 2px 6px; cursor: pointer; }
    .leave-btn { background: transparent; border: 1px solid #440000; color: #880000; font-size: 0.5em; padding: 2px 6px; cursor: pointer; }
    .leave-btn:hover { background: #440000; color: #fff; }
    
    .team-comms { background: #000; border: 1px solid #003333; padding: 10px; }
    .comms-header { font-size: 0.55em; color: #008888; margin-bottom: 5px; }
    .comms-log { height: 100px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 4px; margin-bottom: 10px; }
    .comms-msg { font-size: 0.55em; color: #00ff00; line-height: 1.2; }
    .comms-msg .sender { color: #00ffff; font-weight: bold; }

    .chat-input { display: flex; gap: 4px; }
    .chat-input input { background: #000; border: 1px solid #004444; color: #00ff00; font-size: 0.6em; padding: 4px; flex-grow: 1; font-family: inherit; }
    .chat-input button { background: #003333; color: #00ff00; border: 1px solid #008888; font-size: 0.5em; cursor: pointer; }
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
