import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeAssistantService {
  roomTemp = signal(22);
  lightLevel = signal(500); // lux
  humidity = signal(45);

  constructor() {
    this.initEnvironmentEffects();
    // In a real app, we would connect to HA WebSocket/API here
  }

  private initEnvironmentEffects() {
    effect(() => {
      const temp = this.roomTemp();
      const lux = this.lightLevel();
      const root = document.documentElement;

      // Frost Effect (Cold)
      if (temp < 18) {
        const intensity = Math.min(1, (18 - temp) / 10);
        root.style.setProperty('--void-frost-intensity', intensity.toString());
      } else {
        root.style.setProperty('--void-frost-intensity', '0');
      }

      // Heat Haze (Hot)
      if (temp > 28) {
        const intensity = Math.min(1, (temp - 28) / 10);
        root.style.setProperty('--void-heat-intensity', intensity.toString());
      } else {
        root.style.setProperty('--void-heat-intensity', '0');
      }

      // Brightness Link
      if (lux < 50) {
        root.style.setProperty('--global-dimming', '0.4');
      } else {
        root.style.setProperty('--global-dimming', '0');
      }
    });
  }

  // Mock update method for testing/demo
  updateEnvironment(data: {temp?: number, lux?: number}) {
    if (data.temp !== undefined) this.roomTemp.set(data.temp);
    if (data.lux !== undefined) this.lightLevel.set(data.lux);
  }
}
