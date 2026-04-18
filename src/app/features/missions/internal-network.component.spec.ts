import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InternalNetworkComponent } from './internal-network.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('InternalNetworkComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InternalNetworkComponent],
      providers: [
        { provide: GameService, useValue: { activeInternalOrigin: signal('test'), internalNetwork: signal([]), compromiseInternal: vi.fn() } }
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InternalNetworkComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
