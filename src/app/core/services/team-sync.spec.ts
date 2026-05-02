import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Synergistic Void-Link (Issue #53)', () => {
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

  it('should have a teamProgress signal that tracks remote activities', () => {
    expect(service.teamProgress()).toEqual({});
  });

  it('should update teamProgress when receiving sync events', () => {
    // We'll mock the socket handler or directly call the internal update method if available
    (service as any).handleTeamSync({ operative: 'GHOST_9', progress: 45, action: 'DECRYPT' });
    
    expect(service.teamProgress()['GHOST_9']).toEqual({ progress: 45, action: 'DECRYPT', lastSeen: expect.any(Number) });
  });

  it('should trigger a visual echo when remote progress changes', () => {
    const spy = vi.spyOn(service, 'triggerVisualEvent');
    
    (service as any).handleTeamSync({ operative: 'GHOST_9', progress: 80, action: 'DECRYPT', lat: 51.5, lng: -0.1 });
    
    expect(spy).toHaveBeenCalledWith(51.5, -0.1, 'echo', expect.any(String));
  });
});
