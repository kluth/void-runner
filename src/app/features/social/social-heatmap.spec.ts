import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialHeatmapComponent } from './social-heatmap.component';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SocialHeatmapComponent (Issue #47)', () => {
  let component: SocialHeatmapComponent;
  let fixture: ComponentFixture<SocialHeatmapComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialHeatmapComponent],
      providers: [
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SocialHeatmapComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute heatmapData from teamProgress', () => {
    gameService.teamProgress.set({
      'GHOST_1': { progress: 50, action: 'DECRYPT', lastSeen: Date.now() }
    });
    
    const data = component.heatmapData();
    expect(data.length).toBe(1);
    expect(data[0].operative).toBe('GHOST_1');
    expect(data[0].color).toBe('var(--neon-cyan)');
  });

  it('should calculate aggregatePressure', () => {
    gameService.teamProgress.set({
      'GHOST_1': { progress: 100, action: 'DECRYPT', lastSeen: Date.now() },
      'GHOST_2': { progress: 0, action: 'BREACH', lastSeen: Date.now() }
    });
    
    // Intensity for 100% is 1.0, for 0% is 0.2. Avg = 0.6. Pressure = 60%.
    expect(component.aggregatePressure()).toBe(60);
  });
});
