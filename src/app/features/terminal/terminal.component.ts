import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { NeuralService } from '../../core/services/neural.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="terminal-container" (click)="focusInput()">
      <div class="terminal-header">
        <span class="prefix">SYS_LOG //</span>
        <span class="os">VOID_OS_KERNEL</span>
        <span class="ai-mode">LINK: {{ neuralService.aiMode() }}</span>
        @if (neuralService.isProcessing()) {
          <span class="status-blink processing">WAITING_FOR_LINK</span>
        } @else {
          <span class="status-blink">REC</span>
        }
      </div>
      <div class="terminal-body" #scrollContainer>
        @for (log of gameService.terminalLogs(); track $index) {
          <div class="log-line">
            <span class="timestamp">[{{ log.timestamp }}]</span>
            <span class="content" [innerHTML]="log.message"></span>
          </div>
        }
        <div class="input-line">
          <span class="prompt">root@void_os:~$</span>
          <input type="text" 
                 #terminalInput
                 [(ngModel)]="cmdInput" 
                 (keydown.arrowUp)="navigateHistory(1)"
                 (keydown.arrowDown)="navigateHistory(-1)"
                 (keyup.enter)="handleCmd()" 
                 [disabled]="neuralService.isProcessing()" 
                 autofocus>
        </div>
      </div>
    </div>
  `,
  styles: `
    .terminal-container { 
      background: rgba(5, 5, 5, 0.95); 
      border: 1px solid #111; 
      min-height: 15rem; 
      height: 100%;
      display: flex; 
      flex-direction: column; 
      cursor: text; 
      overflow: hidden;
    }
    .terminal-header { 
      background: #000; 
      padding: 0.5rem 0.75rem; 
      border-bottom: 1px solid #1a1a1a; 
      display: flex; 
      gap: 0.75rem; 
      align-items: center; 
      flex-wrap: wrap;
    }
    .prefix { color: #006600; font-size: 0.6rem; font-weight: bold; }
    .os { color: #00ff00; font-size: 0.7rem; letter-spacing: 2px; flex-grow: 1; }
    .ai-mode { font-size: 0.5rem; color: #00ffff; border: 1px solid #00ffff; padding: 1px 4px; }
    .status-blink { color: #ff0000; font-size: 0.5rem; font-weight: bold; animation: blink 1s infinite; white-space: nowrap; }
    .status-blink.processing { color: #00ffff; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .terminal-body { 
      flex-grow: 1; 
      overflow-y: auto; 
      padding: 0.75rem; 
      font-family: 'JetBrains Mono', monospace; 
      scrollbar-width: thin;
      scrollbar-color: #004400 #000;
    }
    .log-line { font-size: 0.7rem; margin-bottom: 0.25rem; display: flex; gap: 0.5rem; line-height: 1.4; }
    .timestamp { color: #004400; user-select: none; flex-shrink: 0; }
    .content { color: #00cc00; white-space: pre-wrap; word-break: break-all; }

    .input-line { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; }
    .prompt { color: #00ff00; font-size: clamp(0.6rem, 2vw, 0.7rem); font-weight: bold; white-space: nowrap; }
    input { background: transparent; border: none; color: #fff; font-family: inherit; font-size: clamp(0.6rem, 2vw, 0.7rem); flex-grow: 1; outline: none; min-width: 100px; }
    input:disabled { opacity: 0.5; cursor: wait; }

    .terminal-body::-webkit-scrollbar { width: 4px; }
    .terminal-body::-webkit-scrollbar-track { background: #000; }
    .terminal-body::-webkit-scrollbar-thumb { background: #004400; }
  `
})
export class TerminalComponent implements AfterViewChecked {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  neuralService = inject(NeuralService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('terminalInput') private terminalInput!: ElementRef;

  cmdInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;

  constructor() {
    // Auto-scroll effect
    effect(() => {
      this.gameService.terminalLogs();
      setTimeout(() => this.scrollToBottom(), 10);
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  focusInput() {
    this.terminalInput.nativeElement.focus();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  navigateHistory(direction: number) {
    if (this.commandHistory.length === 0) return;
    
    this.historyIndex += direction;
    if (this.historyIndex >= this.commandHistory.length) this.historyIndex = this.commandHistory.length - 1;
    if (this.historyIndex < -1) this.historyIndex = -1;

    if (this.historyIndex === -1) {
      this.cmdInput = '';
    } else {
      this.cmdInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    }
  }

  handleCmd() {
    const rawCmd = this.cmdInput.trim();
    const cmd = rawCmd.toLowerCase();
    this.cmdInput = '';
    
    if (!cmd) return;

    // Add to history
    this.commandHistory.push(rawCmd);
    this.historyIndex = -1;

    this.gameService.log(`sh: ${rawCmd}`);

    // AI Command
    if (cmd.startsWith('ask ') || cmd.startsWith('gemini ')) {
      const prompt = rawCmd.substring(rawCmd.indexOf(' ') + 1);
      this.gameService.log(`<span style="color: #00ffff">AI_LINK: Analyzing uplink...</span>`);
      this.neuralService.askGemini(prompt).subscribe(res => {
        this.gameService.log(`<span style="color: #fff">AI_RESPONSE (${res.provider}):</span> ${res.response}`);
        this.audioService.playClick();
      });
      return;
    }

    // VPM Install handler
    if (cmd.startsWith('vpm install ')) {
      const pkgId = cmd.substring(12);
      this.gameService.log(`vpm: Connecting to remote repository...`);
      setTimeout(() => {
        if (this.gameService.installSoftware(pkgId)) {
          this.audioService.playSuccess();
        } else {
          this.gameService.log(`ERR: Package ${pkgId} not found or insufficient credits.`);
          this.audioService.playError();
        }
      }, 1500);
      return;
    }

    // Command Router
    switch (cmd) {
      case 'help':
        this.gameService.log('--- AVAILABLE BINARIES ---');
        this.gameService.log('ls          - List active mission parameters');
        this.gameService.log('vpm         - Void Package Manager (list, install)');
        this.gameService.log('whoami      - Display current operative identity');
        this.gameService.log('netstat     - Show network routing status');
        this.gameService.log('top         - System resource and botnet usage');
        this.gameService.log('wipe        - Purge local trace logs (requires wiper)');
        this.gameService.log('diagnostics - Full system hardware check');
        this.gameService.log('clear       - Flush terminal buffer');
        this.gameService.log('ask [msg]   - Uplink to Neural AI');
        this.gameService.log('matrix      - Toggle visual neural-sync');
        break;

      case 'vpm':
        this.gameService.log('Usage: vpm [list|install] [package]');
        break;

      case 'vpm list':
        this.gameService.log('--- SOFTWARE REPOSITORY ---');
        this.gameService.installedSoftware().forEach(s => {
          this.gameService.log(`${s.installed ? '[INSTALLED]' : `[${s.price}cr]`} ${s.id} - ${s.description}`);
        });
        break;

      case 'wipe':
        const wiper = this.gameService.installedSoftware().find(s => s.id === 'wiper' && s.installed);
        if (wiper) {
          if (this.gameService.credits() >= 50) {
            this.gameService.credits.update(c => c - 50);
            this.gameService.detectionLevel.set(0);
            this.gameService.log('LOG_WIPER: Local traces purged. [-50cr]');
            this.audioService.playSuccess();
          } else {
            this.gameService.log('ERR: Insufficient credits for log purge.');
          }
        } else {
          this.gameService.log('ERR: wiper binary not found. Install via vpm.');
        }
        break;

      case 'ls':
      case 'dir':
        this.gameService.log('--- ACTIVE_MISSIONS ---');
        this.gameService.activeMissions().forEach(m => {
          this.gameService.log(`[${m.type.toUpperCase()}] target: ${m.target} | reward: ${m.reward}cr`);
        });
        break;

      case 'whoami':
        this.gameService.log(`USER: ${this.gameService.playerHandle()}`);
        this.gameService.log(`REP:  ${this.gameService.reputation()} (White-Hat Rank)`);
        this.gameService.log(`LEVEL: ${this.gameService.campaignLevel()}`);
        const activeTeam = this.gameService.activeTeam();
        if (activeTeam) {
          this.gameService.log(`TEAM: ${activeTeam.name}`);
        }
        break;

      case 'netstat':
        this.gameService.log(`ROUTING_MODE: ${this.gameService.routingMode()}`);
        this.gameService.log(`TRACE_LEVEL:  ${this.gameService.detectionLevel()}%`);
        this.gameService.log(`UPLINK:       ${this.neuralService.aiMode()}`);
        if (this.gameService.supplyChainActive()) {
          this.gameService.log('GLOBAL_BACKDOOR: ACTIVE');
        }
        break;

      case 'top':
      case 'ps':
        this.gameService.log('--- SYSTEM_RESOURCES ---');
        this.gameService.log(`CPU_LOAD:   ${Math.floor(Math.random() * 20) + 10}%`);
        this.gameService.log(`INTEGRITY:  ${this.gameService.systemIntegrity()}%`);
        this.gameService.log(`BOTNET:     ${this.gameService.botnetSize()} nodes online`);
        this.gameService.log(`EXTORTION:  ${this.gameService.activeRansoms()} active campaigns`);
        break;

      case 'clear':
        this.gameService.terminalLogs.set([]);
        this.gameService.log('TERMINAL_CLEARED');
        break;

      case 'matrix':
      case 'neo':
        this.gameService.matrixMode.set(!this.gameService.matrixMode());
        this.gameService.log(this.gameService.matrixMode() ? 'WAKE_UP_NEO...' : 'SYSTEM_REBOOT_COMPLETE');
        this.audioService.playGlitch();
        break;

      case 'diagnostics':
      case 'sys':
        this.gameService.log('--- SYSTEM DIAGNOSTICS ---');
        this.gameService.log(`AI_CORE:   ${this.neuralService.aiMode()}`);
        this.gameService.log(`WINDOW_AI: ${typeof (window as any).ai !== 'undefined' ? 'PRESENT' : 'MISSING'}`);
        this.gameService.log(`CREDITS:   ${this.gameService.credits()}cr`);
        this.gameService.log(`DATA:      ${this.gameService.experience()} fragments`);
        this.gameService.log('--- END DIAGNOSTICS ---');
        break;

      case 'hack the planet':
        this.gameService.log('!!! HACK THE PLANET !!!');
        this.audioService.playGlitch();
        this.gameService.credits.update(c => c + 1337);
        break;

      default:
        this.gameService.log(`ERR: command not found: ${cmd}`);
        this.audioService.playError();
        break;
    }
  }
}
