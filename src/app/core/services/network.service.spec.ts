import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkService } from './network.service';
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { signal } from '@angular/core';

describe('NetworkService Fixed', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NetworkService,
        { provide: GameService, useValue: { log: vi.fn(), increaseDetection: vi.fn(), routingMode: signal('DIRECT') } }
      ]
    });
    service = TestBed.inject(NetworkService);
  });

  it('should initialize with a path', () => {
    expect(service.currentPath().length).toBeGreaterThan(0);
  });
});
