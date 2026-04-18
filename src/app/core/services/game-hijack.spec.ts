import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';
import { of } from 'rxjs';

const hoisted = vi.hoisted(() => ({
  mockSocket: { on: vi.fn(), emit: vi.fn() }
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn().mockReturnValue(hoisted.mockSocket)
}));

describe('GameService Hijack Frequency (TDD)', () => {
  let service: GameService;
  let neuralService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    neuralService = { triggerHijack: vi.fn(), getHijackResponse: vi.fn().mockResolvedValue(of({response: 'hi'})) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { speakCreepy: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playGlitch: vi.fn() } },
        { provide: NeuralService, useValue: neuralService }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should trigger hijack more frequently when integrity is low', () => {
    service.systemIntegrity.set(10); // Dangerous level
    // Chance is ~4.5%, so a random roll of 0.01 should trigger it.
    vi.spyOn(Math, 'random').mockReturnValue(0.01); 
    
    (service as any).gameTick();
    
    expect(neuralService.getHijackResponse).toHaveBeenCalled();
  });
});
