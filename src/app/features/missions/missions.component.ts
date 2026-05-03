import { Component, inject, signal, OnDestroy } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { Mission } from '../../core/models/game.models';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ops-container">
      <div class="active-missions">
        @for (mission of gameService.activeMissions(); track mission.id) {
          <div class="terminal-frame mission-card" [class.selected]="selectedMission()?.id === mission.id" (click)="selectedMission.set(mission)">
            <div class="m-header">
              <span class="m-name">{{ mission.name }}</span>
              <span class="m-diff" [class]="getDiffClass(mission.difficulty)">[{{ getDiffLabel(mission.difficulty) }}]</span>
            </div>
            <div class="m-target">> TARGET: {{ mission.target }}</div>
            <div class="m-footer">
              <span>REWARD: {{ mission.reward }} CR</span>
              <button class="primary text-xs" (click)="startMission(mission); $event.stopPropagation()">[ EXECUTE ]</button>
            </div>
          </div>
        }
        @if (gameService.activeMissions().length === 0) {
          <div class="empty-msg">NO_ACTIVE_OPERATIONS_DETECTED</div>
        }
      </div>

      <!-- MISSION MINIGAME MODAL -->
      @if (activeMission()) {
        <div class="mission-modal-overlay glass-overlay">
           <div class="active-ops-view terminal-frame">
              <div class="ops-header">
                 <div class="ascii-line">OPERATION: {{ activeMission()?.name }}</div>
                 <div class="timer" [class.low]="missionTimer() < 10">T-MINUS: {{ missionTimer() }}s</div>
              </div>

              <div class="ops-buffer">
                @switch (activeMission()?.type) {
                  @case ('brute-force') {
                    <div class="brute-force-grid">
                       <div class="target-string">{{ targetString() }}</div>
                       <div class="guess-input">
                          <input type="text" [(ngModel)]="currentGuess" (keyup.enter)="checkGuess()" placeholder="SYNC_CODE..." maxlength="4">
                       </div>
                       <div class="feedback">{{ guessFeedback() }}</div>
                       
                       <div class="hex-grid mt-4">
                          @for (char of ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']; track char) {
                            <button (click)="tryCode(char)" [class.glow]="glowingChar() === char">{{ char }}</button>
                          }
                       </div>
                    </div>
                  }
                  @case ('port-scan') {
                    <div class="port-matrix">
                      @for (port of ports(); track $index) {
                        <div class="port-node" [class.scanned]="port.scanned" (click)="scanPort(port)">
                          <div class="p-freq">{{ port.frequency }}</div>
                          <div class="p-id">P_{{ $index }}</div>
                        </div>
                      }
                    </div>
                  }
                  @case ('buffer-overflow') {
                    <div class="buffer-game">
                       <div class="progress-label">BUFFER_SATURATION: {{ bufferFill() }}%</div>
                       <div class="buffer-bar">
                          <div class="fill" [style.width.%]="bufferFill()"></div>
                       </div>
                       <button class="primary" (click)="addBytes(10)">[ INJECT_BYTES ]</button>
                    </div>
                  }
                  @default {
                    <div class="generic-breach">
                       <div class="breach-status">NEURAL_FIREWALL_DETECTED</div>
                       <button class="primary" (click)="winMission()">[ BYPASS_ENCRYPTION ]</button>
                    </div>
                  }
                }
              </div>

              <div class="ops-footer">
                <button class="magenta" (click)="cancelMission()">[ ABORT_OPERATION ]</button>
              </div>
           </div>
        </div>
      }
    </div>
  `,
  styles: `
    .ops-container { display: flex; flex-direction: column; gap: 1rem; }
    .mission-card { padding: 10px; cursor: pointer; transition: all 0.2s; }
    .mission-card:hover { border-color: var(--primary); background: rgba(0, 255, 159, 0.05); }
    .mission-card.selected { border-color: var(--neon-cyan); box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); }
    
    .m-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 0.8rem; margin-bottom: 5px; }
    .m-name { color: var(--primary); }
    .m-diff { font-size: 0.6rem; }
    .diff-low { color: var(--neon-green); }
    .diff-med { color: var(--neon-yellow); }
    .diff-high { color: var(--neon-orange); }
    .diff-crit { color: var(--neon-magenta); animation: blink 1s infinite; }

    .m-target { font-size: 0.7rem; opacity: 0.7; margin-bottom: 10px; }
    .m-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; }

    .empty-msg { text-align: center; padding: 2rem; opacity: 0.3; font-size: 0.7rem; font-weight: 900; }

    .mission-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .active-ops-view { 
      background: var(--layer-1); width: 100%; max-width: 800px; 
      max-height: 90dvh; display: flex; flex-direction: column; 
    }
    .ops-header { padding: 1rem; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0, 255, 159, 0.1); }
    .timer { font-family: 'Orbitron', monospace; color: var(--primary); }
    .timer.low { color: var(--neon-magenta); animation: blink 0.5s infinite; }

    .ops-buffer { flex: 1; overflow-y: auto; padding: 2rem; display: flex; align-items: center; justify-content: center; }
    
    .brute-force-grid { text-align: center; }
    .target-string { font-size: 3rem; font-weight: 900; letter-spacing: 10px; color: var(--primary); text-shadow: 0 0 20px var(--primary); margin-bottom: 2rem; }
    .guess-input input { background: #000; border: 1px solid var(--primary); color: var(--primary); padding: 10px; text-align: center; font-size: 1.5rem; width: 200px; }

    .hex-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; }
    .hex-grid button { padding: 8px; font-size: 0.7rem; }
    .hex-grid button.glow { background: var(--primary); color: #000; box-shadow: 0 0 15px var(--primary); }

    .port-matrix { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
    .port-node { padding: 10px; border: 1px solid rgba(0, 255, 159, 0.2); text-align: center; cursor: pointer; }
    .port-node.scanned { border-color: var(--primary); background: rgba(0, 255, 159, 0.1); }
    .p-freq { font-size: 0.8rem; font-weight: bold; }
    .p-id { font-size: 0.5rem; opacity: 0.5; }

    .buffer-game { width: 100%; text-align: center; }
    .buffer-bar { height: 20px; background: rgba(255, 255, 255, 0.1); margin: 20px 0; border: 1px solid var(--primary); }
    .buffer-bar .fill { height: 100%; background: var(--primary); transition: width 0.1s linear; }

    .ops-footer { padding: 1rem; border-top: 1px solid rgba(0, 255, 159, 0.1); display: flex; justify-content: flex-end; }

    @keyframes blink { 50% { opacity: 0.3; } }
  `
})
export class MissionComponent implements OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);

  selectedMission = signal<Mission | null>(null);
  activeMission = signal<Mission | null>(null);
  missionTimer = signal(0);
  private timerInterval: any;

  // Minigame State
  correctSequence = signal<string[]>([]);
  currentCode = signal<string>('');
  glowingChar = signal<string | null>(null);
  bufferFill = signal(0);

  targetString = signal('');
  currentGuess = '';
  guessFeedback = signal('INITIATING_DECRYPTION...');
  
  ports = signal<any[]>([]);
  targetFrequency = signal(0);
  private freqInterval: any;

  startMission(m: Mission) {
    this.activeMission.set(m);
    const difficulty = m.difficulty ?? 1;
    this.missionTimer.set(difficulty * 30 + 30);
    this.initMinigame(m);
    
    this.timerInterval = setInterval(() => {
      this.missionTimer.update(t => t - 1);
      if (this.missionTimer() <= 0) this.failMission();
      
      if (this.activeMission()?.type === 'brute-force' && Math.random() > 0.7) {
          const seq = this.correctSequence();
          this.glowingChar.set(seq[Math.floor(Math.random() * seq.length)]);
          setTimeout(() => this.glowingChar.set(null), 800);
      }
    }, 1000);
  }

  private initMinigame(m: Mission) {
    if (m.type === 'brute-force') {
      const hex = '0123456789ABCDEF'.split('');
      const seq = [];
      for (let i = 0; i < 4; i++) {
        seq.push(hex[Math.floor(Math.random() * hex.length)]);
      }
      this.correctSequence.set(seq);
      this.targetString.set(seq.join(''));
    } else if (m.type === 'port-scan') {
      this.targetFrequency.set(Math.floor(Math.random() * 900) + 100);
      const p = [];
      for (let i = 0; i < 18; i++) {
        p.push({ frequency: Math.floor(Math.random() * 900) + 100, scanned: false });
      }
      this.ports.set(p);
      this.startFrequencyDrift();
    } else if (m.type === 'buffer-overflow') {
        this.bufferFill.set(0);
    }
  }

  tryCode(char: string) {
    const current = this.currentCode();
    if (current.length < 4) {
      this.currentCode.set(current + char);
      if (this.currentCode().length === 4) {
        if (this.currentCode() === this.targetString()) {
          this.winMission();
        } else {
          this.audioService.playError();
          this.currentCode.set('');
          this.missionTimer.update(t => Math.max(0, t - 5));
          this.gameService.increaseDetection(5);
        }
      }
    }
  }

  addBytes(amount: number) {
    this.bufferFill.update(v => v + amount);
    if (this.bufferFill() > 100) {
      this.gameService.increaseDetection(100);
      this.failMission();
    } else if (this.bufferFill() === 100) {
      this.winMission();
    }
  }

  private startFrequencyDrift() {
    this.freqInterval = setInterval(() => {
      this.ports.update(ps => ps.map(p => ({
        ...p,
        frequency: p.scanned ? p.frequency : Math.floor(Math.random() * 900) + 100
      })));
    }, 100);
  }

  checkGuess() {
    if (this.currentGuess.toUpperCase() === this.targetString()) {
      this.winMission();
    } else {
      this.guessFeedback.set('SYNC_ERROR: RE-ATTEMPTING...');
      this.currentGuess = '';
      this.audioService.playError();
    }
  }

  scanPort(port: any) {
    port.scanned = true;
    if (Math.abs(port.frequency - this.targetFrequency()) < 50) {
      this.winMission();
    } else {
      this.gameService.increaseDetection(10);
      this.audioService.playError();
    }
  }

  winMission() {
    if (this.activeMission()) {
      this.gameService.completeMission(this.activeMission()!);
      this.audioService.playSuccess();
      this.closeMission();
    }
  }

  failMission() {
    if (this.activeMission()) {
      this.gameService.failMission(this.activeMission()!);
      this.audioService.playError();
      this.closeMission();
    }
  }

  cancelMission() {
    this.closeMission();
  }

  private closeMission() {
    this.activeMission.set(null);
    clearInterval(this.timerInterval);
    clearInterval(this.freqInterval);
  }

  getDiffLabel(d: number) {
    if (d <= 1) return 'LOW';
    if (d <= 2) return 'MED';
    if (d <= 3) return 'HIGH';
    return 'CRIT';
  }

  getDiffClass(d: number) {
    if (d <= 1) return 'diff-low';
    if (d <= 2) return 'diff-med';
    if (d <= 3) return 'diff-high';
    return 'diff-crit';
  }

  ngOnDestroy() {
    this.closeMission();
  }
}
