import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-global-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="feed-container terminal-frame">
      <div class="ascii-line header">ENCRYPTED_RUNNER_FEED // GLOBAL</div>
      
      <div class="feed-list" #scrollContainer>
        @for (post of game.globalFeed(); track post.id) {
          <div class="feed-post">
            <div class="p-header">
              <span class="p-handle">{{ post.handle }}</span>
              <span class="p-time">{{ post.timestamp | date:'shortTime' }}</span>
            </div>
            <div class="p-msg">{{ post.message }}</div>
          </div>
        }
      </div>

      <div class="feed-input">
        <input [(ngModel)]="newMsg" (keyup.enter)="send()" placeholder="FRAGMENT_MSG...">
        <button (click)="send()">[ SEND ]</button>
      </div>
    </div>
  `,
  styles: `
    .feed-container { padding: 10px; background: rgba(13, 21, 32, 0.8); height: 300px; display: flex; flex-direction: column; }
    .feed-list { flex: 1; overflow-y: auto; margin: 10px 0; display: flex; flex-direction: column-reverse; gap: 10px; }
    .feed-post { border-left: 1px solid var(--neon-cyan); padding-left: 8px; }
    .p-header { display: flex; justify-content: space-between; font-size: 0.6rem; opacity: 0.6; }
    .p-handle { color: var(--neon-cyan); font-weight: bold; }
    .p-msg { font-size: 0.7rem; color: #eee; margin-top: 2px; line-height: 1.2; }
    .feed-input { display: flex; gap: 5px; }
    .feed-input input { flex: 1; background: #000; border: 1px solid var(--primary); color: var(--primary); font-size: 0.7rem; padding: 4px; }
  `
})
export class GlobalFeedComponent {
  game = inject(GameService);
  newMsg = '';

  send() {
    if (this.newMsg.trim()) {
      this.game.sendFeedMessage(this.newMsg);
      this.newMsg = '';
    }
  }
}
