import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalibrationOverlayComponent } from './calibration-overlay.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('CalibrationOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalibrationOverlayComponent],
      providers: [
        { provide: GameService, useValue: { isCalibrating: signal(true), log: vi.fn() } }
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CalibrationOverlayComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
