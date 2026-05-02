import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScribeService } from '../../core/services/scribe.service';

@Component({
  selector: 'app-margin-scribe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scribe-margin">
      @for (log of scribe.scribeLogs(); track log.timestamp) {
        <div class="scribe-entry">
          <div class="entry-time">{{ formatTime(log.timestamp) }}</div>
          <div class="entry-text glitch-on-appear">{{ log.text }}</div>
        </div>
      }
    </div>
  `,
  styles: `
    .scribe-margin {
      position: fixed; top: 0; right: 0; width: 150px; height: 100%;
      padding: 10px; z-index: 100;
      background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.4));
      pointer-events: none;
      display: flex; flex-direction: column; gap: 15px;
      overflow: hidden;
    }
    .scribe-entry {
      opacity: 0.7; border-right: 1px solid var(--primary);
      padding-right: 5px; text-align: right;
    }
    .entry-time { font-size: 0.5rem; color: var(--neon-cyan); opacity: 0.5; }
    .entry-text { 
      font-size: 0.6rem; color: var(--primary); 
      font-style: italic; line-height: 1.2;
    }
    .glitch-on-appear {
      animation: type 0.5s steps(20);
    }
    @keyframes type {
      from { width: 0; }
      to { width: 100%; }
    }
  `
})
export class MarginScribeComponent {
  scribe = inject(ScribeService);

  formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
