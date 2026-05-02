import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Neural-Adaptive Fidelity Mode (Issue #54)', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should have a neuralLoad signal that defaults to 0', () => {
    expect((service as any).neuralLoad()).toBe(0);
  });

  it('should compute fidelityMode as AESTHETIC when neuralLoad is low', () => {
    (service as any).neuralLoad.set(50);
    expect((service as any).fidelityMode()).toBe('AESTHETIC');
  });

  it('should compute fidelityMode as SAFE when neuralLoad is high (>= 80)', () => {
    (service as any).neuralLoad.set(80);
    expect((service as any).fidelityMode()).toBe('SAFE');
    
    (service as any).neuralLoad.set(95);
    expect((service as any).fidelityMode()).toBe('SAFE');
  });

  it('should update CSS variables when fidelityMode changes to SAFE', () => {
    const root = document.documentElement;
    const spy = vi.spyOn(root.style, 'setProperty');

    (service as any).neuralLoad.set(85);
    TestBed.flushEffects();
    
    // Expect high contrast safe-mode colors to be set
    expect(spy).toHaveBeenCalledWith('--primary', '#FFFFFF');
    expect(spy).toHaveBeenCalledWith('--secondary', '#FFFFFF');
    expect(spy).toHaveBeenCalledWith('--tertiary', '#FF0000');
    expect(spy).toHaveBeenCalledWith('--layer-1', '#000000');
  });

  it('should restore CSS variables when fidelityMode changes back to AESTHETIC', () => {
    const root = document.documentElement;
    
    (service as any).neuralLoad.set(85); // SAFE mode
    TestBed.flushEffects();
    (service as any).neuralLoad.set(0);  // Back to AESTHETIC
    TestBed.flushEffects();
    
    // Should restore neon-green (standard --primary)
    expect(root.style.getPropertyValue('--primary').trim().toUpperCase()).toBe('#00FF9F');
  });
});
