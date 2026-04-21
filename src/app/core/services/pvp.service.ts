import { Injectable, inject, signal } from '@angular/core';
import { GameService } from './game.service';

export interface PvpPlayer {
  id: string;
  handle: string;
  reputation: number;
  credits: number;
  isOnline: boolean;
  lastSeen: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface BreachContract {
  id: string;
  attackerId: string;
  defenderId: string;
  targetHandle: string;
  reward: number;
  difficulty: number;
  status: 'PENDING' | 'ACTIVE' | 'SUCCESS' | 'FAILED';
  createdAt: number;
  firewallPuzzle: number[];
}

export interface TraceTarget {
  playerId: string;
  handle: string;
  signalStrength: number;
  distance: number;
  bearing: number;
  lastPing: number;
}

export interface WantedPoster {
  playerId: string;
  handle: string;
  bounty: number;
  crimes: string[];
  lastKnownLocation: string;
}

@Injectable({ providedIn: 'root' })
export class PvpService {
  private game = inject(GameService);

  onlinePlayers = signal<PvpPlayer[]>([]);
  activeBreaches = signal<BreachContract[]>([]);
  traceTargets = signal<TraceTarget[]>([]);
  wantedList = signal<WantedPoster[]>([]);
  playerReputation = signal(0);
  trustScore = signal(100);
  isTracing = signal(false);
  isInBreach = signal(false);

  // Simulated online players (would be real in production)
  private generateFakePlayers(): PvpPlayer[] {
    const handles = [
      'SPECTRE_7', 'GHOST_SHELL', 'NULL_BYTE', 'SHADOW_RUN', 'CIPHER_PUNK',
      'DARK_SIGNAL', 'NEON_BLADE', 'ZERO_COOL', 'CRASH_OVERRIDE', 'PHANTOM_404',
      'BLACK_ICE', 'NET_RUNNER', 'DATA_WRAITH', 'CHROME_VIPER', 'STATIC_NOISE',
    ];
    return handles.map((h, i) => ({
      id: `player_${i}_${Date.now()}`,
      handle: h,
      reputation: Math.floor(Math.random() * 5000),
      credits: Math.floor(Math.random() * 50000),
      isOnline: Math.random() > 0.5,
      lastSeen: Date.now() - Math.floor(Math.random() * 86400000),
      threatLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
    }));
  }

  initialize() {
    this.onlinePlayers.set(this.generateFakePlayers());
    this.startOnlineSimulation();
    this.generateWantedList();
  }

  // ── Online Player Simulation ──
  private startOnlineSimulation() {
    setInterval(() => {
      this.onlinePlayers.update(players => {
        return players.map(p => ({
          ...p,
          isOnline: Math.random() > 0.6,
          lastSeen: p.isOnline ? Date.now() : p.lastSeen - Math.random() * 60000,
        }));
      });
    }, 30000);
  }

  // ── Network Breach (Async PVP) ──
  createBreachContract(defenderHandle: string, reward: number): BreachContract | null {
    const defender = this.onlinePlayers().find(p => p.handle === defenderHandle);
    if (!defender) {
      this.game.log('<span style="color: var(--neon-magenta)">[PVP] Target not found in network</span>');
      return null;
    }

    const contract: BreachContract = {
      id: `breach_${Date.now()}`,
      attackerId: this.game.playerHandle(),
      defenderId: defender.id,
      targetHandle: defenderHandle,
      reward,
      difficulty: Math.min(10, Math.floor(defender.reputation / 500) + 1),
      status: 'PENDING',
      createdAt: Date.now(),
      firewallPuzzle: this.generateFirewallPuzzle(),
    };

    this.activeBreaches.update(b => [...b, contract]);
    this.game.log(`<span style="color: var(--neon-cyan)">[PVP] Breach contract created: ${defenderHandle} | Reward: ${reward} CR</span>`);
    this.game.credits.update(c => Math.max(0, c - Math.floor(reward * 0.2))); // Entry fee
    return contract;
  }

  private generateFirewallPuzzle(): number[] {
    const len = 4 + Math.floor(Math.random() * 4);
    return Array.from({ length: len }, () => Math.floor(Math.random() * 16));
  }

  startBreach(contractId: string) {
    this.activeBreaches.update(contracts =>
      contracts.map(c => c.id === contractId ? { ...c, status: 'ACTIVE' as const } : c)
    );
    this.isInBreach.set(true);
    this.game.log('<span style="color: var(--neon-orange)">[PVP] BREACH INITIATED - Crack the firewall sequence</span>');
  }

  solveBreach(contractId: string, solution: number[]): boolean {
    const contract = this.activeBreaches().find(c => c.id === contractId);
    if (!contract) return false;

    const correct = JSON.stringify(solution) === JSON.stringify(contract.firewallPuzzle);
    
    if (correct) {
      this.activeBreaches.update(contracts =>
        contracts.map(c => c.id === contractId ? { ...c, status: 'SUCCESS' as const } : c)
      );
      this.game.credits.update(c => c + contract.reward);
      this.playerReputation.update(r => r + contract.difficulty * 10);
      this.game.log(`<span style="color: var(--neon-green)">[PVP] BREACH SUCCESSFUL! +${contract.reward} CR | +${contract.difficulty * 10} REP</span>`);
      this.isInBreach.set(false);
      return true;
    } else {
      this.activeBreaches.update(contracts =>
        contracts.map(c => c.id === contractId ? { ...c, status: 'FAILED' as const } : c)
      );
      this.trustScore.update(t => Math.max(0, t - 5));
      this.game.log('<span style="color: var(--neon-magenta)">[PVP] BREACH FAILED - Firewall integrity intact</span>');
      this.isInBreach.set(false);
      return false;
    }
  }

  // ── Trace War (Real-time PVP) ──
  startTrace() {
    this.isTracing.set(true);
    this.game.log('<span style="color: var(--neon-cyan)">[TRACE] Initiating network trace sweep...</span>');

    // Generate trace targets
    const targets: TraceTarget[] = this.onlinePlayers()
      .filter(p => p.isOnline)
      .slice(0, 5)
      .map(p => ({
        playerId: p.id,
        handle: p.handle,
        signalStrength: Math.floor(Math.random() * 100),
        distance: Math.floor(Math.random() * 10000),
        bearing: Math.floor(Math.random() * 360),
        lastPing: Date.now(),
      }));

    this.traceTargets.set(targets);
  }

  refineTrace(targetId: string): boolean {
    this.traceTargets.update(targets =>
      targets.map(t => {
        if (t.playerId === targetId) {
          const newStrength = Math.min(100, t.signalStrength + Math.floor(Math.random() * 20) + 5);
          return { ...t, signalStrength: newStrength, lastPing: Date.now() };
        }
        return t;
      })
    );

    const target = this.traceTargets().find(t => t.playerId === targetId);
    if (target && target.signalStrength >= 100) {
      this.completeTrace(target);
      return true;
    }
    return false;
  }

  private completeTrace(target: TraceTarget) {
    this.game.log(`<span style="color: var(--neon-green)">[TRACE] Target locked: ${target.handle}</span>`);
    this.game.credits.update(c => c + 500);
    this.playerReputation.update(r => r + 25);
    this.isTracing.set(false);
    this.traceTargets.set([]);
  }

  // ── Sabotage ──
  plantMalware(targetHandle: string): boolean {
    const target = this.onlinePlayers().find(p => p.handle === targetHandle);
    if (!target) return false;

    this.game.log(`<span style="color: var(--neon-orange)">[SABOTAGE] Deploying malware to ${targetHandle}...</span>`);
    
    // Random success chance based on reputation
    const success = Math.random() < (this.playerReputation() / 2000 + 0.3);
    
    if (success) {
      this.game.log(`<span style="color: var(--neon-green)">[SABOTAGE] Malware planted successfully</span>`);
      this.trustScore.update(t => Math.max(0, t - 10));
      // Track betrayal for wanted system
      this.checkWantedStatus(targetHandle);
      return true;
    } else {
      this.game.log(`<span style="color: var(--neon-magenta)">[SABOTAGE] Counter-intrusion detected! Firewall blocked your attack</span>`);
      this.game.detectionLevel.update(d => Math.min(100, d + 20));
      return false;
    }
  }

  // ── Betrayal Contracts ──
  createBetrayalContract(targetHandle: string, reward: number): boolean {
    this.game.log(`<span style="color: var(--neon-magenta)">[CONTRACT] Betrayal contract placed on ${targetHandle} | Bounty: ${reward} CR</span>`);
    this.trustScore.update(t => Math.max(0, t - 20));
    
    // Add to wanted list
    this.wantedList.update(wanted => {
      if (wanted.find(w => w.handle === targetHandle)) return wanted;
      return [...wanted, {
        playerId: `target_${Date.now()}`,
        handle: targetHandle,
        bounty: reward,
        crimes: ['CONTRACT_TARGET'],
        lastKnownLocation: 'UNKNOWN',
      }];
    });
    return true;
  }

  // ── Wanted System ──
  private generateWantedList() {
    const criminals = [
      { handle: 'NULL_BYTE', bounty: 5000, crimes: ['DATA_THEFT', 'IDENTITY_FRAUD'] },
      { handle: 'ZERO_COOL', bounty: 12000, crimes: ['INFRASTRUCTURE_ATTACK', 'CORP_ESPIONAGE'] },
      { handle: 'CHROME_VIPER', bounty: 3000, crimes: ['SABOTAGE', 'BETRAYAL'] },
    ];

    this.wantedList.set(criminals.map(c => ({
      playerId: `npc_${c.handle}`,
      handle: c.handle,
      bounty: c.bounty,
      crimes: c.crimes,
      lastKnownLocation: ['NIGHT_CITY', 'THE_NET', 'SECTOR_7', 'DARK_ZONE'][Math.floor(Math.random() * 4)],
    })));
  }

  private checkWantedStatus(victimHandle: string) {
    if (this.trustScore() < 50) {
      this.game.log(`<span style="color: var(--neon-magenta)">[WANTED] Your trust score is critically low. You may be targeted by other operatives.</span>`);
      
      // Add self to wanted list if not already there
      if (!this.wantedList().find(w => w.handle === this.game.playerHandle())) {
        this.wantedList.update(wanted => [...wanted, {
          playerId: this.game.playerHandle(),
          handle: this.game.playerHandle(),
          bounty: Math.floor((100 - this.trustScore()) * 100),
          crimes: ['BETRAYAL', 'SABOTAGE'],
          lastKnownLocation: 'ACTIVE_TRACE',
        }]);
      }
    }
  }

  // ── Darknet Auction ──
  getAuctionItems() {
    return [
      { id: 'a1', name: 'QUANTUM_DECRYPTOR', currentBid: 2500, timeLeft: 3600, seller: 'PHANTOM_404' },
      { id: 'a2', name: 'NEURAL_BOOSTER_v3', currentBid: 8000, timeLeft: 7200, seller: 'BLACK_ICE' },
      { id: 'a3', name: 'GHOST_PROTOCOL_LICENSE', currentBid: 15000, timeLeft: 1800, seller: 'SPECTRE_7' },
      { id: 'a4', name: 'CORP_ACCESS_KEY_[REDACTED]', currentBid: 50000, timeLeft: 900, seller: '???_???' },
    ];
  }

  placeBid(auctionId: string, amount: number): boolean {
    if (this.game.credits() < amount) {
      this.game.log('<span style="color: var(--neon-magenta)">[AUCTION] Insufficient credits</span>');
      return false;
    }
    this.game.credits.update(c => c - amount);
    this.game.log(`<span style="color: var(--neon-cyan)">[AUCTION] Bid placed: ${amount} CR on item ${auctionId}</span>`);
    return true;
  }

  // ── Incoming Attacks ──
  simulateIncomingAttack() {
    const attackers = this.onlinePlayers().filter(p => p.isOnline && p.threatLevel === 'CRITICAL');
    if (attackers.length === 0) return;

    const attacker = attackers[Math.floor(Math.random() * attackers.length)];
    this.game.log(`<span style="color: var(--neon-magenta)">[ALERT] Incoming breach attempt from ${attacker.handle}!</span>`);
    this.game.log(`<span style="color: var(--neon-magenta)">[ALERT] Defend your neural link! Type "defend" to counter</span>`);
  }
}
