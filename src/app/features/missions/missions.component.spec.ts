import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MissionComponent } from './missions.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { signal } from '@angular/core';

describe('MissionComponent Port Scan Enhancement', () => {
  let component: MissionComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      activeMissions: signal([]),
      log: vi.fn(),
      triggerVisualEvent: vi.fn(),
      completeMission: vi.fn(),
      increaseDetection: vi.fn(),
      detectionLevel: signal(0),
      blueTeamActive: signal(false)
    };

    TestBed.configureTestingModule({
      imports: [MissionComponent],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: AudioService, useValue: { playClick: vi.fn(), playSuccess: vi.fn(), playError: vi.fn() } }
      ]
    });
    const fixture = TestBed.createComponent(MissionComponent);
    component = fixture.componentInstance;
    vi.useFakeTimers();
  });

  afterEach(() => {
    component.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should initialize ports with fluctuating frequencies', () => {
    component.startMission({ type: 'port-scan', name: 'Test Scan', lat: 0, lng: 0 } as any);
    expect(component.ports().length).toBe(18);
    expect(component.targetFrequency()).toBeGreaterThan(0);
    expect(component.ports()[0].frequency).toBeDefined();
  });

  it('should update port frequencies over time', () => {
    component.startMission({ type: 'port-scan', name: 'Test Scan', lat: 0, lng: 0 } as any);
    const initialFreq = component.ports()[0].frequency;
    
    // Advance timers
    vi.advanceTimersByTime(200);
    
    expect(component.ports()[0].frequency).not.toBe(initialFreq);
  });

  it('should only succeed port scan if frequency matches target', () => {
    component.startMission({ type: 'port-scan', name: 'Test Scan', lat: 0, lng: 0 } as any);
    const port = component.ports()[0];
    port.open = true; 
    
    // Set frequency way off
    port.frequency = component.targetFrequency() + 100;
    component.scanPort(port);
    expect(gameService.completeMission).not.toHaveBeenCalled();
    expect(gameService.increaseDetection).toHaveBeenCalled();

    // Set frequency to match
    port.scanned = false; 
    port.frequency = component.targetFrequency();
    component.scanPort(port);
    expect(gameService.completeMission).toHaveBeenCalled();
  });

  it('should handle buffer-overflow minigame logic', () => {
    component.startMission({ type: 'buffer-overflow', name: 'Test Buffer', lat: 0, lng: 0 } as any);
    expect(component.bufferFill()).toBe(0);

    component.addBytes(10);
    expect(component.bufferFill()).toBe(10);

    component.addBytes(90);
    expect(component.bufferFill()).toBe(100);
    expect(gameService.completeMission).toHaveBeenCalled();
  });

  it('should fail buffer-overflow if it exceeds 100%', () => {
    component.startMission({ type: 'buffer-overflow', name: 'Test Buffer', lat: 0, lng: 0 } as any);
    
    component.addBytes(50);
    component.addBytes(60); // 110%
    
    expect(gameService.increaseDetection).toHaveBeenCalledWith(100);
    expect(gameService.completeMission).not.toHaveBeenCalled();
    expect(component.activeMission()).toBeNull();
  });
});
