import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigWizardComponent } from './config-wizard.component';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from '../../core/services/game.service';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';

describe('ConfigWizardComponent (TDD) v2', () => {
  let component: ConfigWizardComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfigWizardComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: GameService, useValue: { isConfigured: signal(false), log: vi.fn() } }
      ]
    });
    const fixture = TestBed.createComponent(ConfigWizardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should allow skipping initialization', async () => {
    component.skip();
    const req = httpMock.expectOne('http://localhost:3000/api/config/skip');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
