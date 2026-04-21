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
      mountedHardware: vi.fn().mockReturnValue([null, null, null]),
      inventory: vi.fn().mockReturnValue([]),
      currentPowerUsage: vi.fn().mockReturnValue(10),
      totalPowerCapacity: vi.fn().mockReturnValue(100),
      buyHardware: vi.fn(),
      mountHardware: vi.fn(),
      unmountHardware: vi.fn()
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

  it('should buy hardware if unlocked', () => {
    const item = { id: 'h1', price: 100, unlocked: true } as any;
    component.buyItem(item);
    expect(gameService.buyHardware).toHaveBeenCalledWith(item);
  });

  it('should not buy hardware if locked', () => {
    const item = { id: 'h1', price: 100, unlocked: false } as any;
    component.buyItem(item);
    expect(gameService.buyHardware).not.toHaveBeenCalled();
  });

  it('should generate power bar ascii', () => {
    // 10/100 = 10% -> 2 bars of 20
    expect(component.getPowerBar()).toBe('██');
    expect(component.getEmptyPowerBar()).toBe('░░░░░░░░░░░░░░░░░░');
  });

  it('should select slot for mounting', () => {
    const item = { id: 'i1', name: 'Item 1' } as any;
    component.selectedInventoryItem = item;
    component.selectSlot(1);
    expect(component.selectedSlot).toBe(1);
  });

  it('should unmount hardware if no item selected', () => {
    component.selectedInventoryItem = null;
    component.selectSlot(1);
    expect(gameService.unmountHardware).toHaveBeenCalledWith(1);
  });

  it('should confirm mount', () => {
    const item = { id: 'i1', name: 'Item 1' } as any;
    component.selectedInventoryItem = item;
    component.selectedSlot = 1;
    component.confirmMount();
    expect(gameService.mountHardware).toHaveBeenCalledWith(item, 1);
    expect(component.selectedSlot).toBeNull();
    expect(component.selectedInventoryItem).toBeNull();
  });
});
