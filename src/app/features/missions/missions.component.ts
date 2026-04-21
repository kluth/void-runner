import { Component, inject, signal, OnDestroy } from '@angular/core';
import { GameService, Mission } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SqlInjectionComponent } from './sql-injection.component';
import { RfidCloneComponent } from './rfid-clone.component';
import { PhishingCampaignComponent } from './phishing-campaign.component';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, FormsModule, SqlInjectionComponent, RfidCloneComponent, PhishingCampaignComponent],
  template: `
    <div class="missions-container" role="region" aria-label="Available Missions">
      <div class="ascii-header">
        <pre>
┌──────────────────────────────────────────────────────────────────────────────┐
│ MISSION_PROTOCOL_ACTIVE // SESSION_ID: {{ (gameService.credits() * 1.3).toString(16).toUpperCase() }} // STATUS: ONLINE        │
└──────────────────────────────────────────────────────────────────────────────┘</pre>
      </div>
      
      @if (!activeMission()) {
        <div class="mission-hub">
          <div class="hub-header">
            <div class="title-box">
              <pre>┌─ ACTIVE_CONTRACTS_NODE ─┐</pre>
            </div>
            <div class="det-meter" aria-label="Detection Risk">
               <span class="det-label">TRACE_STRENGTH:</span>
               <div class="det-bar-ascii">
                 [{{ getTraceBar() }}] {{ gameService.detectionLevel() }}%
               </div>
            </div>
          </div>

          <div class="contract-grid" role="list">
            @for (mission of gameService.activeMissions(); track mission.id) {
              <div class="contract-card" role="listitem">
                <pre class="card-border-top">┌── [{{ mission.type.toUpperCase() }}] {{ '─'.repeat(Math.max(0, 24 - mission.type.length)) }}┐</pre>
                <div class="card-body">
                  <div class="c-id">ID: {{ mission.id.substring(0,8) }}</div>
                  <h4 class="c-name">{{ mission.name }}</h4>
                  <div class="c-target">TARGET: {{ mission.target }}</div>
                  
                  <div class="c-reward-strip">
                     <span class="r-label">COMPENSATION:</span>
                     <span class="r-val">{{ mission.reward }} CR</span>
                  </div>
                </div>
                <div class="card-actions">
                   <button class="terminal-btn" (click)="startMission(mission)">[ INIT_HANDSHAKE ]</button>
                </div>
                <pre class="card-border-bottom">└─────────────────────────────────┘</pre>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-ops-overlay">
          <div class="active-ops-view" role="dialog" aria-modal="true">
            <pre class="modal-border">┌──────────────────────────────────────────────────────────────────────────────┐</pre>
            <div class="ops-header">
                <span class="blink">●</span> 
                <span class="title">OPR: {{ activeMission()?.name }} // STATUS: IN_PROGRESS</span>
            </div>
            <pre class="modal-divider">├──────────────────────────────────────────────────────────────────────────────┤</pre>

            <div class="mini-game-chamber">
                <div class="chamber-noise">VECTOR_BUFFER: {{ byteBuffer() }}</div>
                
                @if (activeMission()?.type === 'port-scan') {
                  <div class="port-scan-ui">
                      <div class="target-sync-panel">
                        <pre>┌─ TARGET_FREQUENCY ─┐</pre>
                        <span class="freq-value">{{ targetFrequency() }} Hz</span>
                        <pre>└────────────────────┘</pre>
                      </div>
                      <div class="ports-matrix" role="grid">
                        @for (port of ports(); track $index) {
                            <button class="port-cell" 
                                [class.scanned]="port.scanned" 
                                [class.open]="port.open"
                                [class.matching]="isMatching(port)"
                                (click)="scanPort(port)">
                              <span class="p-num">{{ port.num }}</span>
                              <span class="p-freq">{{ port.frequency }}Hz</span>
                            </button>
                        }
                      </div>
                  </div>
                }

                @if (activeMission()?.type === 'brute-force') {
                  <div class="brute-chamber">
                      <div class="mission-timer" [class.low-time]="missionTimer() < 10">
                        TIME_REMAINING: {{ missionTimer() }}s
                      </div>
                      <div class="code-readout">{{ currentCode() || '____' }}</div>
                      <div class="code-grid">
                        @for (char of '0123456789ABCDEF'.split(''); track char) {
                            <button 
                              (click)="tryCode(char)" 
                              [class.glow]="glowingChar() === char">
                              [{{ char }}]
                            </button>
                        }
                      </div>
                  </div>
                }

                @if (activeMission()?.type === 'buffer-overflow') {
                  <div class="buffer-chamber">
                      <div class="buffer-header">
                        <span class="label">STACK_POINTER: 0x{{ (bufferFill() * 4).toString(16).toUpperCase().padStart(4, '0') }}</span>
                        <span class="val">{{ bufferFill() }}%</span>
                      </div>
                      <div class="buffer-track-ascii">
                        [{{ '#'.repeat(Math.floor(bufferFill()/5)) }}{{ ' '.repeat(20 - Math.floor(bufferFill()/5)) }}]
                      </div>
                      <div class="byte-drops">
                        <button class="terminal-btn small" (click)="addBytes(2)">[+0x02]</button>
                        <button class="terminal-btn small" (click)="addBytes(7)">[+0x07]</button>
                        <button class="terminal-btn small" (click)="addBytes(13)">[+0x0D]</button>
                        <button class="terminal-btn small" (click)="addBytes(21)">[+0x15]</button>
                      </div>
                      @if (bufferFill() > 90) {
                        <div class="overflow-warning">!! NEAR_OVERFLOW_DETECTED !!</div>
                      }
                  </div>
                }

                @if (activeMission()?.type === 'sql-injection') {
                  <app-sql-injection 
                      [mission]="activeMission()!" 
                      (onComplete)="winMission()"
                      (onFail)="stopMission()">
                  </app-sql-injection>
                }

                @if (activeMission()?.type === 'phishing-campaign') {
                  <app-phishing-campaign [mission]="activeMission()!"></app-phishing-campaign>
                }

                @if (activeMission()?.type === 'rfid-clone') {
                  <app-rfid-clone [mission]="activeMission()!"></app-rfid-clone>
                }

                @if (activeMission()?.type !== 'port-scan' && 
                    activeMission()?.type !== 'brute-force' && 
                    activeMission()?.type !== 'buffer-overflow' &&
                    activeMission()?.type !== 'sql-injection' &&
                    activeMission()?.type !== 'phishing-campaign' &&
                    activeMission()?.type !== 'rfid-clone') {
                  <div class="generic-breach">
                      <div class="breach-status">NEURAL_FIREWALL_DETECTED</div>
                      <button class="terminal-btn" (click)="winMission()">[ BYPASS_ENCRYPTION ]</button>
                  </div>
                }
            </div>

            <pre class="modal-divider">├──────────────────────────────────────────────────────────────────────────────┤</pre>
            <div class="ops-footer">
              <button class="abort-btn" (click)="stopMission()">[ ABORT_DEPLOYMENT ]</button>
            </div>
            <pre class="modal-border">└──────────────────────────────────────────────────────────────────────────────┘</pre>
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
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .missions-container {
      background: #000;
      height: 100%;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    pre {
      margin: 0;
      line-height: 1.2;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .ascii-header {
      margin-bottom: 1rem;
      align-self: center;
    }

    .hub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 0 1rem;
    }

    .det-meter {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .det-label { font-size: 0.7rem; }
    .det-bar-ascii { color: var(--tertiary); font-family: 'JetBrains Mono', monospace; }

    .contract-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      padding: 1rem;
    }

    .contract-card {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .card-body {
      padding: 0 1.5rem;
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
    }

    .card-actions {
      padding: 0.5rem 1.5rem;
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      display: flex;
      justify-content: center;
    }

    .c-id { font-size: 0.7rem; opacity: 0.7; margin-bottom: 0.5rem; }
    .c-name { font-size: 1.1rem; font-weight: 900; margin: 0 0 0.5rem 0; color: var(--primary); }
    .c-target { font-size: 0.8rem; margin-bottom: 1rem; }

    .c-reward-strip {
      border-top: 1px dashed var(--primary);
      padding-top: 0.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
    }
    .r-label { font-size: 0.7rem; }
    .r-val { font-weight: 900; color: var(--secondary); }

    .terminal-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 5px 10px;
    }
    .terminal-btn:hover {
      background: var(--primary);
      color: #000;
    }
    .terminal-btn.small { font-size: 0.7rem; }

    .active-ops-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .active-ops-view {
      display: flex;
      flex-direction: column;
      max-width: 90vw;
      width: 800px;
    }

    .ops-header {
      padding: 0.5rem 2rem;
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .ops-footer {
      padding: 0.5rem 2rem;
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      display: flex;
      justify-content: center;
    }

    .blink { animation: blink 1s steps(2) infinite; color: var(--tertiary); }
    @keyframes blink { to { opacity: 0; } }

    .mini-game-chamber {
      padding: 2rem;
      border-left: 1px solid var(--primary);
      border-right: 1px solid var(--primary);
      min-height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .chamber-noise {
      position: absolute; top: 10px; left: 20px;
      font-size: 0.6rem; opacity: 0.5;
    }

    .port-scan-ui {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    .target-sync-panel { text-align: center; }
    .freq-value { font-size: 1.5rem; color: var(--primary); font-weight: 900; }

    .ports-matrix {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }
    .port-cell {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 10px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .port-cell:hover { background: rgba(var(--primary-rgb), 0.1); }
    .port-cell.scanned { opacity: 0.3; }
    .port-cell.matching { box-shadow: 0 0 10px var(--primary); border-width: 2px; }
    .port-cell.open { background: var(--secondary); color: #000; }

    .brute-chamber {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
    .code-readout {
      font-size: 3rem;
      letter-spacing: 0.5rem;
      color: var(--primary);
      text-shadow: 0 0 10px var(--primary);
    }
    .code-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .code-grid button {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 10px;
      cursor: pointer;
    }
    .code-grid button:hover { background: var(--primary); color: #000; }
    .code-grid button.glow { box-shadow: 0 0 15px var(--primary); background: var(--primary); color: #000; }

    .buffer-chamber {
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .buffer-track-ascii {
      font-size: 1.2rem;
      letter-spacing: 2px;
      text-align: center;
    }

    .abort-btn {
      background: transparent;
      border: none;
      color: var(--tertiary);
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      padding: 5px 20px;
    }
    .abort-btn:hover { background: var(--tertiary); color: #000; }

    @media (max-width: 600px) {
      .ports-matrix { grid-template-columns: repeat(3, 1fr); }
      .contract-grid { grid-template-columns: 1fr; }
    }
  `
})
export class MissionComponent implements OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  activeMission = signal<Mission | null>(null);
  ports = signal<any[]>([]);
  targetFrequency = signal(0);
  currentCode = signal('');
  byteBuffer = signal('0x00');
  bufferFill = signal(0);
  
  Math = Math;

  // Brute Force Overhaul
  correctSequence = signal<string[]>([]);
  missionTimer = signal<number>(0);
  glowingChar = signal<string | null>(null);
  
  private freqInterval: any;
  private timerInterval: any;
  private leakInterval: any;

  getTraceBar() {
    const level = this.gameService.detectionLevel();
    const filled = Math.floor(level / 10);
    return '#'.repeat(filled) + ' '.repeat(10 - filled);
  }

  startMission(mission: Mission) {
    this.activeMission.set(mission);
    this.audioService.playClick();
    this.gameService.log(`DEPLOYING_PROTOCOL: ${mission.name}...`);
    this.gameService.triggerVisualEvent(mission.lat, mission.lng, 'pulse', '#0df2f2');
    
    if (mission.type === 'port-scan') {
      this.targetFrequency.set(Math.floor(Math.random() * 800) + 100);
      const p = [];
      for (let i = 0; i < 18; i++) {
        p.push({ 
          num: Math.floor(Math.random() * 9000) + 100, 
          scanned: false, 
          open: Math.random() > 0.85,
          frequency: Math.floor(Math.random() * 900) + 100,
          drift: (Math.random() - 0.5) * 20
        });
      }
      this.ports.set(p);
      this.startFrequencyDrift();
    }

    if (mission.type === 'brute-force') {
      const hex = '0123456789ABCDEF'.split('');
      const seq = [];
      for (let i = 0; i < 4; i++) {
        seq.push(hex[Math.floor(Math.random() * hex.length)]);
      }
      this.correctSequence.set(seq);
      this.missionTimer.set(60); 
      this.startMissionTimer();
      this.startLogicLeaks();
    }

    if (mission.type === 'buffer-overflow') {
      this.bufferFill.set(0);
    }
  }

  private startMissionTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.missionTimer.update(t => {
        if (t <= 1) {
          this.gameService.failMission(this.activeMission()!);
          this.stopMission();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private startLogicLeaks() {
    if (this.leakInterval) clearInterval(this.leakInterval);
    this.leakInterval = setInterval(() => {
      const seq = this.correctSequence();
      if (seq.length > 0) {
        const leakChar = seq[Math.floor(Math.random() * seq.length)];
        this.glowingChar.set(leakChar);
        setTimeout(() => this.glowingChar.set(null), 800);
      }
    }, 3000);
  }

  private startFrequencyDrift() {
    if (this.freqInterval) clearInterval(this.freqInterval);
    this.freqInterval = setInterval(() => {
      this.ports.update(pts => pts.map(p => {
        let newFreq = p.frequency + p.drift;
        if (newFreq > 999 || newFreq < 100) p.drift *= -1;
        return { ...p, frequency: Math.floor(newFreq) };
      }));
    }, 100);
  }

  scanPort(port: any) {
    if (port.scanned) return;
    
    const diff = Math.abs(port.frequency - this.targetFrequency());
    const tolerance = 50;

    if (diff <= tolerance) {
      port.scanned = true;
      this.audioService.playClick();
      this.byteBuffer.set('0x' + Math.floor(Math.random()*255).toString(16).toUpperCase());
      if (port.open) {
         this.winMission();
      } else {
         this.gameService.log(`PORT_${port.num}: SIGNAL_MATCHED // STATUS: CLOSED`);
      }
    } else {
      this.audioService.playError();
      this.gameService.log(`PORT_${port.num}: SYNC_ERROR // FREQ_MISMATCH: ${diff}Hz`);
      this.gameService.increaseDetection(2);
    }
  }

  isMatching(port: any): boolean {
    return Math.abs(port.frequency - this.targetFrequency()) <= 50;
  }

  tryCode(char: string) {
    this.currentCode.update(c => (c + char).substring(0, 4));
    this.audioService.playClick();
    if (this.currentCode().length === 4) {
       if (this.currentCode() === this.correctSequence().join('')) {
          this.winMission();
       } else {
          this.gameService.log('ERR: SYNC_FAIL. REBOOTING_CODE_BUFFER.');
          this.currentCode.set('');
          this.missionTimer.update(t => Math.max(0, t - 5));
          this.gameService.increaseDetection(5);
       }
    }
  }

  addBytes(amount: number) {
    this.audioService.playClick();
    const nextFill = this.bufferFill() + amount;
    this.bufferFill.set(nextFill);

    if (nextFill === 100) {
      this.winMission();
    } else if (nextFill > 100) {
      this.gameService.log('!!! CRITICAL_ERROR: STACK_OVERFLOW_DETECTED !!!');
      this.gameService.increaseDetection(100);
      this.stopMission();
    }
  }

  winMission() {
    this.audioService.playSuccess();
    this.gameService.completeMission(this.activeMission()!);
    this.stopMission();
  }

  stopMission() {
    this.activeMission.set(null);
    this.ports.set([]);
    this.currentCode.set('');
    if (this.freqInterval) clearInterval(this.freqInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.leakInterval) clearInterval(this.leakInterval);
    this.freqInterval = null;
    this.timerInterval = null;
    this.leakInterval = null;
  }

  ngOnDestroy() {
    if (this.freqInterval) clearInterval(this.freqInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.leakInterval) clearInterval(this.leakInterval);
  }
}
