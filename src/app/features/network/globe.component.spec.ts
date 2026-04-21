import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobeComponent } from './globe.component';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { NetworkService } from '../../core/services/network.service';
import * as THREE from 'three';

vi.mock('three', async () => {
  const actual = await vi.importActual('three') as any;
  return {
    ...actual,
    WebGLRenderer: class {
      setSize = vi.fn();
      render = vi.fn();
      dispose = vi.fn();
      domElement = document.createElement('canvas');
    }
  };
});

describe('GlobeComponent', () => {
  let mockGameService: any;
  let mockNetworkService: any;

  beforeEach(() => {
    mockGameService = {
      globalEvent: signal('NONE'),
      visualEvents: signal([]),
      routingMode: signal('DIRECT')
    };
    mockNetworkService = {
      currentPath: signal([]),
      nodes: signal([])
    };

    TestBed.configureTestingModule({
      imports: [GlobeComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: NetworkService, useValue: mockNetworkService }
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GlobeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should update visuals when globalEvent changes', () => {
    const fixture = TestBed.createComponent(GlobeComponent);
    const component = fixture.componentInstance;
    
    // We need to mock Three.js related things if it fails in JSDOM
    // But let's see if it works as is.
    const spy = vi.spyOn(component as any, 'updateVisuals');
    
    (component as any).gameService.globalEvent.set('SINGULARITY');
    fixture.detectChanges(); // triggers effects in Angular 17+
    
    expect(spy).toHaveBeenCalled();
  });
});
