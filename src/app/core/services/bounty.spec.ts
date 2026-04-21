import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService, Mission } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

describe('GameService Bounty Integration', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { log: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn() } },
        { provide: NeuralService, useValue: {} }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should add an Elite bounty to activeMissions when accepted', () => {
    const bounty: any = {
      id: 'b-test',
      target: 'TEST_TARGET',
      reward: 1000,
      difficulty: 'ELITE',
      type: 'DATA_THEFT',
      issuer: 'MYSTERIOUS_X',
      expiresIn: '10:00'
    };

    service.acceptBounty(bounty);

    const missions = service.activeMissions();
    const acceptedMission = missions.find(m => m.target === 'TEST_TARGET');

    expect(acceptedMission).toBeDefined();
    expect(acceptedMission?.difficulty).toBeGreaterThan(3); // Assuming Elite is high difficulty
    expect((acceptedMission as any).difficultyLabel).toBe('ELITE');
    expect(acceptedMission?.hardwareReward).toBeDefined();
  });

  it('should grant a hardware reward when an elite bounty is completed', () => {
    const hardwareItem = { id: 'test-hw', name: 'Test HW', description: 'Test', price: 100, bonusType: 'recon', bonusValue: 10, unlocked: true, powerDraw: 5 };
    const mission: any = {
      id: 'm-test',
      name: 'Test Mission',
      target: 'TEST_TARGET',
      difficulty: 5,
      reward: 0,
      lat: 0,
      lng: 0,
      type: 'port-scan',
      isHoneypot: false,
      hardwareReward: hardwareItem
    };

    const initialInventoryCount = service.inventory().length;
    service.completeMission(mission);

    expect(service.inventory()).toContainEqual(hardwareItem);
    expect(service.inventory().length).toBe(initialInventoryCount + 1);
  });
});
