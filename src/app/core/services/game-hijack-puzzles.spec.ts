import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';
import { of } from 'rxjs';

describe('GameService Hijack Puzzles (TDD)', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { log: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn(), speakCreepy: vi.fn() } },
        { provide: NeuralService, useValue: { getHijackResponse: vi.fn().mockReturnValue(of({ response: 'mock' })) } }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should generate a solvable puzzle instead of a random hex string', async () => {
    // Manually trigger the private puzzle generator if possible or check output of triggerHijack
    await (service as any).triggerHijack();
    
    const code = service.hijackUnlockCode();
    expect(code).toBeDefined();
    expect(code.length).toBeGreaterThan(0);
    
    // The code should be simpler than a 10-char random hex
    // e.g. a number, a short word, or a simple hex byte
    expect(code.length).toBeLessThan(9);
  });
});
