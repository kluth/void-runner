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
    .internal-container { background: var(--layer-1); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--neon-shadow); }
    .sec-header { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; color: var(--primary); background: var(--layer-2); padding: 0.75rem; margin-bottom: 1.5rem; letter-spacing: 2px; font-weight: 900; text-transform: uppercase; }
    
    .targets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .target-card { background: var(--layer-2); padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.05s steps(2); }
    .target-card.compromised { border-left: 2px solid var(--secondary); background: var(--layer-3); }
    
    .t-icon { font-size: 0.6rem; color: var(--primary); opacity: 0.4; font-family: 'JetBrains Mono', monospace; font-weight: 900; margin-bottom: 1rem; }
    .t-info { margin-bottom: 1.25rem; }
    .t-name { font-size: 0.75rem; font-weight: 900; color: #fff; display: block; }
    .t-type { font-size: 0.55rem; color: var(--secondary); font-family: 'JetBrains Mono', monospace; font-weight: 900; opacity: 0.6; }
    
    .pivot-btn { width: 100%; border: var(--ghost-border); background: var(--layer-4); color: var(--primary); padding: 10px; font-size: 0.6rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 900; transition: all 0.05s steps(2); }
    .pivot-btn:hover:not(:disabled) { background: var(--primary); color: var(--on-primary); }
    .pivot-btn:disabled { opacity: 0.2; }
  `
})
export class InternalNetworkComponent {
  gameService = inject(GameService);
}
