import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-darknet-node',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (gameService.hasDarknetAccess()) {
      <div class="darknet-container" role="region" aria-label="Darknet Communication Node">
        <div class="darknet-header">
          <h3 class="title">SECURE_NODE // GLOBAL_DARKNET</h3>
          <span class="status pulse" aria-live="polite">UPLINK_ENCRYPTED</span>
        </div>

        <div class="darknet-layout">
          <nav class="sidebar" role="tablist" aria-label="Darknet Channels">
            <button class="tab-btn" role="tab" [attr.aria-selected]="activeTab === 'global'" (click)="activeTab = 'global'">GLOBAL_RECON</button>
            <button class="tab-btn" role="tab" [attr.aria-selected]="activeTab === 'teams'" (click)="activeTab = 'teams'">SYNDICATES</button>
            <button class="tab-btn" role="tab" [attr.aria-selected]="activeTab === 'dms'" (click)="activeTab = 'dms'">SECURE_DMS</button>
          </nav>

          <div class="main-view">
            @if (activeTab === 'global') {
              <div class="chat-view" role="tabpanel" aria-label="Global Reconnaissance Chat">
                <div class="chat-log" #globalScroll aria-live="polite">
                  @for (msg of gameService.teamMessages(); track $index) {
                    <div class="msg">
                      <span class="sender">{{ msg.sender }}</span>: {{ msg.text }}
                    </div>
                  }
                </div>
                <div class="chat-input">
                  <input type="text" [(ngModel)]="globalText" 
                         (keyup.enter)="sendGlobal()" 
                         placeholder="BROADCAST_TO_WORLD..."
                         aria-label="Broadcast message to global recon">
                  <button (click)="sendGlobal()" aria-label="Send broadcast">SEND</button>
                </div>
              </div>
            } @else if (activeTab === 'teams') {
              <div class="team-view" role="tabpanel" aria-label="Syndicate Management">
                <div class="create-team">
                  <input type="text" [(ngModel)]="newTeamName" 
                         placeholder="NEW_SYNDICATE_ID"
                         aria-label="New syndicate identifier">
                  <button (click)="createTeam()" aria-label="Create new syndicate">CREATE</button>
                </div>
                <div class="teams-grid" role="list">
                  @for (team of gameService.availableTeams(); track team.id) {
                    <div class="team-node" role="listitem">
                      <div class="t-info">
                        <span class="t-name">{{ team.name }}</span>
                        <span class="t-count" aria-label="{{ team._count?.members || 0 }} operatives connected">{{ team._count?.members || 0 }} OPS</span>
                      </div>
                      <button [disabled]="gameService.activeTeam()?.id === team.id" 
                              (click)="joinTeam(team.id)"
                              [attr.aria-label]="gameService.activeTeam()?.id === team.id ? 'Already connected to ' + team.name : 'Join ' + team.name">
                        {{ gameService.activeTeam()?.id === team.id ? 'CONNECTED' : 'JOIN' }}
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @else if (activeTab === 'dms') {
              <div class="dm-view" role="tabpanel" aria-label="Secure Direct Messages">
                <div class="online-ops">
                  <span class="op-label">ACTIVE_OPERATIVES:</span>
                  <div class="op-list">
                    @for (op of gameService.leaderboard(); track op.id) {
                      @if (!op.isPlayer) {
                        <button class="op-chip" (click)="selectOp(op)" [attr.aria-label]="'Message ' + op.name">{{ op.name }}</button>
                      }
                    }
                  </div>
                </div>

                @if (selectedOp) {
                  <div class="active-dm">
                    <h4 class="dm-header">SECURE_TUNNEL // {{ selectedOp.name }}</h4>
                    <div class="dm-log" aria-live="polite">
                      @for (msg of getDmsWithOp(); track $index) {
                        <div class="msg" [class.sent]="msg.senderId === 'ME'">
                           {{ msg.text }}
                        </div>
                      }
                    </div>
                    <div class="chat-input">
                      <input type="text" [(ngModel)]="dmText" 
                             (keyup.enter)="sendDm()" 
                             placeholder="ENCRYPTED_MSG..."
                             aria-label="Secure message to {{ selectedOp.name }}">
                      <button (click)="sendDm()" aria-label="Send secure message">SEND</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="locked-container" role="alert" aria-label="Access Denied">
         <div class="lock-icon" aria-hidden="true">[0x_LOCKED]</div>
         <div class="lock-text">ENCRYPTED_COMMS_MODULE: OFFLINE</div>
         <div class="lock-sub">Requires 1000 Reputation for Node Decryption.</div>
      </div>
    }
  `,
  styles: `
    .darknet-container { 
      background: var(--layer-1); 
      padding: var(--spacing-md); 
      margin-bottom: 1rem; 
      box-shadow: var(--neon-shadow); 
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .darknet-header { display: flex; justify-content: space-between; align-items: center; background: var(--layer-2); padding: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
    .title { font-size: var(--font-size-sm); color: var(--primary); letter-spacing: 3px; font-weight: 900; margin: 0; }
    .pulse { color: var(--secondary); animation: blink 1s steps(2) infinite; font-size: 0.6rem; font-weight: 900; }

    .darknet-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem; flex-grow: 1; min-height: 400px; }
    @media (min-width: 769px) { .darknet-layout { grid-template-columns: 180px 1fr; } }
    
    .sidebar { display: flex; flex-direction: column; gap: 0.5rem; }
    .tab-btn { font-size: 0.65rem; color: var(--primary); opacity: 0.5; cursor: pointer; padding: 1rem 0.75rem; transition: all 0.05s steps(2); font-weight: 900; background: var(--layer-2); border: none; text-align: left; }
    .tab-btn:hover { opacity: 1; background: var(--layer-4); }
    .tab-btn.active { opacity: 1; background: var(--layer-5); color: #fff; box-shadow: inset 4px 0 var(--primary); }

    .main-view { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; background: var(--layer-0); padding: 1rem; min-height: 300px; }
    
    .chat-log, .dm-log { flex-grow: 1; padding: 0.75rem; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 0.5rem; background: rgba(0,0,0,0.2); }
    .msg { font-size: 0.7rem; color: var(--secondary); line-height: 1.4; word-break: break-all; font-family: 'JetBrains Mono', monospace; }
    .msg.sent { color: var(--primary); text-align: right; }
    .sender { color: var(--primary); font-weight: 900; }

    .chat-input { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .chat-input input { background: var(--layer-2); border: var(--ghost-border); color: #fff; font-size: 0.8rem; padding: 0.75rem; flex-grow: 1; outline: none; }
    .chat-input button { background: var(--layer-4); color: var(--primary); border: var(--ghost-border); font-size: 0.7rem; padding: 0.75rem 1.5rem; cursor: pointer; font-weight: 900; }

    .team-node { display: flex; justify-content: space-between; align-items: center; background: var(--layer-2); padding: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 10px; }
    .t-name { font-size: 0.8rem; color: #fff; font-weight: 900; }
    .t-count { font-size: 0.55rem; color: var(--secondary); font-weight: 900; }

    .create-team { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .create-team input { flex-grow: 1; background: var(--layer-2); border: var(--ghost-border); color: #fff; font-size: 0.8rem; padding: 0.75rem; outline: none; }

    .op-label { font-size: 0.55rem; color: var(--primary); opacity: 0.4; display: block; margin-bottom: 0.75rem; letter-spacing: 1px; font-weight: 900; }
    .op-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .op-chip { font-size: 0.65rem; background: var(--layer-2); color: var(--primary); padding: 0.5rem 1rem; cursor: pointer; font-weight: 900; border: none; }
    .op-chip:hover { background: var(--layer-4); }

    .dm-header { font-size: 0.75rem; color: var(--primary); margin-bottom: 1rem; font-weight: 900; text-transform: uppercase; border-bottom: var(--ghost-border); padding-bottom: 0.5rem; }

    .locked-container { background: var(--layer-0); padding: 4rem 2rem; text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .lock-icon { font-family: 'JetBrains Mono', monospace; font-size: 2.5rem; color: var(--tertiary); margin-bottom: 1.5rem; }
    .lock-text { font-size: 1.1rem; font-weight: 900; color: var(--tertiary); margin-bottom: 0.5rem; }
    .lock-sub { font-size: 0.7rem; color: var(--tertiary); opacity: 0.5; }
  `
})
export class DarknetNodeComponent {
  gameService = inject(GameService);
  activeTab: 'global' | 'teams' | 'dms' = 'global';
  globalText = '';
  dmText = '';
  newTeamName = '';
  selectedOp: any = null;

  sendGlobal() {
    if (this.globalText.trim()) {
      this.gameService.sendTeamMessage(this.globalText);
      this.globalText = '';
    }
  }

  createTeam() {
    if (this.newTeamName.trim()) {
      this.gameService.createTeam(this.newTeamName, 'Operative cell.');
      this.newTeamName = '';
    }
  }

  joinTeam(id: string) {
    this.gameService.joinTeam(id);
  }

  selectOp(op: any) {
    this.selectedOp = op;
    this.activeTab = 'dms';
  }

  sendDm() {
    if (this.selectedOp && this.dmText.trim()) {
      this.gameService.sendPrivateMessage(this.selectedOp.id, this.dmText);
      this.dmText = '';
    }
  }

  getDmsWithOp() {
    if (!this.selectedOp) return [];
    return this.gameService.privateMessages().filter(m => 
      m.senderId === this.selectedOp.id || m.senderId === 'ME'
    );
  }
}
