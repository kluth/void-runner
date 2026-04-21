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
      <div class="terminal-frame">
        <div class="t-row top">┌── SECURE_NODE // GLOBAL_DARKNET ────────────────────────────────────────────────────────┐</div>
        
        <div class="t-mid">
          <div class="t-sidebar">
            <div class="t-tab" [class.active]="activeTab === 'global'" (click)="activeTab = 'global'">
              │ [01] GLOBAL │
            </div>
            <div class="t-tab" [class.active]="activeTab === 'teams'" (click)="activeTab = 'teams'">
              │ [02] SYNDIC │
            </div>
            <div class="t-tab" [class.active]="activeTab === 'dms'" (click)="activeTab = 'dms'">
              │ [03] SECURE │
            </div>
            <div class="t-fill">│           │</div>
          </div>

          <div class="t-main">
            @if (activeTab === 'global') {
              <div class="t-view">
                <div class="t-view-header">│ > CHANNEL: #GLOBAL_RECON ───────────────────────────────────────────────────┤</div>
                <div class="t-log" #globalScroll>
                  @for (msg of gameService.teamMessages(); track $index) {
                    <div class="t-msg">
                      <span class="t-sender">[{{ msg.sender }}]</span>: {{ msg.text }}
                    </div>
                  }
                </div>
                <div class="t-input-area">
                  <span class="t-prompt">PROMPT></span>
                  <input type="text" [(ngModel)]="globalText" 
                         (keyup.enter)="sendGlobal()" 
                         placeholder="broadcast_msg..."
                         class="t-input">
                  <button (click)="sendGlobal()" class="t-btn">[ SEND ]</button>
                </div>
              </div>
            } @else if (activeTab === 'teams') {
              <div class="t-view">
                <div class="t-view-header">│ > CHANNEL: #SYNDICATE_MGR ──────────────────────────────────────────────────┤</div>
                <div class="t-scroll">
                  <div class="t-section">
                    <div class="t-label">[ CREATE_NEW_SYNDICATE ]</div>
                    <div class="t-input-area">
                       <span class="t-prompt">ID></span>
                       <input type="text" [(ngModel)]="newTeamName" placeholder="syndicate_id..." class="t-input">
                       <button (click)="createTeam()" class="t-btn">[ INIT ]</button>
                    </div>
                  </div>
                  
                  <div class="t-divider">├─────────────────────────────────────────────────────────────────────────────┤</div>
                  
                  <div class="t-label">[ AVAILABLE_SYNDICATES ]</div>
                  <div class="t-grid">
                    @for (team of gameService.availableTeams(); track team.id) {
                      <div class="t-node">
                        <span class="t-node-name">[{{ team.name }}]</span>
                        <span class="t-node-count">{{ team._count?.members || 0 }} OPS</span>
                        <button class="t-btn-small" 
                                [disabled]="gameService.activeTeam()?.id === team.id" 
                                (click)="joinTeam(team.id)">
                          {{ gameService.activeTeam()?.id === team.id ? '[CONNECTED]' : '[ JOIN ]' }}
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            } @else if (activeTab === 'dms') {
              <div class="t-view">
                <div class="t-view-header">│ > CHANNEL: #SECURE_DMS ──────────────────────────────────────────────────────┤</div>
                
                <div class="t-ops-bar">
                  <span class="t-label">OPERATIVES_ONLINE:</span>
                  <div class="t-ops-list">
                    @for (op of gameService.leaderboard(); track op.id) {
                      @if (!op.isPlayer) {
                        <button class="t-op-btn" (click)="selectOp(op)">[{{ op.name }}]</button>
                      }
                    }
                  </div>
                </div>

                @if (selectedOp) {
                  <div class="t-divider">├─────────────────────────────────────────────────────────────────────────────┤</div>
                  <div class="t-dm-session">
                    <div class="t-label">SECURE_TUNNEL // {{ selectedOp.name }}</div>
                    <div class="t-log">
                      @for (msg of getDmsWithOp(); track $index) {
                        <div class="t-msg" [class.sent]="msg.senderId === 'ME'">
                           <span class="t-sender">{{ msg.senderId === 'ME' ? '[ME]' : '[' + selectedOp.name + ']' }}</span>: {{ msg.text }}
                        </div>
                      }
                    </div>
                    <div class="t-input-area">
                      <span class="t-prompt">SEND></span>
                      <input type="text" [(ngModel)]="dmText" 
                             (keyup.enter)="sendDm()" 
                             placeholder="encrypted_payload..."
                             class="t-input">
                      <button (click)="sendDm()" class="t-btn">[ SEND ]</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
        
        <div class="t-row bottom">└──────────────────────────────────────────────────────────────────────────────────────────┘</div>
      </div>
    } @else {
      <div class="t-locked">
         <div class="t-locked-box">
           <div>┌───────────────────────────────────┐</div>
           <div>│        [ ACCESS_DENIED ]          │</div>
           <div>├───────────────────────────────────┤</div>
           <div>│ ENCRYPTED_COMMS_MODULE: OFFLINE   │</div>
           <div>│ REQ: 1000 REPUTATION              │</div>
           <div>└───────────────────────────────────┘</div>
         </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .terminal-frame {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: #000;
    }

    .t-row {
      white-space: pre;
      line-height: 1;
      font-size: 12px;
      overflow: hidden;
    }

    .t-mid {
      display: flex;
      flex-grow: 1;
      overflow: hidden;
    }

    .t-sidebar {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .t-tab {
      padding: 5px 0;
      cursor: pointer;
      white-space: pre;
      line-height: 1.2;
    }

    .t-tab.active {
      background: var(--primary);
      color: #000;
    }

    .t-fill {
      flex-grow: 1;
      white-space: pre;
    }

    .t-main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-left: none;
    }

    .t-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .t-view-header {
      white-space: pre;
      line-height: 1.2;
      font-size: 12px;
      overflow: hidden;
    }

    .t-log {
      flex-grow: 1;
      padding: 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
    }

    .t-msg {
      font-size: 13px;
      line-height: 1.4;
    }

    .t-msg.sent {
      color: var(--primary-bright);
    }

    .t-sender {
      font-weight: bold;
    }

    .t-input-area {
      display: flex;
      align-items: center;
      padding: 5px 10px;
      background: #000;
      border-top: 1px dashed var(--primary);
    }

    .t-prompt {
      margin-right: 10px;
      font-weight: bold;
    }

    .t-input {
      flex-grow: 1;
      background: transparent !important;
      border: none !important;
      color: var(--primary) !important;
      font-family: 'JetBrains Mono', monospace !important;
      outline: none !important;
      padding: 0 !important;
    }

    .t-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-weight: bold;
      padding: 0 10px;
    }

    .t-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .t-scroll {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
    }

    .t-section {
      margin-bottom: 20px;
    }

    .t-label {
      font-weight: bold;
      margin-bottom: 10px;
      display: block;
    }

    .t-divider {
      white-space: pre;
      margin: 15px 0;
      line-height: 1;
      overflow: hidden;
    }

    .t-grid {
      display: grid;
      gap: 10px;
    }

    .t-node {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px dashed var(--primary);
      padding: 8px;
    }

    .t-btn-small {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      font-size: 11px;
      cursor: pointer;
    }

    .t-btn-small:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .t-ops-bar {
      padding: 10px;
      border-bottom: 1px dashed var(--primary);
    }

    .t-ops-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 5px;
    }

    .t-op-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
    }

    .t-op-btn:hover {
      text-decoration: underline;
    }

    .t-dm-session {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
    }

    .t-locked {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .t-locked-box {
      font-family: 'JetBrains Mono', monospace;
      text-align: center;
      line-height: 1.2;
      color: var(--primary);
    }
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
