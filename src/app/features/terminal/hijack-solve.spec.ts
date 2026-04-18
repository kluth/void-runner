import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HijackOverlayComponent } from './hijack-overlay.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('HijackOverlayComponent (TDD - Difficult Solve)', () => {
  let component: HijackOverlayComponent;
  let gameServiceMock: any;

  beforeEach(() => {
    gameServiceMock = {
      isHijacked: signal(true),
      hijackMessage: signal('Your code is 0xDEADBEEF'),
      hijackUnlockCode: signal('0xDEADBEEF'),
      log: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HijackOverlayComponent, FormsModule],
      providers: [
        { provide: GameService, useValue: gameServiceMock }
      ]
    });
    const fixture = TestBed.createComponent(HijackOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should NOT release if the code is incorrect', () => {
    component.solveInput = 'WRONG';
    component.release();
    expect(gameServiceMock.isHijacked()).toBe(true);
  });

  it('should release only if the code matches hijackUnlockCode', () => {
    component.solveInput = '0xDEADBEEF';
    component.release();
    expect(gameServiceMock.isHijacked()).toBe(false);
  });
});
