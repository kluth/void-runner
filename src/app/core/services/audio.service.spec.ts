import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioService } from './audio.service';
import { TestBed } from '@angular/core/testing';

describe('AudioService Intensive', () => {
  let service: AudioService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AudioService();
  });

  it('should generate large playlist', () => {
    expect(service.playlist.length).toBe(55);
    expect(service.playlist[0].name).toBeDefined();
  });

  it('should play all sound types', () => {
    service.playBeep();
    service.playSuccess();
    service.playError();
    service.playClick();
    service.playGlitch();
    // No errors thrown
  });

  it('should cycle tracks', () => {
    service.toggleMusic();
    const first = service.currentTrack();
    expect(first).not.toBe('SYSTEM_IDLE');
    
    // Simulate end of track
    (service as any).currentIndex = 54;
    (service as any).playNextTrack();
    expect(service.currentTrack()).not.toBe(first);
  });

  it('should speak creepy via TTS', () => {
    const mockSpeak = vi.fn();
    (window as any).speechSynthesis = {
      cancel: vi.fn(),
      speak: mockSpeak,
      getVoices: vi.fn().mockReturnValue([{ name: 'Microsoft David' }])
    };
    service.speakCreepy('Fear me');
    expect(mockSpeak).toHaveBeenCalled();
  });
});
