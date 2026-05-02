import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfluenceMatrixComponent } from './influence-matrix.component';
import { FactionService } from '../../core/services/faction.service';
import { GameService } from '../../core/services/game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('InfluenceMatrixComponent (Issue #35)', () => {
  let component: InfluenceMatrixComponent;
  let fixture: ComponentFixture<InfluenceMatrixComponent>;
  let factionService: FactionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfluenceMatrixComponent],
      providers: [
        FactionService,
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InfluenceMatrixComponent);
    component = fixture.componentInstance;
    factionService = TestBed.inject(FactionService);
    factionService.initialize();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute advisory text based on highest influence', () => {
    const factions = factionService.influenceMatrix();
    factions[0].influence = 99;
    factionService.influenceMatrix.set(factions);
    
    expect(component.getAdvisory()).toContain('99%');
  });
});
