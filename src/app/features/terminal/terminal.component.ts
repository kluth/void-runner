import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { NeuralService } from '../../core/services/neural.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-container">
      <div class="terminal-header">
        <span class="title">VOID_RUNNER // BASH_V4.2</span>
        <span class="status">UPLINK: {{ neuralService.aiMode() }}</span>
      </div>
      <div class="terminal-body" #scrollContainer>
        @for (log of gameService.terminalLogs(); track $index) {
          <div class="log-line">
            <span class="timestamp">[{{ log.timestamp }}]</span>
            <span class="message" [innerHTML]="log.message"></span>
          </div>
        }
        <div class="input-line">
          <span class="prompt">{{ gameService.playerHandle() }}@void:~$</span>
          <input type="text" 
                 [(ngModel)]="cmdInput" 
                 (keyup.enter)="handleCmd()"
                 (keydown.arrowUp)="navigateHistory(1)"
                 (keydown.arrowDown)="navigateHistory(-1)"
                 autofocus>
        </div>
      </div>
    </div>
  `,
  styles: `
    .terminal-container { background: #050505; border: 1px solid #00ff00; height: 100%; display: flex; flex-direction: column; font-family: 'JetBrains Mono', monospace; box-shadow: 0 0 20px rgba(0, 255, 0, 0.05); }
    .terminal-header { background: #00ff00; color: #000; padding: 4px 10px; display: flex; justify-content: space-between; font-size: 0.6em; font-weight: bold; }
    .terminal-body { flex-grow: 1; padding: 15px; overflow-y: auto; color: #fff; }
    .log-line { font-size: 0.7rem; margin-bottom: 0.25rem; display: flex; gap: 10px; }
    .timestamp { color: #008800; min-width: 70px; }
    .message { line-height: 1.4; word-break: break-all; }
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

  cmdInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;

  private manPages: Record<string, string[]> = {
    'ls': [
        'NAME: ls - list active missions',
        'SYNOPSIS: ls [target]',
        'DESCRIPTION: Displays all currently available contracts on the grid.',
        'If target is specified, filters by network node.'
    ],
    'vpm': [
        'NAME: vpm - Void Package Manager',
        'SYNOPSIS: vpm [list|install] [package_id]',
        'DESCRIPTION: Official repository manager for neural software.',
        'list: Show all available and installed packages.',
        'install <id>: Authenticate and deploy software to local workstation.'
    ],
    'set': [
        'NAME: set - configure workstation parameters',
        'SYNOPSIS: set [category.parameter] [value]',
        'CATEGORIES:',
        '  audio: volume [0-100], speech [on|off]',
        '  video: matrix [on|off], glitch [on|off], scanlines [on|off]',
        '  social: notifications [on|off], public_profile [on|off], status [ONLINE|AWAY|DND]',
        '  beta: neural_vibration [on|off], ai_emotions [on|off], high_res_globe [on|off]',
        '  general: auto_wipe [on|off], theme [CLASSIC|OMEGA]',
        '  control: autocomplete [on|off]',
        'EXAMPLE: set social.notifications off'
    ],
    'wipe': [
        'NAME: wipe - purge local trace logs',
        'SYNOPSIS: wipe',
        'DESCRIPTION: Emergency protocol to flush workstation telemetry.',
        'COST: 50cr per execution.',
        'REQUIRES: log-wiper software binary.'
    ],
    'whoami': [
        'NAME: whoami - display identity profile',
        'DESCRIPTION: Prints current operative handle, underworld reputation, and syndicate affiliation.'
    ],
    'matrix': [
        'NAME: matrix - toggle neural visualization',
        'DESCRIPTION: Synchronizes visual cortex with the grid stream. Experimental.'
    ],
    'man': [
        'NAME: man - display command manual',
        'SYNOPSIS: man [command]',
        'DESCRIPTION: Interface for workstation technical documentation.',
        'Displays name, synopsis, and detailed usage for any grid binary.'
    ],
    'clear': [
        'NAME: clear - flush terminal buffer',
        'DESCRIPTION: Resets the workstation interface and clears log history.'
    ],
    'top': [
        'NAME: top - system resource monitor',
        'DESCRIPTION: Real-time telemetry for CPU load, system integrity, and botnet saturation.'
    ],
    'diagnostics': [
        'NAME: diagnostics - system integrity check',
        'DESCRIPTION: Comprehensive hardware and software audit to detect logic bombs or memory leaks.'
    ],
    'help': [
        'NAME: help - list grid binaries',
        'DESCRIPTION: Prints a summary of all standard workstation commands.'
    ]
  };

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
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

    // MAN command
    if (cmd.startsWith('man ')) {
      const page = cmd.substring(4);
      if (this.manPages[page]) {
          this.gameService.log('--- SYSTEM MANUAL ---');
          this.manPages[page].forEach(line => this.gameService.log(line));
          this.audioService.playClick();
      } else {
          this.gameService.log(`man: no manual entry for ${page}`);
          this.audioService.playError();
      }
      return;
    }

    // SET command
    if (cmd.startsWith('set ')) {
        const parts = cmd.split(' ');
        if (parts.length === 3) {
            this.gameService.updateSetting(parts[1], parts[2]);
            this.audioService.playSuccess();
        } else {
            this.gameService.log('Usage: set [category.key] [value]');
            this.audioService.playError();
        }
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
        this.gameService.log('set         - Configure workstation settings');
        this.gameService.log('man [cmd]   - Detailed manual for command');
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

      case 'set':
          this.gameService.log('Usage: set [category.key] [value]');
          this.gameService.log('Example: set audio.volume 50');
          this.gameService.log('Values: current state');
          const s = this.gameService.settings();
          this.gameService.log(`audio: volume=${s.audio.volume} speech=${s.audio.speech ? 'on' : 'off'}`);
          this.gameService.log(`video: matrix=${s.video.matrix ? 'on' : 'off'} glitch=${s.video.glitch ? 'on' : 'off'} scanlines=${s.video.scanlines ? 'on' : 'off'}`);
          this.gameService.log(`social: notifications=${s.social.notifications ? 'on' : 'off'} public=${s.social.public_profile ? 'on' : 'off'} status=${s.social.status}`);
          this.gameService.log(`beta: vibe=${s.beta.neural_vibration ? 'on' : 'off'} emotions=${s.beta.ai_emotions ? 'on' : 'off'} globe=${s.beta.high_res_globe ? 'on' : 'off'}`);
          this.gameService.log(`general: auto_wipe=${s.general.auto_wipe ? 'on' : 'off'} theme=${s.general.theme}`);
          this.gameService.log(`control: autocomplete=${s.control.autocomplete ? 'on' : 'off'}`);
          break;

      default:
        this.gameService.log(`ERR: command not found: ${cmd}`);
        this.audioService.playError();
        break;
    }
  }
}
