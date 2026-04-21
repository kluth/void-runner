import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SqlInjectionComponent } from './sql-injection.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GameService } from '../../core/services/game.service';
import { signal } from '@angular/core';

describe('SqlInjectionComponent', () => {
  let component: SqlInjectionComponent;
  let fixture: ComponentFixture<SqlInjectionComponent>;
  let mockGameService: any;

  beforeEach(() => {
    mockGameService = {
      log: vi.fn(),
      completeMission: vi.fn(),
      failMission: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [SqlInjectionComponent],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    });

    fixture = TestBed.createComponent(SqlInjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize a schema with tables and columns', () => {
    expect(component.tables().length).toBeGreaterThan(0);
    expect(component.tables()[0].columns.length).toBeGreaterThan(0);
  });

  it('should allow selecting a column', () => {
    const table = component.tables()[0];
    const column = table.columns[0];
    component.selectColumn(table.name, column.name);
    expect(component.selectedColumn()).toEqual({ tableName: table.name, columnName: column.name });
  });

  it('should create a connection when two columns are selected sequentially', () => {
    const t1 = component.tables()[0];
    const c1 = t1.columns[0];
    const t2 = component.tables()[1];
    const c2 = t2.columns[0];

    component.selectColumn(t1.name, c1.name);
    component.selectColumn(t2.name, c2.name);

    expect(component.connections().length).toBe(1);
    expect(component.connections()[0]).toEqual({
      from: { tableName: t1.name, columnName: c1.name },
      to: { tableName: t2.name, columnName: c2.name }
    });
  });

  it('should win the game when the correct path is established', () => {
    // This depends on the implementation of how "correct path" is defined.
    // Let's assume there's a goal: connect 'users.id' to 'secrets.owner_id'
    // For the test, we can force a win condition or simulate the steps.
    
    // We'll need to know what the target path is.
    const path = component.targetPath();
    for (let i = 0; i < path.length - 1; i++) {
        component.selectColumn(path[i].tableName, path[i].columnName);
        component.selectColumn(path[i+1].tableName, path[i+1].columnName);
    }

    expect(component.isSolved()).toBe(true);
  });
});
