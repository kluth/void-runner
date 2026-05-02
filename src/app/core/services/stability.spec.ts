import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Psych-Stability Variance (Issue #34)', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should have a psychStability signal that defaults to 100', () => {
    expect(service.psychStability()).toBe(100);
  });

  it('should decrease stability when neural load is high', () => {
    service.neuralLoad.set(95);
    (service as any).gameTick(); // Stability should drop
    expect(service.psychStability()).toBeLessThan(100);
  });

  it('should trigger hallucinations when stability is low', () => {
    service.psychStability.set(20);
    expect(service.isHallucinating()).toBe(true);
  });
});
