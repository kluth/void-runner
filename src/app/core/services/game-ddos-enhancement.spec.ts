import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';
import { of } from 'rxjs';

describe('GameService DDoS Enhancement', () => {
  let service: GameService;
  let audioService: any;
  let neuralService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    audioService = {
      speakCreepy: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(),
      playGlitch: vi.fn(), playClick: vi.fn(), playBeep: vi.fn()
    };
    neuralService = { triggerHijack: vi.fn(), getHijackResponse: vi.fn().mockResolvedValue(of({response: 'hi'})) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: audioService },
        { provide: NeuralService, useValue: neuralService }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should set DDoS active and timer when launched', () => {
    service.botnetSize.set(20);
    const result = service.launchDDoS();
    
    expect(result).toBe(true);
    // @ts-ignore - we'll add these properties
    expect(service.isDDoSActive()).toBe(true);
    // @ts-ignore
    expect(service.ddosTimer()).toBeGreaterThan(0);
  });

  it('should trigger visual glitches (isDistorted) while DDoS is active', () => {
    service.botnetSize.set(20);
    service.launchDDoS();
    
    // We need to trigger gameTick and see if it sets isDistorted
    // Since it's random, we might need to mock Math.random
    vi.spyOn(Math, 'random').mockReturnValue(0.999); // Force glitch if threshold is lower
    
    (service as any).gameTick();
    
    // We expect isDistorted to be true at some point or at least triggered
    // This depends on our implementation.
  });

  it('should slow down purgeTimer while DDoS is active', () => {
    service.botnetSize.set(20);
    service.launchDDoS();
    
    service.purgeActive.set(true);
    service.purgeTimer.set(30);
    
    // In a normal tick, purgeTimer would go down by 1.
    // In a slowed tick, it should go down by less (or only every other tick).
    
    (service as any).gameTick();
    
    // If we implement it as "every other tick", it might still be 30 or 29.
    // Let's see how we implement it.
  });

  it('should slow down intrusionProgress while DDoS is active', () => {
    service.botnetSize.set(20);
    service.launchDDoS();
    
    service.intrusionActive.set(true);
    service.intrusionProgress.set(10);
    
    const initialProgress = service.intrusionProgress();
    (service as any).gameTick();
    const progressAfterOneTickWithDDoS = service.intrusionProgress() - initialProgress;
    
    // Deactivate DDoS
    // @ts-ignore
    service.isDDoSActive.set(false);
    
    service.intrusionProgress.set(10);
    (service as any).gameTick();
    const progressAfterOneTickWithoutDDoS = service.intrusionProgress() - initialProgress;
    
    expect(progressAfterOneTickWithDDoS).toBeLessThan(progressAfterOneTickWithoutDDoS);
  });
});
