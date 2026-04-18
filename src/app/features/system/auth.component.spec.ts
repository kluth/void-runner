import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthComponent } from './auth.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      twoFactorUserId: vi.fn().mockReturnValue(null),
      qrCode: vi.fn().mockReturnValue(null),
      login: vi.fn(),
      register: vi.fn(),
      verify2fa: vi.fn(),
      handleOAuthToken: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [AuthComponent, FormsModule],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: vi.fn() } } } }
      ]
    });
    const fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
  });

  it('should submit login', () => {
    component.mode = 'login';
    component.username = 'u';
    component.password = 'p';
    component.submit();
    expect(gameService.login).toHaveBeenCalledWith('u', 'p');
  });

  it('should submit register', () => {
    component.mode = 'register';
    component.username = 'u';
    component.password = 'p';
    component.submit();
    expect(gameService.register).toHaveBeenCalledWith('u', 'p');
  });
});
