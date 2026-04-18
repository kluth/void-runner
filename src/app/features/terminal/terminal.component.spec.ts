import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TerminalComponent } from './terminal.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { NeuralService } from '../../core/services/neural.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('TerminalComponent', () => {
  let component: TerminalComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      terminalLogs: vi.fn().mockReturnValue([]),
      log: vi.fn(),
      activeMissions: vi.fn().mockReturnValue([]),
      playerHandle: vi.fn().mockReturnValue('TEST'),
      reputation: vi.fn().mockReturnValue(100),
      campaignLevel: vi.fn().mockReturnValue(1),
      routingMode: vi.fn().mockReturnValue('DIRECT'),
      detectionLevel: vi.fn().mockReturnValue(0),
      systemIntegrity: vi.fn().mockReturnValue(100),
      botnetSize: vi.fn().mockReturnValue(0),
      activeRansoms: vi.fn().mockReturnValue(0),
      credits: vi.fn().mockReturnValue(500),
      experience: vi.fn().mockReturnValue(100),
      matrixMode: vi.fn().mockReturnValue(false),
      activeTeam: vi.fn().mockReturnValue(null),
      installedSoftware: vi.fn().mockReturnValue([])
    };

    TestBed.configureTestingModule({
      imports: [TerminalComponent, FormsModule],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: AudioService, useValue: { playError: vi.fn(), playClick: vi.fn(), playGlitch: vi.fn() } },
        { provide: NeuralService, useValue: { aiMode: vi.fn().mockReturnValue('PROXY'), isProcessing: vi.fn().mockReturnValue(false), askGemini: vi.fn().mockReturnValue(of({ response: 'hi', provider: 'M' })) } }
      ]
    });
    const fixture = TestBed.createComponent(TerminalComponent);
    component = fixture.componentInstance;
  });

  it('should handle help command', () => {
    component.cmdInput = 'help';
    component.handleCmd();
    expect(gameService.log).toHaveBeenCalledWith(expect.stringContaining('AVAILABLE BINARIES'));
  });

  it('should handle whoami command', () => {
    component.cmdInput = 'whoami';
    component.handleCmd();
    expect(gameService.log).toHaveBeenCalledWith(expect.stringContaining('USER: TEST'));
  });

  it('should navigate history', () => {
    component.cmdInput = 'test1';
    component.handleCmd();
    component.cmdInput = 'test2';
    component.handleCmd();
    
    component.navigateHistory(1);
    expect(component.cmdInput).toBe('test2');
    component.navigateHistory(1);
    expect(component.cmdInput).toBe('test1');
  });
});
