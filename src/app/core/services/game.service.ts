import { Injectable, signal, computed, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { NeuralService } from './neural.service';
import { AudioService } from './audio.service';

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  price: number;
  bonusType: 'recon' | 'exploit' | 'stealth' | 'social' | 'defense' | 'cloud';
  bonusValue: number;
  unlocked: boolean;
}

export interface LogEntry {
  timestamp: string;
  message: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'binary' | 'encrypted_log' | 'firmware' | 'cloud_dump';
  analysisProgress: number;
  analyzed: boolean;
  rewardType: 'zero-day' | 'data' | 'target_intel' | 'credits';
}

export interface InternalTarget {
  id: string;
  name: string;
  type: 'WORKSTATION' | 'DATABASE' | 'MAIL_SERVER' | 'ADMIN_CONTROLLER';
  status: 'LOCKED' | 'COMPROMISED';
  reward: number;
}

export interface SoftwarePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'BINARY' | 'DAEMON' | 'UTIL';
  installed: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  bonus?: string;
  reqRep?: number;
  _count?: { members: number };
}

export interface PlayerData {
  id: string;
  username: string;
  name: string;
  reputation: number;
  score: number;
  teamId?: string | null;
  team?: Team | null;
}

export interface Mission {
  id: string;
  name: string;
  target: string;
  difficulty: number;
  reward: number;
  type: 'brute-force' | 'port-scan' | 'sql-injection' | 'rfid-clone' | 'buffer-overflow' | 'xss-injection' | 'osint-research' | 'phishing-campaign' | 'crypto-heist' | 'quantum-breach' | 'iot-takeover' | 'social-engineering';
  isHoneypot: boolean;
  isEntryPoint?: boolean;
}

export type RoutingMode = 'DIRECT' | 'VPN' | 'ONION';

export const AVAILABLE_HARDWARE: HardwareItem[] = [
  { id: 'pineapple', name: 'WiFi Pineapple Nano', description: 'Advanced wireless auditing platform.', price: 300, bonusType: 'recon', bonusValue: 20, unlocked: true },
  { id: 'ducky', name: 'USB Rubber Ducky', description: 'The original keystroke injection tool.', price: 150, bonusType: 'exploit', bonusValue: 15, unlocked: true },
  { id: 'flipper', name: 'Flipper Zero', description: 'Multi-tool for pentesting physical access.', price: 250, bonusType: 'recon', bonusValue: 25, unlocked: true },
  { id: 'hackrf', name: 'HackRF One', description: 'Software Defined Radio for advanced RF attacks.', price: 600, bonusType: 'exploit', bonusValue: 30, unlocked: false },
  { id: 'omg', name: 'O.MG Cable', description: 'Covert HID injection cable with WiFi control.', price: 450, bonusType: 'stealth', bonusValue: 25, unlocked: false },
  { id: 'proxmark', name: 'Proxmark3 RDV4', description: 'Powerful RFID/NFC research tool.', price: 500, bonusType: 'recon', bonusValue: 30, unlocked: false },
  { id: 'se-toolkit', name: 'SET - Social Eng. Toolkit', description: 'Convincing templates and automated phishing.', price: 400, bonusType: 'social', bonusValue: 25, unlocked: false },
  { id: 'voip-spoofer', name: 'VoIP Spoof-Station', description: 'Spoof caller IDs for high-trust vishing.', price: 350, bonusType: 'social', bonusValue: 20, unlocked: false },
  { id: 'firewall', name: 'Sentinel Firewall', description: 'Blocks rival intrusion attempts.', price: 300, bonusType: 'defense', bonusValue: 20, unlocked: true },
  { id: 'edr', name: 'Advanced EDR Node', description: 'Detects stealthy intrusions on your botnet.', price: 550, bonusType: 'defense', bonusValue: 35, unlocked: false },
  { id: 'bucket-bruter', name: 'S3 Bucket Hunter', description: 'Scans for misconfigured cloud storage.', price: 700, bonusType: 'cloud', bonusValue: 40, unlocked: false },
  { id: 'red-pill', name: 'The Red Pill', description: 'See the world as it truly is. Frozen trace level.', price: 1000, bonusType: 'stealth', bonusValue: 99, unlocked: false }
];

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private socket: Socket;
  private neuralService = inject(NeuralService);
  private audioService = inject(AudioService);
  playerHandle = signal('VOID_RUNNER_' + Math.floor(Math.random() * 9999));

  // Hardware & Software State
  availableHardware = signal<HardwareItem[]>(AVAILABLE_HARDWARE);
  installedSoftware = signal<SoftwarePackage[]>([
    { id: 'nmap-pro', name: 'nmap-pro', description: 'Advanced port auditing. -50% trace gain on scans.', price: 150, type: 'BINARY', installed: false },
    { id: 'sqlmap-lite', name: 'sqlmap-lite', description: 'SQL automation. Reveals vulnerabilities faster.', price: 200, type: 'BINARY', installed: false },
    { id: 'proxychains-ng', name: 'proxychains-ng', description: 'Advanced routing. -30% routing costs.', price: 100, type: 'UTIL', installed: false },
    { id: 'wiper', name: 'log-wiper', description: 'Adds "wipe" command to purge active trace.', price: 300, type: 'UTIL', installed: false },
    { id: 'bleachbit-core', name: 'bleachbit-core', description: 'Passive trace cleaning daemon.', price: 500, type: 'DAEMON', installed: false }
  ]);

  // Core State
  credits = signal(500);
  experience = signal(0);
  inventory = signal<HardwareItem[]>([]);
  terminalLogs = signal<LogEntry[]>([]);
  
  // Mission State
  activeMissions = signal<Mission[]>([]);
  campaignLevel = signal(1);

  // Network State
  routingMode = signal<RoutingMode>('DIRECT');

  // Dynamic Session State
  detectionLevel = signal(0);
  matrixMode = signal(false);
  secretsFound = signal<string[]>([]);

  // Advanced Mechanics State
  botnetSize = signal(0);
  zeroDays = signal(0);
  reputation = signal(0);
  
  // New Mechanics
  activeRansoms = signal(0);
  supplyChainActive = signal(false);
  publicExploits = signal<Mission['type'][]>([]); // 1-Days
  
  // Lateral Movement & Sandbox
  internalNetwork = signal<InternalTarget[]>([]);
  activeInternalOrigin = signal<string | null>(null);
  artifacts = signal<Artifact[]>([]);

  // Global Live Events & Multiplayer
  globalEvent = signal<'NONE' | 'CTF_ACTIVE' | 'PATCH_TUESDAY' | 'ZERO_DAY_PANIC'>('NONE');
  leaderboard = signal<{id?: string, name: string, reputation: number, score: number, isPlayer: boolean}[]>([]);
  eventTimer = signal(0);
  activeTeam = signal<Team | null>(null);
  teamMessages = signal<{sender: string, text: string, teamId?: string}[]>([]);
  
  // Real Multiplayer Social State
  availableTeams = signal<Team[]>([]);
  privateMessages = signal<{senderName: string, senderId: string, text: string, timestamp: string}[]>([]);
  hasDarknetAccess = signal(false);

  // Authentication State
  authToken = signal<string | null>(localStorage.getItem('VOID_RUNNER_TOKEN'));
  playerData = signal<PlayerData | null>(null);
  qrCode = signal<string | null>(null);
  authRequired = signal(false); 
  twoFactorUserId = signal<string | null>(null);

  // Intrusion State
  intrusionActive = signal(false);
  intrusionProgress = signal(0);

  // System Integrity & Retaliation State
  systemIntegrity = signal(100); // 0-100%
  activeDebuffs = signal<{id: string, name: string, type: 'RANSOM' | 'GLITCH' | 'LOCK', expiresAt: number}[]>([]);
  
  // Immersive Stress Mechanics
  difficultyMultiplier = signal(1.0);
  isDistorted = signal(false);
  blueTeamActive = signal(false);

  // Hijack State
  isHijacked = signal(false);
  hijackMessage = signal<string>('');
  hijackUnlockCode = signal<string>('');
  
  // Hardware Verification State
  isCalibrating = signal(false);
  isBooting = signal(true); 
  isConfigured = signal(true); 

  private rivalNames = ['Zer0_Cool', 'CrashOverride', 'AcidBurn', 'CerealKiller', 'Lord_Nikon', 'PhantomPhreak', 'Plague', 'Dark_Dante', 'Mudge', 'Gummo'];

  constructor() {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const socketUrl = isProd ? window.location.origin : 'http://localhost:3000';
    this.socket = io(socketUrl);
    
    this.setupSocket();
    this.checkConfigStatus();

    this.log('INITIALIZING VOID_OS...');
    this.log('CORE SYSTEMS ONLINE.');
    for (let i = 0; i < 4; i++) {
      this.addRandomMission();
    }

    setInterval(() => this.gameTick(), 1000);
    setInterval(() => this.economyTick(), 10000);
  }

  private checkConfigStatus() {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const apiUrl = isProd ? '/api/config/status' : 'http://localhost:3000/api/config/status';
    
    fetch(apiUrl)
      .then(r => r.json())
      .then((res: {configured: boolean}) => this.isConfigured.set(res.configured))
      .catch(() => this.isConfigured.set(true)); 
  }

  private setupSocket() {
    this.socket.on('connect', () => {
      this.log(`[NETWORK] UPLINK ESTABLISHED.`);
      if (this.authToken()) {
        this.socket.emit('session_resume', { token: this.authToken() });
      }
    });

    this.socket.on('auth_complete', (data: { token: string, player: PlayerData }) => {
      localStorage.setItem('VOID_RUNNER_TOKEN', data.token);
      this.authToken.set(data.token);
      this.playerData.set(data.player);
      this.authRequired.set(false);
      this.twoFactorUserId.set(null);
      this.socket.emit('session_resume', { token: data.token });
    });

    this.socket.on('auth_2fa_required', (data: { userId: string }) => {
      this.twoFactorUserId.set(data.userId);
    });

    this.socket.on('auth_2fa_qr', (qr: string) => {
      this.qrCode.set(qr);
    });

    this.socket.on('init_state', (data: { 
        globalEvent: any, 
        eventTimer: number, 
        leaderboard: any[], 
        chatMessages: any[], 
        teams: Team[],
        player: PlayerData 
    }) => {
      this.globalEvent.set(data.globalEvent);
      this.eventTimer.set(data.eventTimer);
      this.leaderboard.set(data.leaderboard.map((p: any) => ({ ...p, isPlayer: p.id === data.player.id })));
      this.teamMessages.set(data.chatMessages);
      this.availableTeams.set(data.teams);
      this.playerData.set(data.player);
      this.authRequired.set(false);
    });

    this.socket.on('error_msg', (msg: string) => {
      this.log(`<span style="color: #f00">ERR: ${msg}</span>`);
      this.audioService.playError();
    });

    this.socket.on('new_private_message', (pm: any) => {
      this.privateMessages.update(msgs => [pm, ...msgs].slice(0, 50));
      this.log(`[SECURE_DM] Incoming message from ${pm.senderName}. Check Darknet Node.`);
      this.audioService.playClick();
    });

    this.socket.on('teams_update', (teams: Team[]) => {
      this.availableTeams.set(teams);
    });

    this.socket.on('team_joined', (team: Team) => {
      this.activeTeam.set(team);
      this.log(`SYSTEM: Affiliation confirmed with ${team.name}.`);
    });

    this.socket.on('event_update', (data: { event: any, timer: number }) => {
      this.globalEvent.set(data.event);
      this.eventTimer.set(data.timer);
      if (data.event !== 'NONE') this.log(`[GLOBAL EVENT] ${data.event} STARTED.`);
    });

    this.socket.on('new_message', (msg: any) => {
      this.teamMessages.update(msgs => [msg, ...msgs].slice(0, 20));
      if (msg.sender !== this.playerHandle()) {
        this.log(`[COMMS] ${msg.sender}: ${msg.text}`);
        if (Math.random() > 0.8) {
          this.audioService.speakCreepy(`${msg.sender} says: ${msg.text}`);
        }
      }
    });

    this.socket.on('disconnect', () => {
      this.log('[NETWORK] UPLINK LOST. RECONNECTING...');
    });
  }

  private updateRemoteScore() {
    if (this.authToken()) {
      this.socket.emit('update_score', { 
        token: this.authToken(),
        score: this.credits(), 
        reputation: this.reputation() 
      });
    }
  }

  sendTeamMessage(text: string) {
    if (this.authToken()) {
      this.socket.emit('send_message', {
        token: this.authToken(),
        text,
        teamId: this.activeTeam()?.id
      });
    }
  }

  sendPrivateMessage(receiverId: string, text: string) {
    this.socket.emit('send_private_message', { token: this.authToken(), receiverId, text });
  }

  createTeam(name: string, description: string) {
    this.socket.emit('create_team', { token: this.authToken(), name, description });
  }

  joinTeam(teamId: string) {
    this.isCalibrating.set(true);
    this.socket.emit('join_team', { token: this.authToken(), teamId });
  }

  login(username: string, pass: string) {
    this.socket.emit('auth_login', { username, password: pass });
  }

  register(username: string, pass: string) {
    this.socket.emit('auth_register', { username, password: pass });
  }

  verify2fa(code: string) {
    this.socket.emit('auth_2fa_verify', { userId: this.twoFactorUserId(), code });
  }

  setup2fa() {
    this.socket.emit('auth_2fa_setup', { token: this.authToken() });
  }

  handleOAuthToken(token: string) {
    localStorage.setItem('VOID_RUNNER_TOKEN', token);
    this.authToken.set(token);
    this.authRequired.set(false);
    this.socket.emit('session_resume', { token });
    window.history.replaceState({}, document.title, "/");
  }

  private gameTick() {
    const now = Date.now();
    const det = this.detectionLevel();
    this.difficultyMultiplier.set(1.0 + (det / 50)); 
    this.isDistorted.set(det > 75);
    this.blueTeamActive.set(det > 85);

    if (Notification.permission === 'granted' && Math.random() > 0.998 && !this.isHijacked()) {
      this.triggerFakedSystemAlert();
    }

    if (!this.hasDarknetAccess() && this.reputation() >= 1000) {
      this.hasDarknetAccess.set(true);
      this.log('<span style="color: #00ffff">!!! URGENT: ENCRYPTED COMMS MODULE ACTIVE. DARKNET_NODE ACCESSIBLE. !!!</span>');
      this.audioService.playSuccess();
    }

    const currentDebuffs = this.activeDebuffs();
    if (currentDebuffs.length > 0) {
      const remaining = currentDebuffs.filter(d => d.expiresAt > now);
      if (remaining.length !== currentDebuffs.length) {
        this.activeDebuffs.set(remaining);
        this.log("DEBUFF_CLEARED: System stability improved.");
      }
    }

    if (this.systemIntegrity() < 100 && now % 5000 < 1000) {
      this.systemIntegrity.update(i => Math.min(100, i + 1));
    }

    if (this.systemIntegrity() < 30 && now % 2000 < 1000) {
      const bleed = Math.floor(Math.random() * 5) + 1;
      if (this.credits() > 0) {
        this.credits.update(c => Math.max(0, c - bleed));
        if (Math.random() > 0.9) this.log('<span style="color: #ff0000">!!! ALERT: MEMORY_LEAK DETECTED. DATA DECAYING !!!</span>');
      }
    }

    if (this.installedSoftware().find(s => s.id === 'bleachbit-core' && s.installed) && now % 3000 < 1000) {
      if (this.detectionLevel() > 0) {
        this.detectionLevel.update(d => Math.max(0, d - 0.1));
      }
    }

    this.artifacts.update(arts => arts.map(a => {
      if (!a.analyzed && a.analysisProgress < 100) {
        return { ...a, analysisProgress: Math.min(100, a.analysisProgress + 1.5) };
      }
      return a;
    }));

    this.artifacts().forEach(a => {
      if (a.analysisProgress >= 100 && !a.analyzed) this.finishAnalysis(a);
    });

    if (this.eventTimer() > 0) {
      this.eventTimer.update(t => Math.max(0, t - 1));
    }

    const cloudPower = this.totalCloudBonus();
    if (cloudPower > 0 && Math.random() > 0.99) {
      this.dropArtifact('cloud_dump');
    }

    if (this.intrusionActive()) {
      const defense = this.totalDefenseBonus();
      const progressGain = Math.max(0.5, 3 - (defense / 20));
      this.intrusionProgress.update(p => p + progressGain);
      if (this.intrusionProgress() >= 100) this.resolveIntrusion(false);
    } else {
      if (Math.random() > 0.999 && this.reputation() > 200) this.startIntrusion();
    }

    const hijackBaseChance = 0.0005;
    const integrityFactor = (100 - this.systemIntegrity()) / 100;
    const finalHijackChance = hijackBaseChance + (integrityFactor * 0.05); 

    if (!this.isHijacked() && Math.random() < finalHijackChance) {
      this.triggerHijack();
    }
  }

  async triggerHijack() {
    this.log('!!! WARNING: UNKNOWN_OVERRIDE DETECTED !!!');
    this.isHijacked.set(true);

    const code = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase();
    this.hijackUnlockCode.set(code);

    const history = this.teamMessages().map(m => m.text).join(' ');
    // We add the secret code to the history so AI knows it
    const augmentedHistory = `${history} [SYSTEM_SECURITY_CODE: ${code}]`;
    
    const obs = await this.neuralService.getHijackResponse(this.playerHandle(), augmentedHistory);
    obs.subscribe(res => {
      this.hijackMessage.set(res.response);
      this.audioService.speakCreepy(res.response);
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 500, 200, 100, 200]);
      }
    });
  }

  private economyTick() {
    if (this.botnetSize() > 0) {
      const cryptoMined = Math.floor(this.botnetSize() * 1.5);
      this.credits.update(c => c + cryptoMined);
      if (Math.random() > 0.8 && this.activeRansoms() === 0) {
          this.log(`BOTNET: Mined ${cryptoMined}cr in background.`);
      }
    }

    if (this.activeRansoms() > 0) {
      const extortionPayout = this.activeRansoms() * 80;
      this.credits.update(c => c + extortionPayout);
      this.log(`RANSOMWARE: Extorted ${extortionPayout}cr.`);
      this.increaseDetection(this.activeRansoms() * 4);
    }
    this.updateRemoteScore();
  }

  // Stats
  totalReconBonus = computed(() => {
    if (this.activeDebuffs().some(d => d.type === 'LOCK')) return 0;
    return this.inventory().filter(i => i.bonusType === 'recon').reduce((acc, curr) => acc + curr.bonusValue, 0);
  });

  totalExploitBonus = computed(() => {
    if (this.activeDebuffs().some(d => d.type === 'LOCK')) return 0;
    return this.inventory().filter(i => i.bonusType === 'exploit').reduce((acc, curr) => acc + curr.bonusValue, 0);
  });

  totalStealthBonus = computed(() => {
    if (this.activeDebuffs().some(d => d.type === 'LOCK')) return 0;
    return this.inventory().filter(i => i.bonusType === 'stealth').reduce((acc, curr) => acc + curr.bonusValue, 0);
  });

  totalSocialBonus = computed(() => {
    if (this.activeDebuffs().some(d => d.type === 'LOCK')) return 0;
    return this.inventory().filter(i => i.bonusType === 'social').reduce((acc, curr) => acc + curr.bonusValue, 0);
  });

  totalDefenseBonus = computed(() => {
    if (this.activeDebuffs().some(d => d.type === 'LOCK')) return 0;
    return this.inventory().filter(i => i.bonusType === 'defense').reduce((acc, curr) => acc + curr.bonusValue, 0);
  });

  totalCloudBonus = computed(() => {
    if (this.activeDebuffs().some(d => d.type === 'LOCK')) return 0;
    return this.inventory().filter(i => i.bonusType === 'cloud').reduce((acc, curr) => acc + curr.bonusValue, 0);
  });

  stealthMultiplier = computed(() => {
    switch (this.routingMode()) {
      case 'VPN': return 1.5;
      case 'ONION': return 3.0;
      default: return 1.0;
    }
  });

  log(message: string) {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.terminalLogs.update(logs => [...logs, { timestamp, message: `> ${message}` }].slice(-20));
  }

  addRandomMission() {
    const types: Mission['type'][] = [
      'port-scan', 'brute-force', 'sql-injection', 'rfid-clone', 
      'buffer-overflow', 'xss-injection', 'osint-research', 'phishing-campaign',
      'crypto-heist', 'quantum-breach', 'iot-takeover', 'social-engineering'
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Difficulty scaling: New types are naturally harder
    const baseDifficulty = (['crypto-heist', 'quantum-breach'].includes(type)) ? 4 : 1;
    const difficulty = this.campaignLevel() + baseDifficulty + Math.floor(Math.random() * 2);
    
    const reward = (difficulty * 150) + Math.floor(Math.random() * 100);
    const targetPrefixes = [
      'GLOBAL_NET', 'CORP_NODE', 'SECURE_VAULT', 'DATA_HUB', 'VOID_LINK', 'SHADOW_SRV',
      'SAT_UPLINK', 'BIO_LAB_MAINFRAME', 'CRYPTO_EXCHANGE', 'DEEP_SEA_CABLE', 'QUANTUM_NODE', 'GOV_DATACENTER'
    ];
    const target = targetPrefixes[Math.floor(Math.random() * targetPrefixes.length)] + '_' + Math.floor(Math.random() * 9999);
    
    const newMission: Mission = {
      id: Math.random().toString(36).substring(7),
      name: `OP_${type.replace('-', '_').toUpperCase()}`,
      target, difficulty, reward, type,
      isHoneypot: Math.random() < 0.15,
      isEntryPoint: Math.random() < 0.20
    };
    this.activeMissions.update(m => [...m, newMission]);
  }

  increaseDetection(amount: number) {
    if (this.inventory().some(i => i.id === 'red-pill')) return;
    
    // Check for CREDIT_FREEZE debuff - if active, you are "flagged" and trace grows faster
    const isFrozen = this.activeDebuffs().some(d => d.type === 'LOCK'); 
    const finalAmount = isFrozen ? amount * 2 : amount;

    const stealth = this.totalStealthBonus();
    let multiplier = this.stealthMultiplier();
    if (this.globalEvent() === 'ZERO_DAY_PANIC') multiplier *= 0.5;
    const reducedAmount = Math.max(0.1, (finalAmount - (stealth / 10)) / multiplier) * (this.supplyChainActive() ? 0.5 : 1.0);
    this.detectionLevel.update(d => Math.min(100, Number((d + reducedAmount).toFixed(1))));
    
    if (this.detectionLevel() >= 100) {
      this.log('!!! CRITICAL: TRACE DETECTED. EMERGENCY DISCONNECT !!!');
      this.activeRansoms.set(0);
      this.triggerRetaliation(true);
      this.detectionLevel.set(0);
    }
  }

  triggerRetaliation(critical = false) {
    const chance = critical ? 1.0 : 0.3;
    if (Math.random() > chance) return;
    
    const types = ['RANSOM', 'GLITCH', 'LOCK', 'DATA_WIPE', 'REP_SABOTAGE'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const duration = critical ? 60000 : 30000;
    
    this.applyRetaliation(type, duration, critical);
  }

  private applyRetaliation(type: 'RANSOM' | 'GLITCH' | 'LOCK' | 'DATA_WIPE' | 'REP_SABOTAGE', duration: number, critical = false) {
    const id = Math.random().toString(36).substring(7);
    this.systemIntegrity.update(i => Math.max(0, i - (critical ? 40 : 15)));

    switch (type) {
      case 'RANSOM':
        const loss = critical ? 500 : 200;
        this.credits.update(c => Math.max(0, c - loss));
        this.activeDebuffs.update(d => [...d, { id, name: `CREDIT_EXTORTION_${loss}cr`, type: 'RANSOM', expiresAt: Date.now() + duration }]);
        this.log(`!!! COUNTER-ATTACK: RANSOMWARE DETECTED. LOST ${loss}cr !!!`);
        break;
      case 'GLITCH':
        this.activeDebuffs.update(d => [...d, { id, name: 'KERNEL_LOGIC_BOMB', type: 'GLITCH', expiresAt: Date.now() + duration }]);
        this.log('!!! COUNTER-ATTACK: LOGIC BOMB SCRAMBLING SENSORS !!!');
        this.matrixMode.set(true);
        setTimeout(() => this.matrixMode.set(false), duration);
        break;
      case 'LOCK':
        this.activeDebuffs.update(d => [...d, { id, name: 'HARDWARE_LOCKDOWN', type: 'LOCK', expiresAt: Date.now() + duration }]);
        this.log('!!! COUNTER-ATTACK: HARDWARE INTERFACE LOCKED !!!');
        break;
      case 'DATA_WIPE':
        const wiped = this.artifacts().length;
        this.artifacts.set([]);
        this.log(`!!! CRITICAL: DATA_WIPE SEQUENCE INITIATED. ${wiped} ARTIFACTS PURGED !!!`);
        break;
      case 'REP_SABOTAGE':
        const repLoss = critical ? 100 : 30;
        this.reputation.update(r => Math.max(0, r - repLoss));
        this.log(`!!! COUNTER-ATTACK: REPUTATION SABOTAGED. -${repLoss} REP !!!`);
        break;
    }
  }

  completeMission(mission: Mission) {
    if (!this.authToken() && (this.reputation() > 200 || mission.difficulty > 2)) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">SECURE_SAVE: Connection unstable. Authenticate to sync neural progress.</span>');
      return;
    }
    let r = mission.reward;
    let e = mission.difficulty * 25;
    let rep = Math.floor(mission.difficulty * 1.5);
    if (this.globalEvent() === 'CTF_ACTIVE') { e *= 2; rep *= 2; }
    if (this.globalEvent() === 'ZERO_DAY_PANIC') r *= 2;
    if (this.publicExploits().includes(mission.type)) {
      this.log(`1-DAY EXPLOIT USED: ${mission.type.toUpperCase()} SUCCESS RATE 100%.`);
      this.publicExploits.update(ex => ex.filter(t => t !== mission.type));
    }
    this.credits.update(c => c + r);
    this.addExperience(e);
    this.reputation.update(rp => rp + rep);
    this.detectionLevel.set(0);
    this.log(`MISSION ${mission.name.toUpperCase()} SUCCESSFUL. +${r}cr, +${rep} REP.`);
    this.botnetSize.update(b => b + Math.floor(Math.random() * (mission.difficulty * 2)) + 1);
    if (Math.random() > 0.6) this.dropArtifact();
    if (mission.isEntryPoint) this.generateInternalNetwork(mission.target);
    this.activeMissions.update(m => m.filter(x => x.id !== mission.id));
    if (Math.random() > 0.7) this.campaignLevel.update(l => l + 1);
    this.addRandomMission();
    this.updateRemoteScore();
  }

  private dropArtifact(forcedType?: Artifact['type']) {
    const types: Artifact['type'][] = ['binary', 'encrypted_log', 'firmware', 'cloud_dump'];
    const type = forcedType || types[Math.floor(Math.random() * types.length)];
    const rewardTypes: Artifact['rewardType'][] = ['zero-day', 'data', 'target_intel', 'credits'];
    const newArt: Artifact = {
      id: Math.random().toString(36).substring(7),
      name: `UNKWN_${type.toUpperCase()}_${Math.floor(Math.random() * 9999)}`,
      type, analysisProgress: 0, analyzed: false,
      rewardType: rewardTypes[Math.floor(Math.random() * rewardTypes.length)]
    };
    this.artifacts.update(arts => [...arts, newArt]);
    this.log(`[ALERT] ACQUIRED ARTIFACT: ${newArt.name}`);
  }

  private finishAnalysis(art: Artifact) {
    this.artifacts.update(arts => arts.map(a => a.id === art.id ? { ...a, analyzed: true } : a));
    this.log(`ANALYSIS COMPLETE: ${art.name}`);
    switch (art.rewardType) {
      case 'zero-day': this.zeroDays.update(z => z + 1); this.log('RESULT: FOUND 0-DAY EXPLOIT!'); break;
      case 'data': this.addExperience(300); this.log('RESULT: EXTRACTED 300 DATA.'); break;
      case 'credits': this.credits.update(c => c + 1500); this.log('RESULT: EXFILTRATED 1500cr.'); break;
      case 'target_intel': this.log('RESULT: TARGET INTEL ACQUIRED.'); break;
    }
  }

  buyPublicExploit(type: Mission['type']) {
    const cost = 100;
    if (this.credits() >= cost) {
      this.credits.update(c => c - cost);
      this.publicExploits.update(ex => [...ex, type]);
      this.log(`ACQUIRED 1-DAY EXPLOIT FOR ${type.toUpperCase()}.`);
      return true;
    }
    return false;
  }

  private generateInternalNetwork(origin: string) {
    this.activeInternalOrigin.set(origin);
    this.internalNetwork.set([
      { id: 'wks1', name: 'DEV_WORKSTATION', type: 'WORKSTATION', status: 'LOCKED', reward: 150 },
      { id: 'db1', name: 'PRODUCTION_DB', type: 'DATABASE', status: 'LOCKED', reward: 400 },
      { id: 'mail1', name: 'EXCHANGE_SRV', type: 'MAIL_SERVER', status: 'LOCKED', reward: 250 },
      { id: 'dc1', name: 'DOMAIN_CONTROLLER', type: 'ADMIN_CONTROLLER', status: 'LOCKED', reward: 1000 }
    ]);
    this.log(`PIVOT ESTABLISHED: INTERNAL NETWORK OF ${origin} MAPPED.`);
  }

  compromiseInternal(targetId: string) {
    const target = this.internalNetwork().find(t => t.id === targetId);
    if (!target || target.status === 'COMPROMISED') return;
    if (Math.random() > 0.4) {
      this.internalNetwork.update(nets => nets.map(n => n.id === targetId ? { ...n, status: 'COMPROMISED' } : n));
      this.credits.update(c => c + target.reward);
      this.log(`PIVOT SUCCESSFUL: EXFILTRATED ${target.reward}cr.`);
      if (target.type === 'ADMIN_CONTROLLER') {
        this.reputation.update(r => r + 50);
        this.activeInternalOrigin.set(null);
        this.internalNetwork.set([]);
        this.updateRemoteScore();
      }
    } else {
      this.log(`PIVOT FAILED. INCIDENT RESPONSE TRIGGERED.`);
      this.increaseDetection(20);
    }
  }

  private startIntrusion() {
    this.intrusionActive.set(true);
    this.intrusionProgress.set(0);
    this.log('!!! WARNING: INCOMING SYSTEM BREACH !!!');
  }

  private resolveIntrusion(success: boolean) {
    this.intrusionActive.set(false);
    if (success) { this.log('COUNTER-HACK SUCCESSFUL.'); this.reputation.update(r => r + 30); this.updateRemoteScore(); }
    else {
      this.log('BREACH SUCCESSFUL. ASSETS STOLEN.');
      this.credits.update(c => Math.max(0, c - 250));
      this.botnetSize.update(b => Math.floor(b * 0.8));
    }
  }

  counterIntrusion() {
    if (this.intrusionActive()) {
      if (Math.random() > 0.3) this.resolveIntrusion(true);
      else this.intrusionProgress.update(p => Math.min(100, p + 10));
    }
  }

  setRouting(mode: RoutingMode) {
    const cost = mode === 'ONION' ? 50 : mode === 'VPN' ? 20 : 0;
    if (this.credits() >= cost) {
      if (cost > 0) this.credits.update(c => c - cost);
      this.routingMode.set(mode);
      this.log(`ROUTING: ${mode}`);
    }
  }

  buyHardware(item: HardwareItem) {
    if (!this.authToken()) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">HARDWARE_LINK: Identity verification required for physical module installation.</span>');
      return;
    }
    if (this.credits() >= item.price) {
      this.credits.update(c => c - item.price);
      this.inventory.update(inv => [...inv, item]);
      this.log(`HARDWARE: ${item.name.toUpperCase()} ONLINE.`);
    }
  }

  unlockHardware(id: string, cost: number) {
    if (!this.authToken()) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">RESEARCH_DB: Access restricted to verified operatives. Authenticate to decrypt.</span>');
      return false;
    }
    if (this.experience() >= cost) {
      this.experience.update(e => e - cost);
      this.availableHardware.update(hw => hw.map(h => h.id === id ? { ...h, unlocked: true } : h));
      this.log(`RESEARCH: ${id.toUpperCase()} UNLOCKED.`);
      return true;
    }
    return false;
  }

  addExperience(amount: number) { this.experience.update(e => e + amount); }

  failMission(mission: Mission) {
    this.detectionLevel.set(0);
    this.log(`MISSION FAILED: ${mission.name.toUpperCase()}`);
    this.triggerRetaliation(false);
    this.activeMissions.update(m => m.filter(x => x.id !== mission.id));
    this.addRandomMission();
  }

  researchZeroDay() {
    if (!this.authToken()) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">VULN_EXCHANGE: Darknet authentication required for 0-day research.</span>');
      return false;
    }
    if (this.experience() >= 250) {
      this.experience.update(e => e - 250);
      if (Math.random() > (this.globalEvent() === 'PATCH_TUESDAY' ? 0.85 : 0.7)) {
        this.zeroDays.update(z => z + 1);
        this.log('0-DAY ACQUIRED!');
        return true;
      }
    }
    return false;
  }

  sellZeroDay() {
    if (this.zeroDays() > 0) {
      this.zeroDays.update(z => z - 1);
      const profit = 2500 + Math.floor(Math.random() * 1500);
      this.credits.update(c => c + profit);
      this.reputation.update(r => Math.max(0, r - 25));
      this.log(`SOLD 0-DAY: +${profit}cr, -25 REP.`);
      this.updateRemoteScore();
    }
  }

  discloseZeroDay() {
    if (this.zeroDays() > 0) {
      this.zeroDays.update(z => z - 1);
      this.reputation.update(r => r + 150);
      this.experience.update(e => e + 500);
      this.detectionLevel.update(d => Math.max(0, d - 30));
      this.log(`DISCLOSED 0-DAY: +150 REP, +500 DATA.`);
      this.updateRemoteScore();
    }
  }

  useZeroDay(mission: Mission) {
    if (this.zeroDays() > 0) {
      this.zeroDays.update(z => z - 1);
      this.completeMission(mission);
    }
  }

  launchDDoS() {
    if (this.botnetSize() >= 10) {
      this.botnetSize.update(b => b - Math.floor(b * 0.5));
      this.detectionLevel.update(d => Math.max(0, d - 40));
      this.log('DDoS LAUNCHED.');
      return true;
    }
    return false;
  }

  deployRansomware() {
    if (this.botnetSize() >= 15) {
      this.botnetSize.update(b => b - 15);
      this.activeRansoms.update(r => r + 1);
      this.log('RANSOMWARE DEPLOYED.');
      return true;
    }
    return false;
  }

  cashOutRansomware() {
    if (this.activeRansoms() > 0) {
      const p = this.activeRansoms() * 1200;
      this.credits.update(c => c + p);
      this.activeRansoms.set(0);
      this.log(`RANSOMWARE CASHED: +${p}cr.`);
      return true;
    }
    return false;
  }

  installSupplyChain() {
    if (this.zeroDays() >= 1 && this.botnetSize() >= 50 && !this.supplyChainActive()) {
      this.zeroDays.update(z => z - 1);
      this.botnetSize.update(b => b - 50);
      this.supplyChainActive.set(true);
      this.log('SUPPLY CHAIN COMPROMISED.');
      return true;
    }
    return false;
  }

  installSoftware(id: string) {
    const pkg = this.installedSoftware().find(s => s.id === id);
    if (!pkg || pkg.installed) return false;
    if (this.credits() >= pkg.price) {
      this.credits.update(c => c - pkg.price);
      this.installedSoftware.update(sw => sw.map(s => s.id === id ? { ...s, installed: true } : s));
      this.log(`vpm: ${id} installed successfully.`);
      return true;
    }
    return false;
  }

  private triggerFakedSystemAlert() {
    const alerts = [
      { title: "SYSTEM_ERROR", body: "Unauthorized neural uplink detected in your sector." },
      { title: "SECURITY_BREACH", body: "Your local address has been flagged by INTERPOL." },
      { title: "VOID_RUNNER", body: "I am closer than you think. Turn around." },
      { title: "KERNEL_PANIC", body: "Logic bomb detected. Purge system immediately." }
    ];
    const alert = alerts[Math.floor(Math.random() * alerts.length)];
    new Notification(alert.title, { body: alert.body, silent: false });
  }
}
