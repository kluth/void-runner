import { Injectable, signal, inject, computed } from '@angular/core';
import { GameService } from './game.service';
import { AudioService } from './audio.service';

export interface CosmeticItem {
  id: string;
  name: string;
  price: number;
  type: 'SKIN' | 'THEME' | 'BANNER';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class Web3MiningService {
  private game = inject(GameService);
  private audio = inject(AudioService);

  isMining = signal(false);
  voidCredits = signal(0);
  unlockedCosmetics = signal<string[]>([]);
  hashesContributed = signal(0);
  
  availableCosmetics = signal<CosmeticItem[]>([
    { id: 'NEURAL_GOLD_SKIN', name: 'Neural Gold Skin', price: 500, type: 'SKIN', description: 'A shimmering gold overlay for your rig.' },
    { id: 'VIOLET_DREAM_THEME', name: 'Violet Dream Theme', price: 1000, type: 'THEME', description: 'Deep purple accents for the entire UI.' },
    { id: 'GHOST_BANNER', name: 'Ghost Operative Banner', price: 250, type: 'BANNER', description: 'A custom ASCII profile banner.' }
  ]);

  private miningInterval: any;

  startMining() {
    if (this.isMining()) return;
    this.isMining.set(true);
    this.game.log('<span style="color: var(--neon-cyan)">[VOID-MINE] Consensus engine engaged. Allocating neural cycles...</span>');
    this.audio.playSuccess();

    this.miningInterval = setInterval(() => {
      this.hashesContributed.update(h => h + 10);
      this.voidCredits.update(v => v + 1);
      
      // Increase heat and stress
      this.game.systemHeat.update(h => Math.min(100, h + 2));
      this.game.neuralLoad.update(n => Math.min(100, n + 1));
      
      if (this.game.systemHeat() > 95) {
          this.game.log('<span style="color: var(--neon-magenta)">[VOID-MINE] Thermal emergency! Auto-throttling engaged.</span>');
          this.stopMining();
      }
    }, 1000);
  }

  stopMining() {
    if (!this.isMining()) return;
    this.isMining.set(false);
    clearInterval(this.miningInterval);
    this.game.log('<span style="color: var(--neon-cyan)">[VOID-MINE] Consensus engine disengaged. Neural load stabilizing.</span>');
  }

  purchaseCosmetic(id: string, price: number): boolean {
    if (this.voidCredits() >= price) {
      this.voidCredits.update(v => v - price);
      this.unlockedCosmetics.update(c => [...c, id]);
      this.game.log(`COSMETIC_ACQUIRED: ${id} is now available in your neural vault.`);
      this.audio.playSuccess();
      return true;
    }
    this.game.log('ERR: INSUFFICIENT_VOID_CREDITS. Contribution required.');
    this.audio.playError();
    return false;
  }
}
