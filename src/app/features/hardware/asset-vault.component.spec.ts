import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssetVaultComponent } from './asset-vault.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';

describe('AssetVaultComponent', () => {
  let component: AssetVaultComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      artifacts: vi.fn().mockReturnValue([]),
      zeroDays: vi.fn().mockReturnValue(5),
      publicExploits: vi.fn().mockReturnValue([]),
      botnetSize: vi.fn().mockReturnValue(10),
      craftArtifacts: vi.fn(),
      sellZeroDay: vi.fn(),
      discloseZeroDay: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [AssetVaultComponent],
      providers: [
        { provide: GameService, useValue: gameService }
      ]
    });
    const fixture = TestBed.createComponent(AssetVaultComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate progress bar', () => {
    // 50% of 15 bars = 7.5 -> 7 bars
    const bar = component.getProgressBar(50);
    expect(bar).toContain('███████');
    expect(bar.length).toBe(15);
  });
});
