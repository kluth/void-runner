import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Hardware HUD-Morphing (Issue #31)', () => {
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

  it('should have a hudVariant signal that defaults to BASIC', () => {
    expect(service.hudVariant()).toBe('BASIC');
  });

  it('should morph to QUANTUM when advanced hardware is mounted', () => {
    const quantumHW: any = { id: 'quantum-uplink', bonusType: 'recon', powerDraw: 50 };
    service.mountedHardware.set([quantumHW, null, null, null, null, null]);
    
    // The computed signal should update
    expect(service.hudVariant()).toBe('QUANTUM');
  });
});
