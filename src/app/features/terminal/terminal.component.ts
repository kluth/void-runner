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
      <div class="terminal-header">
        <span class="noise-data">STATION_ID: {{ gameService.playerHandle() }}</span>
        <span class="term-title">0x_TERMINAL_V4.0 // NEURAL_UPLINK</span>
        <span class="noise-data">LATENCY: 14ms</span>
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

      @if (gameService.detectedOS() === 'ANDROID' || gameService.detectedOS() === 'IOS') {
         <div class="mobile-controls">
            <button (click)="handleCmd()">EXECUTE</button>
            <div class="shortcuts">
               <button (click)="cmdInput = 'help'; handleCmd()">HELP</button>
               <button (click)="cmdInput = 'ls'; handleCmd()">LS</button>
               <button (click)="cmdInput = 'wipe'; handleCmd()">WIPE</button>
            </div>
         </div>
      }
    </div>
  `,
  styles: `
    .terminal-container { 
      background: var(--layer-1); 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      font-family: 'JetBrains Mono', monospace; 
      overflow: hidden;
    }

    .terminal-header { 
      background: var(--layer-2); 
      color: var(--primary); 
      padding: 8px 16px; 
      display: flex; 
      justify-content: space-between; 
      font-size: 0.6rem; 
      font-weight: 900;
      letter-spacing: 1px;
      flex-shrink: 0;
    }

    .terminal-body { 
      flex-grow: 1; 
      padding: 20px; 
      overflow-y: auto; 
      color: #fff; 
      display: flex; 
      flex-direction: column; 
      background-image: radial-gradient(rgba(13, 242, 242, 0.02) 1px, transparent 1px); 
      background-size: 20px 20px; 
    }

    .log-line { 
      font-size: 0.75rem; 
      margin-bottom: 0.4rem; 
      display: flex; 
      gap: 12px; 
      line-height: 1.5; 
    }

    .log-line.glitch-error { 
      color: var(--tertiary) !important; 
      text-shadow: 2px 0 rgba(193, 0, 20, 0.5);
      animation: line-glitch 0.2s steps(2) infinite;
    }

    @keyframes line-glitch {
      0% { transform: translateX(0); }
      50% { transform: translateX(-2px); filter: brightness(1.5); }
      100% { transform: translateX(2px); }
    }

    .timestamp { color: var(--secondary); opacity: 0.4; min-width: 80px; font-size: 0.65rem; }
    .message { word-break: break-all; opacity: 0.9; }
    
    .input-line { 
      display: flex; 
      gap: 10px; 
      align-items: center; 
      margin-top: 1rem; 
      background: var(--layer-2);
      padding: 10px 15px;
    }

    .input-wrapper { display: flex; flex-grow: 1; align-items: center; position: relative; }
    .prompt { color: var(--primary); font-size: 0.75rem; font-weight: 900; white-space: nowrap; }
    
    input { 
      background: transparent; 
      border: none; 
      color: #fff; 
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

    .mobile-controls {
       background: var(--layer-3);
       padding: 15px;
       display: flex;
       flex-direction: column;
       gap: 10px;
    }

    .shortcuts { display: flex; gap: 8px; overflow-x: auto; }
    .shortcuts button { 
       flex: 1; 
       padding: 8px; 
       font-size: 0.6rem; 
       background: var(--layer-4);
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

  constructor() {
    effect(() => {
      this.gameService.terminalLogs();
      if (this.autoScroll) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
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
