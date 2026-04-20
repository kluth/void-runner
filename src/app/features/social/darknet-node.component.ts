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
         <div class="lock-icon">[0x_LOCKED]</div>
         <div class="lock-text">ENCRYPTED_COMMS_MODULE: OFFLINE</div>
         <div class="lock-sub">Requires 1000 Reputation for Node Decryption.</div>
      </div>
    }
  `,
  styles: `
    .darknet-container { background: var(--layer-1); padding: 1rem; margin-bottom: 1rem; box-shadow: var(--neon-shadow); }
    .darknet-header { display: flex; justify-content: space-between; align-items: center; background: var(--layer-2); padding: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
    .title { font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; color: var(--primary); letter-spacing: 3px; font-weight: 900; }
    .pulse { color: var(--secondary); animation: blink 1s steps(2) infinite; font-size: 0.6rem; font-weight: 900; }

    .darknet-layout { display: grid; grid-template-columns: 8rem 1fr; gap: 1.5rem; height: 25rem; }
    
    .sidebar { display: flex; flex-direction: column; gap: 0.5rem; }
    .tab-btn { font-size: 0.6rem; color: var(--primary); opacity: 0.4; cursor: pointer; padding: 1rem 0.75rem; transition: all 0.05s steps(2); font-weight: 900; background: var(--layer-2); }
    .tab-btn:hover { opacity: 1; background: var(--layer-4); }
    .tab-btn.active { opacity: 1; background: var(--layer-5); color: #fff; box-shadow: inset 2px 0 var(--primary); }

    .main-view { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; background: var(--layer-0); padding: 1rem; }
    
    .chat-log, .dm-log { flex-grow: 1; padding: 0.75rem; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 0.5rem; }
    .msg { font-size: 0.6rem; color: var(--secondary); line-height: 1.4; word-break: break-all; font-family: 'JetBrains Mono', monospace; }
    .msg.sent { color: var(--primary); text-align: right; }
    .sender { color: var(--primary); font-weight: 900; }

    .chat-input { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .chat-input input { background: var(--layer-2); border: var(--ghost-border); color: #fff; font-size: 0.7rem; padding: 0.75rem; flex-grow: 1; font-family: 'JetBrains Mono', monospace; outline: none; }
    .chat-input button { background: var(--layer-4); color: var(--primary); border: var(--ghost-border); font-size: 0.6rem; padding: 0.75rem 1.5rem; cursor: pointer; transition: all 0.05s steps(2); font-weight: 900; }
    .chat-input button:hover { background: var(--primary); color: var(--on-primary); }

    .team-node { display: flex; justify-content: space-between; align-items: center; background: var(--layer-2); padding: 1rem; margin-bottom: 0.5rem; }
    .t-name { font-family: 'Space Grotesk', sans-serif; font-size: 0.7rem; color: #fff; font-weight: 900; }
    .t-count { font-size: 0.55rem; color: var(--secondary); font-weight: 900; }
    .team-node button { background: var(--layer-4); border: var(--ghost-border); color: var(--primary); font-size: 0.55rem; cursor: pointer; padding: 0.5rem 1rem; font-weight: 900; }

    .create-team { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .create-team input { flex-grow: 1; background: var(--layer-2); border: var(--ghost-border); color: #fff; font-size: 0.7rem; padding: 0.75rem; outline: none; }

    .op-label { font-size: 0.55rem; color: var(--primary); opacity: 0.4; display: block; margin-bottom: 0.75rem; letter-spacing: 1px; font-weight: 900; }
    .op-chip { font-size: 0.6rem; background: var(--layer-2); color: var(--primary); padding: 0.25rem 0.6rem; cursor: pointer; font-weight: 900; }
    .op-chip:hover { background: var(--layer-4); }

    .dm-header { font-family: 'Space Grotesk', sans-serif; font-size: 0.7rem; color: var(--primary); margin-bottom: 1rem; font-weight: 900; text-transform: uppercase; border-bottom: var(--ghost-border); padding-bottom: 0.5rem; }

    .locked-container { background: var(--layer-0); padding: 3rem; text-align: center; }
    .lock-icon { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; color: var(--tertiary); margin-bottom: 1.5rem; }
    .lock-text { font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 900; color: var(--tertiary); margin-bottom: 0.5rem; }
    .lock-sub { font-size: 0.65rem; color: var(--tertiary); opacity: 0.5; }
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
    return this.gameService.privateMessages().filter(m => 
      m.senderId === this.selectedOp.id || m.senderId === 'ME'
    );
  }
}
