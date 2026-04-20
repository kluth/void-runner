import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="events-monolith">
      <div class="events-status">
        <span class="noise-data">EVENT_SCAN: ACTIVE</span>
        <div class="pulse-indicator"></div>
      </div>

      @if (gameService.globalEvent() !== 'NONE') {
        <div class="active-event glass-overlay" [class]="gameService.globalEvent()">
          <div class="e-top">
            <span class="e-id">ID: 0x_{{ gameService.globalEvent().substring(0,4) }}</span>
            <span class="e-timer">{{ gameService.eventTimer() }}s</span>
          </div>
          <div class="e-title">{{ gameService.globalEvent().replace('_', ' ') }}</div>
          <p class="e-desc">{{ getEventDesc(gameService.globalEvent()) }}</p>
          
          <div class="e-progress">
             <div class="p-bar"><div class="p-fill" [style.width.%]="(gameService.eventTimer() / 300) * 100"></div></div>
          </div>
        </div>
      } @else {
        <div class="idle-status">
           <div class="noise-line">SCANNING_FREQUENCIES...</div>
           <div class="noise-line">NO_GLOBAL_ANOMALIES_DETECTED</div>
        </div>
      }

      <div class="net-telemetry">
         <div class="t-row">
            <span class="t-label">REAL_WORLD_ENTROPY:</span>
            <span class="t-val">{{ gameService.realWorldState()?.entropy || 'STABLE' }}</span>
         </div>
         <div class="t-row">
            <span class="t-label">UPLINK_STRENGTH:</span>
            <span class="t-val">99.8%</span>
         </div>
      </div>
    </div>
  `,
  styles: `
    .events-monolith {
      background: var(--layer-1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .events-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--layer-2);
      padding: 8px 12px;
    }

    .pulse-indicator {
      width: 8px; height: 8px;
      background: var(--secondary);
      box-shadow: 0 0 10px var(--secondary);
      animation: pulse 1.5s steps(2) infinite;
    }
    @keyframes pulse { from { opacity: 1; } to { opacity: 0.3; } }

    .active-event {
      padding: 1.5rem;
      border-left: 4px solid var(--primary);
      position: relative;
    }
    .active-event.CTF_ACTIVE { border-color: var(--secondary); }
    .active-event.ZERO_DAY_PANIC { border-color: var(--tertiary); }
    
    .e-top { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; }
    .e-timer { color: var(--secondary); font-weight: 900; }
    
    .e-title { font-size: 1.1rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    .e-desc { font-size: 0.65rem; color: #fff; opacity: 0.6; line-height: 1.4; margin-bottom: 1.5rem; }

    .e-progress { height: 1px; background: var(--layer-0); }
    .p-fill { height: 100%; background: var(--secondary); box-shadow: 0 0 5px var(--secondary); }

    .idle-status {
       background: var(--layer-0);
       padding: 1.5rem;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.55rem;
       display: flex;
       flex-direction: column;
       gap: 4px;
       opacity: 0.3;
    }

    .net-telemetry {
       display: flex;
       flex-direction: column;
       gap: 6px;
    }
    .t-row { display: flex; justify-content: space-between; font-size: 0.55rem; font-weight: 900; }
    .t-label { opacity: 0.4; }
    .t-val { color: var(--secondary); }
  `
})
export class LiveEventsComponent {
  gameService = inject(GameService);

  getEventDesc(event: string): string {
    switch (event) {
      case 'CTF_ACTIVE': return 'Capture The Flag is live. Mission Experience and Reputation rewards are DOUBLED.';
      case 'PATCH_TUESDAY': return 'Security updates are rolling out. Trace levels decrease 2x slower, but exploits are harder to succeed.';
      case 'ZERO_DAY_PANIC': return 'A high-profile vulnerability is in the wild! Mission rewards doubled, but Trace increases 2x faster.';
      default: return 'Network traffic is stable. Routine operations advised.';
    }
  }
}
