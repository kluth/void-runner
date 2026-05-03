import { Injectable, signal, HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InteractionSpeedService {
  interactionRate = signal(0);
  private interactionCount = 0;
  private lastCalculationTime = Date.now();

  constructor() {
    this.startCalculationLoop();
  }

  recordInteraction() {
    this.interactionCount++;
  }

  private startCalculationLoop() {
    setInterval(() => {
      const now = Date.now();
      const elapsed = (now - this.lastCalculationTime) / 1000;
      if (elapsed >= 1) {
        this.interactionRate.set(this.interactionCount / elapsed);
        this.interactionCount = 0;
        this.lastCalculationTime = now;
      }
    }, 1000);
  }
}
