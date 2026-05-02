import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeMapperComponent } from './node-mapper.component';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('NodeMapperComponent (Issue #50)', () => {
  let component: NodeMapperComponent;
  let fixture: ComponentFixture<NodeMapperComponent>;
  let networkService: NetworkService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeMapperComponent],
      providers: [
        NetworkService,
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NodeMapperComponent);
    component = fixture.componentInstance;
    networkService = TestBed.inject(NetworkService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate correct node positions', () => {
    const node = { lat: 0, lng: 0 };
    expect(component.getNodeX(node)).toBe(50);
    expect(component.getNodeY(node)).toBe(50);
    
    const nodeLondon = { lat: 51.5, lng: -0.1 };
    expect(component.getNodeX(nodeLondon)).toBeCloseTo(49.97, 1);
    expect(component.getNodeY(nodeLondon)).toBeCloseTo(21.38, 1);
  });

  it('should identify nodes in current path', () => {
    const path = networkService.currentPath();
    expect(component.isNodeInPath(path[0])).toBe(true);
    expect(component.isNodeInPath({ id: 'non-existent' })).toBe(false);
  });

  it('should compute active links based on current path', () => {
    const path = networkService.currentPath();
    const links = component.activeLinks();
    expect(links.length).toBe(path.length - 1);
  });
});
