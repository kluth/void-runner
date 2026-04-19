import { Component, inject, signal, effect, OnDestroy, computed } from '@angular/core';
import { GameService, Mission } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="missions-container">
      <div class="header-row">
        <div class="title-group">
          <h3>OPERATIONS // ACTIVE_TARGETS</h3>
          <div class="sub">CAMPAIGN_LEVEL: {{ gameService.campaignLevel() }}</div>
        </div>
        @if (activeMission()) {
          <div class="detection-meter">
            <span class="label">TRACE_PROGRESS</span>
            <div class="bar-bg"><div class="bar-fg" [style.width.%]="gameService.detectionLevel()"></div></div>
            <span class="det-val">{{ gameService.detectionLevel() }}%</span>
          </div>
        }
      </div>
      
      @if (!activeMission()) {
        <div class="mission-list">
          @for (m of gameService.activeMissions(); track m.id) {
            <div class="mission-card" (mouseenter)="audioService.playClick()">
              <div class="m-top">
                <span class="m-type">[{{ m.type.toUpperCase() }}]</span>
                <span class="m-reward">{{ m.reward }}cr</span>
              </div>
              <div class="m-name">{{ m.name }}</div>
              <div class="m-target">TARGET: {{ m.target }}</div>
              <div class="m-actions">
                <button class="init-btn" (click)="startMission(m)">INIT_CONNECTION</button>
                @if (gameService.zeroDays() > 0) {
                  <button class="zero-day-btn" (click)="useZeroDay(m)">DEPLOY 0-DAY</button>
                }
                @if (gameService.publicExploits().includes(m.type)) {
                  <button class="one-day-btn" (click)="gameService.completeMission(m)">USE 1-DAY</button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="active-mission-view">
          <div class="active-header">
            <span class="blink">●</span> EXECUTING_PAYLOAD: {{ activeMission()?.name }}
          </div>
          
          <div class="mini-game-container">
            <!-- Port Scan -->
            @if (activeMission()?.type === 'port-scan') {
              <div class="port-scan-game">
                <div class="game-info">PROBE_ALL_OPEN_PORTS</div>
                <div class="ports-grid">
                  @for (p of ports(); track $index) {
                    <div class="port-tile" 
                         [class.open]="p.status === 'open'" 
                         [class.scanned]="p.scanned" 
                         (click)="scanPort($index)">
                      {{ p.num }}
                    </div>
                  }
                </div>
              </div>
            }
            
            <!-- Brute Force -->
            @else if (activeMission()?.type === 'brute-force') {
              <div class="brute-force-game">
                <div class="game-info">MATCH_HEX_FRAGMENTS</div>
                <div class="code-display">{{ displayCode() }}</div>
                <div class="input-grid">
                  @for (char of '0123456789ABCDEF'.split(''); track char) {
                    <button class="code-btn" (click)="inputChar(char)">{{ char }}</button>
                  }
                </div>
              </div>
            }

            <!-- SQL Injection -->
            @else if (activeMission()?.type === 'sql-injection') {
              <div class="sql-game">
                <div class="game-info">INTERCEPT_DATABASE_VULNS</div>
                <div class="sql-stream">
                  @for (item of sqlItems(); track item.id) {
                    <div class="sql-item" [class.vuln]="item.isVuln" (click)="triggerSqlInjection(item)">
                      {{ item.text }}
                    </div>
                  }
                </div>
              </div>
            }

            <!-- RFID Clone -->
            @else if (activeMission()?.type === 'rfid-clone') {
              <div class="rfid-game">
                <div class="game-info">SIGNAL_BURST_CAPTURE</div>
                <div class="rfid-grid">
                  @for (tile of rfidTiles(); track tile.id) {
                    <div class="rfid-tile" [class.active]="tile.active" (click)="interceptRfid(tile)">
                      @if (tile.active) { ((( ))) } @else { . . . }
                    </div>
                  }
                </div>
                <div class="progress-info">CAP: {{ rfidCaptured }}/5</div>
              </div>
            }

            <!-- Buffer Overflow -->
            @else if (activeMission()?.type === 'buffer-overflow') {
              <div class="overflow-game">
                <div class="game-info">MEMORY_HEX_EDITOR</div>
                <div class="byte-selector">
                  <button [class.active]="selectedByte === '90'" (click)="selectedByte = '90'">[90] NOP</button>
                  <button [class.active]="selectedByte === 'E'" (click)="selectedByte = 'E'">[E] JMP</button>
                  <button [class.active]="selectedByte === 'F'" (click)="selectedByte = 'F'">[F] ESP</button>
                </div>
                <div class="stack-view">
                  @for (cell of stack(); track $index) {
                    <div class="stack-cell" 
                         [class.eip]="$index === eipOffset() || $index === eipOffset() + 1" 
                         [class.overwritten]="cell !== '00'"
                         (click)="injectByte($index)">
                      {{ cell }}
                    </div>
                  }
                </div>
                <button class="launch-btn" (click)="checkOverflow()">EXECUTE_PAYLOAD</button>
              </div>
            }

            <!-- XSS Injection -->
            @else if (activeMission()?.type === 'xss-injection') {
              <div class="xss-game">
                <div class="game-info">WAF_BYPASS_SCRIPT_INJECTION</div>
                <div class="xss-controls">
                  <textarea [(ngModel)]="xssPayload" placeholder="CRAFT_XSS_PAYLOAD..."></textarea>
                  <button (click)="testXss()">EXECUTE</button>
                </div>
                <div class="render-view" [innerHTML]="sanitizedView()"></div>
              </div>
            }

            <!-- OSINT Research -->
            @else if (activeMission()?.type === 'osint-research') {
              <div class="osint-game">
                <div class="game-info">GRID_SOCIAL_FEED_ANALYSIS</div>
                <div class="social-feed">
                  <div class="feed-header"><span style="color: #0ff">@{{ targetHandle }}</span> // BLEETER_PROFILE</div>
                  <div class="posts-container">
                    @for (post of socialPosts; track $index) {
                      <div class="social-post">
                        <div class="post-meta">{{ post.date }}</div>
                        <div class="post-content">{{ post.text }}</div>
                      </div>
                    }
                  </div>
                </div>
                <div class="security-questions">
                  <input type="text" [(ngModel)]="osintAnswer" placeholder="ENTER_PASSWORD_HINT (e.g. Pet's Name)..." (keyup.enter)="checkOsint()">
                  <button (click)="checkOsint()">BRUTE_FORCE</button>
                </div>
              </div>
            }

            <!-- Phishing Campaign -->
            @else if (activeMission()?.type === 'phishing-campaign') {
              <div class="phishing-game">
                <div class="game-info">EMAIL_SPOOFING_TOOL_V2</div>
                <div class="email-client">
                  <div class="e-header">
                    <div class="e-row"><span class="e-label">FROM:</span> 
                      <select [(ngModel)]="phishSender" (change)="updatePhishPreview()">
                        <option value="IT">IT_Support@corp.net</option>
                        <option value="HR">HR_Dept@corp.net</option>
                        <option value="CEO">Executive_Office@corp.net</option>
                      </select>
                    </div>
                    <div class="e-row"><span class="e-label">TO:</span> TARGET_LIST_04</div>
                    <div class="e-row"><span class="e-label">SUBJECT:</span> 
                      <select [(ngModel)]="phishLure" (change)="updatePhishPreview()">
                        <option value="URGENCY">ACTION REQUIRED: Password Expiry</option>
                        <option value="FEAR">TERMINATION NOTICE: Immediate Action</option>
                        <option value="CURIOSITY">Confidential: Q3 Bonus Structure</option>
                      </select>
                    </div>
                  </div>
                  <div class="e-body">
                    <textarea readonly [value]="phishPreviewText"></textarea>
                  </div>
                  <div class="e-footer">
                     <span class="spam-score" [class.high-score]="spamScore > 70">SPAM_FILTER_EVASION: {{ spamScore }}%</span>
                     <button class="launch-btn" (click)="launchPhishing()">TRANSMIT_PAYLOAD</button>
                  </div>
                </div>
              </div>
            }

            <!-- MITM Attack -->
            @else if (activeMission()?.type === 'mitm-attack') {
              <div class="mitm-game">
                <div class="game-info">PACKET_SNIFFER_ACTIVE</div>
                <div class="packet-stream">
                  @for (packet of activePackets; track packet.id) {
                    <div class="packet" 
                         [style.left.%]="packet.x" 
                         [style.top.%]="packet.y" 
                         [class.encrypted]="packet.isTarget"
                         (click)="interceptPacket(packet)">
                      {{ packet.text }}
                    </div>
                  }
                </div>
                <div class="progress-info">INTERCEPTED: {{ mitmCaptured }}/3</div>
              </div>
            }
          </div>
          
          <button class="abort-btn" (click)="abortMission()">TERMINATE_SESSION</button>
        </div>
      }
    </div>
  `,
  styles: `
    .missions-container { background: rgba(10, 10, 10, 0.9); border: 1px solid #1a1a1a; padding: 1rem; }
    .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; margin-bottom: 1rem; padding-bottom: 0.75rem; flex-wrap: wrap; gap: 1rem; }
    h3 { margin: 0; font-size: 0.8rem; color: #00ff00; letter-spacing: 2px; }
    .sub { font-size: 0.5rem; color: #004400; }

    .detection-meter { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: 1; min-width: 120px; }
    .detection-meter .label { font-size: 0.5rem; color: #ff0000; }
    .bar-bg { width: 100%; max-width: 150px; height: 6px; background: #200; border: 1px solid #400; }
    .bar-fg { height: 100%; background: #ff0000; box-shadow: 0 0 10px #f00; transition: width 0.3s; }
    .det-val { font-size: 0.7rem; color: #ff0000; font-weight: bold; }

    .mission-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: 1rem; }
    @media (max-width: 600px) { .mission-list { grid-template-columns: 1fr; } }
    .mission-card { background: #000; border: 1px solid #222; padding: 1rem; transition: all 0.2s; display: flex; flex-direction: column; }
    .mission-card:hover { border-color: #00ff00; transform: translateY(-2px); }
    .m-top { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.6rem; }
    .m-type { color: #008800; font-weight: bold; }
    .m-reward { color: #fff; font-weight: bold; }
    .m-name { font-size: 0.8rem; font-weight: bold; color: #fff; margin-bottom: 0.25rem; }
    .m-target { font-size: 0.6rem; color: #666; margin-bottom: 0.75rem; flex-grow: 1; }
    
    .m-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .m-actions button { flex: 1; min-width: 5rem; padding: 0.5rem; font-size: 0.55rem; }
    
    button { background: #00ff00; color: #000; border: none; padding: 0.5rem 1rem; font-size: 0.65rem; font-weight: bold; cursor: pointer; font-family: inherit; transition: all 0.2s; }
    button:hover:not(:disabled) { background: #fff; color: #000; }
    button:disabled { opacity: 0.3; cursor: not-allowed; }

    .init-btn { background: #00ff00; color: #000; }
    .zero-day-btn { background: #ff00ff; color: #fff; border: 1px solid #ff00ff; }
    .one-day-btn { background: #00ffff; color: #000; border: 1px solid #00ffff; }

    .active-mission-view { text-align: center; }
    .active-header { font-size: 0.7rem; color: #00ff00; margin-bottom: 1rem; }
    .blink { animation: blink 1s infinite; color: #ff0000; margin-right: 5px; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .mini-game-container { background: #000; border: 1px solid #111; padding: 1.5rem; min-height: 250px; position: relative; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .game-info { font-size: 0.5rem; color: #444; position: absolute; top: 0.5rem; left: 0.75rem; letter-spacing: 1px; }

    .ports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr)); gap: 0.25rem; width: 100%; margin-top: 1rem; }
    .port-tile { font-size: 0.6rem; padding: 0.5rem 0.25rem; border: 1px solid #222; cursor: pointer; color: #444; transition: all 0.2s; }
    .port-tile.scanned { background: #050505; color: #222; }
    .port-tile.open { background: #00ff00 !important; color: #000 !important; border-color: #fff; box-shadow: 0 0 10px #0f0; }

    .code-display { font-size: clamp(1.2rem, 5vw, 2rem); letter-spacing: 0.5rem; color: #fff; margin: 1.5rem 0; font-family: monospace; text-shadow: 0 0 10px rgba(0,255,0,0.5); }
    .input-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.25rem; width: 100%; max-width: 350px; }
    @media (max-width: 400px) { .input-grid { grid-template-columns: repeat(4, 1fr); } }
    .code-btn { padding: 0.5rem 0.25rem; font-size: 0.7rem; }

    .sql-stream { display: flex; flex-direction: column; gap: 0.25rem; width: 100%; margin-top: 1rem; }
    .sql-item { font-size: 0.7rem; padding: 0.5rem; border: 1px solid #111; cursor: pointer; text-align: left; transition: all 0.2s; }
    .sql-item.vuln { color: #00ff00; border-color: #00ff00; background: #001100; box-shadow: inset 0 0 5px #0f0; }

    .rfid-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; width: 100%; max-width: 250px; margin: 1rem auto; }
    .rfid-tile { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: #050505; border: 1px solid #222; color: #222; font-size: 0.6rem; cursor: pointer; transition: all 0.1s; }
    .rfid-tile.active { color: #ff00ff; border-color: #ff00ff; box-shadow: 0 0 15px #f0f; transform: scale(1.05); }
    .progress-info { font-size: 0.6rem; color: #ff00ff; font-weight: bold; }

    .stack-view { display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.25rem; width: 100%; max-width: 300px; margin: 1.5rem auto; cursor: crosshair; }
    @media (max-width: 400px) { .stack-view { grid-template-columns: repeat(4, 1fr); } }
    .stack-cell { font-size: 0.55rem; padding: 0.4rem; border: 1px solid #111; color: #333; text-align: center; transition: all 0.2s; }
    .stack-cell:hover { background: rgba(255,0,255,0.2); }
    .stack-cell.eip { border-color: #ff00ff; color: #ff00ff; font-weight: bold; box-shadow: 0 0 5px rgba(255,0,255,0.5); }
    .stack-cell.overwritten { background: #1a001a; color: #ff00ff; }
    
    .byte-selector { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; }
    .byte-selector button { padding: 0.5rem; border: 1px solid #333; background: #000; color: #888; }
    .byte-selector button.active { border-color: #ff00ff; color: #ff00ff; background: rgba(255,0,255,0.1); }

    .xss-controls { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
    .xss-controls textarea { width: 100%; height: 80px; background: #000; border: 1px solid #222; color: #fff; font-size: 0.7rem; padding: 0.75rem; font-family: inherit; resize: none; outline: none; }
    .xss-controls textarea:focus { border-color: #00ffff; }
    .render-view { width: 100%; max-width: 400px; border: 1px dashed #222; min-height: 50px; margin-top: 0.75rem; padding: 0.75rem; font-size: 0.6rem; color: #555; text-align: left; }

    .osint-game { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 1rem; }
    .social-feed { background: #050505; border: 1px solid #111; display: flex; flex-direction: column; max-height: 200px; overflow-y: auto; text-align: left; }
    .feed-header { background: #111; padding: 0.5rem; font-size: 0.6rem; border-bottom: 1px solid #222; font-weight: bold; position: sticky; top: 0; }
    .posts-container { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .social-post { border-left: 2px solid #004400; padding-left: 0.5rem; }
    .post-meta { font-size: 0.45rem; color: #555; margin-bottom: 0.2rem; }
    .post-content { font-size: 0.6rem; color: #ccc; line-height: 1.3; }
    .security-questions { display: flex; gap: 0.5rem; }
    .security-questions input { background: #000; border: 1px solid #222; color: #fff; padding: 0.5rem; flex-grow: 1; font-size: 0.7rem; outline: none; }
    .security-questions input:focus { border-color: #00ff00; }

    .phishing-game { width: 100%; max-width: 400px; }
    .email-client { background: #050505; border: 1px solid #222; display: flex; flex-direction: column; text-align: left; margin-top: 1rem; }
    .e-header { padding: 0.5rem; border-bottom: 1px solid #222; display: flex; flex-direction: column; gap: 0.25rem; background: #0a0a0a; }
    .e-row { font-size: 0.6rem; display: flex; align-items: center; }
    .e-label { color: #555; min-width: 3.5rem; }
    .e-row select { background: transparent; border: 1px dashed #333; color: #0ff; font-family: inherit; font-size: 0.6rem; outline: none; cursor: pointer; }
    .e-body { padding: 0; }
    .e-body textarea { width: 100%; height: 100px; background: transparent; border: none; color: #aaa; font-family: inherit; font-size: 0.6rem; padding: 0.75rem; resize: none; outline: none; }
    .e-footer { padding: 0.5rem; border-top: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #111; }
    .spam-score { font-size: 0.6rem; color: #ff0000; font-weight: bold; }
    .spam-score.high-score { color: #00ff00; }
    
    .mitm-game { width: 100%; max-width: 400px; height: 200px; position: relative; overflow: hidden; background: #000; border: 1px solid #111; }
    .packet-stream { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .packet { position: absolute; padding: 0.25rem 0.5rem; font-size: 0.5rem; background: #050505; border: 1px solid #222; color: #444; cursor: crosshair; user-select: none; transition: transform 0.1s; }
    .packet:hover { transform: scale(1.1); border-color: #fff; color: #fff; }
    .packet.encrypted { border-color: #00ff00; color: #00ff00; text-shadow: 0 0 5px #0f0; box-shadow: 0 0 10px rgba(0,255,0,0.2); }
    .launch-btn { width: 100%; margin-top: 1rem; background: #ff00ff; color: #fff; }

    .abort-btn { background: #1a1a1a; color: #00ff00; margin-top: 1rem; padding: 0.75rem 1.5rem; font-size: 0.7rem; border: 1px solid #333; }
    .abort-btn:hover { background: #300; color: #f00; border-color: #f00; }
  `
})
export class MissionComponent implements OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  
  activeMission = signal<Mission | null>(null);
  ports = signal<{num: number, status: 'closed'|'open', scanned: boolean}[]>([]);
  targetCode = signal<string>('');
  displayCode = signal<string>('');
  sqlItems = signal<{id: number, text: string, isVuln: boolean}[]>([]);
  rfidTiles = signal<{id: number, active: boolean}[]>([]);
  rfidCaptured = 0;

  stack = signal<string[]>(new Array(32).fill('00'));
  eipOffset = signal(Math.floor(Math.random() * 20) + 8);
  selectedByte = '90';

  xssPayload = '';
  sanitizedView = signal<string>('SAFE_RENDER_OUTPUT');

  targetHandle = '';
  socialPosts: {date: string, text: string}[] = [];
  osintAnswer = '';
  private correctPet = '';

  phishSender = 'IT';
  phishLure = 'URGENCY';
  phishPreviewText = '';
  spamScore = 0;

  activePackets: {id: number, text: string, isTarget: boolean, x: number, y: number}[] = [];
  mitmCaptured = 0;

  private sqlInterval: any;
  private detectionInterval: any;
  private rfidInterval: any;
  private mitmInterval: any;

  constructor() {
    effect(() => {
      if (this.gameService.detectionLevel() >= 100 && this.activeMission()) {
        this.audioService.playError();
        this.gameService.failMission(this.activeMission()!);
        this.stopMission();
      }
    });
  }

  ngOnDestroy() { this.clearAllIntervals(); }

  private clearAllIntervals() {
    clearInterval(this.sqlInterval);
    clearInterval(this.detectionInterval);
    clearInterval(this.rfidInterval);
    clearInterval(this.mitmInterval);
  }

  startMission(m: Mission) {
    this.audioService.playGlitch();
    this.activeMission.set(m);
    this.gameService.log(`STARTING MISSION: ${m.name}`);
    
    if (m.isHoneypot) {
      this.gameService.log('!!! CRITICAL: ENGAGED SOC HONEYPOT !!!');
      this.gameService.increaseDetection(45);
      this.audioService.playError();
    }

    this.detectionInterval = setInterval(() => {
      this.gameService.increaseDetection(1.5);
      
      const m = this.activeMission();
      // Software: keylogger (Slowly reveal brute-force digits)
      if (m?.type === 'brute-force' && this.gameService.installedSoftware().find(s => s.id === 'keylogger' && s.installed)) {
          if (Math.random() > 0.9) {
              const current = this.displayCode().split('');
              const target = this.targetCode();
              const hiddenIdx = current.map((c, i) => i).filter(i => current[i] === '_');
              if (hiddenIdx.length > 0) {
                  const idx = hiddenIdx[Math.floor(Math.random() * hiddenIdx.length)];
                  current[idx] = target[idx];
                  this.displayCode.set(current.join(''));
                  this.gameService.log('KEYLOGGER: Captured keystroke fragment.');
              }
          }
      }

      // Active Sabotage (Blue Team logic)
      if (this.gameService.blueTeamActive()) {
        if (Math.random() > 0.85) {
          this.executeSabotage();
        }
      }
    }, 1000);

    if (m.type === 'port-scan') this.generatePorts(m.difficulty);
    else if (m.type === 'brute-force') this.generateCode(m.difficulty);
    else if (m.type === 'sql-injection') this.startSqlGame(m.difficulty);
    else if (m.type === 'rfid-clone') this.startRfidGame(m.difficulty);
    else if (m.type === 'buffer-overflow') this.initOverflow(m.difficulty);
    else if (m.type === 'osint-research') this.initOsint();
    else if (m.type === 'phishing-campaign') {} // handled in launch
  }

  private executeSabotage() {
    const m = this.activeMission();
    if (!m) return;

    this.gameService.log('<span style="color: #ff0000">!!! ALERT: ACTIVE_COUNTER_HACK DETECTED !!!</span>');
    this.audioService.playBeep(220, 0.1, 'sawtooth');

    if (m.type === 'port-scan') {
      const current = this.ports();
      const open = current.filter(p => p.scanned);
      if (open.length > 0) {
        const target = open[Math.floor(Math.random() * open.length)];
        target.scanned = false;
        this.ports.set([...current]);
        this.gameService.log('BLUE_TEAM: Remote port re-filtered.');
      }
    } else if (m.type === 'brute-force') {
      const current = this.displayCode();
      const chars = current.split('');
      const filled = chars.map((c, i) => ({c, i})).filter(x => x.c !== '_');
      if (filled.length > 0) {
        const target = filled[Math.floor(Math.random() * filled.length)];
        chars[target.i] = '_'; 
        this.displayCode.set(chars.join(''));
        this.gameService.log('BLUE_TEAM: Buffer cleared. Identity lost.');
      }
    }
  }

  abortMission() { this.stopMission(); this.gameService.log('MISSION ABORTED.'); }

  useZeroDay(m: Mission) {
    this.audioService.playGlitch();
    this.gameService.useZeroDay(m);
  }

  private stopMission() { this.activeMission.set(null); this.clearAllIntervals(); }

  // Mini-game Logic
  private generatePorts(difficulty: number) {
    const p = [];
    const count = 18 + (difficulty * 6);
    const openCount = 3 + difficulty;
    const openIndices = new Set<number>();
    while(openIndices.size < openCount) openIndices.add(Math.floor(Math.random() * count));
    for (let i = 0; i < count; i++) p.push({ num: 80 + i, status: openIndices.has(i) ? 'open' as const : 'closed' as const, scanned: false });
    this.ports.set(p);
  }

  scanPort(index: number) {
    const current = this.ports();
    if (current[index].scanned) return;
    current[index].scanned = true;
    this.ports.set([...current]);

    // nmap-pro benefit
    const nmapPro = this.gameService.installedSoftware().find(s => s.id === 'nmap-pro' && s.installed);
    const traceGain = nmapPro ? 2.5 : 5;

    if (current[index].status === 'open') { this.audioService.playClick(); this.gameService.log(`OPEN PORT: ${current[index].num}`); }
    else { this.audioService.playBeep(200, 0.05, 'sine'); this.gameService.increaseDetection(traceGain); }
    
    // firewall-bypass benefit
    const hasBypass = this.gameService.installedSoftware().find(s => s.id === 'firewall-bypass' && s.installed);
    const openPorts = current.filter(p => p.status === 'open');
    const scannedOpenCount = openPorts.filter(p => p.scanned).length;
    const requiredCount = hasBypass ? Math.max(1, openPorts.length - 1) : openPorts.length;
    
    if (scannedOpenCount >= requiredCount) this.winMission();
  }

  private generateCode(difficulty: number) {
    const length = 4 + difficulty;
    const chars = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    this.targetCode.set(code);
    
    // Software: packet-sniffer
    const hasSniffer = this.gameService.installedSoftware().find(s => s.id === 'packet-sniffer' && s.installed);
    if (hasSniffer) {
      const display = '_'.repeat(length).split('');
      const revealCount = Math.floor(length / 3);
      for (let i = 0; i < revealCount; i++) {
        const idx = Math.floor(Math.random() * length);
        display[idx] = code[idx];
      }
      this.displayCode.set(display.join(''));
      this.gameService.log('SNIFFER: Intercepted partial credential fragments.');
    } else {
      this.displayCode.set('_'.repeat(length));
    }
  }

  inputChar(char: string) {
    const target = this.targetCode();
    const current = this.displayCode();
    const nextIndex = current.indexOf('_');
    if (nextIndex === -1) return;
    if (target[nextIndex] === char) {
      this.audioService.playClick();
      const newDisplay = current.substring(0, nextIndex) + char + current.substring(nextIndex + 1);
      this.displayCode.set(newDisplay);
      if (!newDisplay.includes('_')) this.winMission();
    } else { this.audioService.playError(); this.gameService.increaseDetection(10); }
  }

  private startSqlGame(difficulty: number) {
    this.sqlItems.set([]);
    const hasFuzzer = this.gameService.installedSoftware().find(s => s.id === 'ai-fuzzer' && s.installed);
    this.sqlInterval = setInterval(() => {
      const isVuln = Math.random() < (hasFuzzer ? 0.4 : 0.2);
      const fragments = ["SELECT * FROM sys", "DROP TABLE cache", "OR 1=1", "UNION SELECT", "WAITFOR DELAY", "xp_cmdshell", "HAVING 1=1"];
      const newItem = { id: Math.random(), text: fragments[Math.floor(Math.random()*fragments.length)] + (isVuln ? " [!] " : ""), isVuln };
      this.sqlItems.update(items => [newItem, ...items].slice(0, 8));
    }, 900 - (difficulty * 100));
  }

  triggerSqlInjection(item: any) {
    if (item.isVuln) { this.audioService.playClick(); this.winMission(); }
    else { this.audioService.playError(); this.gameService.increaseDetection(15); }
  }

  private startRfidGame(difficulty: number) {
    this.rfidCaptured = 0;
    this.rfidInterval = setInterval(() => {
      const activeIdx = Math.floor(Math.random() * 9);
      this.rfidTiles.set(Array.from({length:9}, (_, i) => ({id: i, active: i === activeIdx})));
      setTimeout(() => this.rfidTiles.set(Array.from({length:9}, (_, i) => ({id: i, active: false}))), 500);
    }, 1100 - (difficulty * 100));
  }

  interceptRfid(tile: any) {
    if (tile.active) { this.audioService.playClick(); this.rfidCaptured++; if (this.rfidCaptured >= 5) this.winMission(); }
    else { this.audioService.playError(); this.gameService.increaseDetection(20); }
  }

  private initOverflow(difficulty: number) {
    this.stack.set(new Array(32).fill('00'));
    this.eipOffset.set(12 + difficulty * 2);
    this.selectedByte = '90';
  }

  injectByte(index: number) {
    this.audioService.playClick();
    const current = [...this.stack()];
    current[index] = this.selectedByte;
    this.stack.set(current);
  }

  checkOverflow() {
    this.audioService.playGlitch();
    const current = this.stack();
    if (current[this.eipOffset()] === 'E' && current[this.eipOffset() + 1] === 'F') {
      this.gameService.log('EIP_OVERWRITE_SUCCESS');
      this.winMission();
    } else {
      this.audioService.playError();
      this.gameService.increaseDetection(15);
    }
  }

  testXss() {
    this.audioService.playClick();
    const p = this.xssPayload.toLowerCase();
    this.sanitizedView.set(p.replace(/<script/g, '[FILTERED]'));

    if (p.includes('onerror') || p.includes('onload') || (p.includes('<img') && p.includes('alert'))) {
      this.gameService.log('BYPASS_DETECTED');
      this.winMission();
    } else {
      this.audioService.playError();
      this.gameService.increaseDetection(10);
    }
  }

  initOsint() {
    const petNames = ['Ghost', 'Viper', 'Cypher', 'Neon', 'Static', 'Buster', 'Rex', 'Bella', 'Luna', 'Max'];
    const cities = ['Neo-Tokyo', 'Night City', 'Sector 7', 'The Sprawl', 'Zion'];
    const hobbies = ['surfing the net', 'modding my cyberdeck', 'drinking synth-caf', 'watching braindances'];
    
    this.correctPet = petNames[Math.floor(Math.random() * petNames.length)];
    this.targetHandle = 'CorpSlave_' + Math.floor(Math.random() * 9999);
    
    const posts = [
      { date: '2 DAYS AGO', text: `Just transferred to the new branch in ${cities[Math.floor(Math.random() * cities.length)]}. The commute is terrible.` },
      { date: '5 DAYS AGO', text: `Can't believe the weather today. Perfect for ${hobbies[Math.floor(Math.random() * hobbies.length)]}.` },
      { date: '1 WEEK AGO', text: `Took my dog ${this.correctPet} to the vet. He hates his new cybernetic leg.` },
      { date: '2 WEEKS AGO', text: `Sysadmin keeps changing the password policy. I just use my pet's name now, I don't care anymore.` },
      { date: '1 MONTH AGO', text: `Does anyone know a good place to get ramen?` }
    ];
    
    this.socialPosts = posts.sort(() => Math.random() - 0.5);
    this.osintAnswer = '';
  }

  checkOsint() {
    if (this.osintAnswer.toLowerCase() === this.correctPet.toLowerCase()) {
      this.gameService.log('IDENTITY_VERIFIED');
      this.winMission();
    } else {
      this.audioService.playError();
      this.gameService.increaseDetection(15);
    }
  }

  updatePhishPreview() {
     let text = '';
     if (this.phishSender === 'IT') text += "Dear User,\n\nYour account password will expire in 24 hours. ";
     else if (this.phishSender === 'HR') text += "Attention Employee,\n\nPlease review the attached policy changes immediately. ";
     else if (this.phishSender === 'CEO') text += "Team,\n\nI need you to review this confidential document before the board meeting. ";

     if (this.phishLure === 'URGENCY') { text += "Failure to comply will result in immediate lockout."; this.spamScore = 65; }
     else if (this.phishLure === 'FEAR') { text += "This is your final warning before disciplinary action is taken."; this.spamScore = 40; }
     else if (this.phishLure === 'CURIOSITY') { text += "You won't believe what is in this file."; this.spamScore = 85; }
     
     if (this.phishSender === 'IT' && this.phishLure === 'FEAR') this.spamScore = 95;
     if (this.phishSender === 'HR' && this.phishLure === 'URGENCY') this.spamScore = 80;
     if (this.phishSender === 'CEO' && this.phishLure === 'CURIOSITY') this.spamScore = 90;

     this.phishPreviewText = text + "\n\nClick here to proceed: [MALICIOUS_LINK]\n\nRegards,\nThe Management";
  }

  launchPhishing() {
    this.audioService.playClick();
    this.gameService.log('INJECTING_CAMPAIGN...');
    let successChance = this.spamScore / 100;
    successChance += (this.gameService.totalSocialBonus() / 100);
    if (Math.random() < successChance) this.winMission();
    else { this.audioService.playError(); this.gameService.increaseDetection(30); }
  }

  startMitmGame(difficulty: number) {
    this.mitmCaptured = 0;
    this.activePackets = [];
    this.mitmInterval = setInterval(() => {
        const isTarget = Math.random() < 0.2;
        const newPacket = {
            id: Math.random(),
            text: isTarget ? 'ENCRYPTED_HANDSHAKE' : 'TCP_KEEPALIVE',
            isTarget,
            x: -20,
            y: Math.floor(Math.random() * 80) + 10
        };
        this.activePackets.push(newPacket);
        
        // Move packets
        this.activePackets.forEach(p => p.x += (5 + difficulty));
        this.activePackets = this.activePackets.filter(p => p.x < 120);
    }, 400 - (difficulty * 50));
  }

  interceptPacket(packet: any) {
      if (packet.isTarget) {
          this.audioService.playClick();
          this.mitmCaptured++;
          packet.text = 'DECRYPTED';
          packet.isTarget = false; // Prevent double click
          if (this.mitmCaptured >= 3) this.winMission();
      } else {
          this.audioService.playError();
          this.gameService.increaseDetection(15);
      }
  }

  private winMission() { 
    this.audioService.playSuccess(); 
    this.gameService.completeMission(this.activeMission()!); 
    this.stopMission(); 
  }
}
