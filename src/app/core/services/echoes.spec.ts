import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Void-Echo Fragment Collector (Issue #40)', () => {
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

  it('should have a voidEchoes signal', () => {
    expect(service.voidEchoes()).toBeDefined();
  });

  it('should allow spawning an echo', () => {
    (service as any).spawnEcho('LORE_FRAGMENT_1', 'The blackout wasn\'t an accident.');
    expect(service.voidEchoes().length).toBe(1);
  });

  it('should allow capturing an echo', () => {
    (service as any).spawnEcho('E1', 'Test');
    service.captureEcho('E1');
    expect(service.voidEchoes().find(e => e.id === 'E1')?.captured).toBe(true);
  });
});
