import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="window-frame" 
         [style.left.px]="win.x" 
         [style.top.px]="win.y" 
         [style.width.px]="win.w" 
         [style.height.px]="win.h"
         [style.z-index]="win.z"
         [class.active]="gameService.activeWindowId() === win.id"
         (mousedown)="gameService.focusWindow(win.id)">
      
      <div class="window-header">
        <div class="win-title">{{ win.title }}</div>
        <div class="win-controls">
          <button (click)="gameService.closeWindow(win.id)">[X]</button>
        </div>
      </div>
      
      <div class="window-content">
        <ng-content></ng-content>
      </div>
      
      <div class="win-resize-handle"></div>
    </div>
  `,
  styles: `
    .window-frame {
      position: absolute;
      background: var(--layer-1);
      border: 1px solid rgba(0, 255, 159, 0.3);
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .window-frame.active {
      border-color: var(--neon-cyan);
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
    }
    .window-header {
      background: rgba(0, 255, 159, 0.1);
      padding: 4px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      font-size: 0.7rem;
      font-family: 'Orbitron', monospace;
      user-select: none;
    }
    .window-frame.active .window-header {
      background: rgba(0, 229, 255, 0.2);
      color: var(--neon-cyan);
    }
    .win-controls button {
      background: transparent;
      border: none;
      color: inherit;
      padding: 0;
      margin-left: 10px;
      font-size: 0.8rem;
    }
    .window-content {
      flex: 1;
      overflow: auto;
      background: #000;
    }
    .win-resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, var(--primary) 50%);
    }

    @media (max-width: 850px) {
      .window-frame {
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: calc(100% - 60px) !important;
        border: none;
      }
      .win-resize-handle {
        display: none;
      }
    }
  `
})
export class WindowComponent {
  @Input({ required: true }) win!: any;
  gameService = inject(GameService);
}
