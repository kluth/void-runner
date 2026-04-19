import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionComponent } from './missions.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { signal } from '@angular/core';

describe('MissionComponent Mastery', () => {
  let component: MissionComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      activeMissions: signal([]),
      zeroDays: signal(0),
      log: vi.fn(),
      useZeroDay: vi.fn(),
      increaseDetection: vi.fn(),
      installedSoftware: signal([]),
      blueTeamActive: signal(false),
      completeMission: vi.fn(),
      totalReconBonus: signal(0),
      totalExploitBonus: signal(0),
      totalSocialBonus: signal(0),
      detectionLevel: signal(0),
      failMission: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [MissionComponent],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: AudioService, useValue: { playGlitch: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playClick: vi.fn(), playBeep: vi.fn() } }
      ]
    });
    const fixture = TestBed.createComponent(MissionComponent);
    component = fixture.componentInstance;
  });

  it('should run all minigames', () => {
    // 1. RFID
    component.startMission({ type: 'rfid-clone', difficulty: 1 } as any);
    component.interceptRfid({ active: true });
    expect(component.rfidCaptured).toBe(1);

    // 2. Buffer Overflow
    component.startMission({ type: 'buffer-overflow', difficulty: 1 } as any);
    component.selectedByte = 'E';
    component.injectByte(component.eipOffset());
    component.selectedByte = 'F';
    component.injectByte(component.eipOffset() + 1);
    component.checkOverflow();
    expect(gameService.completeMission).toHaveBeenCalled();

    // 3. XSS
    component.startMission({ type: 'xss-injection', difficulty: 1 } as any);
    component.xssPayload = '<img src=x onerror=alert(1)>';
    component.testXss();

    // 4. OSINT
    component.startMission({ type: 'osint-research', difficulty: 1 } as any);
    component.osintAnswer = (component as any).correctPet;
    component.checkOsint();

    // 5. Phishing
    component.startMission({ type: 'phishing-campaign', difficulty: 1 } as any);
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    component.spamScore = 100;
    component.launchPhishing();

    // 6. MITM
    component.startMission({ type: 'mitm-attack', difficulty: 1 } as any);
    component.interceptPacket({ isTarget: true });
    component.interceptPacket({ isTarget: true });
    component.interceptPacket({ isTarget: true });
  });

  it('should handle blue team sabotage', () => {
    gameService.blueTeamActive.set(true);
    component.startMission({ type: 'port-scan', difficulty: 1 } as any);
    component.ports.set([{ num: 80, status: 'open', scanned: true }]);
    (component as any).executeSabotage();
    expect(component.ports()[0].scanned).toBe(false);
  });
});
