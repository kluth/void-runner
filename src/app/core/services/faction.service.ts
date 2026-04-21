import { Injectable, inject, signal } from '@angular/core';
import { GameService } from './game.service';

export interface Faction {
  id: string;
  name: string;
  tag: string;
  description: string;
  color: string;
  ideology: string;
  territory: string[];
  power: number;
  reputation: { [playerId: string]: number };
  isPlayerFaction: boolean;
  leader: string;
  memberCount: number;
  wars: string[];
}

export interface FactionWar {
  id: string;
  attackerFactionId: string;
  defenderFactionId: string;
  attackerName: string;
  defenderName: string;
  attackerScore: number;
  defenderScore: number;
  startTime: number;
  endTime: number;
  status: 'ACTIVE' | 'VICTORY_A' | 'VICTORY_D' | 'DRAW';
  battles: WarBattle[];
}

export interface WarBattle {
  id: string;
  type: 'SABOTAGE' | 'HACK' | 'INFILTRATE' | 'DEFEND';
  description: string;
  reward: number;
  difficulty: number;
  completed: boolean;
  winner: string | null;
}

export interface Bounty {
  id: string;
  targetHandle: string;
  targetType: 'PLAYER' | 'NPC' | 'SYSTEM';
  issuerHandle: string;
  issuerType: 'NPC' | 'PLAYER' | 'FACTION' | 'SYSTEM';
  bountyType: 'CAPTURE' | 'HACK' | 'SABOTAGE' | 'TRACE' | 'BREACH' | 'STEAL' | 'ELIMINATE';
  reward: number;
  description: string;
  difficulty: number;
  status: 'OPEN' | 'CLAIMED' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
  createdAt: number;
  expiresAt: number;
  factionId?: string;
  requirements?: string[];
  bonusReward?: number;
}

@Injectable({ providedIn: 'root' })
export class FactionService {
  private game = inject(GameService);

  factions = signal<Faction[]>([]);
  activeWars = signal<FactionWar[]>([]);
  bounties = signal<Bounty[]>([]);
  playerFactionId = signal<string | null>(null);
  playerReputation = signal<{ [factionId: string]: number }>({});

  private npcFactionNames = [
    { name: 'NETWATCH', tag: 'NW', color: '#00E5FF', ideology: 'Corporate order. Network control. Compliance.' },
    { name: 'THE_COLLECTIVE', tag: 'TC', color: '#00FF9F', ideology: 'Open data. Free information. No secrets.' },
    { name: 'BLACK_ICE', tag: 'BI', color: '#FF0055', ideology: 'Profit through chaos. Mercenary freedom.' },
    { name: 'GHOST_PROTOCOL', tag: 'GP', color: '#BF40FF', ideology: 'Total anonymity. No traces. No identities.' },
    { name: 'RED_HANDED', tag: 'RH', color: '#FF6B00', ideology: 'Violence solves everything. Brutal efficiency.' },
    { name: 'SILICON_CHURCH', tag: 'SC', color: '#FCEE09', ideology: 'Machine transcendence. AI supremacy.' },
  ];

  private npcHandles = [
    'SPECTRE_7', 'GHOST_SHELL', 'NULL_BYTE', 'SHADOW_RUN', 'CIPHER_PUNK',
    'DARK_SIGNAL', 'NEON_BLADE', 'ZERO_COOL', 'CRASH_OVERRIDE', 'PHANTOM_404',
    'DATA_WRAITH', 'CHROME_VIPER', 'STATIC_NOISE', 'NET_RUNNER', 'VOID_WALKER',
    'RAZOR_EDGE', 'IRON_PROTOCOL', 'QUANTUM_SHADE', 'BIT_STORM', 'NEURAL_PULSE',
  ];

  initialize() {
    this.initFactions();
    this.generateBounties();
    this.startBountyRotation();
    this.startFactionWarSimulation();
  }

  private initFactions() {
    const territories = ['NIGHT_CITY', 'SECTOR_7', 'DARK_ZONE', 'THE_NET', 'CORP_district', 'OUTSKIRTS'];

    const factions: Faction[] = this.npcFactionNames.map((nf, i) => ({
      id: `faction_${i}`,
      name: nf.name,
      tag: nf.tag,
      description: nf.ideology,
      color: nf.color,
      ideology: nf.ideology,
      territory: [territories[i % territories.length]],
      power: 500 + Math.floor(Math.random() * 2000),
      reputation: {},
      isPlayerFaction: false,
      leader: this.npcHandles[i % this.npcHandles.length],
      memberCount: 20 + Math.floor(Math.random() * 200),
      wars: [],
    }));

    this.factions.set(factions);
  }

  // ── Faction Joining ──
  joinFaction(factionId: string): boolean {
    const faction = this.factions().find(f => f.id === factionId);
    if (!faction) return false;

    // Leave current faction if any
    if (this.playerFactionId()) {
      this.leaveFaction();
    }

    this.playerFactionId.set(factionId);
    this.playerReputation.update(r => ({ ...r, [factionId]: 0 }));

    this.factions.update(factions =>
      factions.map(f => f.id === factionId ? { ...f, memberCount: f.memberCount + 1 } : f)
    );

    this.game.log(`<span style="color: ${faction.color}">[FACTION] You joined ${faction.name} [${faction.tag}]</span>`);
    this.game.log(`<span style="color: ${faction.color}">[FACTION] "${faction.ideology}"</span>`);
    return true;
  }

  leaveFaction(): boolean {
    const currentId = this.playerFactionId();
    if (!currentId) return false;

    this.factions.update(factions =>
      factions.map(f => f.id === currentId ? { ...f, memberCount: Math.max(1, f.memberCount - 1) } : f)
    );

    this.game.log('<span style="color: var(--neon-orange)">[FACTION] You left your faction. Loyal members won\'t forget.</span>');
    this.playerFactionId.set(null);

    // Lose reputation with all factions for betrayal
    this.playerReputation.update(rep => {
      const newRep = { ...rep };
      for (const key of Object.keys(newRep)) {
        newRep[key] = Math.max(-1000, newRep[key] - 200);
      }
      return newRep;
    });
    return true;
  }

  // ── Faction Wars ──
  declareWar(attackerId: string, defenderId: string): FactionWar | null {
    const attacker = this.factions().find(f => f.id === attackerId);
    const defender = this.factions().find(f => f.id === defenderId);
    if (!attacker || !defender) return null;

    const war: FactionWar = {
      id: `war_${Date.now()}`,
      attackerFactionId: attackerId,
      defenderFactionId: defenderId,
      attackerName: attacker.name,
      defenderName: defender.name,
      attackerScore: 0,
      defenderScore: 0,
      startTime: Date.now(),
      endTime: Date.now() + 24 * 60 * 60 * 1000, // 24h
      status: 'ACTIVE',
      battles: this.generateWarBattles(attacker, defender),
    };

    this.activeWars.update(wars => [...wars, war]);
    this.factions.update(factions =>
      factions.map(f => {
        if (f.id === attackerId || f.id === defenderId) {
          return { ...f, wars: [...f.wars, war.id] };
        }
        return f;
      })
    );

    this.game.log(`<span style="color: var(--neon-magenta)">[FACTION WAR] ${attacker.name} has declared war on ${defender.name}!</span>`);
    return war;
  }

  private generateWarBattles(attacker: Faction, defender: Faction): WarBattle[] {
    const types: WarBattle['type'][] = ['SABOTAGE', 'HACK', 'INFILTRATE', 'DEFEND'];
    const descriptions = {
      SABOTAGE: [`Sabotage ${defender.name} communications`, `Destroy ${defender.name} supply lines`, `Corrupt ${defender.name} databases`],
      HACK: [`Breach ${defender.name} firewall`, `Steal ${defender.name} encryption keys`, `Intercept ${defender.name} transmissions`],
      INFILTRATE: [`Plant agent in ${defender.name}`, `Recon ${defender.name} operations`, `Map ${defender.name} territory`],
      DEFEND: [`Protect ${attacker.name} headquarters`, `Secure ${attacker.name} data center`, `Guard ${attacker.name} supply route`],
    };

    const battles: WarBattle[] = [];
    for (let i = 0; i < 6; i++) {
      const type = types[i % types.length];
      const descs = descriptions[type];
      battles.push({
        id: `battle_${Date.now()}_${i}`,
        type,
        description: descs[Math.floor(Math.random() * descs.length)],
        reward: 1000 + Math.floor(Math.random() * 5000),
        difficulty: 3 + Math.floor(Math.random() * 7),
        completed: false,
        winner: null,
      });
    }
    return battles;
  }

  participateInBattle(warId: string, battleId: string): boolean {
    const war = this.activeWars().find(w => w.id === warId);
    if (!war) return false;

    const battle = war.battles.find(b => b.id === battleId);
    if (!battle || battle.completed) return false;

    // Simulate outcome based on difficulty and player rep
    const playerFactionId = this.playerFactionId();
    const isAttacker = playerFactionId === war.attackerFactionId;
    const success = Math.random() < (0.4 + (this.playerReputation()[playerFactionId || ''] || 0) / 2000);

    if (success) {
      if (isAttacker) {
        this.activeWars.update(wars => wars.map(w => w.id === warId ? {
          ...w,
          attackerScore: w.attackerScore + battle.difficulty,
          battles: w.battles.map(b => b.id === battleId ? { ...b, completed: true, winner: 'attacker' } : b),
        } : w));
      } else {
        this.activeWars.update(wars => wars.map(w => w.id === warId ? {
          ...w,
          defenderScore: w.defenderScore + battle.difficulty,
          battles: w.battles.map(b => b.id === battleId ? { ...b, completed: true, winner: 'defender' } : b),
        } : w));
      }
      this.game.credits.update(c => c + battle.reward);
      this.addReputation(playerFactionId!, battle.difficulty * 10);
      this.game.log(`<span style="color: var(--neon-green)">[WAR] Battle won! +${battle.reward} CR | +${battle.difficulty * 10} REP</span>`);
      return true;
    } else {
      this.game.log('<span style="color: var(--neon-magenta)">[WAR] Battle lost. The enemy was prepared.</span>');
      this.addReputation(playerFactionId!, -5);
      return false;
    }
  }

  private startFactionWarSimulation() {
    setInterval(() => {
      // Random NPC faction wars
      if (Math.random() < 0.1 && this.activeWars().length < 3) {
        const factions = this.factions();
        const attacker = factions[Math.floor(Math.random() * factions.length)];
        let defender = factions[Math.floor(Math.random() * factions.length)];
        while (defender.id === attacker.id) {
          defender = factions[Math.floor(Math.random() * factions.length)];
        }
        this.declareWar(attacker.id, defender.id);
      }

      // Update war scores for NPC-only wars
      this.activeWars.update(wars => wars.map(war => {
        if (war.status !== 'ACTIVE') return war;
        const playerFaction = this.playerFactionId();
        if (war.attackerFactionId === playerFaction || war.defenderFactionId === playerFaction) return war;

        // Simulate NPC war progress
        return {
          ...war,
          attackerScore: war.attackerScore + (Math.random() < 0.3 ? Math.floor(Math.random() * 5) : 0),
          defenderScore: war.defenderScore + (Math.random() < 0.3 ? Math.floor(Math.random() * 5) : 0),
        };
      }));

      // Check for war conclusions
      this.activeWars.update(wars => wars.map(war => {
        if (war.status !== 'ACTIVE') return war;
        if (Date.now() > war.endTime || war.attackerScore > 50 || war.defenderScore > 50) {
          if (war.attackerScore > war.defenderScore) {
            this.game.log(`<span style="color: var(--neon-orange)">[WAR] ${war.attackerName} defeated ${war.defenderName}!</span>`);
            return { ...war, status: 'VICTORY_A' as const };
          } else if (war.defenderScore > war.attackerScore) {
            this.game.log(`<span style="color: var(--neon-orange)">[WAR] ${war.defenderName} repelled ${war.attackerName}!</span>`);
            return { ...war, status: 'VICTORY_D' as const };
          }
          return { ...war, status: 'DRAW' as const };
        }
        return war;
      }));
    }, 30000);
  }

  // ── Reputation ──
  addReputation(factionId: string, amount: number) {
    this.playerReputation.update(r => ({
      ...r,
      [factionId]: (r[factionId] || 0) + amount,
    }));
  }

  getFactionRep(factionId: string): number {
    return this.playerReputation()[factionId] || 0;
  }

  getFactionRepLevel(factionId: string): string {
    const rep = this.getFactionRep(factionId);
    if (rep >= 500) return 'ALLIED';
    if (rep >= 200) return 'FRIENDLY';
    if (rep >= 0) return 'NEUTRAL';
    if (rep >= -200) return 'HOSTILE';
    return 'ENEMY';
  }

  // ── Bounty System ──
  private generateBounties() {
    const types: Bounty['bountyType'][] = ['HACK', 'SABOTAGE', 'TRACE', 'BREACH', 'STEAL', 'CAPTURE', 'ELIMINATE'];
    const npcTargets = this.npcHandles.slice(0, 10);

    const bounties: Bounty[] = [];

    // NPC-issued bounties
    for (let i = 0; i < 15; i++) {
      const issuer = this.npcHandles[Math.floor(Math.random() * this.npcHandles.length)];
      const target = npcTargets[Math.floor(Math.random() * npcTargets.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const faction = this.factions()[Math.floor(Math.random() * this.factions().length)];

      bounties.push({
        id: `bounty_${Date.now()}_${i}`,
        targetHandle: target,
        targetType: 'NPC',
        issuerHandle: issuer,
        issuerType: Math.random() > 0.5 ? 'NPC' : 'FACTION',
        bountyType: type,
        reward: 500 + Math.floor(Math.random() * 10000),
        description: this.getBountyDescription(type, target, issuer),
        difficulty: 1 + Math.floor(Math.random() * 10),
        status: 'OPEN',
        createdAt: Date.now() - Math.floor(Math.random() * 86400000),
        expiresAt: Date.now() + (1 + Math.floor(Math.random() * 7)) * 86400000,
        factionId: Math.random() > 0.4 ? faction.id : undefined,
        requirements: Math.random() > 0.6 ? ['FACTION: ' + faction.name] : undefined,
      });
    }

    // System-issued bounties
    for (let i = 0; i < 5; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      bounties.push({
        id: `sys_bounty_${Date.now()}_${i}`,
        targetHandle: 'ENCRYPTED',
        targetType: 'SYSTEM',
        issuerHandle: 'VOID_OS',
        issuerType: 'SYSTEM',
        bountyType: type,
        reward: 2000 + Math.floor(Math.random() * 20000),
        description: this.getSystemBountyDescription(type),
        difficulty: 5 + Math.floor(Math.random() * 6),
        status: 'OPEN',
        createdAt: Date.now(),
        expiresAt: Date.now() + 3 * 86400000,
        bonusReward: Math.floor(Math.random() * 5000),
      });
    }

    this.bounties.set(bounties);
  }

  private getBountyDescription(type: Bounty['bountyType'], target: string, issuer: string): string {
    const descriptions: { [key: string]: string[] } = {
      HACK: [
        `Breach ${target}'s personal firewall. ${issuer} needs their data.`,
        `Infiltrate ${target}'s neural implant. Extract memory banks.`,
        `Override ${target}'s security protocols. Leave no trace.`,
      ],
      SABOTAGE: [
        `Destroy ${target}'s network infrastructure.`,
        `Corrupt ${target}'s backup systems. Make it permanent.`,
        `Disable ${target}'s defenses before the main assault.`,
      ],
      TRACE: [
        `Locate ${target}'s physical coordinates. ${issuer} wants a face-to-face.`,
        `Track ${target}'s digital footprint across the net.`,
        `Pin ${target}'s IP to a real-world location. Live coordinates preferred.`,
      ],
      BREACH: [
        `Penetrate ${target}'s corporate firewall. Steal their secrets.`,
        `Breach ${target}'s darknet marketplace. Take everything.`,
        `Crack ${target}'s encryption. They think it's unbreakable. Prove them wrong.`,
      ],
      STEAL: [
        `Steal ${target}'s cryptocurrency wallet. ${issuer} will split the take.`,
        `Extract ${target}'s neural implant data. The memories are worth more than credits.`,
        `Take ${target}'s quantum decryption key. We need it for the big job.`,
      ],
      CAPTURE: [
        `${issuer} wants ${target} alive. Bring them in for questioning.`,
        `Capture ${target}'s digital avatar. Lock them in a sandbox.`,
        `${target} has information we need. Don't let them escape.`,
      ],
      ELIMINATE: [
        `Permanently delete ${target}'s digital existence. No backups.`,
        `Wipe ${target} from the network. Make it look like a system failure.`,
        `${target} knows too much. Silence them. Forever.`,
      ],
    };

    const descs = descriptions[type] || descriptions['HACK'];
    return descs[Math.floor(Math.random() * descs.length)];
  }

  private getSystemBountyDescription(type: Bounty['bountyType']): string {
    const descriptions: { [key: string]: string[] } = {
      HACK: ['SYSTEM ANOMALY: Unknown entity detected in sector 7. Investigate and report.', 'CORP LEAK: Corporate secrets are being sold on the darknet. Trace the source.'],
      SABOTAGE: ['INFRASTRUCTURE ALERT: Rogue AI controlling traffic systems. Shut it down.', 'DATA CENTER: Unidentified process consuming resources. Terminate with extreme prejudice.'],
      TRACE: ['PHANTOM SIGNAL: Strange transmissions from decommissioned server. Locate and identify.', 'GHOST IN THE MACHINE: Someone is impersonating system administrators. Find them.'],
      BREACH: ['BLACK ICE ALERT: Advanced intrusion detected in VOID_OS core. Repel the attack.', 'ZERO DAY: New vulnerability discovered. Exploit it before the patch.'],
      STEAL: ['RECOVERY: Encrypted data package lost in network transit. Retrieve it.', 'ARTIFACT: Ancient encryption key detected in deep web. Secure it.'],
      CAPTURE: ['ROGUE AI: Autonomous agent escaped containment. Recapture alive for analysis.', 'DEFECTOR: High-value operative switching sides. Intercept and detain.'],
      ELIMINATE: ['THREAT NEUTRALIZATION: Active malware spreading through network. Eradicate immediately.', 'SYSTEM PURGE: Compromised node detected. Isolate and destroy.'],
    };

    const descs = descriptions[type] || descriptions['HACK'];
    return descs[Math.floor(Math.random() * descs.length)];
  }

  // ── Player Bounties ──
  placeBounty(
    targetHandle: string,
    bountyType: Bounty['bountyType'],
    reward: number,
    description?: string
  ): Bounty | null {
    if (this.game.credits() < reward) {
      this.game.log('<span style="color: var(--neon-magenta)">[BOUNTY] Insufficient credits for bounty</span>');
      return null;
    }

    this.game.credits.update(c => c - reward);

    const bounty: Bounty = {
      id: `player_bounty_${Date.now()}`,
      targetHandle,
      targetType: 'PLAYER',
      issuerHandle: this.game.playerHandle(),
      issuerType: 'PLAYER',
      bountyType,
      reward,
      description: description || `Player bounty on ${targetHandle}. ${bountyType} operation.`,
      difficulty: Math.min(10, Math.floor(reward / 1000)),
      status: 'OPEN',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3 * 86400000,
    };

    this.bounties.update(b => [...b, bounty]);
    this.game.log(`<span style="color: var(--neon-orange)">[BOUNTY] Placed ${reward} CR bounty on ${targetHandle} (${bountyType})</span>`);
    return bounty;
  }

  // ── Bounty Rotation ──
  private startBountyRotation() {
    setInterval(() => {
      // Expire old bounties
      this.bounties.update(bounties =>
        bounties.map(b =>
          b.status === 'OPEN' && Date.now() > b.expiresAt ? { ...b, status: 'EXPIRED' as const } : b
        )
      );

      // Generate new bounties periodically
      if (this.bounties().filter(b => b.status === 'OPEN').length < 10) {
        this.generateBounties();
      }

      // Random NPC bounty completions
      this.bounties.update(bounties =>
        bounties.map(b => {
          if (b.status === 'OPEN' && b.issuerType !== 'PLAYER' && Math.random() < 0.05) {
            this.game.log(`<span style="color: var(--text-dim)">[BOUNTY] ${b.bountyType} bounty on ${b.targetHandle} was completed by another operative</span>`);
            return { ...b, status: 'COMPLETED' as const };
          }
          return b;
        })
      );
    }, 60000);
  }

  // ── Claim & Complete Bounties ──
  claimBounty(bountyId: string): boolean {
    const bounty = this.bounties().find(b => b.id === bountyId);
    if (!bounty || bounty.status !== 'OPEN') return false;

    // Check requirements
    if (bounty.requirements) {
      for (const req of bounty.requirements) {
        if (req.startsWith('FACTION:')) {
          const factionName = req.split(':')[1].trim();
          const faction = this.factions().find(f => f.name === factionName);
          if (faction && this.playerFactionId() !== faction.id) {
            this.game.log(`<span style="color: var(--neon-magenta)">[BOUNTY] Requires faction membership: ${factionName}</span>`);
            return false;
          }
        }
      }
    }

    this.bounties.update(bounties =>
      bounties.map(b => b.id === bountyId ? { ...b, status: 'CLAIMED' as const } : b)
    );
    this.game.log(`<span style="color: var(--neon-cyan)">[BOUNTY] Claimed: ${bounty.description.substring(0, 60)}...</span>`);
    return true;
  }

  completeBounty(bountyId: string): boolean {
    const bounty = this.bounties().find(b => b.id === bountyId);
    if (!bounty || bounty.status !== 'CLAIMED') return false;

    this.bounties.update(bounties =>
      bounties.map(b => b.id === bountyId ? { ...b, status: 'COMPLETED' as const } : b)
    );

    let totalReward = bounty.reward;
    if (bounty.bonusReward && Math.random() > 0.5) {
      totalReward += bounty.bonusReward;
      this.game.log(`<span style="color: var(--neon-yellow)">[BOUNTY] BONUS! +${bounty.bonusReward} CR</span>`);
    }

    this.game.credits.update(c => c + totalReward);
    this.game.log(`<span style="color: var(--neon-green)">[BOUNTY] Completed! +${totalReward} CR</span>`);

    if (bounty.factionId) {
      this.addReputation(bounty.factionId, bounty.difficulty * 5);
    }
    return true;
  }

  // ── Getters ──
  getOpenBounties(): Bounty[] {
    return this.bounties().filter(b => b.status === 'OPEN');
  }

  getPlayerFaction(): Faction | null {
    const id = this.playerFactionId();
    return id ? this.factions().find(f => f.id === id) || null : null;
  }

  getActiveWars(): FactionWar[] {
    return this.activeWars().filter(w => w.status === 'ACTIVE');
  }

  getAvailableFactions(): Faction[] {
    return this.factions().filter(f => !f.isPlayerFaction);
  }
}
