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
      <div class="terminal-frame ascii-header">
        MISSION_PROTOCOL_ACTIVE // SESSION_ID: {{ (gameService.credits() * 1.3).toString(16).toUpperCase() }} // STATUS: ONLINE
      </div>
      
      @if (!activeMission()) {
        <div class="mission-hub">
          <div class="hub-header">
            <div class="ascii-line title-box">ACTIVE_CONTRACTS_NODE</div>
            <div class="det-meter" aria-label="Detection Risk">
               <span class="det-label">TRACE_STRENGTH:</span>
               <div class="det-bar-ascii">
                 [{{ getTraceBar() }}] {{ gameService.detectionLevel() }}%
               </div>
            </div>
          </div>

          <div class="contract-grid" role="list">
            @for (mission of gameService.activeMissions(); track mission.id) {
              <div class="terminal-frame contract-card" role="listitem">
                <div class="card-body">
                  <div class="c-id">ID: {{ mission.id.substring(0,8) }}</div>
                  <h4 class="c-name">[{{ mission.type.toUpperCase() }}] {{ mission.name }}</h4>
                  <div class="c-target">TARGET: {{ mission.target }}</div>
                  
                  <div class="c-reward-strip">
                     <span class="r-label">COMPENSATION:</span>
                     <span class="r-val">{{ mission.reward }} CR</span>
                  </div>
                </div>
                <div class="card-actions">
                   <button class="terminal-btn primary" (click)="startMission(mission)">[ INIT_HANDSHAKE ]</button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-ops-overlay">
          <div class="terminal-frame active-ops-view" role="dialog" aria-modal="true">
            <div class="ops-header">
                <span class="blink">●</span> 
                <span class="title">OPR: {{ activeMission()?.name }} // STATUS: IN_PROGRESS</span>
            </div>
            <div class="ascii-line divider"></div>

            <div class="mini-game-chamber">
                <div class="chamber-noise">VECTOR_BUFFER: {{ byteBuffer() }}</div>
                
                @if (activeMission()?.type === 'port-scan') {
                  <div class="port-scan-ui">
                      <div class="target-sync-panel">
                        <div class="ascii-line">TARGET_FREQUENCY</div>
                        <span class="freq-value">{{ targetFrequency() }} Hz</span>
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

            <div class="ascii-line divider"></div>
            <div class="ops-footer">
              <button class="magenta" (click)="stopMission()">[ ABORT_DEPLOYMENT ]</button>
            </div>
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
      color: var(--neon-green);
      font-family: 'JetBrains Mono', monospace;
    }

    .missions-container {
      background: var(--layer-0);
      height: 100%;
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: var(--spacing-md);
    }

    .ascii-header {
      align-self: stretch;
      text-align: center;
      font-weight: bold;
      background: var(--layer-1);
    }

    .hub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      padding: 0 var(--spacing-sm);
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .title-box {
      flex: 1;
      min-width: 200px;
    }

    .det-meter {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .det-label { font-size: var(--font-size-xs); }
    .det-bar-ascii { color: var(--neon-magenta); font-family: 'JetBrains Mono', monospace; font-size: var(--font-size-sm); }

    .contract-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
      gap: var(--spacing-lg);
    }

    .contract-card {
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    
    .contract-card:hover {
      transform: translateY(-4px);
      background: var(--layer-2);
      border-color: rgba(0, 255, 159, 0.35);
      box-shadow: var(--neon-shadow);
    }

    .card-body {
      padding: var(--spacing-sm);
      flex: 1;
    }

    .card-actions {
      padding: var(--spacing-sm);
      display: flex;
      justify-content: center;
      border-top: 1px solid rgba(0, 255, 159, 0.12);
      background: rgba(0, 255, 159, 0.02);
    }

    .c-id { font-size: var(--font-size-xs); color: rgba(0, 255, 159, 0.4); margin-bottom: 0.5rem; letter-spacing: 1px; }
    .c-name { font-size: var(--font-size-base); font-weight: 900; margin: 0 0 0.5rem 0; color: var(--neon-green); font-family: 'Orbitron', monospace; text-shadow: 0 0 6px rgba(0, 255, 159, 0.3); }
    .c-target { font-size: var(--font-size-sm); margin-bottom: 1rem; color: rgba(0, 255, 159, 0.6); }

    .c-reward-strip {
      border-top: 1px solid rgba(0, 255, 159, 0.12);
      padding-top: 0.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
    }
    .r-label { font-size: var(--font-size-xs); color: rgba(0, 255, 159, 0.5); font-family: 'Orbitron', monospace; letter-spacing: 1px; }
    .r-val { font-weight: 900; color: var(--neon-cyan); text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }

    .terminal-btn.small { font-size: var(--font-size-xs); }
    .terminal-btn.cyan { border-color: var(--neon-cyan); color: var(--neon-cyan); }
    .terminal-btn.magenta { border-color: var(--neon-magenta); color: var(--neon-magenta); }

    .active-ops-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(5, 8, 16, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: var(--spacing-md);
      backdrop-filter: blur(8px);
    }

    .active-ops-view {
      display: flex;
      flex-direction: column;
      max-width: 100%;
      width: 800px;
      max-height: 90vh;
      overflow: hidden;
    }

    .ops-header {
      padding: var(--spacing-sm) var(--spacing-md);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .ops-footer {
      padding: var(--spacing-sm);
      display: flex;
      justify-content: center;
    }

    .blink { animation: blink 1s steps(2) infinite; color: var(--neon-magenta); }
    @keyframes blink { to { opacity: 0; } }

    .mini-game-chamber {
      padding: var(--spacing-lg);
      flex: 1;
      overflow-y: auto;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .chamber-noise {
      position: absolute; top: 10px; left: 20px;
      font-size: var(--font-size-xs); opacity: 0.5;
    }

    .port-scan-ui {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
    }
    .target-sync-panel { text-align: center; width: 100%; }
    .freq-value { font-size: var(--font-size-xl); color: var(--neon-green); font-weight: 900; text-shadow: 0 0 10px var(--neon-green); }

    .ports-matrix {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 10px;
      width: 100%;
    }
    .port-cell {
      background: transparent;
      border: 1px solid var(--neon-green);
      color: var(--neon-green);
      padding: 10px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: var(--font-size-sm);
    }
    .port-cell:hover { background: rgba(0, 255, 159, 0.08); }
    .port-cell.scanned { opacity: 0.3; }
    .port-cell.matching { box-shadow: 0 0 10px var(--neon-green); border-width: 2px; }
    .port-cell.open { background: var(--neon-cyan); color: #000; }

    .brute-chamber {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
    }
    .code-readout {
      font-size: var(--font-size-xl);
      letter-spacing: 0.5rem;
      color: var(--neon-green);
      text-shadow: 0 0 10px var(--neon-green);
    }
    .code-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    
    @media (max-width: 400px) {
      .code-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .buffer-chamber {
      width: 100%;
      max-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .buffer-track-ascii {
      font-size: var(--font-size-lg);
      letter-spacing: 2px;
      text-align: center;
    }

    @media (max-width: 600px) {
      .ports-matrix { grid-template-columns: repeat(3, 1fr); }
      .hub-header { flex-direction: column; align-items: stretch; }
      .det-meter { align-items: flex-start; }
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
