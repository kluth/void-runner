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
      <div class="terminal-frame h-full flex flex-col overflow-hidden">
        <div class="ascii-line mb-2">SECURE_NODE // GLOBAL_DARKNET</div>
        
        <div class="t-mid">
          <div class="t-sidebar">
            <div class="t-tab" [class.active]="activeTab === 'global'" (click)="activeTab = 'global'">
              [01] GLOBAL
            </div>
            <div class="t-tab" [class.active]="activeTab === 'teams'" (click)="activeTab = 'teams'">
              [02] SYNDIC
            </div>
            <div class="t-tab" [class.active]="activeTab === 'dms'" (click)="activeTab = 'dms'">
              [03] SECURE
            </div>
          </div>

          <div class="t-main">
            @if (activeTab === 'global') {
              <div class="t-view">
                <div class="ascii-line mb-2 text-xs">CHANNEL: #GLOBAL_RECON</div>
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
                <div class="ascii-line mb-2 text-xs">CHANNEL: #SYNDICATE_MGR</div>
                <div class="t-scroll">
                  <div class="t-section">
                    <div class="t-label">[ CREATE_NEW_SYNDICATE ]</div>
                    <div class="t-input-area border border-dashed border-primary p-2">
                       <span class="t-prompt">ID></span>
                       <input type="text" [(ngModel)]="newTeamName" placeholder="syndicate_id..." class="t-input">
                       <button (click)="createTeam()" class="t-btn">[ INIT ]</button>
                    </div>
                  </div>
                  
                  <div class="ascii-line my-4">AVAILABLE_SYNDICATES</div>
                  
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
                <div class="ascii-line mb-2 text-xs">CHANNEL: #SECURE_DMS</div>
                
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
                  <div class="ascii-line my-2">SECURE_TUNNEL // {{ selectedOp.name }}</div>
                  <div class="t-dm-session">
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
      </div>
    } @else {
      <div class="t-locked flex items-center justify-center h-full">
         <div class="terminal-frame max-w-md w-full text-center p-8">
           <div class="ascii-line mb-4">ACCESS_DENIED</div>
           <div class="my-4 text-tertiary font-bold tracking-widest">ENCRYPTED_COMMS_MODULE: OFFLINE</div>
           <div class="text-sm opacity-60">REQUIREMENT: 1000 REPUTATION</div>
           <div class="ascii-line mt-6"></div>
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

    .t-mid {
      display: flex;
      flex-grow: 1;
      overflow: hidden;
      margin-top: 10px;
    }

    .t-sidebar {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid var(--primary);
      padding-right: 10px;
    }

    .t-tab {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 4px;
      border: 1px transparent solid;
    }

    .t-tab.active {
      background: var(--primary);
      color: #000;
      font-weight: bold;
    }

    .t-main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding-left: 15px;
    }

    .t-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .t-log {
      flex-grow: 1;
      padding: 10px 0;
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
      color: var(--secondary);
    }

    .t-input-area {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-top: 1px dashed var(--primary);
    }

    .t-prompt {
      margin-right: 10px;
      font-weight: bold;
      color: var(--secondary);
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
      border: 1px solid var(--primary);
      color: var(--primary);
      cursor: pointer;
      font-weight: bold;
      padding: 4px 12px;
      margin-left: 10px;
    }

    .t-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .t-scroll {
      flex-grow: 1;
      overflow-y: auto;
      padding-right: 10px;
    }

    .t-section {
      margin-bottom: 20px;
    }

    .t-label {
      font-weight: bold;
      margin-bottom: 10px;
      display: block;
      color: var(--secondary);
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
      padding: 10px;
    }

    .t-btn-small {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      font-size: 11px;
      cursor: pointer;
      padding: 2px 8px;
    }

    .t-btn-small:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .t-ops-bar {
      padding: 10px 0;
      border-bottom: 1px dashed var(--primary);
      margin-bottom: 10px;
    }

    .t-ops-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 5px;
    }

    .t-op-btn {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 2px 8px;
    }

    .t-op-btn:hover {
      background: var(--primary);
      color: #000;
    }

    .t-dm-session {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
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
