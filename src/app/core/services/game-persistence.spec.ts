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

describe('GameService Persistence (TDD)', () => {
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

  it('should sync full state including inventory and software to backend', () => {
    service.authToken.set('valid-token');
    service.credits.set(1337);
    service.inventory.set([{ id: 'pineapple', name: 'Pineapple', description: '', price: 100, bonusType: 'recon', bonusValue: 10, unlocked: true }]);
    service.installedSoftware.update(sw => sw.map(s => s.id === 'nmap-pro' ? { ...s, installed: true } : s));

    (service as any).updateRemoteScore();

    expect(hoisted.emit).toHaveBeenCalledWith('update_score', expect.objectContaining({
      credits: 1337,
      inventory: JSON.stringify(['pineapple']),
      software: expect.stringContaining('nmap-pro')
    }));
  });

  it('should restore full state from init_state event', () => {
    const mockPlayer = {
      credits: 999,
      experience: 50,
      botnetSize: 5,
      campaignLevel: 2,
      reputation: 10,
      score: 100,
      inventory: JSON.stringify(['ducky']),
      software: JSON.stringify(['wiper'])
    };

    // Find the handler for init_state
    const initCall = hoisted.on.mock.calls.find(c => c[0] === 'init_state');
    const initHandler = initCall[1];
    
    initHandler({ 
        player: mockPlayer, 
        leaderboard: [], 
        chatMessages: [], 
        teams: [], 
        globalEvent: 'NONE', 
        eventTimer: 0 
    });

    expect(service.credits()).toBe(999);
    expect(service.inventory().some(i => i.id === 'ducky')).toBe(true);
    expect(service.installedSoftware().find(s => s.id === 'wiper')?.installed).toBe(true);
  });
});
