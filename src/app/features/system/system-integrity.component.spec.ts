import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemIntegrityComponent } from './system-integrity.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('SystemIntegrityComponent', () => {
  let component: SystemIntegrityComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SystemIntegrityComponent],
      providers: [
        { provide: GameService, useValue: { systemIntegrity: signal(100), activeDebuffs: signal([]) } }
      ]
    });
    const fixture = TestBed.createComponent(SystemIntegrityComponent);
    component = fixture.componentInstance;
  });

  it('should calculate remaining time', () => {
    const future = Date.now() + 10000;
    expect(component.getRemaining(future)).toBeGreaterThan(0);
  });
});
