import { Injectable, signal, effect, inject } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class SystemPulseService {
  private game = inject(GameService);
  pulseValue = signal(0);

  constructor() {
    this.startPulse();
    this.applyToCss();
  }

  private startPulse() {
    let frame = 0;
    setInterval(() => {
      frame++;
      // Base pulse (sin wave)
      const base = Math.sin(frame * 0.1);
      // Accelerate pulse with system load
      const loadFactor = this.game.systemStress() / 100;
      const pulse = base * (1 + loadFactor);
      this.pulseValue.set(pulse);
      
      // Haptic feedback if supported and load is high
      if (this.game.systemStress() > 70 && 'vibrate' in navigator) {
          if (frame % 20 === 0) navigator.vibrate(10);
      }
    }, 50);
  }

  private applyToCss() {
    effect(() => {
      const p = this.pulseValue();
      const intensity = (p + 1) / 2; // Normalize to 0-1
      document.documentElement.style.setProperty('--void-pulse', intensity.toString());
      document.documentElement.style.setProperty('--neon-shadow-pulse', `0 0 ${5 + (intensity * 10)}px`);
    });
  }
}
