import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Mission } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';

interface PhishingOption {
  text: string;
  impact: number;
  nextStep: string;
}

interface PhishingStep {
  id: string;
  targetMessage: string;
  options: PhishingOption[];
}

@Component({
  selector: 'app-phishing-campaign',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="phishing-minigame">
      <div class="meter-container">
        <div class="meter-label">SUSPECT_METER: {{ suspectMeter() }}%</div>
        <div class="meter-bar">
          <div class="meter-fill" [style.width.%]="suspectMeter()" [class.high]="suspectMeter() > 70"></div>
        </div>
      </div>

      <div class="dialogue-box">
        <div class="target-name">TARGET: {{ mission?.target }}</div>
        <div class="message-bubble target">
          <span class="sender">TARGET:</span>
          <p>{{ currentStep().targetMessage }}</p>
        </div>

        <div class="pretexts-grid">
          @for (option of currentStep().options; track option.text) {
            <button class="pretext-btn" (click)="selectPretext(option)">
              {{ option.text }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .phishing-minigame {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 1rem;
      background: rgba(0, 20, 20, 0.8);
      border: 1px solid var(--primary);
    }

    .meter-container {
      width: 100%;
    }

    .meter-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
      color: var(--secondary);
    }

    .meter-bar {
      height: 8px;
      background: var(--layer-2);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .meter-fill {
      height: 100%;
      background: var(--secondary);
      transition: width 0.3s ease;
    }

    .meter-fill.high {
      background: var(--tertiary);
      box-shadow: 0 0 10px var(--tertiary);
    }

    .dialogue-box {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .target-name {
      font-size: 0.7rem;
      opacity: 0.6;
      font-weight: 900;
    }

    .message-bubble {
      background: var(--layer-2);
      padding: 1rem;
      border-radius: 4px;
      position: relative;
    }

    .message-bubble .sender {
      font-size: 0.6rem;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 0.5rem;
      display: block;
    }

    .pretexts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .pretext-btn {
      text-align: left;
      padding: 1rem;
      background: var(--layer-3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
    }

    .pretext-btn:hover {
      background: var(--primary);
      color: #000;
    }
  `]
})
export class PhishingCampaignComponent implements OnInit {
  @Input() mission!: Mission;

  gameService = inject(GameService);
  audioService = inject(AudioService);

  suspectMeter = signal(100);
  currentStepId = signal('start');

  steps: PhishingStep[] = [
    {
      id: 'start',
      targetMessage: "Hello? Who is this? I'm quite busy with the server migration.",
      options: [
        { text: "Hey, it's Mark from IT. We're seeing some weird sync issues on your node.", impact: -20, nextStep: 'it_pretext' },
        { text: "I am the system administrator. You must provide your credentials immediately.", impact: 10, nextStep: 'aggressive' },
        { text: "Oh, sorry! I think I have the wrong extension. Are you in HR?", impact: -10, nextStep: 'misdirection' }
      ]
    },
    {
      id: 'it_pretext',
      targetMessage: "Mark? I thought Mark was on vacation. Anyway, what sync issues? Everything looks fine here.",
      options: [
        { text: "Yeah, he was, but he got called in. Look, the buffer is overflowing on the mail relay.", impact: -25, nextStep: 'technical' },
        { text: "Just run the diagnostic tool I'm sending you. It'll fix it.", impact: 20, nextStep: 'suspicious' },
        { text: "It's a security patch. We need to verify your uplink before it locks you out.", impact: -15, nextStep: 'urgency' }
      ]
    },
    {
      id: 'aggressive',
      targetMessage: "Credentials? We have a strict protocol for this. I'm calling my supervisor.",
      options: [
        { text: "Wait! No need for that, I can explain...", impact: 30, nextStep: 'fail' },
        { text: "Your supervisor is the one who authorized this. Check your internal memo.", impact: -5, nextStep: 'authority' }
      ]
    },
    {
      id: 'misdirection',
      targetMessage: "No, this is server ops. HR is extension 404. Why are you calling them?",
      options: [
        { text: "My payroll hasn't cleared. But while I have you, can you check my login access?", impact: -20, nextStep: 'technical' },
        { text: "Nevermind, I'll call 404. Sorry to bother.", impact: 0, nextStep: 'start' }
      ]
    },
    {
      id: 'technical',
      targetMessage: "The mail relay? Again? That thing is a nightmare. What do you need me to do?",
      options: [
        { text: "Just click the 'Reset' link in the notification I just pushed to your terminal.", impact: -30, nextStep: 'success' },
        { text: "Tell me your session ID so I can mirror the port.", impact: -15, nextStep: 'success' }
      ]
    },
    {
      id: 'urgency',
      targetMessage: "Locked out? I can't afford that right now. How do I verify?",
      options: [
        { text: "Input your secondary auth token into the 'Security' portal at this IP.", impact: -35, nextStep: 'success' },
        { text: "Just read me the last 4 digits of your access key.", impact: -10, nextStep: 'technical' }
      ]
    },
    {
      id: 'suspicious',
      targetMessage: "A diagnostic tool? I've never heard of that. I'm reporting this call.",
      options: [
        { text: "No, wait! It's new!", impact: 50, nextStep: 'fail' }
      ]
    },
    {
      id: 'authority',
      targetMessage: "I didn't see any memo. Let me check... wait, who did you say you were again?",
      options: [
        { text: "Mark from IT. I told you.", impact: -10, nextStep: 'it_pretext' },
        { text: "The Admin! Just do as you're told!", impact: 40, nextStep: 'fail' }
      ]
    }
  ];

  ngOnInit() {
    this.suspectMeter.set(100);
    this.currentStepId.set('start');
  }

  currentStep() {
    return this.steps.find(s => s.id === this.currentStepId()) || this.steps[0];
  }

  selectPretext(option: PhishingOption) {
    this.audioService.playClick();
    this.suspectMeter.update(m => Math.max(0, m + option.impact));
    
    if (this.suspectMeter() <= 0 || option.nextStep === 'success') {
      this.gameService.log('SUCCESS: Target compromised. Credentials exfiltrated.');
      this.gameService.completeMission(this.mission);
    } else if (this.suspectMeter() >= 150 || option.nextStep === 'fail') {
      this.gameService.log('FAILURE: Target became too suspicious. Connection severed.');
      this.gameService.failMission(this.mission);
    } else {
      this.currentStepId.set(option.nextStep);
    }
  }
}
