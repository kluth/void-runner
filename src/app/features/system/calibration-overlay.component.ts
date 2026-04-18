import { Component, inject, signal } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calibration-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gameService.isCalibrating()) {
      <div class="calib-container">
        <div class="calib-content">
          <div class="header">NEURAL_LINK // HARDWARE_CALIBRATION</div>
          <div class="sub-header">IDENTITY VERIFICATION REQUIRED FOR SYNDICATE UPLINK</div>
          
          <div class="steps">
            <div class="step" [class.active]="currentStep() === 0">1. VISUAL_BIOMETRIC_SYNC</div>
            <div class="step" [class.active]="currentStep() === 1">2. AUDIO_PULSE_VALIDATION</div>
            <div class="step" [class.active]="currentStep() === 2">3. NEURAL_NOTIFICATION_UPLINK</div>
          </div>

          <div class="action-area">
            @if (currentStep() === 0) {
              <div class="desc">Please align your face with the terminal sensor for biometric mapping. This ensures your neural signature matches the operative database.</div>
              <button class="calib-btn" (click)="startStep(0)">INIT_BIOMETRIC_SCAN</button>
            } @else if (currentStep() === 1) {
              <div class="desc">Biometric shard captured. Now, perform a short audio frequency check. Speak the sequence "VOID RUNNER" when the mic activates.</div>
              <button class="calib-btn" (click)="startStep(1)">START_AUDIO_VALIDATION</button>
            } @else if (currentStep() === 2) {
              <div class="desc">Finalizing uplink. Establish an emergency broadcast link for real-time priority alerts from the syndicate.</div>
              <button class="calib-btn" (click)="startStep(2)">ESTABLISH_UPLINK</button>
            } @else {
              <div class="success-msg">CALIBRATION_COMPLETE. SYNDICATE LINK STABLE.</div>
              <button class="calib-btn finish" (click)="finish()">ENTER_THE_VOID</button>
            }
          </div>

          @if (error()) {
            <div class="error-msg">ERR: HARDWARE_LINK_REFUSED. REDUCED OPERATIONAL CAPACITY.</div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .calib-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 10, 0, 0.98); z-index: 11000;
      display: flex; align-items: center; justify-content: center;
      color: #00ff00; font-family: 'JetBrains Mono', monospace;
    }
    .calib-content {
      width: 500px; padding: 30px; border: 1px solid #00ff00;
      background: #000; box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
    }
    .header { font-size: 1em; font-weight: bold; margin-bottom: 5px; letter-spacing: 2px; }
    .sub-header { font-size: 0.55em; color: #008800; margin-bottom: 30px; }
    
    .steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
    .step { font-size: 0.7em; color: #004400; transition: all 0.3s; }
    .step.active { color: #00ff00; text-shadow: 0 0 10px #00ff00; }
    
    .desc { font-size: 0.65em; color: #888; line-height: 1.5; margin-bottom: 20px; min-height: 50px; }
    
    .calib-btn {
      width: 100%; background: transparent; border: 1px solid #00ff00;
      color: #00ff00; padding: 12px; cursor: pointer; font-family: inherit;
      font-size: 0.7em; font-weight: bold; transition: all 0.3s;
    }
    .calib-btn:hover { background: #00ff00; color: #000; box-shadow: 0 0 20px #00ff00; }
    .calib-btn.finish { border-color: #00ffff; color: #00ffff; }
    .calib-btn.finish:hover { background: #00ffff; color: #000; box-shadow: 0 0 20px #00ffff; }

    .error-msg { font-size: 0.55em; color: #ff0000; margin-top: 20px; text-align: center; }
    .success-msg { color: #00ffff; font-size: 0.7em; text-align: center; margin-bottom: 20px; }
  `
})
export class CalibrationOverlayComponent {
  gameService = inject(GameService);
  currentStep = signal(0);
  error = signal(false);

  async startStep(step: number) {
    this.error.set(false);
    try {
      if (step === 0) {
        // Request Camera (Visual Biometrics)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        this.currentStep.set(1);
      } else if (step === 1) {
        // Request Microphone (Audio Validation)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        this.currentStep.set(2);
      } else if (step === 2) {
        // Request Notifications
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('Permission denied');
        this.currentStep.set(3);
      }
    } catch (e) {
      console.warn('Calibration hardware refused:', e);
      this.error.set(true);
      // Still proceed but AI will know you refused
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  finish() {
    this.gameService.isCalibrating.set(false);
    this.gameService.log('SYSTEM: Neural Link Calibrated. Operative verified.');
  }
}
