import { Injectable, signal, computed, inject } from '@angular/core';
import { GameService, Node } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private gameService = inject(GameService);

  nodes = signal<Node[]>([
    { id: '1', name: 'ENTRY_NODE_ALPHA', lat: 52.52, lng: 13.40, country: 'Germany' },
    { id: '2', name: 'RELAY_NODE_7', lat: 34.05, lng: -118.24, country: 'USA' },
    { id: '3', name: 'EXIT_NODE_VOID', lat: 35.67, lng: 139.65, country: 'Japan' },
    { id: '4', name: 'SHADOW_SERVER', lat: -23.55, lng: -46.63, country: 'Brazil' },
    { id: '5', name: 'CRYPTO_BUNKER', lat: 59.32, lng: 18.06, country: 'Sweden' }
  ]);

  // Temporal Echo-Mapping (Issue #30)
  temporalEchoes = signal<{path: any[], status: 'SUCCESS' | 'FAILURE'}[]>([]);
  addEchoPath(path: any[], status: 'SUCCESS' | 'FAILURE') {
    this.temporalEchoes.update(echoes => [{path, status}, ...echoes].slice(0, 10));
  }

  predictivePaths = computed(() => {
    const current = this.currentPath();
    const last = current[current.length - 1];
    if (!last) return [];
    
    // Suggest 3 potential next nodes based on distance
    return this.nodes()
      .filter(n => !current.find(cn => cn.id === n.id))
      .sort((a, b) => {
        const d1 = Math.sqrt(Math.pow(a.lat - last.lat, 2) + Math.pow(a.lng - last.lng, 2));
        const d2 = Math.sqrt(Math.pow(b.lat - last.lat, 2) + Math.pow(b.lng - last.lng, 2));
        return d1 - d2;
      })
      .slice(0, 3)
      .map(n => ({ from: last, to: n }));
  });

  currentPath = computed(() => {
    const mode = this.gameService.routingMode();
    const allNodes = this.nodes();
    if (mode === 'DIRECT') return [allNodes[1]];
    if (mode === 'VPN') return [allNodes[4], allNodes[1]];
    return [allNodes[0], allNodes[2], allNodes[3], allNodes[1]];
  });
}
