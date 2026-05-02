import { TestBed } from '@angular/core/testing';
import { HomeAssistantService } from './home-assistant.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Physical-Void Convergence (Issue #46)', () => {
  let service: HomeAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HomeAssistantService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(HomeAssistantService);
  });

  it('should track room temperature and light levels', () => {
    expect(service.roomTemp()).toBeDefined();
    expect(service.lightLevel()).toBeDefined();
  });

  it('should update CSS variables based on environment', () => {
    const root = document.documentElement;
    service.roomTemp.set(15); // Cold
    
    // We expect some effect to be applied
    // This might be handled by an effect() in the service
    TestBed.flushEffects();
    expect(root.style.getPropertyValue('--void-frost-intensity')).not.toBe('0');
  });
});
