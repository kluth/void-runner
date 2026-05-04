import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoOverlayService } from '../../core/services/info-overlay.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-info-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (info.visible()) {
      <div class="info-overlay glass-overlay" (click)="close()">
        <div class="info-box terminal-frame" (click)="$event.stopPropagation()">
          <div class="ascii-line cyan">{{ info.title() }}</div>
          <div class="info-content" [innerHTML]="info.content()"></div>
          <button class="primary w-full mt-4" (click)="close()">[ ACKNOWLEDGE ]</button>
        </div>
      </div>
    }
  `,
  styles: `
    .info-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      z-index: 20000; display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
    }
    .info-box {
      background: var(--layer-1);
      width: 100%; max-width: 500px;
      padding: 1.5rem;
      display: flex; flex-direction: column; gap: 1rem;
      box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
    }
    .info-content {
      font-size: 0.75rem;
      line-height: 1.5;
      color: #ccc;
    }
    .info-content p { margin-bottom: 0.5rem; }
    .info-content strong { color: var(--primary); }
  `
})
export class InfoOverlayComponent {
  info = inject(InfoOverlayService);
  audio = inject(AudioService);

  close() {
    this.info.close();
    this.audio.playClick();
  }
}
