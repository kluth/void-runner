import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Symbiotic UI Evolution (Issue #44)', () => {
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

  it('should track tab usage and update primaryAccent', () => {
    // Default is TERMINAL -> Green
    expect(service.primaryAccent().toUpperCase()).toBe('#00FF9F');

    service.clearTabNotification('GRID');
    service.clearTabNotification('GRID');
    
    // Now GRID usage is 2, TERMINAL is 0
    expect(service.primaryAccent().toUpperCase()).toBe('#00E5FF'); // Cyan
    
    service.clearTabNotification('SOCIAL');
    service.clearTabNotification('SOCIAL');
    service.clearTabNotification('SOCIAL');
    
    // Now SOCIAL is 3
    expect(service.primaryAccent().toUpperCase()).toBe('#FF0055'); // Magenta
  });

  it('should apply primaryAccent to CSS variables when in AESTHETIC mode', () => {
    const root = document.documentElement;
    service.clearTabNotification('GRID');
    service.clearTabNotification('GRID');
    TestBed.flushEffects();
    
    expect(root.style.getPropertyValue('--primary').trim().toUpperCase()).toBe('#00E5FF');
  });
});
