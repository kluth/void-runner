import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { OnboardAiService } from '../../core/services/onboard-ai.service';
import { HighDensityHudComponent } from './high-density-hud.component';
import { AgenticHudComponent } from './agentic-hud.component';
import { PulseDiagnosticsComponent } from './pulse-diagnostics.component';
import { MarginScribeComponent } from './margin-scribe.component';
import { NeuralLinkWidgetsComponent } from './neural-link-widgets.component';
import { EchoCollectorComponent } from './echo-collector.component';

@Component({
  selector: 'app-neural-overlay',
  standalone: true,
  imports: [
    CommonModule, 
    HighDensityHudComponent, 
    AgenticHudComponent, 
    PulseDiagnosticsComponent, 
    MarginScribeComponent, 
    NeuralLinkWidgetsComponent,
    EchoCollectorComponent
  ],
  template: `
    <div class="neural-overlay-layer">
      <app-high-density-hud />
      
      <app-agentic-hud />
      
      <app-margin-scribe />

      <app-echo-collector />

      @defer (when game.systemStress() > 60) {
        <app-pulse-diagnostics />
      }

      <app-neural-link-widgets />
    </div>
  `,
  styles: `
    .neural-overlay-layer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100dvw;
      height: 100dvh;
      pointer-events: none;
      z-index: 1000;
    }
  `
})
export class NeuralOverlayComponent {
  game = inject(GameService);
}
