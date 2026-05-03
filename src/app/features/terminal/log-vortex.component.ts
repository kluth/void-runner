import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, LogEntry } from '../../core/services/game.service';

@Component({
  selector: 'app-log-vortex',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vortex-container" #vortexContainer (scroll)="handleScroll()">
      <div class="vortex-track" [style.height.px]="totalHeight()">
        @for (log of visibleLogs(); track log.id) {
          <div class="log-node" 
               [style.transform]="getTransform(log.offset)"
               [style.opacity]="getOpacity(log.offset)"
               [class.active]="log.active">
            <span class="l-time">[{{ log.timestamp }}]</span>
            <span class="l-msg" [innerHTML]="log.message"></span>
          </div>
        }
      </div>
      
      <div class="vortex-singularity">
         <div class="event-horizon"></div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; overflow: hidden; background: #000; position: relative; }
    
    .vortex-container {
      height: 100%; overflow-y: auto; overflow-x: hidden;
      perspective: 1000px; scroll-behavior: smooth;
    }
    
    .vortex-track { position: relative; width: 100%; }
    
    .log-node {
      position: absolute; left: 10%; width: 80%;
      padding: 10px; border-left: 2px solid var(--primary);
      background: rgba(0, 255, 159, 0.02);
      font-size: 0.7rem; color: var(--primary);
      transition: opacity 0.2s;
      pointer-events: auto;
      cursor: pointer;
    }
    .log-node:hover { background: rgba(0, 255, 159, 0.1); }
    .log-node.active { border-left-color: var(--neon-cyan); color: var(--neon-cyan); }
    
    .l-time { opacity: 0.5; margin-right: 10px; }
    
    .vortex-singularity {
      position: absolute; bottom: 0; left: 0; width: 100%; height: 100px;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.9));
    }
    .event-horizon {
      position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
      width: 200%; height: 40px; background: var(--primary);
      filter: blur(20px); opacity: 0.1; border-radius: 50%;
    }
    
    .vortex-container::-webkit-scrollbar { width: 0; }
  `
})
export class LogVortexComponent implements OnInit, AfterViewChecked {
  gameService = inject(GameService);
  @ViewChild('vortexContainer') private container!: ElementRef;

  scrollTop = signal(0);
  autoScroll = true;

  visibleLogs = computed(() => {
    const logs = this.gameService.terminalLogs();
    const st = this.scrollTop();
    const containerHeight = 800; // Fallback
    
    return logs.map((l, i) => {
      const basePos = i * 40;
      const offset = basePos - st;
      return {
        ...l,
        id: i,
        offset,
        active: offset > 0 && offset < 50
      };
    }).filter(l => l.offset > -100 && l.offset < 1000);
  });

  totalHeight = computed(() => this.gameService.terminalLogs().length * 40 + 500);

  ngOnInit() {
    // Initial scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
  }

  ngAfterViewChecked() {
    if (this.autoScroll) this.scrollToBottom();
  }

  handleScroll() {
    const el = this.container.nativeElement;
    this.scrollTop.set(el.scrollTop);
    this.autoScroll = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
  }

  private scrollToBottom() {
    try {
      const el = this.container.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch(e) {}
  }

  getTransform(offset: number) {
    // Non-linear gravity well effect
    const z = -Math.pow(offset / 100, 2) * 50;
    const rotateX = Math.min(45, offset / 10);
    const y = offset;
    
    return `translate3d(0, ${y}px, ${z}px) rotateX(${rotateX}deg)`;
  }

  getOpacity(offset: number) {
    if (offset < 0) return 1;
    return Math.max(0, 1 - (offset / 800));
  }
}
