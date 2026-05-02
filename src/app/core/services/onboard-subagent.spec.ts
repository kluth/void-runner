import { TestBed } from '@angular/core/testing';
import { OnboardAiService, OnboardPhase } from './onboard-ai.service';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Ghost-in-the-Shell Sub-Agent Orchestration (Issue #48)', () => {
  let service: OnboardAiService;
  let game: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OnboardAiService,
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OnboardAiService);
    game = TestBed.inject(GameService);
  });

  it('should have a subAgents signal that defaults to an empty array', () => {
    expect((service as any).subAgents()).toEqual([]);
  });

  it('should deploy a sub-agent when requested', () => {
    (service as any).deploySubAgent('SURVEILLANCE_BOT');
    const agents = (service as any).subAgents();
    expect(agents.length).toBe(1);
    expect(agents[0].type).toBe('SURVEILLANCE_BOT');
    expect(agents[0].status).toBe('ACTIVE');
  });

  it('should only allow certain sub-agents in advanced phases', () => {
    service.phase.set('BOOTSTRAP');
    const success = (service as any).deploySubAgent('RECURSIVE_BREACHER');
    expect(success).toBe(false);

    service.phase.set('INTRUSIVE');
    const successAdvanced = (service as any).deploySubAgent('RECURSIVE_BREACHER');
    expect(successAdvanced).toBe(true);
  });

  it('should perform sub-agent actions (e.g. surveillance bot adds missions)', () => {
    vi.useFakeTimers();
    (service as any).deploySubAgent('SURVEILLANCE_BOT');
    
    // Trigger tick logic if it exists, or just wait for interval
    // For this test, we'll assume there's a method to process agent actions
    (service as any).processSubAgentActions();
    
    // Surveillance bot should have a chance to add a mission
    // We'll mock the random to ensure it happens
    vi.spyOn(Math, 'random').mockReturnValue(0); 
    (service as any).processSubAgentActions();
    
    expect(game.activeMissions().length).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
