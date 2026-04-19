import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hijack-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (gameService.isHijacked()) {
      <div class="hijack-container">
        <div class="glitch-overlay"></div>
        <div class="ascii-background">
          <pre>{{ currentAscii() }}</pre>
        </div>
        
        <div class="hijack-content">
          <div class="warning-text">NEURAL_OVERRIDE_ACTIVE // SOURCE: UNKNOWN</div>
          <div class="anonymous-header">WE ARE THE VOID. WE DO NOT FORGET.</div>
          
          <div class="message-stream">
            <span class="cursor">></span> {{ gameService.hijackMessage() }}
          </div>
          
          <div class="challenge-box">
             <label>DECRYPT_CHALLENGE:</label>
             <input type="text" 
                    [(ngModel)]="solveInput" 
                    placeholder="PROVIDE_SOLUTION..." 
                    (keyup.enter)="release()">
             <div class="hint">The Void demands an answer. Listen to its pulse.</div>
          </div>

          <div class="actions">
            <button class="release-btn" [disabled]="!solveInput" (click)="release()">PURGE_SESSION</button>
            <button class="replay-btn" (click)="replay()">RECAPTURE_SIGNAL</button>
          </div>
        </div>

        <div class="status-bars">
           <div class="bar left">TRACING_LOCATION... 94%</div>
           <div class="bar right">UPLINK_STABILITY: CRITICAL</div>
        </div>
      </div>
    }
  `,
  styles: `
    .hijack-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #000; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      color: #f00; font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
    }

    .ascii-background {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      opacity: 0.25; font-size: 0.7vw; line-height: 1.1;
      pointer-events: none; user-select: none;
      animation: flicker 0.15s infinite;
      color: #f00;
    }

    @keyframes flicker {
      0% { opacity: 0.20; transform: skewX(-1deg); }
      50% { opacity: 0.30; transform: skewX(1deg); }
      100% { opacity: 0.25; transform: skewX(0); }
    }

    .glitch-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: repeating-linear-gradient(0deg, rgba(255,0,0,0.08) 0px, rgba(255,0,0,0.08) 1px, transparent 2px, transparent 4px);
      pointer-events: none; z-index: 5;
    }

    .hijack-content { 
      position: relative; z-index: 10;
      text-align: center; max-width: 800px; padding: 60px; 
      border: 2px solid #f00; box-shadow: 0 0 120px rgba(255,0,0,0.4); 
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(8px);
      transform: perspective(1000px) rotateX(2deg);
    }
    
    .warning-text { font-size: 0.8em; letter-spacing: 4px; margin-bottom: 25px; color: #800; font-weight: bold; }
    .anonymous-header { 
      font-size: 1.8em; font-weight: 900; margin-bottom: 35px; 
      text-transform: uppercase; letter-spacing: -2px;
      text-shadow: 0 0 15px #f00, 0 0 30px #f00;
    }

    .message-stream { font-size: 1.3em; line-height: 1.5; margin-bottom: 50px; min-height: 120px; color: #fff; }
    .cursor { animation: blink 0.5s infinite; color: #f00; }
    @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

    .challenge-box { margin-bottom: 50px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .challenge-box label { font-size: 0.7em; color: #800; font-weight: bold; letter-spacing: 2px; }
    .challenge-box input { 
        background: rgba(40,0,0,0.3); border: 2px solid #800; color: #f00; padding: 20px; 
        font-family: inherit; font-size: 1.5em; text-align: center; width: 100%;
        outline: none; text-transform: uppercase; box-shadow: inset 0 0 10px #000;
    }
    .challenge-box input:focus { border-color: #f00; box-shadow: 0 0 20px #f00, inset 0 0 10px #000; }
    .challenge-box .hint { font-size: 0.6em; color: #800; font-style: italic; margin-top: 5px; }

    .actions { display: flex; gap: 20px; justify-content: center; }

    .release-btn, .replay-btn {
      background: transparent; border: 2px solid #f00; color: #f00;
      padding: 15px 50px; cursor: pointer; font-family: inherit; font-size: 0.9em;
      transition: all 0.3s; font-weight: 900; text-transform: uppercase;
      letter-spacing: 2px;
    }
    .release-btn:hover:not(:disabled), .replay-btn:hover { background: #f00; color: #000; box-shadow: 0 0 40px #f00; }
    .release-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .replay-btn { border-color: #800; color: #800; }

    .status-bars {
      position: absolute; bottom: 0; left: 0; width: 100%; 
      display: flex; justify-content: space-between; padding: 30px;
      font-size: 0.7em; color: #600; font-weight: bold; letter-spacing: 3px;
    }
  `
})
export class HijackOverlayComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  solveInput = '';
  private repeatInterval: ReturnType<typeof setInterval> | null = null;
  private asciiTimer: ReturnType<typeof setInterval> | null = null;
  
  currentAsciiIndex = signal(0);

  private asciiArts = [
    // 1. Detailed fsociety Mask
    `
                 MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
             MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
          MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
        MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
       MMMMMMWNXK00KKXNWMMMMMMMMMMMMMMMMMMMWX00KKXNWMMMMMM
      MMMMMXx:''....'';cdOXWMMMMMMMMMMMWXOdc;''....'':xXMMM
     MMMMNo.   .::::.    .,o0WMMMMMMW0o,.    .::::.   .oNMM
    MMMM0;    :O0KK0O:      .oXMMMMXo.      :O0KK0O:    ;0MM
    MMMWl     xKKKKKKx       .kMMMMk.       xKKKKKKx     lWM
    MMMN:     cO0KK0Oc       .kMMMMk.       cO0KK0Oc     :NM
    MMMWo      .;::;.       .oXMMMMXo.       .;::;.      oWM
    MMMMXo.               .ckWMMMMMMWkc.               .oXMM
     MMMMWKdc,.      ..;cxKWMMMMMMMMMMWKxc;..      .,cdKWMM
      MMMMMMMWNXK00KXNWMMMMMMMMMMMMMMMMMMMMWNXK00KXNWMMMMMM
        MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
          MMMMMMMMMMMMMMMMMMMWWWWWWWMMMMMMMMMMMMMMMMMM
            MMMMMMMMMMMWKOxdollllllodxOKWMMMMMMMMMMM
               MMMMMMW0o;..        ..;o0WMMMMMM
                 MMMMXo.              .oXMMMM
                  MMWl      ......      lWM
                  MMN:     ........     :NM
                  MMWl      ......      lWM
                   NKd.                .dKN
    `,
    // 2. High-Density Binary Skull
    `
                00000000000000000000000000
             00000000000000000000000000000000
           000000000000000000000000000000000000
          00000000000000000000000000000000000000
         0000000111110000000000000000111110000000
        000000111111111000000000000111111111000000
        000000111  1111000000000000111  1111000000
        000000111111111000000000000111111111000000
         0000000111110000000000000000111110000000
          00000000000000000000000000000000000000
           000000000000011111111000000000000000
             000000000011111111110000000000
               0000000011 11 11 1100000000
                 00000011 11 11 11000000
                    0001111111111000
    `,
    // 3. Detailed Void Eye
    `
                         .::::::::.
                     .::::::::::::::::.
                  .::::::::::::::::::::::.
                .::::::::::::::::::::::::::.
               ::::::::::::::::::::::::::::::
              ::::::::::::::::::::::::::::::::
             :::::::     ::::::::::     :::::::
            :::::::  ****  ::::::  ****  :::::::
            :::::::  ****  ::::::  ****  :::::::
             :::::::     ::::::::::     :::::::
              ::::::::::::::::::::::::::::::::
               ::::::::::::::::::::::::::::::
                '::::::::::::::::::::::::::'
                  '::::::::::::::::::::::'
                     '::::::::::::::::'
                         '::::::::'
    `,
    // 4. fsociety Stylized Logo
    `
        __________                 .__         __          
        \\______   \\__ __  ____   __|  |   ____/  |_ ___.__.
         |       _/  |  \\/    \\ /  _  | _/ __ \\   __<   |  |
         |    |   \\  |  /   |  \\  <_>  |\\  ___/|  |  \\___  |
         |____|_  /____/|___|  /\\_____  / \\___  >__|  / ____|
                \\/           \\/       \\/      \\/      \\/     
    `
  ];

  currentAscii = computed(() => this.asciiArts[this.currentAsciiIndex()]);

  ngOnInit() {
    this.startRepeatLoop();
    this.startAsciiLoop();
  }

  ngOnDestroy() {
    this.stopRepeatLoop();
    this.stopAsciiLoop();
  }

  private startRepeatLoop() {
    this.repeatInterval = setInterval(() => {
        if (this.gameService.isHijacked() && this.gameService.hijackMessage()) {
            this.audioService.speakCreepy(this.gameService.hijackMessage());
        }
    }, 20000);
  }

  private stopRepeatLoop() {
    if (this.repeatInterval) clearInterval(this.repeatInterval);
  }

  private startAsciiLoop() {
    this.asciiTimer = setInterval(() => {
      this.currentAsciiIndex.update(i => (i + 1) % this.asciiArts.length);
    }, 2500);
  }

  private stopAsciiLoop() {
    if (this.asciiTimer) clearInterval(this.asciiTimer);
  }

  replay() {
    this.audioService.speakCreepy(this.gameService.hijackMessage());
  }

  release() {
    if (this.solveInput.trim().toUpperCase() === this.gameService.hijackUnlockCode().toUpperCase()) {
        this.gameService.isHijacked.set(false);
        this.gameService.hijackMessage.set('');
        this.gameService.hijackUnlockCode.set('');
        this.solveInput = '';
        this.stopRepeatLoop();
        this.gameService.log('SYSTEM_PURGE: Session regained. Neural link stabilized.');
    } else {
        this.gameService.log('ERR: SYNC_CODE_MISMATCH. The machine laughs.');
        this.solveInput = '';
        this.audioService.playError();
    }
  }
}
