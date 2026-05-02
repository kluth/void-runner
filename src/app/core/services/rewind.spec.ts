import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Chronos-Lag Data Rewind (Issue #43)', () => {
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

  it('should take a snapshot and rewind to it', () => {
    service.credits.set(1000);
    service.takeSnapshot();
    
    service.credits.set(500);
    expect(service.credits()).toBe(500);
    
    const success = service.rewindState();
    expect(success).toBe(true);
    expect(service.credits()).toBe(1000);
  });

  it('should return false if no snapshots are available', () => {
    const success = service.rewindState();
    expect(success).toBe(false);
  });

  it('should limit snapshots to 5', () => {
    for (let i = 0; i < 10; i++) {
      service.takeSnapshot();
    }
    expect(service.stateSnapshots().length).toBe(5);
  });
});
