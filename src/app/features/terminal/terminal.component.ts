import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogVortexComponent } from './log-vortex.component';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule, LogVortexComponent],
  template: `
    <div class="terminal-container" 
         [class.overclocked]="typingSpeed() > 100"
         [class.neural-lag]="typingSpeed() > 0 && typingSpeed() < 30"
         [class.hijacked]="gameService.isHijacked()">
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
              <span class="value cyan">0x{{ gameService.playerHandle().length.toString(16).toUpperCase() }}</span>
            </div>
            <div class="header-segment">
              <span class="label">LATENCY:</span>
              <span class="value">14ms</span>
            </div>
            <div class="header-segment hide-mobile">
              <span class="label">STATUS:</span>
              <span class="value pulse connected">CONNECTED</span>
            </div>
          </div>

          <div class="terminal-body" #scrollContainer (scroll)="handleScroll()">
            @if (gameService.settings().video.event_horizon) {
               <app-log-vortex />
            } @else {
               @for (log of gameService.terminalLogs(); track $index) {
                 <div class="log-line" [class.glitch-error]="log.message.includes('ERR:') || log.message.includes('!!!')">
                   <span class="timestamp">[{{ log.timestamp }}]</span>
                   <span class="message" [innerHTML]="log.message"></span>
                 </div>
               }
            }
            
            <div class="input-line">
              <span class="prompt">{{ gameService.playerHandle() }}@void:~$</span>
              <div class="input-wrapper">
                <input type="text" 
                       #cmdInputRef
                       [(ngModel)]="cmdInput" 
                       (input)="onInputChange()"
                       (keydown)="handleKey()"
                       (keyup.enter)="handleCmd()"
                       (keydown.tab)="handleTab($event)"
                       (keydown.arrowUp)="navigateHistory(1)"
                       (keydown.arrowDown)="navigateHistory(-1)"
                       spellcheck="false"
                       autocomplete="off"
                       autofocus>
                
                @if (gameService.commandSuggestions().length > 0) {
                  <div class="suggestions-overlay">
                    @for (sug of gameService.commandSuggestions(); track sug) {
                      <div class="suggestion-item" (click)="applySuggestion(sug)">
                        <span class="sug-text">{{ sug }}</span>
                        <span class="tab-hint">[TAB]</span>
                      </div>
                    }
                  </div>
                }
                <span class="cursor-block"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tmux-status-bar">
        <div class="status-left">
          <span class="session-name">[void]</span>
          <span class="window-index active">0:sh*</span>
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
               <button role="listitem" class="cyan" (click)="cmdInput = 'help'; handleCmd()">HELP</button>
               <button role="listitem" (click)="cmdInput = 'ls'; handleCmd()">LS</button>
               <button role="listitem" class="magenta" (click)="cmdInput = 'status'; handleCmd()">STATUS</button>
               <button role="listitem" class="cyan" (click)="cmdInput = 'cooldown'; handleCmd()">COOL</button>
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
      background: var(--layer-0);
    }

    .terminal-container { 
      background: var(--layer-0); 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      font-family: 'JetBrains Mono', monospace; 
      color: var(--neon-green);
      overflow: hidden;
      position: relative;
      padding: 4px;
      box-sizing: border-box;
      container-type: inline-size;
      container-name: terminal;
    }

    .overclocked {
      text-shadow: 0 0 5px var(--neon-cyan);
      box-shadow: inset 0 0 50px rgba(0, 229, 255, 0.1);
    }
    .neural-lag {
      filter: blur(0.5px);
      opacity: 0.8;
    }
    
    .hijacked {
      animation: terminal-liquify 2s infinite alternate;
    }

    @keyframes terminal-liquify {
      from { filter: url(#liquify); transform: none; }
      to { filter: url(#liquify); transform: skewX(2deg) scale(1.01); }
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
    }

    .terminal-header { 
      display: flex; 
      flex-wrap: wrap;
      gap: 10px 20px;
      padding: 6px 12px;
      border-bottom: 1px solid rgba(0, 255, 159, 0.1);
      font-size: var(--font-size-xs);
      background: rgba(0, 255, 159, 0.02);
    }

    .header-segment .label {
      color: rgba(0, 255, 159, 0.5);
      margin-right: 5px;
      font-family: 'Orbitron', monospace;
      font-size: 0.85em;
      letter-spacing: 1px;
    }
    .header-segment .value { font-weight: 700; color: var(--neon-green); }
    .header-segment .value.cyan { color: var(--neon-cyan); }
    .header-segment .value.connected { color: var(--neon-green); }
    .header-segment .clickable:hover {
      text-decoration: underline; cursor: pointer;
      text-shadow: 0 0 8px var(--neon-green);
    }

    .terminal-body { 
      flex: 1;
      padding: 10px 15px; 
      overflow-y: auto;
      min-height: 0;
      position: relative;
      display: flex; 
      flex-direction: column; 
    }

    .log-line { 
      font-size: var(--font-size-sm); 
      margin-bottom: 2px; 
      display: flex; 
      gap: 12px; 
      line-height: 1.4; 
      border-left: 2px solid transparent;
      padding-left: 6px;
      transition: border-color 0.15s;
    }
    .log-line:hover {
      border-left-color: rgba(0, 255, 159, 0.2);
      background: rgba(0, 255, 159, 0.02);
    }

    .log-line.glitch-error { 
      color: var(--neon-magenta) !important; 
      border-left-color: var(--neon-magenta) !important;
      animation: line-glitch 0.2s steps(2) infinite;
    }

    @keyframes line-glitch {
      0% { transform: translateX(0); }
      50% { transform: translateX(-2px); filter: brightness(1.3) hue-rotate(10deg); }
      100% { transform: translateX(2px); }
    }

    .timestamp {
      color: rgba(0, 255, 159, 0.4);
      min-width: 80px;
      font-size: 0.9em;
    }
    .message { word-break: break-all; }
    
    .input-line { 
      display: flex; 
      gap: 10px; 
      align-items: center; 
      margin-top: 10px; 
      border-top: 1px solid rgba(0, 255, 159, 0.08);
      padding-top: 10px;
    }

    .input-wrapper { display: flex; flex-grow: 1; align-items: center; position: relative; }
    .prompt {
      color: var(--neon-green);
      font-size: var(--font-size-sm);
      font-weight: 900;
      white-space: nowrap;
      text-shadow: 0 0 6px rgba(0, 255, 159, 0.4);
    }
    
    input { 
      background: transparent; 
      border: none; 
      color: #fff; 
      font-family: inherit; 
      font-size: var(--font-size-sm); 
      width: 100%;
      outline: none;
      caret-color: transparent;
      padding: 0;
    }

    .cursor-block {
      width: 8px;
      height: 1.1em;
      background: var(--neon-green);
      box-shadow: 0 0 8px var(--neon-green);
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

    .suggestions-overlay {
      position: absolute;
      left: 0;
      top: -40px;
      background: var(--layer-2);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
      z-index: 100;
      padding: 4px;
      display: flex;
      flex-direction: column;
      min-width: 200px;
    }

    .suggestion-item {
      padding: 4px 8px;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      font-size: var(--font-size-xs);
      color: var(--neon-cyan);
    }
    .suggestion-item:hover {
      background: rgba(0, 229, 255, 0.1);
    }
    .tab-hint {
      font-size: 0.8em;
      opacity: 0.5;
      margin-left: 10px;
    }

    .tmux-status-bar {
      display: flex;
      background: var(--neon-green);
      color: var(--layer-0);
      font-size: var(--font-size-xs);
      font-weight: 900;
      height: clamp(20px, 4cqi, 30px);
      align-items: center;
      padding: 0 8px;
      margin-top: 4px;
      font-family: 'Orbitron', 'JetBrains Mono', monospace;
      letter-spacing: 1px;
    }

    .status-left, .status-right { display: flex; gap: 10px; }
    .session-name { font-weight: 900; }
    .window-index { background: var(--layer-0); color: var(--neon-green); padding: 0 6px; margin: 0 2px; }
    .window-index.active { background: var(--layer-0); color: var(--neon-green); font-weight: 900; }
    .window-index.inactive { background: transparent; color: var(--layer-0); opacity: 0.7; }
    .spacer { flex-grow: 1; }
    .node-id { color: var(--layer-0); opacity: 0.6; }
    .clock { color: var(--layer-0); font-weight: 900; }

    @container terminal (max-width: 400px) {
      .terminal-header {
        flex-direction: column;
        gap: 5px;
      }
      .hide-mobile { display: none; }
      .timestamp { display: none; }
    }

    @container terminal (min-width: 1200px) {
      .terminal-body {
        padding: 20px 40px;
      }
      .log-line {
        gap: 20px;
        margin-bottom: 4px;
      }
    }

    .pulse { animation: status-pulse 2s infinite; }
    @keyframes status-pulse {
      0%, 100% { opacity: 1; text-shadow: 0 0 6px var(--neon-green); }
      50% { opacity: 0.6; text-shadow: none; }
    }

    .bottom-sheet {
       background: var(--layer-1);
       padding: 15px;
       display: flex;
       flex-direction: column;
       gap: 15px;
       border-top: 2px solid var(--neon-green);
       box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
       margin-top: auto;
    }
    .sheet-handle {
      width: 40px; height: 3px;
      background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan));
      margin: 0 auto; opacity: 0.5;
    }

    .execute-btn {
      padding: 12px; font-size: 0.8rem; width: 100%;
      border: 1px solid var(--neon-green);
      background: var(--neon-green);
      color: var(--layer-0);
    }

    .shortcuts { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; }
    .shortcuts button { 
       flex: 1 0 auto; 
       padding: 8px 12px; 
       font-size: 0.65rem; 
       background: transparent;
       border: 1px solid rgba(0, 255, 159, 0.3);
       color: var(--neon-green);
    }
    .shortcuts button.cyan { border-color: var(--neon-cyan); color: var(--neon-cyan); }
    .shortcuts button.magenta { border-color: var(--neon-magenta); color: var(--neon-magenta); }


    @keyframes blink { to { opacity: 0; } }

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
       this.gameService.triggerVisualEvent(0, 0, 'burst', '#00F0FF');
       this.easterEggClicks = 0;
    }
  }

  ngAfterViewChecked() {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  handleScroll() {
      // Auto-scroll to bottom when new logs are added
    const element = this.scrollContainer.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    this.autoScroll = atBottom;
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private debounceTimer: any;
  onInputChange() {
    clearTimeout(this.debounceTimer);
    this.gameService.updateIntent(this.cmdInput);

    if (!this.cmdInput.trim()) {
      this.gameService.commandSuggestions.set([]);
      return;
    }
    
    this.debounceTimer = setTimeout(() => {
      this.gameService.synthesizeSuggestions(this.cmdInput);
    }, 400);
  }

  handleTab(event: Event) {
    event.preventDefault();
    const suggestions = this.gameService.commandSuggestions();
    if (suggestions.length > 0) {
      this.applySuggestion(suggestions[0]);
    }
  }

  applySuggestion(sug: string) {
    this.cmdInput = sug;
    this.gameService.commandSuggestions.set([]);
    this.audioService.playClick();
  }

  // Cognitive-Sync (Issue #19)
  typingSpeed = signal(0);
  typingAccuracy = signal(100);
  private lastTypeTime = 0;
  private keystrokes = 0;

  handleKey() {
    const now = Date.now();
    if (this.lastTypeTime > 0) {
      const diff = now - this.lastTypeTime;
      const wpm = Math.floor(60000 / diff);
      this.typingSpeed.set(Math.min(200, wpm));
    }
    this.lastTypeTime = now;
    this.keystrokes++;
  }

  handleCmd() {
    if (!this.cmdInput.trim()) return;
    const cmd = this.cmdInput.trim();
    this.gameService.processCommand(cmd);
    this.checkEasterEggs(cmd);
    this.cmdInput = '';
    this.historyIndex = -1;
    this.audioService.playClick();
  }

  private eggState = signal<string | null>(null);

  private checkEasterEggs(cmd: string) {
    const input = cmd.toLowerCase();

    // 1. Matrix: Knock Knock
    if (input === 'knock knock') {
      this.eggState.set('matrix_1');
      this.audioService.playGlitch();
      this.gameService.log('<span style="color: var(--neon-cyan)">[SYSTEM] Wake up, Neo...</span>');
      return;
    }
    if (this.eggState() === 'matrix_1' && input.includes('white rabbit')) {
      this.gameService.log('<span style="color: var(--neon-cyan)">[SYSTEM] Follow the white rabbit.</span>');
      this.gameService.reputation.update(r => r + 500);
      this.gameService.log('<span style="color: var(--neon-green)">[EGG] LEGENDARY_SEQUENCE_SYNCED: +500 REP</span>');
      this.audioService.playSuccess();
      this.eggState.set(null);
      return;
    }

    // 2. WarGames: Shall we play a game?
    if (input.includes('play a game')) {
      this.gameService.log('<span style="color: var(--neon-magenta)">[WOPR] LOVE TO. HOW ABOUT A NICE GAME OF GLOBAL THERMONUCLEAR WAR?</span>');
      this.audioService.speakCreepy('Shall we play a game?');
      return;
    }

    // 3. Hackers: Hack the planet
    if (input === 'hack the planet') {
        this.gameService.log(`<span style="color: var(--neon-orange)">[CEREAL_KILLER] THEY'RE TRASHING OUR RIGHTS! HACK THE PLANET!</span>`);
        this.gameService.credits.update(c => c + 1337);
        this.audioService.playGlitch();
        return;
    }

    // 4. Mr. Robot: Hello Friend
    if (input === 'hello friend') {
        this.gameService.log(`<span style="color: var(--neon-violet)">[ELLIOT] Hello friend. Hello friend? That's lame. Maybe I should give you a name.</span>`);
        this.gameService.increaseDetection(-10);
        return;
    }

    this.eggState.set(null);
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