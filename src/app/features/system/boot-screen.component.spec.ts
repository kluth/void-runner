import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BootScreenComponent } from './boot-screen.component';
import { TestBed } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('BootScreenComponent (TDD) Fixed', () => {
  let component: BootScreenComponent;
  let gameService: any;
  let fixture: any;

  beforeEach(() => {
    gameService = {
      isBooting: signal(true),
      log: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [BootScreenComponent],
      providers: [
        { provide: GameService, useValue: gameService }
      ]
    });
    fixture = TestBed.createComponent(BootScreenComponent);
    component = fixture.componentInstance;
  });

  it('should create the boot screen', () => {
    expect(component).toBeTruthy();
  });

  it('should show initialization steps eventually', async () => {
    fixture.detectChanges(); // Trigger ngOnInit
    // Wait a bit for the first few steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(component.bootLogs().length).toBeGreaterThan(0);
  });

  it('should set isBooting to false after sequence completes', async () => {
    // Speed up steps for the test
    (component as any).steps = ["Step 1"];
    fixture.detectChanges();
    
    // Wait for the sequence to complete (Step 1 time + 1.5s finish delay)
    await new Promise(resolve => setTimeout(resolve, 3000));
    expect(gameService.isBooting()).toBe(false);
  }, 10000);
});
