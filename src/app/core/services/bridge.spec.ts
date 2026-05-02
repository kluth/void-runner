import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Omni-Link Bridge (Issue #36)', () => {
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

  it('should have a heldEntity signal', () => {
    expect(service.heldEntity()).toBeNull();
  });

  it('should allow dragging an entity', () => {
    service.dragEntity({ id: 'c1', type: 'CONTACT', data: { name: 'GHOST' } });
    expect(service.heldEntity()?.id).toBe('c1');
  });

  it('should allow dropping an entity into a target domain', () => {
    service.dragEntity({ id: 'c1', type: 'CONTACT', data: { name: 'GHOST' } });
    const result = service.dropEntity('NETWORK_NODE', 'srv-alpha');
    
    expect(result).toBe(true);
    expect(service.heldEntity()).toBeNull();
  });
});
