import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Synaptic-Shatter UI Chaos (Issue #45)', () => {
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

  it('should set isCorrupted to true when neuralLoad is extreme (> 90)', () => {
    service.neuralLoad.set(85);
    expect(service.isCorrupted()).toBe(false);

    service.neuralLoad.set(91);
    expect(service.isCorrupted()).toBe(true);
  });
});
