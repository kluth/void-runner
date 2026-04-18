import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobeComponent } from './globe.component';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

describe('GlobeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobeComponent]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GlobeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
