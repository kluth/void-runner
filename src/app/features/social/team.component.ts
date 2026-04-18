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
    .teams-container { background: rgba(10, 10, 10, 0.9); border: 1px solid #1a1a1a; padding: 1rem; margin-bottom: 1rem; }
    .sec-header { font-size: 0.7rem; color: #00ffff; border-bottom: 1px solid #222; padding-bottom: 0.5rem; margin-bottom: 1rem; letter-spacing: 2px; }
    
    .handle-config { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem; background: #001111; padding: 0.75rem; border: 1px solid #003333; flex-wrap: wrap; }
    .handle-config label { font-size: 0.5rem; color: #00ffff; white-space: nowrap; }
    .handle-config input { background: #000; border: 1px solid #004444; color: #fff; font-size: 0.6rem; padding: 0.5rem; flex-grow: 1; font-family: inherit; outline: none; min-width: 8rem; }
    .handle-config button { background: #004444; color: #00ffff; border: 1px solid #00ffff; font-size: 0.6rem; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.2s; }
    .handle-config button:hover { background: #00ffff; color: #000; }

    .teams-list { display: flex; flex-direction: column; gap: 1rem; }
    .team-card { background: #000; border: 1px solid #222; padding: 1rem; transition: all 0.2s; }
    .team-card.locked { opacity: 0.5; border-style: dashed; }
    .team-card:hover:not(.locked) { border-color: #00ffff; transform: translateY(-2px); }
    
    .team-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
    .team-name { font-size: 0.8rem; font-weight: bold; color: #00ffff; }
    .req { font-size: 0.55rem; color: #666; }
    
    .team-desc { font-size: 0.6rem; color: #888; margin-bottom: 0.5rem; line-height: 1.4; }
    .team-bonus { font-size: 0.6rem; color: #00ff00; font-family: monospace; margin-bottom: 1rem; }
    
    .join-btn { width: 100%; background: #004444; color: #00ffff; border: 1px solid #00ffff; padding: 0.6rem; font-size: 0.65rem; font-weight: bold; cursor: pointer; font-family: inherit; transition: all 0.2s; }
    .join-btn:hover:not(:disabled) { background: #00ffff; color: #000; }
    
    .active-team { background: #001111; border: 1px solid #00ffff; padding: 1rem; }
    .at-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
    .at-actions { display: flex; gap: 0.5rem; }
    .at-name { font-size: 1rem; font-weight: bold; color: #00ffff; }
    .at-bonus { font-size: 0.6rem; color: #00ff00; margin-bottom: 1.5rem; }
    
    .mfa-btn { background: #004444; border: 1px solid #00ff00; color: #00ff00; font-size: 0.55rem; padding: 0.25rem 0.5rem; cursor: pointer; }
    .leave-btn { background: transparent; border: 1px solid #440000; color: #880000; font-size: 0.55rem; padding: 0.25rem 0.5rem; cursor: pointer; transition: all 0.2s; }
    .leave-btn:hover { background: #440000; color: #fff; }
    
    .team-comms { background: #000; border: 1px solid #003333; padding: 1rem; display: flex; flex-direction: column; }
    .comms-header { font-size: 0.55rem; color: #008888; margin-bottom: 0.5rem; letter-spacing: 1px; }
    .comms-log { height: 8rem; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 0.5rem; margin-bottom: 1rem; padding: 0.5rem; background: rgba(0,0,0,0.5); }
    .comms-msg { font-size: 0.6rem; color: #00ff00; line-height: 1.4; word-break: break-all; }
    .comms-msg .sender { color: #00ffff; font-weight: bold; }

    .chat-input { display: flex; gap: 0.5rem; }
    .chat-input input { background: #000; border: 1px solid #004444; color: #00ff00; font-size: 0.65rem; padding: 0.5rem; flex-grow: 1; font-family: inherit; outline: none; }
    .chat-input input:focus { border-color: #00ffff; }
    .chat-input button { background: #003333; color: #00ff00; border: 1px solid #008888; font-size: 0.6rem; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.2s; }
    .chat-input button:hover { background: #00ff00; color: #000; }
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
