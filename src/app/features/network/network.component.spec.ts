import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkComponent } from './network.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { NetworkService } from '../../core/services/network.service';
import { signal } from '@angular/core';

describe('NetworkComponent', () => {
  let component: NetworkComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NetworkComponent],
      providers: [
        { provide: GameService, useValue: { botnetSize: signal(10), launchDDoS: vi.fn(), routingMode: signal('DIRECT'), setRouting: vi.fn() } },
        { provide: NetworkService, useValue: { currentPath: signal([]) } },
        { provide: 'AudioService', useValue: { playGlitch: vi.fn(), playError: vi.fn() } }
      ]
    });
    const fixture = TestBed.createComponent(NetworkComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
