import { Component, ElementRef, inject, AfterViewInit, OnDestroy, ViewChild, signal, effect } from '@angular/core';
import * as THREE from 'three';
import { NetworkService } from '../../core/services/network.service';
import { GameService, VisualEvent } from '../../core/services/game.service';
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
  private eventGroup!: THREE.Group;
  private animationId!: number;

  private activeEventMeshes = new Map<string, THREE.Object3D>();

  private GEO_JSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

  constructor() {
    effect(() => {
      // Trigger update when path changes
      this.networkService.currentPath();
      this.updateVisuals();
    });

    effect(() => {
      const events = this.gameService.visualEvents();
      this.syncVisualEvents(events);
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

    this.eventGroup = new THREE.Group();
    this.globeGroup.add(this.eventGroup);
  }

  private createGlobe() {
    const geometry = new THREE.SphereGeometry(100, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0df2f2,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const globe = new THREE.Mesh(geometry, material);
    this.globeGroup.add(globe);

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
    
    while(this.pointGroup.children.length > 0){ 
        this.pointGroup.remove(this.pointGroup.children[0]); 
    }

    const nodes = this.networkService.currentPath();
    const mode = this.gameService.routingMode();
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

  private syncVisualEvents(events: VisualEvent[]) {
    if (!this.eventGroup) return;

    // Remove meshes for events that are no longer present
    const eventIds = new Set(events.map(e => e.id));
    for (const [id, mesh] of this.activeEventMeshes.entries()) {
      if (!eventIds.has(id)) {
        this.eventGroup.remove(mesh);
        this.activeEventMeshes.delete(id);
      }
    }

    // Add new ones
    events.forEach(ev => {
      if (!this.activeEventMeshes.has(ev.id)) {
        const pos = this.latLngToVector3(ev.lat, ev.lng, 102);
        
        let mesh: THREE.Object3D;
        if (ev.type === 'pulse' || ev.type === 'burst') {
          const geo = new THREE.SphereGeometry(ev.type === 'pulse' ? 3 : 5, 16, 16);
          const mat = new THREE.MeshBasicMaterial({ color: ev.color, transparent: true, opacity: 0.8 });
          mesh = new THREE.Mesh(geo, mat);
          mesh.position.copy(pos);
          // Metadata for animation
          mesh.userData = { 
              type: ev.type, 
              startTime: Date.now(), 
              duration: ev.duration,
              originalScale: 1
          };
        } else {
          // Attack - cross/marker
          const geo = new THREE.RingGeometry(4, 6, 8);
          const mat = new THREE.MeshBasicMaterial({ color: ev.color, transparent: true, opacity: 1, side: THREE.DoubleSide });
          mesh = new THREE.Mesh(geo, mat);
          mesh.position.copy(pos);
          mesh.lookAt(0,0,0);
          mesh.userData = { type: 'attack', startTime: Date.now(), duration: ev.duration };
        }

        this.eventGroup.add(mesh);
        this.activeEventMeshes.set(ev.id, mesh);
      }
    });
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.globeGroup) {
        this.globeGroup.rotation.y += 0.002;
        this.globeGroup.rotation.x += 0.0005;
        
        this.lat.set((this.globeGroup.rotation.x * 57.29).toFixed(2));
        this.lon.set((this.globeGroup.rotation.y * 57.29).toFixed(2));
    }

    // Animate active events
    const now = Date.now();
    for (const [id, mesh] of this.activeEventMeshes.entries()) {
      const data = mesh.userData;
      const age = now - data['startTime'];
      const progress = age / data['duration'];

      if (data['type'] === 'pulse') {
        const s = 1 + Math.sin(age * 0.01) * 0.5;
        mesh.scale.set(s, s, s);
        (mesh as any).material.opacity = 0.8 * (1 - progress);
      } else if (data['type'] === 'burst') {
        const s = 1 + progress * 4;
        mesh.scale.set(s, s, s);
        (mesh as any).material.opacity = 1 - progress;
      } else if (data['type'] === 'attack') {
        mesh.rotation.z += 0.1;
        (mesh as any).material.opacity = 1 - progress;
        const s = 1 - progress * 0.5;
        mesh.scale.set(s, s, s);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
  }
}
