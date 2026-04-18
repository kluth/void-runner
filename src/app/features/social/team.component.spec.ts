import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamComponent } from './team.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('TeamComponent', () => {
  let gameService: any;

  beforeEach(() => {
    gameService = {
      reputation: signal(100),
      activeTeam: signal(null),
      playerHandle: signal('TEST'),
      teamMessages: signal([]),
      sendTeamMessage: vi.fn(),
      setup2fa: vi.fn(),
      log: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [TeamComponent, FormsModule],
      providers: [{ provide: GameService, useValue: gameService }]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TeamComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
