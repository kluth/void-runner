import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

const hoisted = vi.hoisted(() => {
    return {
        on: vi.fn(),
        emit: vi.fn()
    };
});

vi.mock('socket.io-client', () => {
    return {
        io: vi.fn(() => hoisted)
    };
});

describe('GameService Settings (TDD)', () => {
  let service: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { log: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn(), speakCreepy: vi.fn() } },
        { provide: NeuralService, useValue: { getHijackResponse: vi.fn(), http: { get: vi.fn() } } }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should allow updating and persisting settings', () => {
    service.updateSetting('audio.volume', '75');
    expect(service.settings().audio.volume).toBe(75);
    
    service.updateSetting('video.glitch', 'off');
    expect(service.settings().video.glitch).toBe(false);

    // Verify it emits to backend
    service.authToken.set('token');
    (service as any).updateRemoteScore();
    expect(hoisted.emit).toHaveBeenCalledWith('update_score', expect.objectContaining({
      settings: expect.stringContaining('audio')
    }));
  });
});
