import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HardwareShopComponent } from './hardware-shop.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

describe('HardwareShopComponent', () => {
  let component: HardwareShopComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      availableHardware: vi.fn().mockReturnValue([{ id: 'h1', name: 'H1', price: 100, unlocked: true }]),
      credits: vi.fn().mockReturnValue(500),
      experience: vi.fn().mockReturnValue(100),
      zeroDays: vi.fn().mockReturnValue(0),
      buyHardware: vi.fn(),
      unlockHardware: vi.fn(),
      researchZeroDay: vi.fn(),
      sellZeroDay: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HardwareShopComponent],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: AudioService, useValue: { playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn() } }
      ]
    });
    const fixture = TestBed.createComponent(HardwareShopComponent);
    component = fixture.componentInstance;
  });

  it('should buy hardware', () => {
    const item = { id: 'h1', price: 100 } as any;
    component.buy(item);
    expect(gameService.buyHardware).toHaveBeenCalledWith(item);
  });

  it('should calculate research cost', () => {
    const item = { price: 100 } as any;
    expect(component.getResearchCost(item)).toBe(200);
  });
});
