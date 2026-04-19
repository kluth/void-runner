import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TerminalComponent } from './terminal.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NeuralService } from '../../core/services/neural.service';
import { AudioService } from '../../core/services/audio.service';
import { signal } from '@angular/core';

describe('TerminalComponent Man Command (TDD)', () => {
  let component: TerminalComponent;
  let gameService: any;

  beforeEach(() => {
    gameService = {
      log: vi.fn(),
      terminalLogs: signal([]),
      installedSoftware: signal([]),
      activeMissions: signal([]),
      reputation: signal(0),
      campaignLevel: signal(1),
      playerHandle: signal('TEST'),
      routingMode: signal('DIRECT'),
      detectionLevel: signal(0),
      systemIntegrity: signal(100),
      botnetSize: signal(0),
      activeRansoms: signal(0),
      matrixMode: signal(false),
      settings: signal({ control: { autocomplete: true } }),
      updateSetting: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [TerminalComponent, HttpClientTestingModule],
      providers: [
        { provide: GameService, useValue: gameService },
        { provide: AudioService, useValue: { playClick: vi.fn(), playSuccess: vi.fn(), playError: vi.fn(), playGlitch: vi.fn() } },
        { provide: NeuralService, useValue: { askGemini: vi.fn(), aiMode: signal('LOCAL') } }
      ]
    });
    const fixture = TestBed.createComponent(TerminalComponent);
    component = fixture.componentInstance;
  });

  it('should show manual for a specific command', () => {
    component.cmdInput = 'man ls';
    component.handleCmd();
    expect(gameService.log).toHaveBeenCalledWith(expect.stringContaining('NAME: ls'));
  });

  it('should handle set command for settings', () => {
    component.cmdInput = 'set audio.volume 80';
    component.handleCmd();
    expect(gameService.updateSetting).toHaveBeenCalledWith('audio.volume', '80');
  });
});
