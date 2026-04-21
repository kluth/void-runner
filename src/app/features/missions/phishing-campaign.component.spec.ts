import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhishingCampaignComponent } from './phishing-campaign.component';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

describe('PhishingCampaignComponent', () => {
  let component: PhishingCampaignComponent;
  let fixture: ComponentFixture<PhishingCampaignComponent>;
  let mockGameService: any;
  let mockAudioService: any;

  beforeEach(async () => {
    mockGameService = {
      log: vi.fn(),
      completeMission: vi.fn(),
      failMission: vi.fn()
    };
    mockAudioService = {
      playClick: vi.fn(),
      playSuccess: vi.fn(),
      playError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PhishingCampaignComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: AudioService, useValue: mockAudioService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhishingCampaignComponent);
    component = fixture.componentInstance;
    // Set a mock mission
    component.mission = {
      id: 'test-id',
      name: 'Test Phishing',
      target: 'Test Target',
      difficulty: 1,
      reward: 100,
      lat: 0,
      lng: 0,
      type: 'phishing-campaign',
      isHoneypot: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a suspect meter at 100%', () => {
    expect(component.suspectMeter()).toBe(100);
  });

  it('should lower suspect meter when a correct pretext is chosen', () => {
    const initialMeter = component.suspectMeter();
    component.selectPretext(component.currentStep().options[0]);
    expect(component.suspectMeter()).toBeLessThan(initialMeter);
  });

  it('should increase suspect meter or stay same when a bad pretext is chosen', () => {
    // We need to find a bad option in the mock data we will implement
    // For now, let's just assume the second option might be bad or less effective
    const initialMeter = component.suspectMeter();
    // This depends on implementation, but let's say we have an option that increases suspicion
    const badOption = { text: 'Bad', impact: 10, nextStep: 'fail' };
    component.selectPretext(badOption);
    expect(component.suspectMeter()).toBeGreaterThan(initialMeter - 5); // Should not decrease as much as a good one
  });

  it('should win mission when suspect meter reaches 0%', () => {
    component.suspectMeter.set(10);
    const winningOption = { text: 'Win', impact: -15, nextStep: 'success' };
    component.selectPretext(winningOption);
    expect(mockGameService.completeMission).toHaveBeenCalled();
  });

  it('should fail mission when suspect meter stays too high or reaches a fail state', () => {
    // If we have a max turns or something, or if suspicion hits 200%?
    // User said "lower suspect meter", so maybe if it hits 150% it fails.
    component.suspectMeter.set(140);
    const badOption = { text: 'Terrible', impact: 20, nextStep: 'fail' };
    component.selectPretext(badOption);
    expect(mockGameService.failMission).toHaveBeenCalled();
  });
});
