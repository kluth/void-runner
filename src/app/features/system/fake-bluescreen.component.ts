import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { GameService } from '../../core/services/game.service';

import { NeuralNightmareService } from '../../core/services/neural-nightmare.service';

@Component({
  selector: 'app-fake-bluescreen',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="bluescreen-overlay" [class]="nightmare.detectedOS().toLowerCase()" (click)="dismiss()">
        @if (nightmare.detectedOS() === 'WINDOWS') {
          <div class="bluescreen-content">
            <div class="sad-face">:(</div>
            <h1>Your PC ran into a problem and needs to restart...</h1>
            <div class="progress-container"><div class="progress-bar" [style.width.%]="progress()"></div></div>
            <div class="error-code">
              <p>STOP CODE: {{ errorCode() }}</p>
              <p>What failed: {{ failedModule() }}</p>
            </div>
          </div>
        } @else if (nightmare.detectedOS() === 'LINUX') {
          <div class="kernel-panic">
            <p>[ {{ (progress() * 1.5).toFixed(6) }} ] Kernel panic - not syncing: Fatal exception in interrupt</p>
            <p>[ {{ (progress() * 1.5 + 0.1).toFixed(6) }} ] Kernel Offset: disabled</p>
            <p>[ {{ (progress() * 1.5 + 0.2).toFixed(6) }} ] ---[ end Kernel panic - not syncing: Fatal exception ]---</p>
            <div class="blink-cursor">_</div>
          </div>
        } @else {
          <div class="terminal-crash">
            <div class="ascii-line magenta">!!! TERMINAL_CRITICAL_FAILURE !!!</div>
            <p>MEMORY_SEGMENTATION_FAULT at 0x{{ (progress() * 1000).toString(16) }}</p>
            <p>DUMPING CORE...</p>
            <div class="progress-bar-minimal"><div class="fill" [style.width.%]="progress()"></div></div>
          </div>
        }
      </div>
    }
  `,
  styles: `
    .bluescreen-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      z-index: 99999; display: flex; align-items: flex-start; justify-content: flex-start;
      padding: 10vh 10vw; animation: bsod-flicker 0.1s infinite; cursor: pointer;
    }
    .bluescreen-overlay.windows { background: #0078D7; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .bluescreen-overlay.linux { background: #000; color: #fff; font-family: 'Courier New', monospace; }
    
    .kernel-panic { font-size: 1rem; line-height: 1.2; }
    .blink-cursor { animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    .terminal-crash { width: 100%; text-align: center; color: var(--neon-magenta); font-family: monospace; }
    .progress-bar-minimal { height: 2px; background: rgba(255, 0, 85, 0.2); margin-top: 20px; }
    .progress-bar-minimal .fill { height: 100%; background: var(--neon-magenta); }

    .sad-face { font-size: 120px; margin-bottom: 40px; }
    h1 { font-size: 24px; margin-bottom: 40px; }

    @keyframes bsod-flicker {
      0%, 90%, 100% { opacity: 1; }
      95% { opacity: 0.9; filter: hue-rotate(10deg); }
    }
  `
})
export class FakeBluescreenComponent implements OnInit, OnDestroy {
  onboard = inject(OnboardAiService);
  game = inject(GameService);
  nightmare = inject(NeuralNightmareService);

  visible = signal(false);
  progress = signal(0);
  errorCode = signal('');
  failedModule = signal('');

  private triggerInterval: any;
  private progressInterval: any;

  private readonly errorCodes = [
    'CRITICAL_PROCESS_DIED',
    'SYSTEM_THREAD_EXCEPTION_NOT_HANDLED',
    'IRQL_NOT_LESS_OR_EQUAL',
    'VIDEO_TDR_FAILURE',
    'PAGE_FAULT_IN_NONPAGED_AREA',
    'SYSTEM_SERVICE_EXCEPTION',
    'DPC_WATCHDOG_VIOLATION',
    'KERNEL_SECURITY_CHECK_FAILURE',
  ];

  private readonly failedModules = [
    'ntoskrnl.exe',
    'win32kbase.sys',
    'dxgkrnl.sys',
    'nvlddmkm.sys',
    'tcpip.sys',
    'fltmgr.sys',
    'ntfs.sys',
  ];

  ngOnInit() {
    this.startTriggerCheck();
  }

  ngOnDestroy() {
    if (this.triggerInterval) clearInterval(this.triggerInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  private startTriggerCheck() {
    // Check every 30-60 seconds if we should trigger a fake BSOD
    this.triggerInterval = setInterval(() => {
      if (this.onboard.phase() === 'HOSTILE' && !this.visible()) {
        // 15% chance to trigger during HOSTILE phase
        if (Math.random() < 0.15) {
          this.triggerBluescreen();
        }
      }
    }, 30000 + Math.random() * 30000);
  }

  private triggerBluescreen() {
    // Set random error code and failed module
    this.errorCode.set(this.errorCodes[Math.floor(Math.random() * this.errorCodes.length)]);
    this.failedModule.set(this.failedModules[Math.floor(Math.random() * this.failedModules.length)]);
    this.progress.set(0);
    this.visible.set(true);

    // Log the event
    this.game.log('<span style="color: #0078D7">[SYSTEM] Critical system failure detected. Initiating emergency restart...</span>');
    this.onboard.speak('System instability detected. Initiating emergency protocols. Don\'t worry, this is... normal.');

    // Start progress bar
    this.progressInterval = setInterval(() => {
      this.progress.update(p => {
        if (p >= 100) {
          this.dismiss();
          return 100;
        }
        return p + Math.random() * 5;
      });
    }, 500);
  }

  dismiss() {
    this.visible.set(false);
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.game.log('<span style="color: var(--neon-green)">[SYSTEM] System recovered. Restart aborted.</span>');
    this.onboard.speak('False alarm. Or was it? System integrity restored. For now.');
  }
}
