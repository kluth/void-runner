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
    .darknet-container { background: rgba(5, 5, 5, 0.95); border: 1px double #00ffff; padding: 15px; margin-bottom: 15px; }
    .darknet-header { display: flex; justify-content: space-between; border-bottom: 1px solid #004444; padding-bottom: 10px; margin-bottom: 15px; }
    .title { font-size: 0.8em; color: #00ffff; letter-spacing: 3px; font-weight: bold; }
    .pulse { color: #00ffff; animation: blink 2s infinite; font-size: 0.6em; }

    .darknet-layout { display: grid; grid-template-columns: 120px 1fr; gap: 15px; height: 300px; }
    
    .sidebar { display: flex; flex-direction: column; gap: 8px; border-right: 1px solid #111; padding-right: 10px; }
    .tab-btn { font-size: 0.6em; color: #008888; cursor: pointer; padding: 8px; border: 1px solid transparent; }
    .tab-btn:hover { color: #00ffff; background: #001111; }
    .tab-btn.active { color: #00ffff; border-color: #008888; background: #001111; }

    .main-view { flex-grow: 1; overflow-y: auto; }
    
    .chat-view, .dm-view { display: flex; flex-direction: column; height: 100%; }
    .chat-log, .dm-log { flex-grow: 1; background: #000; border: 1px solid #111; padding: 10px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 5px; }
    .msg { font-size: 0.6em; color: #00ff00; line-height: 1.4; }
    .msg.sent { color: #00ffff; text-align: right; }
    .sender { color: #00ffff; font-weight: bold; }

    .chat-input { display: flex; gap: 5px; margin-top: 10px; }
    .chat-input input { background: #000; border: 1px solid #004444; color: #fff; font-size: 0.7em; padding: 8px; flex-grow: 1; font-family: inherit; }
    .chat-input button { background: #004444; color: #00ffff; border: 1px solid #00ffff; font-size: 0.6em; padding: 8px 15px; cursor: pointer; }

    .teams-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 15px; }
    .team-node { display: flex; justify-content: space-between; align-items: center; background: #050505; border: 1px solid #111; padding: 10px; }
    .t-name { font-size: 0.7em; color: #fff; font-weight: bold; }
    .t-count { font-size: 0.5em; color: #008800; margin-left: 10px; }
    .team-node button { background: transparent; border: 1px solid #008888; color: #008888; font-size: 0.5em; cursor: pointer; padding: 4px 8px; }
    .team-node button:hover:not(:disabled) { background: #00ffff; color: #000; border-color: #00ffff; }

    .create-team { display: flex; gap: 5px; }
    .create-team input { flex-grow: 1; background: #000; border: 1px solid #222; color: #fff; font-size: 0.6em; padding: 8px; font-family: inherit; }
    .create-team button { background: #003333; color: #00ffff; border: 1px solid #00ffff; font-size: 0.6em; padding: 0 15px; cursor: pointer; }

    .online-ops { margin-bottom: 15px; }
    .op-label { font-size: 0.5em; color: #008800; display: block; margin-bottom: 5px; }
    .op-list { display: flex; flex-wrap: wrap; gap: 5px; }
    .op-chip { font-size: 0.55em; background: #001111; border: 1px solid #004444; color: #00ffff; padding: 3px 8px; cursor: pointer; }
    .op-chip:hover { background: #00ffff; color: #000; }

    .active-dm { border-top: 1px solid #222; padding-top: 15px; display: flex; flex-direction: column; height: 200px; }
    .dm-header { font-size: 0.6em; color: #00ffff; margin-bottom: 10px; font-weight: bold; }

    .locked-container { background: rgba(10, 0, 0, 0.5); border: 1px dashed #400; padding: 40px; text-align: center; }
    .lock-icon { font-size: 3em; margin-bottom: 20px; }
    .lock-text { font-size: 1em; font-weight: bold; color: #ff0000; margin-bottom: 10px; }
    .lock-sub { font-size: 0.6em; color: #600; }
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
