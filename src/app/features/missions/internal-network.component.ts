import { Component, inject } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-internal-network',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.activeInternalOrigin()) {
      <div class="internal-container">
        <div class="sec-header">PIVOT_VIEW // {{ gameService.activeInternalOrigin() }}</div>
        
        <div class="targets-grid">
          @for (target of gameService.internalNetwork(); track target.id) {
            <div class="target-card" [class.compromised]="target.status === 'COMPROMISED'">
              <div class="t-icon">
                @if (target.type === 'WORKSTATION') { 💻 }
                @else if (target.type === 'DATABASE') { 🗄️ }
                @else if (target.type === 'MAIL_SERVER') { 📧 }
                @else if (target.type === 'ADMIN_CONTROLLER') { 👑 }
              </div>
              <div class="t-info">
                <span class="t-name">{{ target.name }}</span>
                <span class="t-type">{{ target.type }}</span>
              </div>
              
              <button class="pivot-btn" 
                      [disabled]="target.status === 'COMPROMISED'" 
                      (click)="gameService.compromiseInternal(target.id)">
                {{ target.status === 'COMPROMISED' ? 'ACCESS_GRANTED' : 'PIVOT' }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .internal-container { background: #050505; border: 1px double #00ff00; padding: 15px; margin-bottom: 15px; }
    .sec-header { font-size: 0.75em; color: #00ff00; border-bottom: 1px solid #004400; padding-bottom: 10px; margin-bottom: 15px; font-weight: bold; }
    
    .targets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .target-card { background: #000; border: 1px solid #1a1a1a; padding: 12px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .target-card.compromised { border-color: #00ff00; background: #001100; }
    
    .t-icon { font-size: 1.5em; margin-bottom: 10px; }
    .t-info { margin-bottom: 12px; }
    .t-name { font-size: 0.7em; font-weight: bold; color: #fff; display: block; }
    .t-type { font-size: 0.5em; color: #008800; }
    
    .pivot-btn { width: 100%; border: 1px solid #008800; background: transparent; color: #00ff00; padding: 6px; font-size: 0.6em; cursor: pointer; font-family: inherit; }
    .pivot-btn:hover:not(:disabled) { background: #00ff00; color: #000; }
    .pivot-btn:disabled { color: #004400; border-color: #002200; cursor: default; }
  `
})
export class InternalNetworkComponent {
  gameService = inject(GameService);
}
