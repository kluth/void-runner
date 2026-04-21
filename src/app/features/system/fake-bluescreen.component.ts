import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-fake-bluescreen',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="bluescreen-overlay" (click)="dismiss()">
        <div class="bluescreen-content">
          <div class="sad-face">:(</div>
          <h1>Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</h1>
          <div class="progress-container">
            <div class="progress-bar" [style.width.%]="progress()"></div>
          </div>
          <div class="error-code">
            <p>For more information about this issue and possible fixes, visit https://www.windows.com/stopcode</p>
            <p class="stopcode">STOP CODE: {{ errorCode() }}</p>
            <p class="stopcode">What failed: {{ failedModule() }}</p>
          </div>
          <div class="qr-code">
            <div class="qr-placeholder">QR CODE</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .bluescreen-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #0078D7;
      color: #fff;
      font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      z-index: 99999;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 10vh 10vw;
      animation: bsod-flicker 0.1s infinite;
      cursor: pointer;
    }

    .bluescreen-content {
      max-width: 800px;
    }

    .sad-face {
      font-size: 120px;
      margin-bottom: 40px;
      line-height: 1;
    }

    h1 {
      font-size: 24px;
      font-weight: 400;
      margin-bottom: 40px;
      line-height: 1.4;
    }

    .progress-container {
      width: 300px;
      height: 5px;
      background: rgba(255, 255, 255, 0.3);
      margin-bottom: 40px;
    }

    .progress-bar {
      height: 100%;
      background: #fff;
      transition: width 0.5s ease;
    }

    .error-code {
      margin-bottom: 40px;
    }

    .error-code p {
      font-size: 14px;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .stopcode {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 16px !important;
    }

    .qr-code {
      position: absolute;
      right: 10vw;
      top: 10vh;
    }

    .qr-placeholder {
      width: 150px;
      height: 150px;
      background: #fff;
      color: #0078D7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }

    @keyframes bsod-flicker {
      0%, 90%, 100% { opacity: 1; }
      95% { opacity: 0.95; }
    }
  `
})
export class FakeBluescreenComponent implements OnInit, OnDestroy {
  private onboard = inject(OnboardAiService);
  private game = inject(GameService);

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
