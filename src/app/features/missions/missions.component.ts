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
      <div class="noise-data" style="top:4px; right:6px;" aria-hidden="true">MISSION_PROTOCOL_ACTIVE</div>
      
      @if (!activeMission()) {
        <div class="mission-hub">
          <div class="hub-header">
            <h3 class="title">ACTIVE_CONTRACTS_NODE</h3>
            <div class="det-meter" aria-label="Detection Risk">
               <span class="det-label">TRACE:</span>
               <div class="det-bar" role="progressbar" [attr.aria-valuenow]="gameService.detectionLevel()" aria-valuemin="0" aria-valuemax="100">
                  <div class="det-fill" [style.width.%]="gameService.detectionLevel()"></div>
               </div>
               <span class="det-val">{{ gameService.detectionLevel() }}%</span>
            </div>
          </div>

          <div class="contract-grid" role="list">
            @for (mission of gameService.activeMissions(); track mission.id) {
              <div class="contract-card" role="listitem" [class.rare]="mission.reward > 1000">
                <div class="c-top">
                   <span class="c-type" aria-label="Category: {{ mission.type }}">[{{ mission.type.toUpperCase() }}]</span>
                   <span class="c-id" aria-hidden="true">ID: {{ mission.id.substring(0,6) }}</span>
                </div>
                <h4 class="c-name">{{ mission.name }}</h4>
                <div class="c-target">TARGET: {{ mission.target }}</div>
                
                <div class="c-reward-strip" aria-label="Reward">
                   <span class="r-label">COMPENSATION:</span>
                   <span class="r-val">{{ mission.reward }}cr</span>
                </div>

                <div class="c-actions">
                   <button class="primary" (click)="startMission(mission)" [attr.aria-label]="'Accept ' + mission.name + ' mission'">INIT_HANDSHAKE</button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-ops-view" role="dialog" aria-modal="true" [attr.aria-label]="'Active Mission: ' + activeMission()?.name">
           <div class="ops-header">
              <span class="blink" aria-hidden="true">[!]</span> 
              <span class="title">OPR: {{ activeMission()?.name }} // STATUS: IN_PROGRESS</span>
           </div>

           <div class="mini-game-chamber holographic-viz">
              <div class="chamber-noise" aria-hidden="true">VECTOR_BUFFER: {{ byteBuffer() }}</div>
              
              @if (activeMission()?.type === 'port-scan') {
                 <div class="port-scan-ui">
                    <div class="target-sync-panel">
                       <span class="label">TARGET_FREQUENCY:</span>
                       <span class="freq-value">{{ targetFrequency() }}Hz</span>
                    </div>
                    <div class="ports-matrix" role="grid" aria-label="Port Matrix Scan">
                       @for (port of ports(); track $index) {
                          <button class="port-cell" 
                               [class.scanned]="port.scanned" 
                               [class.open]="port.open"
                               [class.matching]="isMatching(port)"
                               (click)="scanPort(port)"
                               [attr.aria-label]="'Port ' + port.num">
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
                    <div class="code-readout" aria-live="polite" aria-label="Code entered: {{ currentCode() }}">{{ currentCode() }}</div>
                    <div class="code-grid">
                       @for (char of '0123456789ABCDEF'.split(''); track char) {
                          <button 
                            (click)="tryCode(char)" 
                            [class.glow]="glowingChar() === char"
                            [attr.aria-label]="'Enter ' + char">
                            {{ char }}
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
                    <div class="buffer-track">
                       <div class="buffer-fill" [style.width.%]="bufferFill()" [class.warning]="bufferFill() > 80"></div>
                       <div class="buffer-target" style="left: 100%"></div>
                    </div>
                    <div class="byte-drops">
                       <button class="byte-btn" (click)="addBytes(2)">+0x02</button>
                       <button class="byte-btn" (click)="addBytes(7)">+0x07</button>
                       <button class="byte-btn" (click)="addBytes(13)">+0x0D</button>
                       <button class="byte-btn" (click)="addBytes(21)">+0x15</button>
                    </div>
                    <div class="overflow-warning" *ngIf="bufferFill() > 90">!! NEAR OVERFLOW !!</div>
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
                    <button class="primary" (click)="winMission()">BYPASS_ENCRYPTION</button>
                 </div>
              }
           </div>

           <button class="abort-btn" (click)="stopMission()" aria-label="Abort mission">ABORT_DEPLOYMENT</button>
        </div>
      }
    </div>
  `,
  styles: `
    .missions-container {
      background: var(--layer-1);
      height: 100%;
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-y: auto;
    }

    .hub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--layer-2);
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title { font-size: var(--font-size-sm); font-weight: 900; letter-spacing: 2px; }

    .det-meter { display: flex; align-items: center; gap: 12px; }
    .det-label { font-size: 0.5rem; opacity: 0.4; font-weight: 900; }
    .det-bar { width: clamp(60px, 8vw, 120px); height: 2px; background: var(--layer-0); }
    .det-fill { height: 100%; background: var(--tertiary); box-shadow: 0 0 10px var(--tertiary); }
    .det-val { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--tertiary); }

    .contract-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .contract-card {
      background: var(--layer-2);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.05s steps(2);
      position: relative;
    }

    .contract-card:hover {
      background: var(--layer-4);
      box-shadow: var(--neon-shadow);
    }

    .rare { border-left: 4px solid var(--secondary) !important; }

    .c-top { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; opacity: 0.4; font-weight: 900; }
    .c-name { font-size: var(--font-size-base); font-weight: 900; color: #fff; letter-spacing: -0.02em; margin: 0; }
    .c-target { font-size: 0.65rem; color: var(--primary); opacity: 0.6; font-family: 'JetBrains Mono', monospace; }

    .c-reward-strip {
      background: var(--layer-0);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .r-label { font-size: 0.5rem; font-weight: 900; opacity: 0.4; }
    .r-val { font-size: 1.1rem; font-weight: 900; color: var(--secondary); }

    .active-ops-view {
       display: flex;
       flex-direction: column;
       height: 100%;
       gap: 1.5rem;
       min-height: 400px;
    }

    .ops-header { 
       background: var(--layer-2); 
       padding: 15px; 
       font-size: 0.8rem; 
       font-weight: 900; 
       color: var(--primary);
       display: flex;
       align-items: center;
    }
    .blink { color: var(--tertiary); animation: blink 0.5s steps(2) infinite; margin-right: 10px; }

    .mini-game-chamber {
       flex-grow: 1;
       background: var(--layer-0);
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       position: relative;
       padding: var(--spacing-lg);
       min-height: 300px;
    }

    .chamber-noise {
       position: absolute; top: 10px; left: 15px;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.5rem; opacity: 0.2;
    }

    .port-scan-ui {
       width: 100%;
       display: flex;
       flex-direction: column;
       align-items: center;
       gap: 1.5rem;
    }

    .target-sync-panel {
       background: var(--layer-2);
       padding: 10px 20px;
       border-left: 3px solid var(--primary);
       display: flex;
       flex-direction: column;
       align-items: center;
    }
    .target-sync-panel .label { font-size: 0.5rem; opacity: 0.5; font-weight: 900; }
    .target-sync-panel .freq-value { font-size: 1.2rem; font-weight: 900; color: var(--primary); font-family: 'JetBrains Mono', monospace; }

    .ports-matrix {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
       gap: 8px;
       width: 100%;
       max-width: 600px;
    }
    .port-cell {
       background: var(--layer-2);
       padding: 10px 5px;
       display: flex;
       flex-direction: column;
       align-items: center;
       font-family: 'JetBrains Mono', monospace;
       cursor: pointer;
       opacity: 0.7;
       border: 1px solid transparent;
       color: var(--primary);
       transition: all 0.1s ease;
    }
    .port-cell:hover { background: var(--layer-3); opacity: 1; border-color: rgba(13, 242, 242, 0.3); }
    .port-cell.matching { border-color: var(--primary); box-shadow: 0 0 10px var(--primary); opacity: 1; }
    .port-cell.scanned { opacity: 0.4; background: var(--layer-1); }
    .port-cell.open { background: var(--secondary); color: #000; opacity: 1; box-shadow: 0 0 15px var(--secondary); }
    
    .p-num { font-size: 0.8rem; font-weight: 900; }
    .p-freq { font-size: 0.6rem; opacity: 0.6; }

    .code-readout {
       font-size: var(--font-size-xl);
       font-weight: 900;
       color: #fff;
       letter-spacing: 0.5rem;
       margin-bottom: 2rem;
       text-shadow: 0 0 10px var(--primary);
       text-align: center;
    }
    .code-grid {
       display: grid;
       grid-template-columns: repeat(4, 1fr);
       gap: 8px;
       width: 100%;
       max-width: 320px;
    }
    .code-grid button { 
       padding: 12px; 
       font-size: 1rem; 
       background: var(--layer-3); 
       transition: all 0.3s ease;
    }
    .code-grid button.glow {
       background: var(--primary);
       box-shadow: 0 0 20px var(--primary);
       color: #000;
       transform: scale(1.1);
       z-index: 10;
    }

    .mission-timer {
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.8rem;
       color: var(--secondary);
       margin-bottom: 1rem;
       letter-spacing: 1px;
    }
    .mission-timer.low-time {
       color: var(--tertiary);
       animation: pulse-red 0.5s infinite alternate;
    }

    @keyframes pulse-red {
       from { opacity: 1; }
       to { opacity: 0.5; }
    }

    .buffer-chamber {
       width: 100%;
       max-width: 400px;
       display: flex;
       flex-direction: column;
       gap: 1.5rem;
    }
    .buffer-header {
       display: flex;
       justify-content: space-between;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.8rem;
       font-weight: 900;
    }
    .buffer-track {
       width: 100%;
       height: 30px;
       background: var(--layer-2);
       position: relative;
       border: 1px solid rgba(255,255,255,0.1);
    }
    .buffer-fill {
       height: 100%;
       background: var(--primary);
       transition: width 0.2s ease;
       box-shadow: 0 0 15px var(--primary);
    }
    .buffer-fill.warning { background: var(--tertiary); box-shadow: 0 0 15px var(--tertiary); }
    .buffer-target {
       position: absolute;
       top: -5px;
       bottom: -5px;
       width: 2px;
       background: #fff;
       box-shadow: 0 0 10px #fff;
    }
    .byte-drops {
       display: grid;
       grid-template-columns: repeat(4, 1fr);
       gap: 10px;
    }
    .byte-btn {
       padding: 10px;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.7rem;
       background: var(--layer-3);
       border: 1px solid rgba(255,255,255,0.1);
       color: #fff;
       cursor: pointer;
    }
    .byte-btn:hover { background: var(--layer-4); border-color: var(--primary); }
    .overflow-warning {
       text-align: center;
       color: var(--tertiary);
       font-size: 0.7rem;
       font-weight: 900;
       animation: blink 0.3s steps(2) infinite;
    }

    .abort-btn { 
       background: transparent; 
       border: 1px solid var(--tertiary); 
       color: var(--tertiary); 
       align-self: center;
       font-size: 0.65rem;
       width: auto;
    }
    
    @media (max-width: 480px) {
       .contract-card:nth-child(n) { width: 100% !important; grid-column: auto !important; }
       .ports-matrix { grid-template-columns: repeat(3, 1fr); }
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
  
  // Brute Force Overhaul
  correctSequence = signal<string[]>([]);
  missionTimer = signal<number>(0);
  glowingChar = signal<string | null>(null);
  
  private freqInterval: any;
  private timerInterval: any;
  private leakInterval: any;

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
