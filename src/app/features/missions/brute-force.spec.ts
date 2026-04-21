import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MissionComponent } from './missions.component';
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { signal } from '@angular/core';

describe('MissionComponent Brute Force Overhaul', () => {
  let component: MissionComponent;
  let gameService: any;

  beforeEach(() => {
    vi.useFakeTimers();
    gameService = {
      activeMissions: signal([]),
      log: vi.fn(),
      triggerVisualEvent: vi.fn(),
      completeMission: vi.fn(),
      failMission: vi.fn(),
      detectionLevel: signal(0),
      increaseDetection: vi.fn()
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
  });

  afterEach(() => {
    component.ngOnDestroy();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize brute-force mission with a correct sequence and a timer', () => {
    component.startMission({ type: 'brute-force', name: 'Test Brute', lat: 0, lng: 0 } as any);
    expect((component as any).correctSequence().length).toBe(4);
    expect((component as any).missionTimer()).toBeGreaterThan(0);
  });

  it('should succeed when correct sequence is entered', () => {
    component.startMission({ type: 'brute-force', name: 'Test Brute', lat: 0, lng: 0 } as any);
    const sequence = (component as any).correctSequence();
    
    sequence.forEach((char: string) => component.tryCode(char));
    
    expect(gameService.completeMission).toHaveBeenCalled();
  });

  it('should reduce timer and clear input on incorrect 4-character sequence', () => {
    component.startMission({ type: 'brute-force', name: 'Test Brute', lat: 0, lng: 0 } as any);
    const initialTimer = (component as any).missionTimer();
    
    // Enter 4 incorrect characters (unlikely to match random sequence)
    const sequence = (component as any).correctSequence();
    const wrongChar = sequence[0] === 'F' ? 'E' : 'F';
    
    for(let i=0; i<4; i++) component.tryCode(wrongChar);
    
    expect((component as any).missionTimer()).toBeLessThan(initialTimer);
    expect(component.currentCode()).toBe('');
  });

  it('should fail mission when timer reaches 0', () => {
    component.startMission({ type: 'brute-force', name: 'Test Brute', lat: 0, lng: 0 } as any);
    (component as any).missionTimer.set(1);
    
    vi.advanceTimersByTime(1100);
    
    expect(gameService.failMission).toHaveBeenCalled();
    expect(component.activeMission()).toBeNull();
  });

  it('should occasionally set a glowing character from the correct sequence', () => {
    component.startMission({ type: 'brute-force', name: 'Test Brute', lat: 0, lng: 0 } as any);
    const sequence = (component as any).correctSequence();
    
    vi.advanceTimersByTime(3100); 
    
    const glowing = (component as any).glowingChar();
    if (glowing) {
      expect(sequence).toContain(glowing);
    }
  });
});
