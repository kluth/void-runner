import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService, Mission } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

describe('GameService Expansion (TDD)', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { log: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn(), speakCreepy: vi.fn() } },
        { provide: NeuralService, useValue: { getHijackResponse: vi.fn() } }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should generate advanced mission types like crypto-heist or quantum-breach', () => {
    // Generate many missions to ensure variety
    for(let i=0; i<50; i++) service.addRandomMission();
    
    const types = service.activeMissions().map(m => m.type);
    expect(types).toContain('crypto-heist');
    expect(types).toContain('quantum-breach');
  });

  it('should include elite targets like SAT_UPLINK or BIO_LAB', () => {
    for(let i=0; i<50; i++) service.addRandomMission();
    
    const targets = service.activeMissions().map(m => m.target);
    const hasElite = targets.some(t => t.includes('SAT_UPLINK') || t.includes('BIO_LAB'));
    expect(hasElite).toBe(true);
  });

  it('should handle new retaliation threats like DATA_WIPE', () => {
    service.artifacts.set([{ id: '1', name: 'TEST', type: 'binary', analysisProgress: 0, analyzed: false, rewardType: 'credits' }]);
    
    // We force a DATA_WIPE retaliation
    (service as any).applyRetaliation('DATA_WIPE', 30000);
    
    expect(service.artifacts().length).toBe(0);
  });
});
