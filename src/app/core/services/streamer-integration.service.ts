import { Injectable, inject, effect, signal } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class StreamerIntegrationService {
  private gameService = inject(GameService);
  private simulationInterval: any;

  constructor() {
    effect(() => {
      const settings = this.gameService.settings().streamer;
      if (settings.enabled) {
        this.startSimulation();
        this.connectToSocket();
      } else {
        this.stopSimulation();
        this.disconnectFromSocket();
      }
    });
  }

  private startSimulation() {
    if (this.simulationInterval) return;
    this.gameService.log(`[STREAMER] Integration active for ${this.gameService.settings().streamer.platform}`);
    this.simulationInterval = setInterval(() => {
      const commands = ['!trace', '!join', '!heal', '!zeroday', '!emp', '!bounty', '!sabotage', '!raid'];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      const randomUser = 'Viewer_' + Math.floor(Math.random() * 1000);
      
      // Simulate random chat activity (40% chance every 10 seconds)
      if (Math.random() > 0.6) {
        this.handleCommand(randomCommand, randomUser);
      }
    }, 10000);
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      this.gameService.log('[STREAMER] Integration suspended.');
    }
  }

  private connectToSocket() {
    // DESIGN: This is where we would connect to a real backend
    // Example:
    // this.gameService.getSocket().on('streamer_chat', (data: {command: string, user: string}) => {
    //   this.handleCommand(data.command, data.user);
    // });
    
    // For now, we use simulated events via startSimulation()
  }

  private disconnectFromSocket() {
    // DESIGN: Cleanup socket listeners
    // this.gameService.getSocket().off('streamer_chat');
  }

  private handleCommand(command: string, user: string) {
    this.gameService.log(`[STREAMER] ${user}: ${command}`);
    
    switch (command) {
      case '!trace':
        // Chat plays against the player: increase detection
        this.gameService.detectionLevel.update(v => Math.min(v + 5, 100));
        this.gameService.log(`[STREAMER] Detection level increased by ${user}`);
        break;
      case '!join':
        // Chat helps the player: increase botnet size
        this.gameService.botnetSize.update(v => v + 1);
        this.gameService.log(`[STREAMER] Botnet size increased by ${user}`);
        break;
      case '!heal':
        // Chat helps the player: restore system integrity
        this.gameService.systemIntegrity.update(v => Math.min(v + 10, 100));
        this.gameService.log(`[STREAMER] System integrity restored by ${user}`);
        break;
      case '!zeroday':
        if (Math.random() > 0.5) {
          this.gameService.zeroDays.update(z => z + 1);
          this.gameService.log(`[STREAMER] ${user} gifted a ZERO-DAY EXPLOIT!`);
        }
        break;
      case '!emp':
        this.gameService.detectionLevel.set(0);
        this.gameService.log(`[STREAMER] ${user} activated an EMP blast! Trace cleared.`);
        break;
      case '!bounty':
        this.gameService.credits.update(c => c + 500);
        this.gameService.log(`[STREAMER] ${user} completed a chat bounty! +500cr.`);
        break;
      case '!sabotage':
        this.gameService.triggerRetaliation(false);
        this.gameService.log(`[STREAMER] ${user} sabotaged the streamer's link!`);
        break;
      case '!raid':
        this.gameService.triggerRetaliation(true);
        this.gameService.log(`[STREAMER] CHAT RAID: Incoming blue team retaliation!`);
        break;
    }
  }
}
