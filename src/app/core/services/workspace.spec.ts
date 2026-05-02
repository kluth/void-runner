import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Void-OS Hyper-Workspace (Issue #52)', () => {
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

  it('should have a windows signal that tracks open apps', () => {
    expect(service.windows()).toBeDefined();
  });

  it('should allow opening a new window', () => {
    service.openWindow('TERMINAL');
    const wins = service.windows();
    expect(wins.find(w => w.id === 'TERMINAL')).toBeDefined();
  });

  it('should toggle window focus', () => {
    service.openWindow('TERMINAL');
    service.openWindow('GRID');
    
    service.focusWindow('TERMINAL');
    expect(service.activeWindowId()).toBe('TERMINAL');
  });

  it('should allow closing a window', () => {
    service.openWindow('TERMINAL');
    service.closeWindow('TERMINAL');
    expect(service.windows().length).toBe(0);
  });
});
