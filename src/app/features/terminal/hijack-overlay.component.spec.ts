import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HijackOverlayComponent } from './hijack-overlay.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('HijackOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HijackOverlayComponent],
      providers: [
        { provide: GameService, useValue: { isHijacked: signal(true), hijackMessage: signal('test'), log: vi.fn() } }
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HijackOverlayComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should release hijack', () => {
    const fixture = TestBed.createComponent(HijackOverlayComponent);
    const component = fixture.componentInstance;
    component.release();
    expect(component.gameService.isHijacked()).toBe(false);
  });
});
