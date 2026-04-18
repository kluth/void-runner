import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DarknetNodeComponent } from './darknet-node.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { FormsModule } from '@angular/forms';

describe('DarknetNodeComponent', () => {
  let component: DarknetNodeComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      hasDarknetAccess: vi.fn().mockReturnValue(true),
      teamMessages: vi.fn().mockReturnValue([]),
      availableTeams: vi.fn().mockReturnValue([]),
      leaderboard: vi.fn().mockReturnValue([]),
      activeTeam: vi.fn().mockReturnValue(null),
      privateMessages: vi.fn().mockReturnValue([]),
      sendTeamMessage: vi.fn(),
      createTeam: vi.fn(),
      joinTeam: vi.fn(),
      sendPrivateMessage: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [DarknetNodeComponent, FormsModule],
      providers: [
        { provide: GameService, useValue: gameService }
      ]
    });
    const fixture = TestBed.createComponent(DarknetNodeComponent);
    component = fixture.componentInstance;
  });

  it('should send global message', () => {
    component.globalText = 'hello world';
    component.sendGlobal();
    expect(gameService.sendTeamMessage).toHaveBeenCalledWith('hello world');
  });

  it('should create team', () => {
    component.newTeamName = 'New Team';
    component.createTeam();
    expect(gameService.createTeam).toHaveBeenCalledWith('New Team', expect.any(String));
  });
});
