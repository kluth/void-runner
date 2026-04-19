import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

const hoisted = vi.hoisted(() => {
    return {
        on: vi.fn(),
        emit: vi.fn()
    };
});

vi.mock('socket.io-client', () => {
    return {
        io: vi.fn(() => hoisted)
    };
});

describe('GameService Advanced Persistence (TDD)', () => {
  let service: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: { log: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn(), speakCreepy: vi.fn() } },
        { provide: NeuralService, useValue: { getHijackResponse: vi.fn(), http: { get: vi.fn() } } }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should persist tactical metrics like integrity and debuffs to backend', () => {
    service.authToken.set('valid-token');
    service.systemIntegrity.set(42);
    service.detectionLevel.set(88.5);
    const debuff = { id: 'test', name: 'LOGIC_BOMB', type: 'GLITCH' as const, expiresAt: Date.now() + 10000 };
    service.activeDebuffs.set([debuff]);

    (service as any).updateRemoteScore();

    expect(hoisted.emit).toHaveBeenCalledWith('update_score', expect.objectContaining({
      systemIntegrity: 42,
      detectionLevel: 88.5,
      activeDebuffs: expect.stringContaining('LOGIC_BOMB')
    }));
  });

  it('should restore tactical metrics from init_state', () => {
    const mockPlayer = {
      credits: 500,
      experience: 100,
      systemIntegrity: 66,
      detectionLevel: 15.5,
      activeDebuffs: JSON.stringify([{ id: 'd1', name: 'RANSOM', type: 'RANSOM', expiresAt: 9999999999999 }]),
      artifacts: JSON.stringify([{ id: 'art1', name: 'DUMP', type: 'binary', analysisProgress: 0, analyzed: false, rewardType: 'credits' }]),
      publicExploits: JSON.stringify(['port-scan']),
      inventory: '[]',
      software: '[]',
      reputation: 0,
      score: 0,
      botnetSize: 0,
      campaignLevel: 1
    };

    const initCall = hoisted.on.mock.calls.find(c => c[0] === 'init_state');
    initCall[1]({ player: mockPlayer, leaderboard: [], chatMessages: [], teams: [], globalEvent: 'NONE', eventTimer: 0 });

    expect(service.systemIntegrity()).toBe(66);
    expect(service.detectionLevel()).toBe(15.5);
    expect(service.activeDebuffs().length).toBe(1);
    expect(service.artifacts().length).toBe(1);
    expect(service.publicExploits()).toContain('port-scan');
  });
});
