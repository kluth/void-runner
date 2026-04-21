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
      terminalLogs: signal([]),
      log: vi.fn(),
      activeMissions: signal([]),
      playerHandle: signal('TEST'),
      reputation: signal(100),
      campaignLevel: signal(1),
      routingMode: signal('DIRECT'),
      detectionLevel: signal(0),
      systemIntegrity: signal(100),
      botnetSize: signal(0),
      activeRansoms: signal(0),
      credits: signal(500),
      experience: signal(100),
      matrixMode: signal(false),
      activeTeam: signal(null),
      installedSoftware: signal([]),
      detectedOS: signal('LINUX'),
      commandHistory: signal([]),
      processCommand: vi.fn(),
      triggerVisualEvent: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [TerminalComponent, FormsModule],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: AudioService, useValue: { playError: vi.fn(), playClick: vi.fn(), playGlitch: vi.fn(), playSuccess: vi.fn() } },
        { provide: NeuralService, useValue: { aiMode: signal('PROXY'), isProcessing: signal(false), askGemini: vi.fn().mockReturnValue(of({ response: 'hi', provider: 'M' })) } }
      ]
    });
    const fixture = TestBed.createComponent(TerminalComponent);
    component = fixture.componentInstance;
  });

  it('should handle help command', () => {
    component.cmdInput = 'help';
    component.handleCmd();
    expect(gameService.processCommand).toHaveBeenCalledWith('help');
  });

  it('should handle whoami command', () => {
    component.cmdInput = 'whoami';
    component.handleCmd();
    expect(gameService.processCommand).toHaveBeenCalledWith('whoami');
  });

  it('should navigate history', () => {
    gameService.commandHistory.set(['test1', 'test2']);
    
    component.navigateHistory(1);
    expect(component.cmdInput).toBe('test2');
    component.navigateHistory(1);
    expect(component.cmdInput).toBe('test1');
  });
});
