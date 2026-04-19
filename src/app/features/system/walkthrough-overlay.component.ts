import { Component, inject, signal, computed } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { NeuralService } from '../../core/services/neural.service';
import { CommonModule } from '@angular/common';

interface WalkthroughStep {
  title: string;
  content: string;
  selector?: string;
}

@Component({
  selector: 'app-walkthrough-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.tutorialActive()) {
      <div class="walkthrough-overlay">
        <div class="tutorial-card">
          <div class="card-header">
            <span class="ai-label">ONBOARD_AI: VOID_OS_GUIDE</span>
            <span class="step-indicator">STEP {{ currentStepIndex() + 1 }} / {{ steps.length }}</span>
          </div>
          <div class="card-body">
            <h3>{{ currentStep().title }}</h3>
            <p [innerHTML]="currentStep().content"></p>
          </div>
          <div class="card-footer">
            <button class="skip-btn" (click)="skip()">SKIP_TUTORIAL</button>
            <button class="next-btn" (click)="next()">
              {{ currentStepIndex() === steps.length - 1 ? 'INITIALIZE_SYSTEM' : 'NEXT_STATION' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .walkthrough-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
      font-family: 'JetBrains Mono', monospace;
    }

    .tutorial-card {
      width: 500px;
      max-width: 90vw;
      background: #050505;
      border: 1px solid #00ff00;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
      display: flex;
      flex-direction: column;
    }

    .card-header {
      background: #00ff00;
      color: #000;
      padding: 8px 15px;
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .card-body {
      padding: 25px;
      color: #fff;
    }

    .card-body h3 {
      color: #00ff00;
      margin-top: 0;
      font-size: 1.2rem;
      letter-spacing: 2px;
      border-bottom: 1px solid #111;
      padding-bottom: 10px;
    }

    .card-body p {
      line-height: 1.6;
      font-size: 0.9rem;
      color: #ccc;
    }

    .card-footer {
      padding: 15px 25px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #111;
    }

    button {
      padding: 8px 20px;
      font-family: inherit;
      font-size: 0.7rem;
      cursor: pointer;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }

    .next-btn {
      background: #00ff00;
      border: 1px solid #00ff00;
      color: #000;
      font-weight: bold;
    }

    .next-btn:hover {
      background: #00cc00;
      box-shadow: 0 0 10px #00ff00;
    }

    .skip-btn {
      background: transparent;
      border: 1px solid #333;
      color: #666;
    }

    .skip-btn:hover {
      border-color: #ff0000;
      color: #ff0000;
    }
  `
})
export class WalkthroughOverlayComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  neuralService = inject(NeuralService);

  currentStepIndex = signal(0);

  steps: WalkthroughStep[] = [
    {
      title: 'WELCOME OPERATIVE',
      content: 'I am your onboard AI. Welcome to VOID_OS. Your neural link is established. I will guide you through the primary workstation interfaces.'
    },
    {
      title: 'THE TERMINAL',
      content: 'This is your primary interface. Type commands to interact with the grid. Try <code>help</code> to see available binaries, or <code>ask [message]</code> to talk to me directly.'
    },
    {
      title: 'HARDWARE SHOP',
      content: 'Access physical modules here. Buy WiFi Pineapples, Flipper Zeros, and more to increase your recon, exploit, and stealth capabilities. Some modules require research (DATA) to unlock.'
    },
    {
      title: 'MISSIONS & CONTRACTS',
      content: 'Browse the active contracts on the grid. Complete missions to earn credits (cr) and reputation (REP). Be careful: higher difficulty missions increase your TRACE level faster.'
    },
    {
      title: 'GLOBAL GRID (SOCIAL)',
      content: 'Monitor global events, join hacker teams, and communicate via the Darknet. Your reputation determines which syndicates will talk to you.'
    },
    {
      title: 'SYSTEM SETTINGS',
      content: 'Configure your neural feedback. Adjust volume, CRT scanlines, matrix visualization, and font sizes. You can use the <code>set</code> command in the terminal for quick adjustments.'
    },
    {
      title: 'FINAL ADVICE',
      content: 'Keep your TRACE level low. If it reaches 100%, the Blue Team will locate your node and initiate a counter-strike. Use <code>wipe</code> to purge your logs regularly.'
    }
  ];

  currentStep = computed(() => this.steps[this.currentStepIndex()]);

  next() {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update(i => i + 1);
      this.audioService.playClick();
      this.speakCurrentStep();
    } else {
      this.finish();
    }
  }

  skip() {
    this.finish();
  }

  finish() {
    this.gameService.tutorialActive.set(false);
    this.gameService.updateSetting('general.tutorial_completed', 'true');
    this.audioService.playSuccess();
    this.gameService.log('SYSTEM_GUIDE: Tutorial complete. Good luck, operative.');
  }

  private speakCurrentStep() {
    if (this.gameService.settings().audio.speech) {
        this.audioService.speakCreepy(this.currentStep().title);
    }
  }
}
