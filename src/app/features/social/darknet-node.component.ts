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
      <div class="darknet-container">
        <div class="darknet-header">
          <span class="title">SECURE_NODE // GLOBAL_DARKNET</span>
          <span class="status pulse">UPLINK_ENCRYPTED</span>
        </div>

        <div class="darknet-layout">
          <div class="sidebar">
            <div class="tab-btn" [class.active]="activeTab === 'global'" (click)="activeTab = 'global'">GLOBAL_RECON</div>
            <div class="tab-btn" [class.active]="activeTab === 'teams'" (click)="activeTab = 'teams'">SYNDICATES</div>
            <div class="tab-btn" [class.active]="activeTab === 'dms'" (click)="activeTab = 'dms'">SECURE_DMS</div>
          </div>

          <div class="main-view">
            @if (activeTab === 'global') {
              <div class="chat-view">
                <div class="chat-log" #globalScroll>
                  @for (msg of gameService.teamMessages(); track $index) {
                    <div class="msg">
                      <span class="sender">{{ msg.sender }}</span>: {{ msg.text }}
                    </div>
                  }
                </div>
                <div class="chat-input">
                  <input type="text" [(ngModel)]="globalText" (keyup.enter)="sendGlobal()" placeholder="BROADCAST_TO_WORLD...">
                  <button (click)="sendGlobal()">SEND</button>
                </div>
              </div>
            } @else if (activeTab === 'teams') {
              <div class="team-view">
                <div class="create-team">
                  <input type="text" [(ngModel)]="newTeamName" placeholder="NEW_SYNDICATE_NAME">
                  <button (click)="createTeam()">CREATE</button>
                </div>
                <div class="teams-grid">
                  @for (team of gameService.availableTeams(); track team.id) {
                    <div class="team-node">
                      <div class="t-info">
                        <span class="t-name">{{ team.name }}</span>
                        <span class="t-count">{{ team._count?.members || 0 }} OPS</span>
                      </div>
                      <button [disabled]="gameService.activeTeam()?.id === team.id" (click)="joinTeam(team.id)">
                        {{ gameService.activeTeam()?.id === team.id ? 'CONNECTED' : 'JOIN' }}
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @else if (activeTab === 'dms') {
              <div class="dm-view">
                <div class="online-ops">
                  <span class="op-label">ACTIVE_OPERATIVES:</span>
                  <div class="op-list">
                    @for (op of gameService.leaderboard(); track op.id) {
                      @if (!op.isPlayer) {
                        <div class="op-chip" (click)="selectOp(op)">{{ op.name }}</div>
                      }
                    }
                  </div>
                </div>

                @if (selectedOp) {
                  <div class="active-dm">
                    <div class="dm-header">SECURE_TUNNEL // {{ selectedOp.name }}</div>
                    <div class="dm-log">
                      @for (msg of getDmsWithOp(); track $index) {
                        <div class="msg" [class.sent]="msg.senderId === 'ME'">
                           {{ msg.text }}
                        </div>
                      }
                    </div>
                    <div class="chat-input">
                      <input type="text" [(ngModel)]="dmText" (keyup.enter)="sendDm()" placeholder="ENCRYPTED_MSG...">
                      <button (click)="sendDm()">SEND</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="locked-container">
         <div class="lock-icon">🔒</div>
         <div class="lock-text">ENCRYPTED_COMMS_MODULE: OFFLINE</div>
         <div class="lock-sub">Requires 1000 Reputation for Node Decryption.</div>
      </div>
    }
  `,
  styles: `
    .darknet-container { background: rgba(5, 5, 5, 0.95); border: 1px double #00ffff; padding: 1rem; margin-bottom: 1rem; }
    .darknet-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #004444; padding-bottom: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
    .title { font-size: 0.8rem; color: #00ffff; letter-spacing: 3px; font-weight: bold; }
    .pulse { color: #00ffff; animation: blink 2s infinite; font-size: 0.6rem; }

    .darknet-layout { display: grid; grid-template-columns: 8rem 1fr; gap: 1rem; height: 25rem; }
    @media (max-width: 600px) {
      .darknet-layout { grid-template-columns: 1fr; height: auto; min-height: 25rem; }
      .sidebar { flex-direction: row !important; border-right: none !important; border-bottom: 1px solid #111; padding-right: 0 !important; padding-bottom: 0.5rem; }
      .tab-btn { flex: 1; text-align: center; }
    }
    
    .sidebar { display: flex; flex-direction: column; gap: 0.5rem; border-right: 1px solid #111; padding-right: 0.75rem; }
    .tab-btn { font-size: 0.6rem; color: #008888; cursor: pointer; padding: 0.75rem 0.5rem; border: 1px solid transparent; transition: all 0.2s; }
    .tab-btn:hover { color: #00ffff; background: #001111; }
    .tab-btn.active { color: #00ffff; border-color: #008888; background: #001111; }

    .main-view { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; }
    
    .chat-view, .dm-view, .team-view { display: flex; flex-direction: column; height: 100%; min-height: 20rem; }
    .chat-log, .dm-log { flex-grow: 1; background: #000; border: 1px solid #111; padding: 0.75rem; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 0.5rem; }
    .msg { font-size: 0.6rem; color: #00ff00; line-height: 1.4; word-break: break-all; }
    .msg.sent { color: #00ffff; text-align: right; }
    .sender { color: #00ffff; font-weight: bold; }

    .chat-input { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .chat-input input { background: #000; border: 1px solid #004444; color: #fff; font-size: 0.7rem; padding: 0.6rem; flex-grow: 1; font-family: inherit; outline: none; }
    .chat-input button { background: #004444; color: #00ffff; border: 1px solid #00ffff; font-size: 0.6rem; padding: 0.6rem 1rem; cursor: pointer; transition: all 0.2s; }
    .chat-input button:hover { background: #00ffff; color: #000; }

    .teams-grid { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
    .team-node { display: flex; justify-content: space-between; align-items: center; background: #050505; border: 1px solid #111; padding: 0.75rem; gap: 1rem; }
    .t-info { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; flex-grow: 1; }
    .t-name { font-size: 0.7rem; color: #fff; font-weight: bold; }
    .t-count { font-size: 0.55rem; color: #008800; }
    .team-node button { background: transparent; border: 1px solid #008888; color: #008888; font-size: 0.55rem; cursor: pointer; padding: 0.4rem 0.75rem; white-space: nowrap; transition: all 0.2s; }
    .team-node button:hover:not(:disabled) { background: #00ffff; color: #000; border-color: #00ffff; }

    .create-team { display: flex; gap: 0.5rem; }
    .create-team input { flex-grow: 1; background: #000; border: 1px solid #222; color: #fff; font-size: 0.7rem; padding: 0.6rem; font-family: inherit; outline: none; }
    .create-team button { background: #003333; color: #00ffff; border: 1px solid #00ffff; font-size: 0.6rem; padding: 0 1rem; cursor: pointer; transition: all 0.2s; }

    .online-ops { margin-bottom: 1rem; }
    .op-label { font-size: 0.55rem; color: #008800; display: block; margin-bottom: 0.5rem; letter-spacing: 1px; }
    .op-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .op-chip { font-size: 0.6rem; background: #001111; border: 1px solid #004444; color: #00ffff; padding: 0.25rem 0.6rem; cursor: pointer; transition: all 0.2s; }
    .op-chip:hover { background: #00ffff; color: #000; }

    .active-dm { border-top: 1px solid #222; padding-top: 1rem; display: flex; flex-direction: column; flex-grow: 1; min-height: 15rem; }
    .dm-header { font-size: 0.6rem; color: #00ffff; margin-bottom: 0.75rem; font-weight: bold; }

    .locked-container { background: rgba(10, 0, 0, 0.5); border: 1px dashed #400; padding: 2rem; text-align: center; }
    .lock-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .lock-text { font-size: 1rem; font-weight: bold; color: #ff0000; margin-bottom: 0.5rem; }
    .lock-sub { font-size: 0.6rem; color: #600; }
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
  }

  sendDm() {
    if (this.selectedOp && this.dmText.trim()) {
      this.gameService.sendPrivateMessage(this.selectedOp.id, this.dmText);
      this.dmText = '';
    }
  }

  getDmsWithOp() {
    if (!this.selectedOp) return [];
    // Filter DMs involving the current op ID and current player ID
    return this.gameService.privateMessages().filter(m => 
      m.senderId === this.selectedOp.id || m.senderId === 'ME' // Note: in real, we'd use our socket.id
    );
  }
}
