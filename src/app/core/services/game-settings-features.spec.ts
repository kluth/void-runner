import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

describe('GameService Feature Expansion (TDD)', () => {
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

  it('should handle new automation settings like auto_analysis', () => {
    service.updateSetting('general.auto_analysis', 'on');
    expect(service.settings().general.auto_analysis).toBe(true);
  });

  it('should handle UI settings like font_size', () => {
    service.updateSetting('video.font_size', '14');
    expect(service.settings().video.font_size).toBe(14);
  });

  it('should handle new social settings like incognito', () => {
    service.updateSetting('social.incognito', 'true');
    expect(service.settings().social.incognito).toBe(true);
  });
});
