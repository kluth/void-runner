import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-system-shatter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shatter-overlay" *ngIf="game.isShattered()">
      <div class="crack-line l1"></div>
      <div class="crack-line l2"></div>
      <div class="crack-line l3"></div>
      
      <div class="failure-msg">
        <h1 class="glitch-text">SYSTEM_SHATTER</h1>
        <p>CRITICAL_KERNEL_COLLAPSE // REBOOTING...</p>
      </div>
    </div>
  `,
  styles: `
    .shatter-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; z-index: 999999;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; color: var(--neon-magenta);
      animation: shatter-entry 0.1s steps(2) infinite;
    }
    .crack-line {
      position: absolute; background: var(--neon-magenta); opacity: 0.8;
    }
    .l1 { top: 30%; left: 0; width: 100%; height: 2px; transform: rotate(5deg); }
    .l2 { top: 60%; left: 0; width: 100%; height: 2px; transform: rotate(-8deg); }
    .l3 { top: 0; left: 50%; width: 2px; height: 100%; transform: rotate(15deg); }

    .failure-msg { text-align: center; font-family: 'Orbitron', monospace; }
    
    @keyframes shatter-entry {
      0%, 100% { filter: invert(0); transform: none; }
      50% { filter: invert(1); transform: scale(1.05) translate(10px, 10px); }
    }
  `
})
export class SystemShatterComponent {
  game = inject(GameService);
}
