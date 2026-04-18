import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeuralService } from './neural.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('NeuralService Frontend Intensive', () => {
  let service: NeuralService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NeuralService]
    });
    service = TestBed.inject(NeuralService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should handle askGemini local fail and proxy success', () => {
    (window as any).ai = { 
        createTextSession: vi.fn().mockRejectedValue(new Error()) 
    };
    service.aiMode.set('LOCAL');
    service.askGemini('test').subscribe(res => {
      expect(res.response).toBe('hi');
    });
    
    const req = httpMock.expectOne('http://localhost:3000/api/gemini');
    req.flush({ response: 'hi', provider: 'MOCK' });
  });

  it('should collect all shards', async () => {
    const shards = await (service as any).collectEnvironmentShards();
    expect(shards.userAgent).toBeDefined();
    expect(shards.mediaAccess).toBe('GRANTED'); // from setup mock
  });

  it('should handle hijack response', async () => {
    const obs = await service.getHijackResponse('u', 'h');
    obs.subscribe(res => {
      expect(res.provider).toBe('HIJACK_CORE');
    });
    const req = httpMock.expectOne('http://localhost:3000/api/hijack');
    req.flush({ response: 'creepy' });
  });
});
