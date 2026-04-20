import { Component, inject, signal, computed, effect } from '@angular/core';
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
      background: rgba(0, 0, 0, 0.4);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      font-family: 'JetBrains Mono', monospace;
      pointer-events: none; /* Let clicks pass through to highlighted elements if needed, but the card will override this */
    }

    .tutorial-card {
      pointer-events: all;
      width: 500px;
      max-width: 90vw;
      background: #050505;
      border: 2px solid #00ff00;
      box-shadow: 0 0 50px rgba(0, 255, 0, 0.3);
      display: flex;
      flex-direction: column;
      animation: slide-up 0.5s ease-out;
    }

    @keyframes slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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
      padding: 10px 25px;
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
      font-weight: 900;
      letter-spacing: 1px;
    }

    .next-btn:hover {
      background: #00cc00;
      box-shadow: 0 0 20px #00ff00;
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
      content: 'I am your onboard AI. Welcome to VOID_OS. Your neural link is established. I will guide you through the primary workstation interfaces.',
      selector: 'STATS'
    },
    {
      title: 'THE TERMINAL',
      content: 'This is your primary interface. Type commands to interact with the grid. Try <code>help</code> to see available binaries, or <code>ask [message]</code> to talk to me directly. You can use <code>sync</code> to force a neural handshake.',
      selector: 'TERMINAL'
    },
    {
      title: 'RETALIATION & HIJACKS',
      content: 'Keep your TRACE low. If it reaches 100%, expect retaliation. Beware of <b>Unknown Overrides</b> (Hijacks). If hijacked, wait for the Neural Debugger hint or use <b>FORCE_PURGE</b> to buy your way out.',
      selector: 'STATS'
    },
    {
      title: 'GLOBAL GRID & REAL-WORLD SYNC',
      content: 'Monitor global events and coordinate attacks. The grid is hardlinked to the physical world: stock manipulation relies on live crypto prices, and high-stakes <b>PATCH_TUESDAY</b> events only occur on actual Tuesdays.',
      selector: 'GLOBE'
    },
    {
      title: 'MISSIONS & CONTRACTS',
      content: 'Browse procedurally generated contracts. The era of passive hacking is over: you must actively execute breaches using Memory Hex Editors, Packet Sniffers, and Qubit Stabilizers.',
      selector: 'MISSIONS'
    },
    {
      title: 'SOCIAL NETWORK',
      content: 'Access the Darknet Node, join Syndicates, and communicate with other runners once your reputation reaches 1000. Your identity on the leaderboard is permanently masked behind a legendary alias.',
      selector: 'SOCIAL'
    },
    {
      title: 'TACTICAL RIG INTERFACE',
      content: 'Access the Black Market to acquire hardware. You must manually <b>MOUNT</b> modules into your 6 expansion slots. Watch your Neural Load (NW): exceeding 100 NW will cause a critical power failure.',
      selector: 'HARDWARE'
    },
    {
      title: 'FINAL ADVICE',
      content: 'Keep your system integrity high. Use <code>wipe</code> to purge your logs regularly, or simply go offline to let your heat naturally dissipate. Good luck, operative.',
      selector: 'STATS'
    }
  ];

  currentStep = computed(() => this.steps[this.currentStepIndex()]);

  constructor() {
    // Synchronize the highlighted selector in GameService
    effect(() => {
      if (this.gameService.tutorialActive()) {
        this.gameService.currentTutorialSelector.set(this.currentStep().selector || null);
      } else {
        this.gameService.currentTutorialSelector.set(null);
      }
    });
  }

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
    this.gameService.currentTutorialSelector.set(null);
    this.audioService.playSuccess();
    this.gameService.log('SYSTEM_GUIDE: Tutorial complete. Good luck, operative.');
  }

  private speakCurrentStep() {
    if (this.gameService.settings().audio.speech) {
        this.audioService.speakCreepy(this.currentStep().title);
    }
  }
}
