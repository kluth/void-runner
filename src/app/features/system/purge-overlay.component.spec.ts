import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurgeOverlayComponent } from './purge-overlay.component';
import { GameService } from '../../core/services/game.service';

describe('PurgeOverlayComponent', () => {
  let component: PurgeOverlayComponent;
  let fixture: ComponentFixture<PurgeOverlayComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurgeOverlayComponent],
      providers: [GameService]
    }).compileComponents();

    fixture = TestBed.createComponent(PurgeOverlayComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show overlay when purge is active', () => {
    // Mocking the signal value might be tricky depending on how it's implemented,
    // but typically we can use the service to trigger it.
    (gameService as any).purgeActive.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.purge-terminal-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should show the correct purge code', () => {
    (gameService as any).purgeActive.set(true);
    (gameService as any).purgeCode.set('TEST-CODE-123');
    fixture.detectChanges();
    const code = fixture.nativeElement.querySelector('.code');
    expect(code.textContent).toContain('TEST-CODE-123');
  });
});
