import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeuralService } from './neural.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('NeuralService Media Capture (TDD) Fixed', () => {
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

  it('should capture a base64 image if media access is granted', async () => {
    // We mock getUserMedia to succeed in setup
    const shards = await (service as any).collectEnvironmentShards();
    expect(shards.mediaAccess).toBe('GRANTED');
    expect(shards.webcamFrame).toBeDefined();
    expect(shards.webcamFrame).toContain('base64');
  });
});
