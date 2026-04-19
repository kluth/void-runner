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

describe('GameService Advanced Settings (TDD)', () => {
  let service: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { log: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn(), speakCreepy: vi.fn(), masterVolume: { set: vi.fn() }, speechEnabled: { set: vi.fn() } } },
        { provide: NeuralService, useValue: { getHijackResponse: vi.fn(), http: { get: vi.fn() } } }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should handle social setting updates', () => {
    service.updateSetting('social.notifications', 'off');
    expect(service.settings().social.notifications).toBe(false);
  });

  it('should handle beta setting updates', () => {
    service.updateSetting('beta.ai_emotions', 'on');
    expect(service.settings().beta.ai_emotions).toBe(true);
  });

  it('should handle auto_wipe setting', () => {
    service.updateSetting('general.auto_wipe', 'on');
    expect(service.settings().general.auto_wipe).toBe(true);
  });
});
