import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OverclockStationComponent } from './overclock-station.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('OverclockStationComponent', () => {
  let component: OverclockStationComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      inventory: vi.fn().mockReturnValue([{ id: 'h1', name: 'H1', description: 'Test' }]),
      log: vi.fn(),
      systemIntegrity: signal(100)
    };

    TestBed.configureTestingModule({
      imports: [OverclockStationComponent],
      providers: [
        { provide: GameService, useValue: gameService }
      ]
    });
    const fixture = TestBed.createComponent(OverclockStationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update stats and risk level', () => {
    component.voltage = 80;
    component.frequency = 80;
    component.updateStats();
    expect(component.riskLevel()).toBe(80);
  });

  it('should generate progress bar', () => {
    const bar = component.getProgressBar(50);
    expect(bar).toContain('█████');
    expect(bar.length).toBe(10);
  });
});
