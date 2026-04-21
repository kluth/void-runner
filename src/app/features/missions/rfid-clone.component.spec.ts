import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RfidCloneComponent } from './rfid-clone.component';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { signal } from '@angular/core';

describe('RfidCloneComponent', () => {
  let component: RfidCloneComponent;
  let fixture: ComponentFixture<RfidCloneComponent>;
  let mockGameService: any;
  let mockAudioService: any;

  beforeEach(async () => {
    mockGameService = {
      completeMission: vi.fn(),
      failMission: vi.fn(),
      log: vi.fn(),
      triggerVisualEvent: vi.fn()
    };

    mockAudioService = {
      playClick: vi.fn(),
      playSuccess: vi.fn(),
      playError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RfidCloneComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: AudioService, useValue: mockAudioService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RfidCloneComponent);
    component = fixture.componentInstance;
    component.mission = {
      id: 'test-id',
      name: 'Test Mission',
      target: 'Test Target',
      difficulty: 1,
      reward: 100,
      lat: 0,
      lng: 0,
      type: 'rfid-clone',
      isHoneypot: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with moving bar', () => {
    // Initial position is 50 because sin(0) = 0, and (0+1)*50 = 50
    expect(component.barPosition()).toBe(50);
  });

  it('should complete mission if stopped in Clone Zone', () => {
    // Manually set bar position to within zone
    component.barPosition.set(50);
    component.zoneStart.set(40);
    component.zoneEnd.set(60);
    
    component.stopSignal();
    
    expect(mockGameService.completeMission).toHaveBeenCalled();
  });

  it('should fail mission if stopped outside Clone Zone', () => {
    // Manually set bar position to outside zone
    component.barPosition.set(20);
    component.zoneStart.set(40);
    component.zoneEnd.set(60);
    
    component.stopSignal();
    
    expect(mockGameService.failMission).toHaveBeenCalled();
  });
});
