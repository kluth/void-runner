import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HijackOverlayComponent } from './hijack-overlay.component';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('HijackOverlayComponent (TDD - Persistence)', () => {
  let component: HijackOverlayComponent;
  let gameServiceMock: any;
  let audioServiceMock: any;

  beforeEach(() => {
    vi.useFakeTimers();
    audioServiceMock = { speakCreepy: vi.fn() };
    gameServiceMock = {
      isHijacked: signal(true),
      hijackMessage: signal('The code is 0x1234'),
      hijackUnlockCode: signal('0x1234'),
      log: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HijackOverlayComponent, FormsModule],
      providers: [
        { provide: GameService, useValue: gameServiceMock },
        { provide: AudioService, useValue: audioServiceMock }
      ]
    });
    const fixture = TestBed.createComponent(HijackOverlayComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should repeat the creepy message every 20 seconds', () => {
    component.ngOnInit();
    
    // Fast forward 21 seconds
    vi.advanceTimersByTime(21000);
    expect(audioServiceMock.speakCreepy).toHaveBeenCalled();
  });

  it('should allow manual replay of the transmission', () => {
    component.replay();
    expect(audioServiceMock.speakCreepy).toHaveBeenCalledWith('The code is 0x1234');
  });
});
