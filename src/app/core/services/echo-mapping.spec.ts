import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Temporal Echo-Mapping (Issue #30)', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NetworkService,
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(NetworkService);
  });

  it('should have a temporalEchoes signal', () => {
    expect(service.temporalEchoes()).toBeDefined();
  });

  it('should store historical paths as echoes', () => {
    service.addEchoPath([{id: 'n1', lat: 0, lng: 0}, {id: 'n2', lat: 10, lng: 10}], 'SUCCESS');
    expect(service.temporalEchoes().length).toBe(1);
    expect(service.temporalEchoes()[0].status).toBe('SUCCESS');
  });
});
