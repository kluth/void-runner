import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-container">
      <div class="terminal-frame">
        <div class="ascii-line">VOID_RUN_TERMINAL_v5.0</div>
        
        <div class="terminal-content">
          <div class="terminal-header">
            <div class="header-segment">
              <span class="label">USER:</span>
              <span class="value clickable" (click)="triggerEasterEgg()">{{ gameService.playerHandle() }}</span>
            </div>
            <div class="header-segment">
              <span class="label">SESSION:</span>
              <span class="value">0x{{ gameService.playerHandle().length.toString(16).toUpperCase() }}</span>
            </div>
            <div class="header-segment">
              <span class="label">LATENCY:</span>
              <span class="value">14ms</span>
            </div>
            <div class="header-segment hide-mobile">
              <span class="label">STATUS:</span>
              <span class="value pulse">CONNECTED</span>
            </div>
          </div>

          <div class="terminal-body" #scrollContainer (scroll)="handleScroll()">
            @for (log of gameService.terminalLogs(); track $index) {
              <div class="log-line" [class.glitch-error]="log.message.includes('ERR:') || log.message.includes('!!!')">
                <span class="timestamp">[{{ log.timestamp }}]</span>
                <span class="message" [innerHTML]="log.message"></span>
              </div>
            }
            
            <div class="input-line">
              <span class="prompt">{{ gameService.playerHandle() }}@void:~$</span>
              <div class="input-wrapper">
                <input type="text" 
                       #cmdInputRef
                       [(ngModel)]="cmdInput" 
                       (keyup.enter)="handleCmd()"
                       (keydown.arrowUp)="navigateHistory(1)"
                       (keydown.arrowDown)="navigateHistory(-1)"
                       spellcheck="false"
                       autocomplete="off"
                       autofocus>
                <span class="cursor-block"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tmux-status-bar">
        <div class="status-left">
          <span class="session-name">[void]</span>
          <span class="window-index">0:sh*</span>
          <span class="window-index inactive">1:net</span>
          <span class="window-index inactive">2:sys</span>
        </div>
        <div class="spacer"></div>
        <div class="status-right">
          <span class="node-id">"CORE_NODE"</span>
          <span class="clock">{{ currentTime() }}</span>
        </div>
      </div>

      @if (gameService.detectedOS() === 'ANDROID' || gameService.detectedOS() === 'IOS') {
         <div class="mobile-controls bottom-sheet" role="dialog" aria-label="Quick Commands">
            <div class="sheet-handle"></div>
            <button class="primary execute-btn" (click)="handleCmd()" aria-label="Execute Command">EXECUTE</button>
            <div class="shortcuts" role="list">
               <button role="listitem" (click)="cmdInput = 'help'; handleCmd()">HELP</button>
               <button role="listitem" (click)="cmdInput = 'ls'; handleCmd()">LS</button>
               <button role="listitem" (click)="cmdInput = 'status'; handleCmd()">STATUS</button>
               <button role="listitem" (click)="cmdInput = 'cooldown'; handleCmd()">COOL</button>
               <button role="listitem" (click)="cmdInput = 'wipe'; handleCmd()">WIPE</button>
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
    }

    .terminal-container { 
      background: #000; 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      font-family: 'JetBrains Mono', monospace; 
      color: var(--primary);
      overflow: hidden;
      position: relative;
      padding: 4px;
      box-sizing: border-box;
    }

    .terminal-frame {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .terminal-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-top: 8px;
    }

    .terminal-header { 
      display: flex; 
      flex-wrap: wrap;
      gap: 10px 20px;
      padding: 4px 10px;
      border-bottom: 1px dashed rgba(0, 255, 0, 0.2);
      font-size: 0.65rem;
    }

    .header-segment .label { opacity: 0.5; margin-right: 5px; }
    .header-segment .value { font-weight: 700; }
    .header-segment .clickable:hover { text-decoration: underline; cursor: pointer; color: var(--primary-bright); }

    .terminal-body { 
      flex-grow: 1; 
      padding: 10px 15px; 
      overflow-y: auto; 
      display: flex; 
      flex-direction: column; 
    }

    .log-line { 
      font-size: 0.75rem; 
      margin-bottom: 2px; 
      display: flex; 
      gap: 12px; 
      line-height: 1.4; 
    }

    .log-line.glitch-error { 
      color: var(--tertiary) !important; 
      animation: line-glitch 0.2s steps(2) infinite;
    }

    @keyframes line-glitch {
      0% { transform: translateX(0); }
      50% { transform: translateX(-1px); filter: brightness(1.2); }
      100% { transform: translateX(1px); }
    }

    .timestamp { color: var(--primary); opacity: 0.3; min-width: 80px; font-size: 0.65rem; }
    .message { word-break: break-all; }
    
    .input-line { 
      display: flex; 
      gap: 10px; 
      align-items: center; 
      margin-top: 10px; 
      border-top: 1px solid rgba(0, 255, 0, 0.1);
      padding-top: 10px;
    }

    .input-wrapper { display: flex; flex-grow: 1; align-items: center; position: relative; }
    .prompt { color: var(--primary); font-size: 0.75rem; font-weight: 900; white-space: nowrap; }
    
    input { 
      background: transparent; 
      border: none; 
      color: var(--primary-bright); 
      font-family: inherit; 
      font-size: 0.75rem; 
      width: 100%;
      outline: none; 
      caret-color: transparent;
      padding: 0;
    }

    .cursor-block {
      width: 8px;
      height: 1.1em;
      background: var(--primary);
      animation: blink 0.8s steps(2) infinite;
      position: absolute;
      left: 0;
      pointer-events: none;
      visibility: hidden;
    }

    .input-wrapper:focus-within .cursor-block {
       visibility: visible;
       position: static;
       margin-left: 2px;
    }

    .tmux-status-bar {
      display: flex;
      background: var(--primary);
      color: #000;
      font-size: 0.65rem;
      font-weight: 900;
      height: 20px;
      align-items: center;
      padding: 0 5px;
      margin-top: 4px;
    }

    .status-left, .status-right { display: flex; gap: 10px; }
    .window-index { background: #000; color: var(--primary); padding: 0 5px; margin: 0 2px; }
    .window-index.inactive { background: transparent; color: #000; }
    .spacer { flex-grow: 1; }

    .pulse { animation: status-pulse 2s infinite; }
    @keyframes status-pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    .bottom-sheet {
       background: #000;
       padding: 15px;
       display: flex;
       flex-direction: column;
       gap: 15px;
       border-top: 1px solid var(--primary);
       box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
       margin-top: auto;
    }
    .sheet-handle { width: 40px; height: 2px; background: var(--primary); margin: 0 auto; opacity: 0.3; }

    .execute-btn { padding: 12px; font-size: 0.8rem; width: 100%; border: 1px solid var(--primary); }

    .shortcuts { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; }
    .shortcuts button { 
       flex: 1 0 auto; 
       padding: 8px 12px; 
       font-size: 0.65rem; 
       background: transparent;
       border: 1px solid var(--primary);
       color: var(--primary);
    }

    @media (max-width: 600px) {
      .hide-mobile { display: none; }
    }
  `
})
export class TerminalComponent implements AfterViewChecked {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('cmdInputRef') private cmdInputRef!: ElementRef<HTMLInputElement>;

  cmdInput = '';
  historyIndex = -1;
  autoScroll = true;
  easterEggClicks = 0;

  currentTime = signal('');

  constructor() {
    effect(() => {
      this.gameService.terminalLogs();
      if (this.autoScroll) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });

    setInterval(() => {
      const now = new Date();
      this.currentTime.set(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
  }

  triggerEasterEgg() {
    this.easterEggClicks++;
    if (this.easterEggClicks === 5) {
       this.gameService.log('<span style="color: var(--secondary)">[RECURSIVE_BREACH] FOUNDATION LAYER ACCESSED. Developer backdoor triggered. +5000cr</span>');
       this.gameService.credits.update(c => c + 5000);
       this.audioService.playSuccess();
       this.gameService.triggerVisualEvent(0, 0, 'burst', '#2ff801');
       this.easterEggClicks = 0;
    }
  }

  ngAfterViewChecked() {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  handleScroll() {
    const element = this.scrollContainer.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    this.autoScroll = atBottom;
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  handleCmd() {
    if (!this.cmdInput.trim()) return;
    const cmd = this.cmdInput.trim();
    this.gameService.processCommand(cmd);
    this.cmdInput = '';
    this.historyIndex = -1;
  }

  navigateHistory(dir: number) {
    const history = this.gameService.commandHistory();
    if (history.length === 0) return;

    this.historyIndex += dir;
    if (this.historyIndex >= history.length) this.historyIndex = history.length - 1;
    if (this.historyIndex < -1) this.historyIndex = -1;

    if (this.historyIndex === -1) {
      this.cmdInput = '';
    } else {
      this.cmdInput = history[history.length - 1 - this.historyIndex];
    }
  }
}
