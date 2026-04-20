import { Component, inject, signal, OnDestroy } from '@angular/core';
import { GameService, Mission } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                 <div class="ports-matrix" role="grid" aria-label="Port Matrix Scan">
                    @for (port of ports(); track $index) {
                       <button class="port-cell" 
                            [class.scanned]="port.scanned" 
                            [class.open]="port.open"
                            (click)="scanPort(port)"
                            [attr.aria-label]="'Port ' + port.num + (port.open ? ' is open' : '')">
                          {{ port.num }}
                       </button>
                    }
                 </div>
              }

              @if (activeMission()?.type === 'brute-force') {
                 <div class="brute-chamber">
                    <div class="code-readout" aria-live="polite" aria-label="Code entered: {{ currentCode() }}">{{ currentCode() }}</div>
                    <div class="code-grid">
                       @for (char of '0123456789ABCDEF'.split(''); track char) {
                          <button (click)="tryCode(char)" [attr.aria-label]="'Enter ' + char">{{ char }}</button>
                       }
                    </div>
                 </div>
              }

              @if (activeMission()?.type !== 'port-scan' && activeMission()?.type !== 'brute-force') {
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

    .ports-matrix {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
       gap: 8px;
       width: 100%;
       max-width: 500px;
    }
    .port-cell {
       background: var(--layer-2);
       padding: 15px 5px;
       text-align: center;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.7rem;
       cursor: pointer;
       opacity: 0.6;
       border: none;
       color: var(--primary);
    }
    .port-cell:hover { background: var(--layer-3); opacity: 1; }
    .port-cell.scanned { opacity: 0.4; background: var(--layer-1); }
    .port-cell.open { background: var(--secondary); color: #000; opacity: 1; box-shadow: 0 0 15px var(--secondary); }

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
    .code-grid button { padding: 12px; font-size: 1rem; background: var(--layer-3); }

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
  currentCode = signal('');
  byteBuffer = signal('0x00');

  startMission(mission: Mission) {
    this.activeMission.set(mission);
    this.audioService.playClick();
    this.gameService.log(`DEPLOYING_PROTOCOL: ${mission.name}...`);
    this.gameService.triggerVisualEvent(mission.lat, mission.lng, 'pulse', '#0df2f2');
    
    if (mission.type === 'port-scan') {
      const p = [];
      for (let i = 0; i < 18; i++) {
        p.push({ num: Math.floor(Math.random() * 9000) + 100, scanned: false, open: Math.random() > 0.85 });
      }
      this.ports.set(p);
    }
  }

  scanPort(port: any) {
    if (port.scanned) return;
    port.scanned = true;
    this.audioService.playClick();
    this.byteBuffer.set('0x' + Math.floor(Math.random()*255).toString(16).toUpperCase());
    if (port.open) {
       this.winMission();
    }
  }

  tryCode(char: string) {
    this.currentCode.update(c => (c + char).substring(0, 4));
    this.audioService.playClick();
    if (this.currentCode().length === 4) {
       if (Math.random() > 0.6) this.winMission();
       else {
          this.gameService.log('ERR: SYNC_FAIL. REBOOTING_CODE_BUFFER.');
          this.currentCode.set('');
       }
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
  }

  ngOnDestroy() {}
}
