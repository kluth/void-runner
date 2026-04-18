import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntrusionOverlayComponent } from './intrusion-overlay.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('IntrusionOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IntrusionOverlayComponent],
      providers: [
        { provide: GameService, useValue: { intrusionActive: signal(true), intrusionProgress: signal(50), counterIntrusion: vi.fn() } }
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(IntrusionOverlayComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
