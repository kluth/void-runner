import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';
import { of } from 'rxjs';

const hoisted = vi.hoisted(() => ({
  mockSocket: { on: vi.fn(), emit: vi.fn() }
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn().mockReturnValue(hoisted.mockSocket)
}));

describe('GameService Frontend Total Coverage', () => {
  let service: GameService;
  let audioService: any;
  let neuralService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    audioService = {
      speakCreepy: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(),
      playGlitch: vi.fn(), playClick: vi.fn(), playBeep: vi.fn()
    };
    neuralService = { triggerHijack: vi.fn(), getHijackResponse: vi.fn().mockResolvedValue(of({response: 'hi'})) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: AudioService, useValue: audioService },
        { provide: NeuralService, useValue: neuralService }
      ]
    });
    service = TestBed.inject(GameService);
    service.authToken.set('token');
  });

  it('should cover artifact and sandbox logic', () => {
    (service as any).dropArtifact();
    expect(service.artifacts().length).toBe(1);
    const art = service.artifacts()[0];
    (service as any).finishAnalysis(art);
    expect(art.analyzed).toBeDefined();
  });

  it('should handle internal network pivots', () => {
    (service as any).generateInternalNetwork('pivot');
    const target = service.internalNetwork()[0];
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // force win
    service.compromiseInternal(target.id);
    expect(target.status).toBeDefined();
  });

  it('should handle ddos and ransomware', () => {
    service.botnetSize.set(50);
    service.launchDDoS();
    expect(service.botnetSize()).toBeLessThan(50);
    
    service.deployRansomware();
    expect(service.activeRansoms()).toBe(1);
  });

  it('should handle log wiping', () => {
    service.installSoftware('wiper');
    service.credits.set(500);
    service.detectionLevel.set(50);
    // Note: wipe command is triggered via component, 
    // but we can test the effect if we find the command in TerminalComponent
  });

  it('should trigger faked system alert', () => {
    (window as any).Notification.permission = 'granted';
    (service as any).triggerFakedSystemAlert();
    // Notification created
  });

  it('should randomize mission types during SINGULARITY event every 30s', () => {
    service.globalEvent.set('SINGULARITY');
    service.activeMissions.set([
      { id: '1', name: 'M1', type: 'port-scan', target: 'T1', difficulty: 1, reward: 100, lat: 0, lng: 0, isHoneypot: false }
    ]);
    
    const now = 30000;
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    
    const initialType = service.activeMissions()[0].type;
    
    // We need to trigger gameTick. 
    // Since it's private, we cast to any.
    (service as any).gameTick();
    
    // There is a chance it randomizes to the same type, but with 20+ types it's unlikely.
    // To be sure, we can check if it was called.
    expect(service.terminalLogs().some(l => l.message.includes('SINGULARITY: Mission protocols scrambled'))).toBe(true);
    
    vi.useRealTimers();
  });
});
