import { TestBed } from '@angular/core/testing';
import { SystemPulseService } from './system-pulse.service';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Void-Pulse Synchronizer (Issue #38)', () => {
  let service: SystemPulseService;
  let game: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemPulseService,
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SystemPulseService);
    game = TestBed.inject(GameService);
  });

  it('should have a pulseValue signal', () => {
    expect(service.pulseValue()).toBeDefined();
  });

  it('should update CSS variable --void-pulse', () => {
    const root = document.documentElement;
    // The pulse is driven by a timer/interval
    // We'll just check if it's being updated
    const initial = root.style.getPropertyValue('--void-pulse');
    
    vi.useFakeTimers();
    vi.advanceTimersByTime(200);
    TestBed.flushEffects();
    
    const current = root.style.getPropertyValue('--void-pulse');
    expect(current).not.toBe(initial);
    vi.useRealTimers();
  });
});
