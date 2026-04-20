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
      <div class="terminal-body" #scrollContainer (scroll)="handleScroll()">
        @for (log of gameService.terminalLogs(); track $index) {
          <div class="log-line" [class.glitch-error]="log.message.includes('ERR:') || log.message.includes('!!!')">
            <span class="timestamp">[{{ log.timestamp }}]</span>
            <span class="message" [innerHTML]="log.message"></span>
          </div>
        }
        <div class="input-line">
          <span class="prompt">{{ gameService.playerHandle() }}@void:~$</span>
          <input type="text" 
                 #cmdInputRef
                 [(ngModel)]="cmdInput" 
                 (keyup.enter)="handleCmd()"
                 (keydown.arrowUp)="navigateHistory(1)"
                 (keydown.arrowDown)="navigateHistory(-1)"
                 autofocus>
          @if (gameService.detectedOS() === 'ANDROID' || gameService.detectedOS() === 'IOS') {
            <button class="mobile-send" (click)="handleCmd()">SEND</button>
          }
        </div>

        @if (gameService.detectedOS() === 'ANDROID' || gameService.detectedOS() === 'IOS') {
          <div class="mobile-shortcuts">
            <button (click)="runQuickCmd('help')">HELP</button>
            <button (click)="runQuickCmd('ls')">LS</button>
            <button (click)="runQuickCmd('sync')">SYNC</button>
            <button (click)="runQuickCmd('dossier')">DOSSIER</button>
            <button (click)="runQuickCmd('news')">NEWS</button>
            <button (click)="runQuickCmd('clear')">CLR</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .terminal-container { 
      background: var(--layer-0); 
      border: var(--ghost-border); 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      font-family: 'JetBrains Mono', monospace; 
      box-shadow: var(--neon-shadow);
      border-radius: 0px;
    }
    .terminal-header { 
      background: rgba(0, 255, 0, 0.05); 
      backdrop-filter: var(--glass-filter);
      color: var(--matrix-green); 
      padding: 10px 16px; 
      display: flex; 
      justify-content: space-between; 
      font-size: 0.65rem; 
      font-weight: 900;
      border-bottom: var(--ghost-border);
      letter-spacing: 2px;
    }
    .terminal-body { flex-grow: 1; padding: 24px; overflow-y: auto; color: #fff; display: flex; flex-direction: column; background-image: radial-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px); background-size: 30px 30px; }
    .log-line { font-size: 0.75rem; margin-bottom: 0.5rem; display: flex; gap: 14px; line-height: 1.6; }
    .log-line.glitch-error { animation: line-glitch 0.2s 3; color: var(--critical-error) !important; text-shadow: 0 0 10px var(--critical-error); }
    
    @keyframes line-glitch {
        0% { transform: translateX(0); }
        20% { transform: translateX(-6px); filter: hue-rotate(90deg); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-3px); filter: contrast(1.5); }
        80% { transform: translateX(3px); }
        100% { transform: translateX(0); }
    }
    .timestamp { color: #006600; min-width: 90px; opacity: 0.5; font-size: 0.65rem; font-weight: 700; }
    .message { word-break: break-all; }
    .input-line { display: flex; gap: 0.75rem; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(0,255,0,0.05); padding-top: 1.5rem; }
    .prompt { color: var(--matrix-green); font-size: 0.75rem; font-weight: 900; white-space: nowrap; }
    input { background: transparent; border: none; color: #fff; font-family: inherit; font-size: 0.75rem; flex-grow: 1; outline: none; caret-color: var(--matrix-green); }
    input:disabled { opacity: 0.5; cursor: wait; }

    .mobile-send { background: var(--layer-1); border: var(--ghost-border); color: var(--matrix-green); font-family: inherit; font-size: 0.65rem; padding: 8px 16px; cursor: pointer; font-weight: 900; letter-spacing: 1px; }
    .mobile-shortcuts { display: flex; gap: 10px; margin-top: 24px; overflow-x: auto; padding-bottom: 12px; flex-shrink: 0; }
    .mobile-shortcuts button { 
        background: var(--layer-1); 
        border: var(--ghost-border); 
        color: var(--tactical-cyan); 
        padding: 12px 24px; 
        font-family: inherit; 
        font-size: 0.65rem; 
        font-weight: 900; 
        cursor: pointer; 
        border-radius: 0px; 
        white-space: nowrap; 
        transition: all 0.05s step-end;
    }
    .mobile-shortcuts button:active { background: var(--matrix-green); color: var(--layer-0); box-shadow: var(--neon-shadow); }

    .terminal-body::-webkit-scrollbar { width: 4px; }
    .terminal-body::-webkit-scrollbar-track { background: var(--layer-0); }
    .terminal-body::-webkit-scrollbar-thumb { background: var(--layer-2); }
  `
})
export class TerminalComponent implements AfterViewChecked {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  neuralService = inject(NeuralService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('cmdInputRef') private cmdInputRef!: ElementRef;

  cmdInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  private isNearBottom = true;

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
        'DESCRIPTION: Modifies system behavior and UI settings.',
        'Values for boolean toggles are [on|off|true|false].',
        'CATEGORIES:',
        '  audio.volume      : Master volume [0-100]',
        '  audio.speech      : Toggle AI voice [on|off]',
        '  audio.ambient     : Toggle background hum [on|off]',
        '  audio.music_complexity: Intensity of procedural tracks [0-100]',
        '  video.matrix      : Matrix rain effect [on|off]',
        '  video.glitch      : Visual distortion intensity [on|off]',
        '  video.scanlines   : Retro CRT filter [on|off]',
        '  video.brightness  : Overall UI luminance [0-200]',
        '  video.font_size   : Terminal text size [8-24]',
        '  video.opacity     : UI transparency [0-100]',
        '  video.crt_curvature: Simulate monitor curve [on|off]',
        '  video.view_mode    : Single page or Sector Tabs [SINGLE|TABBED]',
        '  social.notifications: Browser alerts for DMs [on|off]',
        '  social.incognito   : Hide handle in global chat [on|off]',
        '  social.broadcast_location: Show location on grid globe [on|off]',
        '  social.status      : Status [ONLINE|AWAY|DND]',
        '  beta.experimental_pwa: Enable Badge API and extra PWA hooks [on|off]',
        '  general.auto_wipe  : Automatic wipe at 90% trace [on|off]',
        '  general.auto_analysis: 2x speed for artifact analysis [on|off]',
        '  general.language   : Localization [EN|DE|SV|HEX]',
        '  general.tutorial_completed: Manually mark tutorial state [on|off]',
        '  general.wake_lock  : Prevent screen sleep during sessions [on|off]',
        '  control.scroll_speed: Log scrolling velocity [50-500]',
        '  control.vibe_intensity: Hardware feedback strength [0-200]',
        '  streamer.enabled  : Toggle streaming integrations [on|off]',
        '  streamer.platform : Live platform [TWITCH|YOUTUBE|TIKTOK]',
        'EXAMPLE: set general.auto_wipe on'
    ],
    'settings': [
        'NAME: settings - list current configuration',
        'DESCRIPTION: Prints a detailed status of all workstation parameters.'
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
    'sync': [
        'NAME: sync - Neural Identity Synchronization',
        'SYNOPSIS: sync',
        'DESCRIPTION: Proactively initializes the Google Neural Handshake.',
        'Use this to restore a disconnected session or switch operative profiles at any time.'
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
    
    'bounty': [
        'NAME: bounty - claim headhunter rewards',
        'DESCRIPTION: Exchange high detection trace logs of rivals for credits.'
    ],
    'dox': [
        'NAME: dox - reveal target identity',
        'DESCRIPTION: Burn 500 DATA to permanently lower the defense of a specific target.'
    ],
    'auction': [
        'NAME: auction - bid on rare zero-days',
        'DESCRIPTION: Access the Darknet 0-day auction house.'
    ],
    'news': [
        'NAME: news - display procedural grid events',
        'DESCRIPTION: Lists recent headlines affecting global corp stocks and security.'
    ],
    'craft': [
        'NAME: craft - synthesize artifacts',
        'DESCRIPTION: Combine 3 analyzed artifacts into a Zero-Day Exploit.'
    ],
    'faction': [
        'NAME: faction - manage syndicate standing',
        'SYNOPSIS: faction [join|leave] [fixers|anarchists]',
        'DESCRIPTION: Align with underworld factions for unique perks.'
    ],
'help': [
    'NAME: help - list grid binaries',
    'DESCRIPTION: Prints a summary of all standard workstation commands.'
],
'hijack': [
    'NAME: hijack - Neural Override Protocol',
    'SYNOPSIS: Neural Event (Automatic)',
    'DESCRIPTION: Occurs when system integrity is low or an advanced adversary triggers an override.',
    'PURGE_METHOD: To regain control, you must SOLVE the riddle or math puzzle provided by the AI.',
    'The answer to the riddle is your SYNC_CODE. Enter it into the overlay to purge the entity.'
],
'tutorial': [
'NAME: tutorial - initiate neural walkthrough',
'DESCRIPTION: Triggers the onboard AI guide to explain workstation interfaces.'
],
'threats': [
    'NAME: threats - access the global threat database',
    'DESCRIPTION: Displays known corporate and syndicate adversaries.'
],
'bounties': [
    'NAME: bounties - access the bounty board',
    'DESCRIPTION: View high-reward contracts for elite hackers.'
],
'overclock': [
    'NAME: overclock - access the hardware tuning station',
    'DESCRIPTION: Optimize your mounted modules for peak performance.'
],
'vault': [
    'NAME: vault - access the asset storage',
    'DESCRIPTION: Manage artifacts and zero-day exploits.'
]
};
  constructor() {
    this.gameService.socket.on('dossier_data', (data: { dossier: string }) => {
        this.gameService.log('--- OPERATIVE_DOSSIER_DECRYPTED ---');
        this.gameService.log(data.dossier);
        this.audioService.playSuccess();
    });
  }

  ngAfterViewChecked() {
    if (this.isNearBottom) {
        this.scrollToBottom();
    }
  }

  handleScroll() {
    const el = this.scrollContainer.nativeElement;
    // Threshold of 50px to detect if near bottom
    this.isNearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 50;
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  runQuickCmd(cmd: string) {
      this.cmdInput = cmd;
      this.handleCmd();
      setTimeout(() => {
          if (this.cmdInputRef) this.cmdInputRef.nativeElement.focus();
      }, 100);
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
      
      case 'bounty':
        if (this.gameService.reputation() > 100) {
          this.gameService.credits.update(c => c + 300);
          this.gameService.reputation.update(r => r - 50);
          this.gameService.log('BOUNTY CLAIMED: +300cr, -50 REP');
          this.audioService.playSuccess();
        } else {
          this.gameService.log('ERR: Insufficient street cred to claim bounties.');
        }
        break;

      case 'dox':
        if (this.gameService.experience() >= 500) {
          this.gameService.experience.update(e => e - 500);
          this.gameService.log('DOX SUCCESSFUL: Target network defenses weakened.');
          this.audioService.playSuccess();
        } else {
          this.gameService.log('ERR: Insufficient DATA (need 500).');
        }
        break;

      case 'auction':
        this.gameService.log('--- DARKNET AUCTION HOUSE ---');
        this.gameService.log('1. [0-DAY] ROOT_EXPLOIT_V4 - 5000cr');
        this.gameService.log('2. [DATA] 10TB KERNEL DUMP - 2000cr');
        this.gameService.log('ERR: Bidding module offline for maintenance.');
        break;

      case 'news':
        this.gameService.log('--- GRID NEWS FEED ---');
        const news = this.gameService.newsFeed();
        if (news.length === 0) {
          this.gameService.log('No recent news.');
        } else {
          news.forEach(n => this.gameService.log(`[${n.timestamp}] ${n.headline}`));
        }
        break;

      case 'craft':
        this.gameService.craftArtifacts();
        break;

      case 'faction':
        this.gameService.log(`CURRENT FACTION: ${this.gameService.faction()}`);
        this.gameService.log(`FIXERS REP: ${this.gameService.reputationFixers()}`);
        this.gameService.log(`ANARCHISTS REP: ${this.gameService.reputationAnarchists()}`);
        this.gameService.log('Use "faction join [name]" to align.');
        break;

      case 'faction join fixers':
        this.gameService.faction.set('FIXERS');
        this.gameService.log('ALIGNED WITH THE FIXERS.');
        this.audioService.playSuccess();
        break;

      case 'faction join anarchists':
        this.gameService.faction.set('ANARCHISTS');
        this.gameService.log('ALIGNED WITH THE ANARCHISTS.');
        this.audioService.playSuccess();
        break;

      case 'help':
        this.gameService.log('--- AVAILABLE BINARIES ---');
        this.gameService.log('ls          - List active mission parameters');

        this.gameService.log('bounty      - Claim headhunter rewards');
        this.gameService.log('dox         - Reveal target identity for debuffs');
        this.gameService.log('auction     - Access Darknet auction house');
        this.gameService.log('news        - Read procedural grid news');
        this.gameService.log('craft       - Synthesize zero-days from artifacts');
        this.gameService.log('faction     - Manage syndicate standing');

        this.gameService.log('vpm         - Void Package Manager (list, install)');
        this.gameService.log('whoami      - Display current operative identity');
        this.gameService.log('netstat     - Show network routing status');
        this.gameService.log('top         - System resource and botnet usage');
        this.gameService.log('wipe        - Purge local trace logs (requires wiper)');
        this.gameService.log('diagnostics - Full system hardware check');
        this.gameService.log('clear       - Flush terminal buffer');
        this.gameService.log('ask [msg]   - Uplink to Neural AI');
        this.gameService.log('matrix      - Toggle visual neural-sync');
        this.gameService.log('settings    - Display current configuration');
        this.gameService.log('dossier     - Request your neural OSINT case file');
        this.gameService.log('gallery     - Access your private media archive');
        this.gameService.log('sync        - Proactively initialize neural handshake');
        this.gameService.log('set [val]   - Modify system parameters');
        this.gameService.log('man [cmd]   - Detailed manual for command');
        this.gameService.log('tutorial    - Start onboard AI walkthrough');
        break;

      case 'gallery':
        this.gameService.log('--- NEURAL_MEDIA_ARCHIVE ---');
        const media = this.gameService.userMedia();
        if (media.length === 0) {
            this.gameService.log('ARCHIVE_EMPTY: No media shards captured.');
        } else {
            media.forEach((m, i) => {
                this.gameService.log(`[${i}] ${m.type} - Captured ${new Date(m.createdAt).toLocaleString()}`);
                if (m.type === 'IMAGE') this.gameService.log(`  > VIEW_LINK: [Encrypted Base64 Node]`);
            });
        }
        break;

      case 'dossier':
        this.gameService.log('PROFILER: Requesting deep sector audit...');
        this.gameService.socket.emit('get_dossier', { token: this.gameService.authToken() });
        break;

      case 'sync':
        this.gameService.log('UPLINK: Proactive identity handshake initiated.');
        this.gameService.authRequired.set(true);
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

      case 'tutorial':
        this.gameService.tutorialActive.set(true);
        this.gameService.log('NEURAL_LINK: Initializing tutorial overlay...');
        this.audioService.playClick();
        break;

      case 'threats':
      case 'threat-db':
        this.gameService.activeTab.set('MISSIONS');
        this.gameService.log('UPLINK: Accessing THREAT_DATABASE...');
        this.audioService.playClick();
        break;

      case 'bounties':
        this.gameService.activeTab.set('MISSIONS');
        this.gameService.log('UPLINK: Accessing BOUNTY_BOARD...');
        this.audioService.playClick();
        break;

      case 'overclock':
        this.gameService.activeTab.set('HARDWARE');
        this.gameService.log('UPLINK: Accessing OVERCLOCK_STATION...');
        this.audioService.playClick();
        break;

      case 'vault':
        this.gameService.activeTab.set('HARDWARE');
        this.gameService.log('UPLINK: Accessing ASSET_VAULT...');
        this.audioService.playClick();
        break;

      case 'matrix':
      case 'neo':
        this.gameService.matrixMode.set(!this.gameService.matrixMode());
        this.gameService.log(this.gameService.matrixMode() ? 'WAKE_UP_NEO...' : 'SYSTEM_REBOOT_COMPLETE');
        this.audioService.playGlitch();
        break;

      case 'settings':
      case 'config':
          this.gameService.log('--- WORKSTATION_CONFIGURATION ---');
          const s = this.gameService.settings();
          this.gameService.log(`[AUDIO] vol=${s.audio.volume}% speech=${s.audio.speech} ambient=${s.audio.ambient} complex=${s.audio.music_complexity}`);
          this.gameService.log(`[VIDEO] mode=${s.video.view_mode} matrix=${s.video.matrix} glitch=${s.video.glitch} lines=${s.video.scanlines} font=${s.video.font_size}px opac=${s.video.opacity}% curve=${s.video.crt_curvature}`);
          this.gameService.log(`[SOCIAL] notify=${s.social.notifications} incog=${s.social.incognito} loc=${s.social.broadcast_location} status=${s.social.status}`);
          this.gameService.log(`[BETA] vibe=${s.beta.neural_vibration} emo=${s.beta.ai_emotions} globe=${s.beta.high_res_globe} pwa=${s.beta.experimental_pwa}`);
          this.gameService.log(`[GENERAL] autowipe=${s.general.auto_wipe} autoanal=${s.general.auto_analysis} theme=${s.general.theme} lang=${s.general.language} wakelock=${s.general.wake_lock}`);
          this.gameService.log(`[CONTROL] auto=${s.control.autocomplete} scroll=${s.control.scroll_speed} vibe=${s.control.vibe_intensity}`);
          this.gameService.log(`[STREAMER] enabled=${s.streamer.enabled} platform=${s.streamer.platform}`);
          this.gameService.log('Use "set [category.key] [on|off|value]" to modify.');
          break;

      case 'set':
          this.gameService.log('Usage: set [category.key] [value]');
          this.gameService.log('Example: set general.auto_wipe on');
          this.gameService.log('See "man set" for all available parameters.');
          break;

      default:
        this.gameService.log(`ERR: command not found: ${cmd}`);
        this.audioService.playError();
        break;
    }
  }
}
