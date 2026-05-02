import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Glitch-Adaptive HUD (Issue #49)', () => {
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

  it('should calculate systemStress correctly', () => {
    service.systemIntegrity.set(100);
    service.systemHeat.set(0);
    expect(service.systemStress()).toBe(0);

    service.systemIntegrity.set(50);
    service.systemHeat.set(20);
    expect(service.systemStress()).toBe(70);
  });

  it('should set isGlitchy to true when stress is high (> 50)', () => {
    service.systemIntegrity.set(40); // 60 stress
    service.systemHeat.set(0);
    expect(service.isGlitchy()).toBe(true);
  });

  it('should set isGlitchy to true when isDistorted is active', () => {
    service.systemIntegrity.set(100);
    service.systemHeat.set(0);
    service.isDistorted.set(true);
    expect(service.isGlitchy()).toBe(true);
  });
});
