import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LockoutOverlayComponent } from './lockout-overlay.component';
import { GameService } from '../../core/services/game.service';
import { FormsModule } from '@angular/forms';

describe('LockoutOverlayComponent', () => {
  let component: LockoutOverlayComponent;
  let fixture: ComponentFixture<LockoutOverlayComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockoutOverlayComponent, FormsModule],
      providers: [GameService]
    }).compileComponents();

    fixture = TestBed.createComponent(LockoutOverlayComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show overlay when lockout is active', () => {
    (gameService as any).lockoutActive.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.lockout-terminal-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should display the current puzzle', () => {
    (gameService as any).lockoutActive.set(true);
    (gameService as any).lockoutPuzzles.set([{ q: 'What is 1+1?', a: '2' }]);
    (gameService as any).lockoutSolvedCount.set(0);
    fixture.detectChanges();
    const challenge = fixture.nativeElement.querySelector('.challenge-box');
    expect(challenge.textContent).toContain('What is 1+1?');
  });
});
