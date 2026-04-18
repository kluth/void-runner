import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiveEventsComponent } from './live-events.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('LiveEventsComponent', () => {
  let component: LiveEventsComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      globalEvent: signal('CTF_ACTIVE'),
      eventTimer: signal(60),
      leaderboard: signal([]),
      publicExploits: signal([])
    };

    TestBed.configureTestingModule({
      imports: [LiveEventsComponent],
      providers: [{ provide: GameService, useValue: gameService }]
    });
    const fixture = TestBed.createComponent(LiveEventsComponent);
    component = fixture.componentInstance;
  });

  it('should return correct event name', () => {
    expect(component.getEventName()).toBe('GLOBAL CTF QUALIFIER');
  });

  it('should return correct event description', () => {
    expect(component.getEventDesc()).toContain('double Experience');
  });
});
