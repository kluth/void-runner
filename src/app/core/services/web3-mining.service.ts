import { Injectable, signal, inject, computed, Injector } from '@angular/core';
import { GameService } from './game.service';
import { AudioService } from './audio.service';
import { JsonRpcProvider } from 'ethers';

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
  private injector = inject(Injector);
  private audio = inject(AudioService);

  private get game() {
    return this.injector.get(GameService);
  }

  isMining = signal(false);
  voidCredits = signal(0);
  unlockedCosmetics = signal<string[]>([]);
  hashesContributed = signal(0);
  secureModeActive = signal(false);
  
  availableCosmetics = signal<CosmeticItem[]>([
    { id: 'NEURAL_GOLD_SKIN', name: 'Neural Gold Skin', price: 500, type: 'SKIN', description: 'A shimmering gold overlay for your rig.' },
    { id: 'VIOLET_DREAM_THEME', name: 'Violet Dream Theme', price: 1000, type: 'THEME', description: 'Deep purple accents for the entire UI.' },
    { id: 'GHOST_BANNER', name: 'Ghost Operative Banner', price: 250, type: 'BANNER', description: 'A custom ASCII profile banner.' }
  ]);

  private encryptionKey: CryptoKey | null = null;
  private miningActive = false;

  async startMining() {
    if (this.isMining()) return;
    this.isMining.set(true);
    this.miningActive = true;
    this.game.log('<span style="color: var(--neon-cyan)">[VOID-MINE] Connecting to Ethereum Mainnet...</span>');
    this.audio.playSuccess();

    try {
      const provider = new JsonRpcProvider('https://cloudflare-eth.com');
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      
      if (!block) throw new Error("Could not fetch block");
      
      this.game.log(`<span style="color: var(--neon-cyan)">[VOID-MINE] Synced block ${blockNumber}. Hash: ${block.hash.substring(0, 16)}...</span>`);
      this.game.log('<span style="color: var(--neon-yellow)">[VOID-MINE] Commencing SHA-256 Proof-of-Work to derive secure vault key...</span>');
      
      this.performPoW(block.hash);
    } catch(e) {
      this.game.log('<span style="color: var(--neon-magenta)">[VOID-MINE] Failed to connect to Web3 Node. Using local fallback entropy.</span>');
      this.performPoW(crypto.randomUUID());
    }
  }

  private async performPoW(seed: string) {
    let nonce = 0;
    const targetPrefix = '00'; // Dynamic difficulty could be implemented here
    const encoder = new TextEncoder();
    
    while(this.miningActive) {
        const data = encoder.encode(seed + nonce.toString());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        if (hashHex.startsWith(targetPrefix)) {
           // Found a block!
           await this.deriveKey(hashBuffer);
           this.voidCredits.update(v => v + 50);
           this.hashesContributed.update(h => h + nonce);
           this.game.log(`<span style="color: var(--neon-green)">[VOID-MINE] Block Mined! Hash: ${hashHex.substring(0, 16)}...</span>`);
           this.game.log(`<span style="color: var(--neon-cyan)">[VOID-MINE] AES-GCM Encryption Key derived. Vault secured.</span>`);
           this.audio.playSuccess();
           break;
        }
        
        nonce++;
        
        // Yield to main thread and update stats
        if (nonce % 100 === 0) {
            await new Promise(r => setTimeout(r, 0));
            this.hashesContributed.update(h => h + 100);
            this.game.systemHeat.update(h => Math.min(100, h + 1));
            this.game.neuralLoad.update(n => Math.min(100, n + 0.5));
            
            if (this.game.systemHeat() > 95) {
                this.game.log('<span style="color: var(--neon-magenta)">[VOID-MINE] Thermal emergency! Auto-throttling engaged.</span>');
                this.stopMining();
                break;
            }
        }
    }
    
    if (this.miningActive) {
       // Loop if we want continuous mining, but for the key generation one block is enough.
       // Let's continue mining for more credits if they don't stop it.
       setTimeout(() => {
           if (this.miningActive) this.performPoW(seed + nonce.toString());
       }, 1000);
    }
  }

  stopMining() {
    if (!this.isMining()) return;
    this.isMining.set(false);
    this.miningActive = false;
    this.game.log('<span style="color: var(--neon-cyan)">[VOID-MINE] Consensus engine disengaged. Neural load stabilizing.</span>');
  }

  toggleSecureMode() {
      this.secureModeActive.update(v => !v);
      this.game.log(`[VAULT] Secure Web3 Mode: ${this.secureModeActive() ? 'ENABLED' : 'DISABLED'}`);
      if (this.secureModeActive() && !this.encryptionKey) {
          this.game.log('<span style="color: var(--neon-orange)">[VAULT] WARNING: No encryption key present. Start mining to derive a key, or data cannot be decrypted later!</span>');
      }
      // Trigger a save to apply the new mode immediately
      (this.game as any).saveLocalState();
  }

  async deriveKey(rawKeyBuffer: ArrayBuffer) {
      this.encryptionKey = await crypto.subtle.importKey(
          'raw', rawKeyBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
      );
      
      const secureSaved = localStorage.getItem('VOID_RUNNER_STATE_SECURE');
      if (secureSaved && this.secureModeActive()) {
          const decrypted = await this.decryptState(secureSaved);
          if (decrypted) {
              this.game.log('<span style="color: var(--neon-green)">[VAULT] Local data successfully decrypted from Web3 Vault.</span>');
              this.game.applyRawState(decrypted);
          } else {
              this.game.log('<span style="color: var(--neon-magenta)">[VAULT] Decryption failed. Corrupt data.</span>');
          }
      }
  }

  async encryptState(data: string): Promise<string> {
      if (!this.encryptionKey) throw new Error("No key");
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(data);
      const cipherText = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          this.encryptionKey,
          encoded
      );
      
      const combined = new Uint8Array(iv.length + cipherText.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherText), iv.length);
      return btoa(String.fromCharCode(...combined));
  }

  async decryptState(encryptedData: string): Promise<string | null> {
      if (!this.encryptionKey) return null;
      try {
          const binaryStr = atob(encryptedData);
          const combined = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
              combined[i] = binaryStr.charCodeAt(i);
          }
          const iv = combined.slice(0, 12);
          const data = combined.slice(12);
          const decrypted = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv },
              this.encryptionKey,
              data
          );
          return new TextDecoder().decode(decrypted);
      } catch(e) {
          return null;
      }
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
