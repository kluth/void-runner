import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameService } from './game.service';
import { NeuralService } from './neural.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Omni-Shell Command Synthesizer (Issue #51)', () => {
  let service: GameService;
  let neuralService: NeuralService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        NeuralService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GameService);
    neuralService = TestBed.inject(NeuralService);
  });

  it('should have a commandSuggestions signal that defaults to an empty array', () => {
    expect((service as any).commandSuggestions()).toEqual([]);
  });

  it('should synthesize suggestions based on mission context', () => {
    vi.useFakeTimers();
    // Mock active mission
    service.activeMissions.set([{
      id: 'm1', name: 'OP_BRUTE', target: 'CORP_SRV_1', difficulty: 1, reward: 100,
      type: 'brute-force', lat: 0, lng: 0, isHoneypot: false
    }]);

    // Mock AI response
    const spy = vi.spyOn(neuralService, 'askGemini').mockReturnValue(of({
      response: 'brute-force CORP_SRV_1 --user admin --pass dictionary.txt',
      provider: 'LOCAL'
    }));

    (service as any).synthesizeSuggestions('bru');
    
    const suggestions = (service as any).commandSuggestions();
    expect(suggestions).toContain('brute-force CORP_SRV_1 --user admin --pass dictionary.txt');
    vi.useRealTimers();
  });

  it('should clear suggestions when input is empty', () => {
    (service as any).commandSuggestions.set(['some-suggestion']);
    (service as any).synthesizeSuggestions('');
    expect((service as any).commandSuggestions()).toEqual([]);
  });
});
