import { Component, ElementRef, inject, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { NetworkService } from '../../core/services/network.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-globe',
  standalone: true,
  template: `<div #container class="globe-container"></div>`,
  styles: `
    .globe-container {
      width: 100%;
      height: 300px;
      background: #000;
      border: 1px solid #1a1a1a;
      cursor: grab;
    }
  `
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  networkService = inject(NetworkService);
  gameService = inject(GameService);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private globeGroup!: THREE.Group;
  private points: THREE.Mesh[] = [];
  private arcs: THREE.Line[] = [];
  private animationId!: number;
  private resizeObserver!: ResizeObserver;

  private GEO_JSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

  ngAfterViewInit() {
    this.initThree();
    this.loadBoundaries();
    this.setupResizeHandler();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeHandler() {
    this.resizeObserver = new ResizeObserver(() => {
      const width = this.container.nativeElement.clientWidth;
      const height = this.container.nativeElement.clientHeight;
      if (width === 0 || height === 0) return;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
    this.resizeObserver.observe(this.container.nativeElement);
  }

  private initThree() {
    const width = this.container.nativeElement.clientWidth || 300;
    const height = this.container.nativeElement.clientHeight || 300;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 250;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    const sphereGeo = new THREE.SphereGeometry(99, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.globeGroup.add(sphere);

    const gridGeo = new THREE.SphereGeometry(100, 32, 32);
    const gridMat = new THREE.MeshBasicMaterial({ 
      color: 0x0df2f2, // primary
      wireframe: true, 
      transparent: true, 
      opacity: 0.05 
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    this.globeGroup.add(grid);

    this.updateVisuals();
  }

  private async loadBoundaries() {
    try {
      const response = await fetch(this.GEO_JSON_URL);
      const data = await response.json();
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
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
    this.points.forEach(p => this.globeGroup.remove(p));
    this.arcs.forEach(a => this.globeGroup.remove(a));
    this.points = [];
    this.arcs = [];

    const nodes = this.networkService.currentPath();
    const mode = this.gameService.routingMode();
    const color = mode === 'ONION' ? 0xff00ff : mode === 'VPN' ? 0x00ffff : 0x00ff00;

    nodes.forEach(node => {
      const pos = this.latLngToVector3(node.lat, node.lng, 101);
      const pointGeo = new THREE.SphereGeometry(2, 8, 8);
      const pointMat = new THREE.MeshBasicMaterial({ color: color });
      const point = new THREE.Mesh(pointGeo, pointMat);
      point.position.copy(pos);
      this.globeGroup.add(point);
      this.points.push(point);
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
      this.globeGroup.add(arc);
      this.arcs.push(arc);
    }
  }

  private latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.globeGroup) this.globeGroup.rotation.y += 0.001;
    this.updateVisuals(); 
    this.renderer.render(this.scene, this.camera);
  }
}
