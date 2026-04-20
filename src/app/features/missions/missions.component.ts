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
    <div class="missions-container">
      <div class="noise-data" style="top:4px; right:6px;">MISSION_PROTOCOL_ACTIVE</div>
      
      @if (!activeMission()) {
        <div class="mission-hub">
          <div class="hub-header">
            <h3>ACTIVE_CONTRACTS_NODE</h3>
            <div class="det-meter">
               <span class="det-label">GLOBAL_TRACE_DETECTION:</span>
               <div class="det-bar"><div class="det-fill" [style.width.%]="gameService.detectionLevel()"></div></div>
               <span class="det-val">{{ gameService.detectionLevel() }}%</span>
            </div>
          </div>

          <div class="contract-grid">
            @for (mission of gameService.activeMissions(); track mission.id) {
              <div class="contract-card" [class.rare]="mission.reward > 1000">
                <div class="c-top">
                   <span class="c-type">[{{ mission.type.toUpperCase() }}]</span>
                   <span class="c-id">ID: {{ mission.id.substring(0,6) }}</span>
                </div>
                <div class="c-name">{{ mission.name }}</div>
                <div class="c-target">TARGET: {{ mission.target }}</div>
                
                <div class="c-reward-strip">
                   <span class="r-label">COMPENSATION:</span>
                   <span class="r-val">{{ mission.reward }}cr</span>
                </div>

                <div class="c-actions">
                   <button class="primary" (click)="startMission(mission)">INIT_HANDSHAKE</button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="active-ops-view">
           <div class="ops-header">
              <span class="blink">[!]</span> OPR: {{ activeMission()?.name }} // STATUS: IN_PROGRESS
           </div>

           <div class="mini-game-chamber holographic-viz">
              <div class="chamber-noise">VECTOR_BUFFER: {{ byteBuffer() }}</div>
              
              @if (activeMission()?.type === 'port-scan') {
                 <div class="ports-matrix">
                    @for (port of ports(); track $index) {
                       <div class="port-cell" 
                            [class.scanned]="port.scanned" 
                            [class.open]="port.open"
                            (click)="scanPort(port)">
                          {{ port.num }}
                       </div>
                    }
                 </div>
              }

              @if (activeMission()?.type === 'brute-force') {
                 <div class="brute-chamber">
                    <div class="code-readout">{{ currentCode() }}</div>
                    <div class="code-grid">
                       @for (char of '0123456789ABCDEF'.split(''); track char) {
                          <button (click)="tryCode(char)">{{ char }}</button>
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

           <button class="abort-btn" (click)="stopMission()">ABORT_DEPLOYMENT</button>
        </div>
      }
    </div>
  `,
  styles: `
    .missions-container {
      background: var(--layer-1);
      height: 100%;
      padding: 24px;
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
      padding: 15px 20px;
      margin-bottom: 2rem;
    }

    h3 { font-size: 0.9rem; font-weight: 900; letter-spacing: 2px; }

    .det-meter { display: flex; align-items: center; gap: 12px; }
    .det-label { font-size: 0.55rem; opacity: 0.4; font-weight: 900; }
    .det-bar { width: 100px; height: 2px; background: var(--layer-0); }
    .det-fill { height: 100%; background: var(--tertiary); box-shadow: 0 0 10px var(--tertiary); }
    .det-val { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--tertiary); }

    .contract-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
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
    .c-name { font-size: 1.1rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
    .c-target { font-size: 0.65rem; color: var(--primary); opacity: 0.6; font-family: 'JetBrains Mono', monospace; }

    .c-reward-strip {
      background: var(--layer-0);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .r-label { font-size: 0.5rem; font-weight: 900; opacity: 0.4; }
    .r-val { font-size: 0.9rem; font-weight: 900; color: var(--secondary); }

    .active-ops-view {
       display: flex;
       flex-direction: column;
       height: 100%;
       gap: 2rem;
    }

    .mini-game-chamber {
       flex-grow: 1;
       background: var(--layer-0);
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       position: relative;
       padding: 3rem;
    }

    .ports-matrix {
       display: grid;
       grid-template-columns: repeat(6, 1fr);
       gap: 10px;
    }
    .port-cell {
       background: var(--layer-2);
       padding: 15px 5px;
       text-align: center;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.7rem;
       cursor: pointer;
       opacity: 0.4;
    }
    .port-cell.scanned { opacity: 0.8; background: var(--layer-3); }
    .port-cell.open { background: var(--secondary); color: #000; opacity: 1; box-shadow: 0 0 15px var(--secondary); }

    .code-readout {
       font-size: 2.5rem;
       font-weight: 900;
       color: #fff;
       letter-spacing: 0.5rem;
       margin-bottom: 2rem;
       text-shadow: 0 0 10px var(--primary);
    }
    .code-grid {
       display: grid;
       grid-template-columns: repeat(4, 1fr);
       gap: 8px;
    }
    .code-grid button { padding: 10px; font-size: 0.8rem; background: var(--layer-3); }

    .abort-btn { 
       background: transparent; 
       border: 1px solid var(--tertiary); 
       color: var(--tertiary); 
       align-self: center;
       font-size: 0.65rem;
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
    
    if (mission.type === 'port-scan') {
      const p = [];
      for (let i = 0; i < 24; i++) {
        p.push({ num: Math.floor(Math.random() * 9000) + 100, scanned: false, open: Math.random() > 0.8 });
      }
      this.ports.set(p);
    }
  }

  scanPort(port: any) {
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
       if (Math.random() > 0.5) this.winMission();
       else this.currentCode.set('');
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
