import { Component, ElementRef, inject, AfterViewInit, OnDestroy, ViewChild, signal } from '@angular/core';
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
  private animationId!: number;

  ngAfterViewInit() {
    this.initThree();
    this.createGlobe();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
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
  }

  private createGlobe() {
    // Holographic Wireframe Globe
    const geometry = new THREE.SphereGeometry(100, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0df2f2,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const globe = new THREE.Mesh(geometry, material);
    this.globeGroup.add(globe);

    // Inner Solid Core
    const innerGeo = new THREE.SphereGeometry(98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    this.globeGroup.add(inner);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.globeGroup.rotation.y += 0.002;
    this.globeGroup.rotation.x += 0.0005;
    
    this.lat.set((this.globeGroup.rotation.x * 57.29).toFixed(2));
    this.lon.set((this.globeGroup.rotation.y * 57.29).toFixed(2));

    this.renderer.render(this.scene, this.camera);
  }
}
