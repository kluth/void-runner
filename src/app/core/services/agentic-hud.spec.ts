import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OnboardAiService } from './onboard-ai.service';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Agentic HUD (Issue #27)', () => {
  let service: OnboardAiService;

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
  });

  it('should have an agenticInsights signal', () => {
    expect(service.agenticInsights()).toBeDefined();
  });

  it('should generate proactive insights based on system state', () => {
    (service as any).game.systemHeat.set(85);
    (service as any).processAgenticAnalysis();
    
    expect(service.agenticInsights()).toContainEqual(expect.objectContaining({ type: 'WARNING' }));
  });
});
