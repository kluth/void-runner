import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-container">
      <div class="ascii-header">
        ┌──────────────────────────────────────────────────┐
        │ SYSTEM_EVENTS // SCANNER                         │
        └──────────────────────────────────────────────────┘
      </div>

      <div class="events-status">
        <span class="status-label">│ STATUS: ACTIVE [SCANNING...]</span>
        <div class="pulse-block">█</div>
      </div>

      <div class="content-box">
        @if (gameService.globalEvent() !== 'NONE') {
          <div class="active-event" [class]="gameService.globalEvent()">
            <div class="e-border">┌── EVENT_DETECTED ─────────────────────────────</div>
            <div class="e-content">
              <div class="e-row">
                <span class="e-label">ID:</span> 0x_{{ gameService.globalEvent().substring(0,4) }}
                <span class="e-label" style="margin-left: 20px">TTL:</span> {{ gameService.eventTimer() }}s
              </div>
              <div class="e-title">{{ gameService.globalEvent().replace('_', ' ') }}</div>
              <div class="e-desc">{{ getEventDesc(gameService.globalEvent()) }}</div>
              
              <div class="e-progress-container">
                <span class="e-label">PROGRESS:</span>
                <div class="ascii-bar">
                  [{{ getProgressBar() }}]
                </div>
              </div>
            </div>
            <div class="e-border">└──────────────────────────────────────────────</div>
          </div>
        } @else {
          <div class="idle-status">
             <div class="noise-line">│ SCANNING_FREQUENCIES... [OK]</div>
             <div class="noise-line">│ NO_GLOBAL_ANOMALIES_DETECTED</div>
          </div>
        }
      </div>

      <div class="telemetry-box">
        <div class="t-border">┌── NET_TELEMETRY ──────────────────────────────</div>
        <div class="t-content">
           <div class="t-row">
              <span class="t-label">REAL_WORLD_ENTROPY:</span>
              <span class="t-val">{{ gameService.realWorldState()?.entropy || 'STABLE' }}</span>
           </div>
           <div class="t-row">
              <span class="t-label">UPLINK_STRENGTH:</span>
              <span class="t-val">99.8%</span>
           </div>
           <div class="t-row">
              <span class="t-label">ENCRYPTION_LAYER:</span>
              <span class="t-val">AES-256-QUANTUM</span>
           </div>
        </div>
        <div class="t-border">└──────────────────────────────────────────────</div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: #000;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .terminal-container {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ascii-header {
      white-space: pre;
      line-height: 1;
      font-size: 0.8rem;
    }

    .events-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      padding: 0 5px;
    }

    .pulse-block {
      color: var(--primary);
      animation: pulse 1s steps(2) infinite;
    }
    @keyframes pulse { from { opacity: 1; } to { opacity: 0; } }

    .e-border, .t-border {
      white-space: pre;
      line-height: 1;
      font-size: 0.8rem;
    }

    .e-content, .t-content {
      border-left: 1px solid var(--primary);
      padding: 0.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .e-row, .t-row {
      display: flex;
      gap: 10px;
      font-size: 0.7rem;
    }

    .e-label, .t-label {
      opacity: 0.6;
    }

    .e-title {
      font-size: 1rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .e-desc {
      font-size: 0.75rem;
      line-height: 1.4;
      opacity: 0.8;
    }

    .e-progress-container {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .ascii-bar {
      font-family: monospace;
      font-size: 0.8rem;
      letter-spacing: 2px;
    }

    .idle-status {
      padding: 1rem;
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .t-val {
      color: var(--secondary);
    }
  `
})
export class LiveEventsComponent {
  gameService = inject(GameService);

  getProgressBar(): string {
    const width = 20;
    const progress = Math.min(width, Math.max(0, (this.gameService.eventTimer() / 300) * width));
    return '█'.repeat(Math.floor(progress)) + ' '.repeat(width - Math.floor(progress));
  }

  getEventDesc(event: string): string {
    switch (event) {
      case 'CTF_ACTIVE': return 'Capture The Flag is live. Mission Experience and Reputation rewards are DOUBLED.';
      case 'PATCH_TUESDAY': return 'Security updates are rolling out. Trace levels decrease 2x slower, but exploits are harder to succeed.';
      case 'ZERO_DAY_PANIC': return 'A high-profile vulnerability is in the wild! Mission rewards doubled, but Trace increases 2x faster.';
      default: return 'Network traffic is stable. Routine operations advised.';
    }
  }
}
