import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScribeService } from './scribe.service';
import { GameService } from './game.service';
import { NeuralService } from './neural.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Neural-Scribe (Issue #37)', () => {
  let service: ScribeService;
  let neural: NeuralService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScribeService,
        GameService,
        NeuralService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ScribeService);
    neural = TestBed.inject(NeuralService);
  });

  it('should have a scribeLogs signal', () => {
    expect(service.scribeLogs()).toEqual([]);
  });

  it('should generate a log when a mission is completed', async () => {
    vi.spyOn(neural, 'askGemini').mockReturnValue(of({ response: 'Test narrative log.', provider: 'M' }));
    
    service.documentEvent('MISSION_COMPLETE', { name: 'OP_VOID' });
    
    // The observable from of() is synchronous, but let's be safe
    expect(service.scribeLogs()).toContainEqual(expect.objectContaining({ text: 'Test narrative log.' }));
  });
});
