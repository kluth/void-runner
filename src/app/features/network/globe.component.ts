import { Component, ElementRef, inject, AfterViewInit, OnDestroy, ViewChild, signal, effect } from '@angular/core';
import * as THREE from 'three';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [CommonModule],
  template: `<div #container class="globe-container">
      <div class="globe-noise">COORD_TRACK: LAT {{ lat() }} LON {{ lon() }}</div>
  </div>`,
  styles: `
    .globe-container {
      width: 100%;
      height: 400px;
      background: var(--layer-0);
      position: relative;
      cursor: grab;
      overflow: hidden;
    }
    .globe-noise {
       position: absolute; bottom: 10px; left: 15px;
       font-family: 'JetBrains Mono', monospace;
       font-size: 0.5rem; opacity: 0.3; color: var(--primary);
       z-index: 5;
    }
  `
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
  networkService = inject(NetworkService);
  gameService = inject(GameService);

  @ViewChild('container') containerRef!: ElementRef;

  lat = signal('0.00');
  lon = signal('0.00');

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globeGroup!: THREE.Group;
  private pointGroup!: THREE.Group;
  private animationId!: number;

  private GEO_JSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

  constructor() {
    effect(() => {
      // Trigger update when path changes
      this.networkService.currentPath();
      this.updateVisuals();
    });
  }

  ngAfterViewInit() {
    this.initThree();
    this.createGlobe();
    this.loadBoundaries();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree() {
    const width = this.containerRef.nativeElement.clientWidth;
    const height = this.containerRef.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 250;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    this.pointGroup = new THREE.Group();
    this.globeGroup.add(this.pointGroup);
  }

  private createGlobe() {
    // Holographic Wireframe Globe
    const geometry = new THREE.SphereGeometry(100, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0df2f2,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const globe = new THREE.Mesh(geometry, material);
    this.globeGroup.add(globe);

    // Inner Solid Core
    const innerGeo = new THREE.SphereGeometry(98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    this.globeGroup.add(inner);
  }

  private async loadBoundaries() {
    try {
      const response = await fetch(this.GEO_JSON_URL);
      const data = await response.json();
      // Design System: Electric Cyan for boundaries
      const material = new THREE.LineBasicMaterial({ color: 0x0df2f2, transparent: true, opacity: 0.2 });
      
      data.features.forEach((feature: any) => {
        const { type, coordinates } = feature.geometry;
        if (type === 'Polygon') this.drawPolygon(coordinates[0], material);
        else if (type === 'MultiPolygon') coordinates.forEach((poly: any) => this.drawPolygon(poly[0], material));
      });
    } catch (e) {
      console.error('Failed to load globe boundaries', e);
    }
  }

  private drawPolygon(points: number[][], material: THREE.LineBasicMaterial) {
    const vertices: THREE.Vector3[] = [];
    points.forEach(p => vertices.push(this.latLngToVector3(p[1], p[0], 100.5)));
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const line = new THREE.Line(geometry, material);
    this.globeGroup.add(line);
  }

  private updateVisuals() {
    if (!this.pointGroup) return;
    
    // Clear old visuals
    while(this.pointGroup.children.length > 0){ 
        this.pointGroup.remove(this.pointGroup.children[0]); 
    }

    const nodes = this.networkService.currentPath();
    const mode = this.gameService.routingMode();
    // Onion = Red, VPN = Cyan, Direct = Green
    const color = mode === 'ONION' ? 0xc10014 : mode === 'VPN' ? 0x0df2f2 : 0x2ff801;

    nodes.forEach(node => {
      const pos = this.latLngToVector3(node.lat, node.lng, 101);
      const pointGeo = new THREE.SphereGeometry(2, 8, 8);
      const pointMat = new THREE.MeshBasicMaterial({ color: color });
      const point = new THREE.Mesh(pointGeo, pointMat);
      point.position.copy(pos);
      this.pointGroup.add(point);
    });

    for (let i = 0; i < nodes.length - 1; i++) {
      const start = this.latLngToVector3(nodes[i].lat, nodes[i].lng, 101);
      const end = this.latLngToVector3(nodes[i+1].lat, nodes[i+1].lng, 101);
      const mid = start.clone().lerp(end, 0.5).multiplyScalar(1.2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(30);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
      const arc = new THREE.Line(arcGeo, arcMat);
      this.pointGroup.add(arc);
    }
  }

  private latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.globeGroup) {
        this.globeGroup.rotation.y += 0.002;
        this.globeGroup.rotation.x += 0.0005;
        
        this.lat.set((this.globeGroup.rotation.x * 57.29).toFixed(2));
        this.lon.set((this.globeGroup.rotation.y * 57.29).toFixed(2));
    }
    this.renderer.render(this.scene, this.camera);
  }
}
