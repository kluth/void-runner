import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameService } from './game.service';
import { NeuralService } from './neural.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Neural-Biometric Authentication (Issue #41)', () => {
  let service: GameService;
  let neural: NeuralService;

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
    neural = TestBed.inject(NeuralService);
  });

  it('should verify biometrics if media access is granted', async () => {
    vi.spyOn(neural, 'collectEnvironmentShards').mockResolvedValue({ mediaAccess: 'GRANTED' } as any);
    
    const result = await service.verifyBiometrics();
    expect(result).toBe(true);
    expect(service.biometricVerified()).toBe(true);
  });

  it('should fail verification if media access is refused', async () => {
    vi.spyOn(neural, 'collectEnvironmentShards').mockResolvedValue({ mediaAccess: 'REFUSED' } as any);
    
    const result = await service.verifyBiometrics();
    expect(result).toBe(false);
    expect(service.biometricVerified()).toBe(false);
  });

  it('should require biometric verification for researchZeroDay', () => {
    service.authToken.set('valid-token');
    service.biometricVerified.set(false);
    
    const result = service.researchZeroDay();
    expect(result).toBe(false);
    
    service.biometricVerified.set(true);
    service.experience.set(1000);
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Ensure success
    const resultSuccess = service.researchZeroDay();
    expect(resultSuccess).toBe(true);
  });
});
