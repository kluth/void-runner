import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatrixRainComponent } from './matrix-rain.component';
import { TestBed } from '@angular/core/testing';

describe('MatrixRainComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatrixRainComponent]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MatrixRainComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
