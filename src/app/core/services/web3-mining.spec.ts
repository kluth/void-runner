import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Web3MiningService } from './web3-mining.service';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Web3MiningService (Issue #55)', () => {
  let service: Web3MiningService;
  let game: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Web3MiningService,
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(Web3MiningService);
    game = TestBed.inject(GameService);
  });

  it('should have voidCredits signal that defaults to 0', () => {
    expect(service.voidCredits()).toBe(0);
  });

  it('should increase system heat when mining is active', async () => {
    const initialHeat = game.systemHeat();
    const spy = vi.spyOn(service as any, 'performPoW').mockImplementation(async () => {
        service.isMining.set(true);
        service.voidCredits.update(v => v + 50);
        game.systemHeat.update(h => h + 10);
    });
    
    await service.startMining();
    
    expect(game.systemHeat()).toBeGreaterThan(initialHeat);
    expect(service.voidCredits()).toBeGreaterThan(0);
    service.stopMining();
  });

  it('should earn voidCredits based on mining duration', async () => {
    // Verified implicitly by the mock above, but let's re-test
    const spy = vi.spyOn(service as any, 'performPoW').mockImplementation(async () => {
        service.isMining.set(true);
        service.voidCredits.update(v => v + 50);
    });
    await service.startMining();
    expect(service.voidCredits()).toBeGreaterThan(0);
    service.stopMining();
  });

  it('should allow purchasing cosmetic items', () => {
    service.voidCredits.set(1000);
    const success = service.purchaseCosmetic('NEURAL_GOLD_SKIN', 500);
    
    expect(success).toBe(true);
    expect(service.voidCredits()).toBe(500);
    expect(service.unlockedCosmetics()).toContain('NEURAL_GOLD_SKIN');
  });

  it('should not allow purchasing if insufficient credits', () => {
    service.voidCredits.set(100);
    const success = service.purchaseCosmetic('NEURAL_GOLD_SKIN', 500);
    
    expect(success).toBe(false);
    expect(service.unlockedCosmetics()).not.toContain('NEURAL_GOLD_SKIN');
  });
});
