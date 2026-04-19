import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

describe('GameService Mega Settings (TDD)', () => {
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

  it('should handle UI transparency settings', () => {
    service.updateSetting('video.opacity', '50');
    expect(service.settings().video.opacity).toBe(50);
  });

  it('should handle language localization settings', () => {
    service.updateSetting('general.language', 'HEX');
    expect(service.settings().general.language).toBe('HEX');
  });

  it('should handle vibration intensity', () => {
    service.updateSetting('control.vibe_intensity', '80');
    expect(service.settings().control.vibe_intensity).toBe(80);
  });
});
