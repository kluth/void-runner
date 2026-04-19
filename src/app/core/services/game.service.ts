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

export interface GameSettings {
  audio: {
    volume: number;
    speech: boolean;
    ambient: boolean;
    music_complexity: number;
  };
  video: {
    matrix: boolean;
    glitch: boolean;
    scanlines: boolean;
    brightness: number;
    font_size: number;
    opacity: number;
    crt_curvature: boolean;
    view_mode: 'SINGLE' | 'TABBED';
  };
  social: {
    notifications: boolean;
    public_profile: boolean;
    incognito: boolean;
    broadcast_location: boolean;
    status: 'ONLINE' | 'AWAY' | 'DND';
  };
  beta: {
    neural_vibration: boolean;
    ai_emotions: boolean;
    high_res_globe: boolean;
    experimental_shaders: boolean;
    experimental_pwa: boolean;
  };
  general: {
    auto_wipe: boolean;
    auto_analysis: boolean;
    theme: 'CLASSIC' | 'OMEGA' | 'NOIR';
    language: 'EN' | 'DE' | 'SV' | 'HEX';
    tutorial_completed: boolean;
    wake_lock: boolean;
  };
  control: {
    autocomplete: boolean;
    scroll_speed: number;
    vibe_intensity: number;
  };
  streamer: {
    enabled: boolean;
    platform: 'TWITCH' | 'YOUTUBE' | 'TIKTOK';
  };
}

export interface PlayerData {
  id: string;
  username: string;
  name: string;
  reputation: number;
  score: number;
  credits: number;
  experience: number;
  botnetSize: number;
  campaignLevel: number;
  inventory: string; 
  software: string; 
  systemIntegrity: number;
  detectionLevel: number;
  activeDebuffs: string;
  artifacts: string;
  publicExploits: string;
  settings: string; // JSON
  teamId?: string | null;
  team?: Team | null;
}

export interface Mission {
  id: string;
  name: string;
  target: string;
  difficulty: number;
  reward: number;
  type: 'brute-force' | 'port-scan' | 'sql-injection' | 'rfid-clone' | 'buffer-overflow' | 'xss-injection' | 'osint-research' | 'phishing-campaign' | 'mitm-attack' | 'crypto-heist' | 'quantum-breach' | 'iot-takeover' | 'social-engineering' | 'physical-infiltration' | 'drone-hijacking' | 'stock-manipulation' | 'dark-web-hit' | 'corporate-espionage' | 'undersea-tap' | 'satellite-hacking' | 'bgp-hijacking' | 'election-interference' | 'hacker-takedown';
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
  { id: 'red-pill', name: 'The Red Pill', description: 'See the world as it truly is. Frozen trace level.', price: 1000, bonusType: 'stealth', bonusValue: 99, unlocked: false },
  { id: 'neural-coprocessor', name: 'Neural Coprocessor', description: 'Decreases mini-game complexity (e.g., slower timer).', price: 1200, bonusType: 'recon', bonusValue: 20, unlocked: false },
  { id: 'quantum-decryptor', name: 'Quantum Decryptor', description: 'Allows skipping one port scan per mission.', price: 1500, bonusType: 'exploit', bonusValue: 35, unlocked: false },
  { id: 'faraday-cage', name: 'Faraday Cage', description: 'Prevents "HARDWARE_LOCKDOWN" debuffs.', price: 800, bonusType: 'defense', bonusValue: 30, unlocked: false },
  { id: 'emp-grenade', name: 'EMP Grenade', description: 'Clears active trace instantly but destroys all current mission progress.', price: 600, bonusType: 'defense', bonusValue: 50, unlocked: false },
  { id: 'biometric-spoof', name: 'Biometric Spoof', description: 'Increases success rate of Social Engineering missions.', price: 900, bonusType: 'social', bonusValue: 40, unlocked: false },
  { id: 'optic-camo', name: 'Optic Camo Cloak', description: 'Drastically reduces trace gain during physical infiltration.', price: 1300, bonusType: 'stealth', bonusValue: 45, unlocked: false },
  { id: 'signal-jammer', name: 'Signal Jammer', description: 'Delays Blue Team retaliation by 30 seconds.', price: 700, bonusType: 'stealth', bonusValue: 30, unlocked: false },
  { id: 'rfid-injector', name: 'Subdermal RFID Injector', description: 'Auto-completes RFID cloning games.', price: 1100, bonusType: 'recon', bonusValue: 40, unlocked: false },
  { id: 'darknet-router', name: 'Darknet Router', description: 'Halves the cost of Onion routing.', price: 1000, bonusType: 'stealth', bonusValue: 25, unlocked: false },
  { id: 'overclocked-gpu', name: 'Overclocked GPU', description: 'Doubles crypto mining speed for botnets.', price: 2000, bonusType: 'cloud', bonusValue: 50, unlocked: false },
  { id: 'cryo-cooling', name: 'Cryo-Cooling Rig', description: 'Allows botnet to run without increasing detection over time.', price: 2500, bonusType: 'cloud', bonusValue: 60, unlocked: false },
  { id: 'satellite-uplink', name: 'Satellite Uplink', description: 'Allows access to orbital missions.', price: 3000, bonusType: 'recon', bonusValue: 50, unlocked: false },
  { id: 'holographic-emitter', name: 'Holographic Emitter', description: 'Creates decoys to confuse trace algorithms.', price: 1400, bonusType: 'stealth', bonusValue: 40, unlocked: false },
  { id: 'acoustic-dampener', name: 'Acoustic Dampener', description: 'Suppresses peak volume detection from the real-life microphone API.', price: 900, bonusType: 'stealth', bonusValue: 35, unlocked: false },
  { id: 'retinal-scanner', name: 'Retinal Scanner', description: 'Required for Level 5+ secure vault missions.', price: 1800, bonusType: 'recon', bonusValue: 60, unlocked: false }
];

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public socket!: Socket;
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
    { id: 'bleachbit-core', name: 'bleachbit-core', description: 'Passive trace cleaning daemon.', price: 500, type: 'DAEMON', installed: false },
    { id: 'ai-fuzzer', name: 'ai-fuzzer', description: 'Automatically highlights vulnerable SQL injection points.', price: 450, type: 'BINARY', installed: false },
    { id: 'deepfake-studio', name: 'deepfake-studio', description: 'Required for high-tier phishing campaigns.', price: 600, type: 'BINARY', installed: false },
    { id: 'worm-propagator', name: 'worm-propagator', description: 'Slowly increases botnet size automatically while active.', price: 800, type: 'DAEMON', installed: false },
    { id: 'trace-spoof', name: 'trace-spoof', description: 'Fakes a disconnect and redirects trace to a decoy IP.', price: 1000, type: 'UTIL', installed: false },
    { id: 'raas', name: 'raas', description: 'Ransomware-as-a-Service. Increases ransom payout by 50%.', price: 750, type: 'DAEMON', installed: false },
    { id: 'market-crawler', name: 'market-crawler', description: 'Automatically buys public exploits when credits are high.', price: 1200, type: 'DAEMON', installed: false },
    { id: 'cryptojacker', name: 'cryptojacker', description: 'Steals credits passively from compromised networks.', price: 900, type: 'DAEMON', installed: false },
    { id: 'firewall-bypass', name: 'firewall-bypass', description: 'Reduces required port matches in scanning mini-games.', price: 400, type: 'BINARY', installed: false },
    { id: 'packet-sniffer', name: 'packet-sniffer', description: 'Reveals hidden passwords in network traffic.', price: 350, type: 'UTIL', installed: false },
    { id: 'keylogger', name: 'keylogger', description: 'Captures admin passwords over time during a session.', price: 300, type: 'UTIL', installed: false },
    { id: 'botnet-orchestrator', name: 'botnet-orchestrator', description: 'Groups botnets for massive DDoS attacks.', price: 1500, type: 'DAEMON', installed: false },
    { id: 'memory-scraper', name: 'memory-scraper', description: 'Extracts artifacts from compromised nodes automatically.', price: 550, type: 'BINARY', installed: false },
    { id: 'social-scraper', name: 'social-scraper', description: 'Auto-gathers OSINT facts for phishing.', price: 250, type: 'UTIL', installed: false },
    { id: 'rootkit', name: 'rootkit', description: 'Prevents compromised nodes from being patched for 24 hours.', price: 2000, type: 'DAEMON', installed: false },
    { id: 'hypervisor-breakout', name: 'hypervisor-breakout', description: 'Allows pivoting from a VM to the host server.', price: 1800, type: 'BINARY', installed: false }
  ]);

  // Settings State
  settings = signal<GameSettings>({
    audio: { volume: 50, speech: true, ambient: true, music_complexity: 50 },
    video: { matrix: false, glitch: true, scanlines: true, brightness: 100, font_size: 11, opacity: 100, crt_curvature: true, view_mode: 'SINGLE' },
    social: { notifications: true, public_profile: true, incognito: false, broadcast_location: false, status: 'ONLINE' },
    beta: { neural_vibration: true, ai_emotions: false, high_res_globe: false, experimental_shaders: false, experimental_pwa: false },
    general: { auto_wipe: false, auto_analysis: false, theme: 'CLASSIC', language: 'EN', tutorial_completed: false, wake_lock: false },
    control: { autocomplete: true, scroll_speed: 100, vibe_intensity: 100 },
    streamer: { enabled: false, platform: 'TWITCH' }
  });

  // Tab Notification State
  tabNotifications = signal<Record<string, number>>({
    'TERMINAL': 0,
    'MISSIONS': 0,
    'HARDWARE': 0,
    'GRID': 0,
    'SOCIAL': 0
  });

  activeTab = signal('TERMINAL');

  private wakeLock: any = null;

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
  activeOperatives = signal(1);
  reputation = signal(0);
  reputationFixers = signal(0);
  reputationAnarchists = signal(0);
  faction = signal<'NONE' | 'FIXERS' | 'ANARCHISTS'>('NONE');
  
  // New Mechanics
  activeRansoms = signal(0);
  supplyChainActive = signal(false);
  publicExploits = signal<Mission['type'][]>([]); // 1-Days
  newsFeed = signal<{timestamp: string, headline: string}[]>([]);
  
  // Lateral Movement & Sandbox
  internalNetwork = signal<InternalTarget[]>([]);
  activeInternalOrigin = signal<string | null>(null);
  artifacts = signal<Artifact[]>([]);

  // Global Live Events & Multiplayer
  globalEvent = signal<'NONE' | 'CTF_ACTIVE' | 'PATCH_TUESDAY' | 'ZERO_DAY_PANIC' | 'SINGULARITY'>('NONE');
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
  isAuthenticated = computed(() => !!this.authToken());
  playerData = signal<PlayerData | null>(null);
  userMedia = signal<any[]>([]);
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
  tutorialActive = signal(false);
  currentTutorialSelector = signal<string | null>(null);
  detectedOS = signal<'ANDROID' | 'IOS' | 'WINDOWS' | 'LINUX' | 'MAC' | 'UNKNOWN'>('UNKNOWN');

  private rivalNames = ['Zer0_Cool', 'CrashOverride', 'AcidBurn', 'CerealKiller', 'Lord_Nikon', 'PhantomPhreak', 'Plague', 'Dark_Dante', 'Mudge', 'Gummo'];

  constructor() {
    this.detectOS();
    this.initSocket();
    this.loadLocalState();
    this.checkConfigStatus();

    // Boot Sector Optimization: Only show boot screen on fresh session
    const hasBooted = sessionStorage.getItem('VOID_RUNNER_BOOTED');
    if (hasBooted) {
        this.isBooting.set(false);
    } else {
        sessionStorage.setItem('VOID_RUNNER_BOOTED', 'true');
    }

    this.log('INITIALIZING VOID_OS...');
    this.log('CORE SYSTEMS ONLINE.');
    for (let i = 0; i < 4; i++) {
      this.addRandomMission();
    }

    if (!this.settings().general.tutorial_completed) {
        setTimeout(() => this.tutorialActive.set(true), 2000);
    }

    setInterval(() => this.gameTick(), 1000);
    setInterval(() => this.economyTick(), 10000);
  }

  private initSocket() {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const socketUrl = isProd ? window.location.origin : 'http://localhost:3000';
    this.socket = io(socketUrl);
    this.setupSocket();
  }

  private checkConfigStatus() {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const apiUrl = isProd ? '/api/config/status' : 'http://localhost:3000/api/config/status';
    
    fetch(apiUrl)
      .then(r => r.json())
      .then((res: {configured: boolean}) => this.isConfigured.set(res.configured))
      .catch(() => this.isConfigured.set(true)); 
  }

  private detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) this.detectedOS.set('ANDROID');
    else if (/iphone|ipad|ipod/.test(ua)) this.detectedOS.set('IOS');
    else if (/win/.test(ua)) this.detectedOS.set('WINDOWS');
    else if (/mac/.test(ua)) this.detectedOS.set('MAC');
    else if (/linux/.test(ua)) this.detectedOS.set('LINUX');
    else this.detectedOS.set('UNKNOWN');
  }

  private setupSocket() {
    this.socket.on('connect', () => {
      this.log(`[NETWORK] UPLINK ESTABLISHED.`);
      if (this.authToken()) {
        this.socket.emit('session_resume', { token: this.authToken() });
      }
    });

    this.socket.on('auth_complete', (data: { token: string, player: PlayerData }) => {
      console.log('[AUTH] Token received from matrix.');
      localStorage.setItem('VOID_RUNNER_TOKEN', data.token);
      this.authToken.set(data.token);
      this.restoreFullState(data.player);
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

    this.socket.on('operative_count_update', (data: { count: number }) => {
      this.activeOperatives.set(data.count);
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
      this.restoreFullState(data.player);
      this.authRequired.set(false);
      this.twoFactorUserId.set(null);
    });

    this.socket.on('error_msg', (msg: string) => {
      this.log(`<span style="color: #f00">ERR: ${msg}</span>`);
      this.audioService.playError();
    });

    this.socket.on('new_private_message', (pm: any) => {
      this.privateMessages.update(msgs => [pm, ...msgs].slice(0, 50));
      this.log(`[SECURE_DM] Incoming message from ${pm.senderName}. Check Darknet Node.`);
      this.audioService.playClick();
      
      if (this.settings().social.notifications && Notification.permission === 'granted') {
          new Notification('VOID_RUNNER: Incoming DM', { body: `${pm.senderName}: ${pm.text}` });
      }
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
      // Don't add if it's our own message (already handled by local echo)
      if (msg.sender === this.playerHandle()) return;

      this.teamMessages.update(msgs => [msg, ...msgs].slice(0, 20));
      this.log(`[COMMS] ${msg.sender}: ${msg.text}`);
      this.incrementTabNotification('SOCIAL');
      if (Math.random() > 0.8) {
        this.audioService.speakCreepy(`${msg.sender} says: ${msg.text}`);
      }
    });

    this.socket.on('disconnect', () => {
      this.log('[NETWORK] UPLINK LOST. RECONNECTING...');
    });

    // Neural Mirror: Cross-Device State Synchronization
    this.socket.on('state_mirror', (data: any) => {
        console.log('[MIRROR] State packet received from other device.');
        // We reuse restoreFullState as it handles mapping from DB-style objects
        // and we ensure local storage is updated too.
        this.restoreFullState(data);
    });

    this.socket.on('media_gallery', (media: any[]) => {
        this.userMedia.set(media);
    });

    // Attack Sync: Server-driven high-stress events
    this.socket.on('server_attack', (data: { type: 'HIJACK' | 'INTRUSION' }) => {
        if (data.type === 'HIJACK') {
            this.triggerHijack();
        } else {
            this.startIntrusion();
        }
    });
  }

  private async handleWakeLock(enable: boolean) {
    if (enable) {
      if ('wakeLock' in navigator) {
        try {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
          this.log('SYSTEM: Screen wake lock active.');
        } catch (err) {
          console.error('[PWA] Wake Lock failed:', err);
        }
      }
    } else {
      if (this.wakeLock) {
        await this.wakeLock.release();
        this.wakeLock = null;
        this.log('SYSTEM: Screen wake lock released.');
      }
    }
  }

  private incrementTabNotification(tab: string) {
    if (this.settings().video.view_mode === 'TABBED' && this.activeTab() !== tab) {
      const current = { ...this.tabNotifications() };
      current[tab] = (current[tab] || 0) + 1;
      this.tabNotifications.set(current);
      
      if (this.settings().beta.experimental_pwa && 'setAppBadge' in navigator) {
          const total = Object.values(current).reduce((a, b) => a + b, 0);
          (navigator as any).setAppBadge(total);
      }
    }
  }

  clearTabNotification(tab: string) {
    const current = { ...this.tabNotifications() };
    current[tab] = 0;
    this.tabNotifications.set(current);
    this.activeTab.set(tab);

    if (this.settings().beta.experimental_pwa && 'setAppBadge' in navigator) {
        const total = Object.values(current).reduce((a, b) => a + b, 0);
        if (total === 0) (navigator as any).clearAppBadge();
        else (navigator as any).setAppBadge(total);
    }
  }

  private restoreFullState(player: any) {
    // Preserve existing handle/username if the incoming packet is a tactical mirror (may lack identity shards)
    const current = this.playerData();
    const merged = { ...current, ...player };
    this.playerData.set(merged);
    
    this.credits.set(player.credits);
    this.experience.set(player.experience);
    this.botnetSize.set(player.botnetSize);
    this.campaignLevel.set(player.campaignLevel);
    this.reputation.set(player.reputation);
    this.systemIntegrity.set(player.systemIntegrity);
    this.detectionLevel.set(player.detectionLevel);

    try {
      const invIds = JSON.parse(player.inventory) as string[];
      const inv = AVAILABLE_HARDWARE.filter(h => invIds.includes(h.id));
      this.inventory.set(inv);
    } catch(e) {}

    try {
      const softIds = JSON.parse(player.software) as string[];
      this.installedSoftware.update(sw => sw.map(s => ({ ...s, installed: softIds.includes(s.id) })));
    } catch(e) {}

    try { this.activeDebuffs.set(JSON.parse(player.activeDebuffs)); } catch(e) {}
    try { this.artifacts.set(JSON.parse(player.artifacts)); } catch(e) {}
    try { this.publicExploits.set(JSON.parse(player.publicExploits)); } catch(e) {}
    try { 
        if (player.settings && player.settings !== '{}') {
            const parsed = JSON.parse(player.settings);
            this.settings.set({ ...this.settings(), ...parsed });
            this.applySettingsToSignals();
            if (this.settings().general.wake_lock) this.handleWakeLock(true);
        }
    } catch(e) {}
    
    this.saveLocalState();
  }

  private saveLocalState() {
    const state = {
      handle: this.playerHandle(),
      credits: this.credits(),
      experience: this.experience(),
      reputation: this.reputation(),
      botnetSize: this.botnetSize(),
      campaignLevel: this.campaignLevel(),
      inventory: this.inventory().map(i => i.id),
      software: this.installedSoftware().filter(s => s.installed).map(s => s.id),
      systemIntegrity: this.systemIntegrity(),
      detectionLevel: this.detectionLevel(),
      activeDebuffs: this.activeDebuffs(),
      artifacts: this.artifacts(),
      publicExploits: this.publicExploits(),
      settings: this.settings()
    };
    localStorage.setItem('VOID_RUNNER_STATE', JSON.stringify(state));
  }

  private loadLocalState() {
    const saved = localStorage.getItem('VOID_RUNNER_STATE');
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (state.handle) this.playerHandle.set(state.handle);
      this.credits.set(state.credits || 500);
      this.experience.set(state.experience || 0);
      this.reputation.set(state.reputation || 0);
      this.botnetSize.set(state.botnetSize || 0);
      this.campaignLevel.set(state.campaignLevel || 1);
      this.systemIntegrity.set(state.systemIntegrity ?? 100);
      this.detectionLevel.set(state.detectionLevel ?? 0);
      this.activeDebuffs.set(state.activeDebuffs || []);
      this.artifacts.set(state.artifacts || []);
      this.publicExploits.set(state.publicExploits || []);
      if (state.settings) {
          this.settings.set({ ...this.settings(), ...state.settings });
          this.applySettingsToSignals();
          if (this.settings().general.wake_lock) this.handleWakeLock(true);
      }

      if (state.inventory) {
        this.inventory.set(AVAILABLE_HARDWARE.filter(h => state.inventory.includes(h.id)));
      }
      if (state.software) {
        this.installedSoftware.update(sw => sw.map(s => ({ ...s, installed: state.software.includes(s.id) })));
      }
    } catch(e) {}
  }

  private applySettingsToSignals() {
      const s = this.settings();
      this.matrixMode.set(s.video.matrix);
      this.audioService.masterVolume.set(s.audio.volume / 100);
      this.audioService.speechEnabled.set(s.audio.speech);
      document.documentElement.style.setProperty('--global-brightness', `${s.video.brightness}%`);
      document.documentElement.style.setProperty('--terminal-font-size', `${s.video.font_size}px`);
      document.documentElement.style.setProperty('--ui-opacity', `${s.video.opacity / 100}`);
  }

  updateSetting(path: string, value: string) {
    const s = { ...this.settings() };
    const parts = path.split('.');
    if (parts.length !== 2) return;

    const category = parts[0] as keyof GameSettings;
    const key = parts[1] as any;
    const boolVal = value === 'on' || value === 'true';

    if (category === 'audio') {
        if (key === 'volume') s.audio.volume = parseInt(value);
        if (key === 'speech') s.audio.speech = boolVal;
        if (key === 'ambient') s.audio.ambient = boolVal;
        if (key === 'music_complexity') s.audio.music_complexity = parseInt(value);
    } else if (category === 'video') {
        if (key === 'matrix') s.video.matrix = boolVal;
        if (key === 'glitch') s.video.glitch = boolVal;
        if (key === 'scanlines') s.video.scanlines = boolVal;
        if (key === 'brightness') s.video.brightness = parseInt(value);
        if (key === 'font_size') s.video.font_size = parseInt(value);
        if (key === 'opacity') s.video.opacity = parseInt(value);
        if (key === 'crt_curvature') s.video.crt_curvature = boolVal;
        if (key === 'view_mode') s.video.view_mode = value.toUpperCase() as any;
    } else if (category === 'social') {
        if (key === 'notifications') s.social.notifications = boolVal;
        if (key === 'public_profile') s.social.public_profile = boolVal;
        if (key === 'incognito') s.social.incognito = boolVal;
        if (key === 'broadcast_location') s.social.broadcast_location = boolVal;
        if (key === 'status') s.social.status = value.toUpperCase() as any;
    } else if (category === 'beta') {
        if (key === 'neural_vibration') s.beta.neural_vibration = boolVal;
        if (key === 'ai_emotions') s.beta.ai_emotions = boolVal;
        if (key === 'high_res_globe') s.beta.high_res_globe = boolVal;
        if (key === 'experimental_shaders') s.beta.experimental_shaders = boolVal;
        if (key === 'experimental_pwa') s.beta.experimental_pwa = boolVal;
    } else if (category === 'general') {
        if (key === 'auto_wipe') s.general.auto_wipe = boolVal;
        if (key === 'auto_analysis') s.general.auto_analysis = boolVal;
        if (key === 'theme') s.general.theme = value.toUpperCase() as any;
        if (key === 'language') s.general.language = value.toUpperCase() as any;
        if (key === 'tutorial_completed') s.general.tutorial_completed = boolVal;
        if (key === 'wake_lock') {
            s.general.wake_lock = boolVal;
            this.handleWakeLock(boolVal);
        }
    } else if (category === 'control') {
        if (key === 'autocomplete') s.control.autocomplete = boolVal;
        if (key === 'scroll_speed') s.control.scroll_speed = parseInt(value);
        if (key === 'vibe_intensity') s.control.vibe_intensity = parseInt(value);
    } else if (category === 'streamer') {
        if (key === 'enabled') s.streamer.enabled = boolVal;
        if (key === 'platform') s.streamer.platform = value.toUpperCase() as any;
    }

    this.settings.set(s);
    this.applySettingsToSignals();
    this.updateRemoteScore();
    this.log(`SETTINGS: ${path} updated to ${value}`);
  }

  private updateRemoteScore() {
    if (this.authToken()) {
      this.socket.emit('update_score', { 
        token: this.authToken(),
        score: this.credits(), 
        reputation: this.reputation(),
        credits: this.credits(),
        experience: this.experience(),
        botnetSize: this.botnetSize(),
        campaignLevel: this.campaignLevel(),
        inventory: JSON.stringify(this.inventory().map(i => i.id)),
        software: JSON.stringify(this.installedSoftware().filter(s => s.installed).map(s => s.id)),
        systemIntegrity: this.systemIntegrity(),
        detectionLevel: this.detectionLevel(),
        activeDebuffs: JSON.stringify(this.activeDebuffs()),
        artifacts: JSON.stringify(this.artifacts()),
        publicExploits: JSON.stringify(this.publicExploits()),
        settings: JSON.stringify(this.settings())
      });
    }
    this.saveLocalState();
  }

  sendTeamMessage(text: string) {
    if (this.authToken()) {
      this.socket.emit('send_message', {
        token: this.authToken(),
        text,
        teamId: this.activeTeam()?.id
      });
      // Local Echo for immediate feedback
      this.teamMessages.update(msgs => [{ sender: this.playerHandle(), text, teamId: this.activeTeam()?.id }, ...msgs].slice(0, 20));
      this.incrementTabNotification('SOCIAL');
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
    console.log('[AUTH] Syncing Google Token to local sector...');
    localStorage.setItem('VOID_RUNNER_TOKEN', token);
    this.authToken.set(token);
    this.authRequired.set(false);
    
    // Explicitly re-initialize socket handshake with the new token
    this.socket.emit('session_resume', { token });
    this.getMedia(); // Fetch private archive
    this.log('NEURAL_SYNC: Identity verified. Restoration protocol active.');
    
    window.history.replaceState({}, document.title, "/");
  }

  saveMedia(type: 'IMAGE' | 'AUDIO', data: string) {
    if (this.authToken()) {
        this.socket.emit('save_media', { token: this.authToken(), type, data });
    }
  }

  getMedia() {
    if (this.authToken()) {
        this.socket.emit('get_media', { token: this.authToken() });
    }
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
        this.updateRemoteScore();
      }
    }

    if (this.systemIntegrity() < 100 && now % 5000 < 1000) {
      this.systemIntegrity.update(i => Math.min(100, i + 1));
      this.updateRemoteScore();
    }

    if (this.systemIntegrity() < 30 && now % 2000 < 1000) {
      const bleed = Math.floor(Math.random() * 5) + 1;
      if (this.credits() > 0) {
        this.credits.update(c => Math.max(0, c - bleed));
        if (Math.random() > 0.9) this.log('<span style="color: #ff0000">!!! ALERT: MEMORY_LEAK DETECTED. DATA DECAYING !!!</span>');
        this.updateRemoteScore();
      }
    }

    if (this.installedSoftware().find(s => s.id === 'bleachbit-core' && s.installed) && now % 3000 < 1000) {
      if (this.detectionLevel() > 0) {
        this.detectionLevel.update(d => Math.max(0, Number((d - 0.1).toFixed(1))));
      }
    }

    // Auto-Wipe Logic
    if (this.settings().general.auto_wipe && this.detectionLevel() >= 90) {
        const wiper = this.installedSoftware().find(s => s.id === 'wiper' && s.installed);
        if (wiper && this.credits() >= 50) {
            this.credits.update(c => c - 50);
            this.detectionLevel.set(0);
            this.log('AUTO_WIPE: Emergency log purge executed.');
            this.audioService.playSuccess();
            this.updateRemoteScore();
        }
    }

    // Market Crawler logic
    if (this.installedSoftware().find(s => s.id === 'market-crawler' && s.installed) && now % 60000 < 1000) {
        if (this.credits() >= 500) {
            const types: Mission['type'][] = ['port-scan', 'brute-force', 'sql-injection'];
            this.buyPublicExploit(types[Math.floor(Math.random() * types.length)]);
        }
    }

    // Worm Propagator logic
    if (this.installedSoftware().find(s => s.id === 'worm-propagator' && s.installed) && now % 5000 < 1000) {
        this.botnetSize.update(b => b + 1);
        if (Math.random() > 0.95) this.log('WORM: Propagated to new node.');
    }

    // Cryptojacker logic
    if (this.installedSoftware().find(s => s.id === 'cryptojacker' && s.installed) && now % 10000 < 1000) {
        const gain = Math.floor(this.botnetSize() / 2);
        if (gain > 0) {
            this.credits.update(c => c + gain);
            if (Math.random() > 0.9) this.log(`CRYPTOJACK: Harvested ${gain}cr.`);
        }
    }

    this.artifacts.update(arts => arts.map(a => {
      if (!a.analyzed && a.analysisProgress < 100) {
        let gain = this.settings().general.auto_analysis ? 2.5 : 1.5;
        if (this.installedSoftware().find(s => s.id === 'memory-scraper' && s.installed)) gain *= 1.5;
        return { ...a, analysisProgress: Math.min(100, a.analysisProgress + gain) };
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
      // Local fallback trigger (much lower chance, server usually drives this now)
      if (Math.random() > 0.9995 && this.reputation() > 500) this.startIntrusion();
    }

    const hijackBaseChance = 0.0001; // Reduced from 0.0005
    const integrityFactor = (100 - this.systemIntegrity()) / 100;
    const finalHijackChance = hijackBaseChance + (integrityFactor * 0.01); 

    if (!this.isHijacked() && Math.random() < finalHijackChance) {
      this.triggerHijack();
    }

    // Psychological Stress: Ghost Events
    if (Math.random() > 0.999) {
        this.triggerGhostEvent();
    }

    // Procedural News
    if (now % 45000 < 1000) {
        this.generateNews();
    }
  }

  private triggerGhostEvent() {
      const shards = this.neuralService.getHardwareShards();
      const events = [
          `GHOST_LINK: Detected passive listener on local node.`,
          `NEURAL_GLITCH: Visual cortex re-syncing...`,
          `SHARD_LEAK: Your ${shards.browser} instance is leaking entropy.`,
          `SPOOK: I can hear you thinking, ${this.playerHandle()}.`,
          `VOID_SCAN: Local sector ${shards.location || 'UNKNOWN'} flagged for extraction.`,
          `ALERT: Your ${shards.os} kernel is soft. Hardening recommended.`
      ];
      const event = events[Math.floor(Math.random() * events.length)];
      this.log(`<span style="color: #ff00ff">${event}</span>`);
      this.audioService.playGlitch();
      
      if (Math.random() > 0.7) {
          this.isDistorted.set(true);
          setTimeout(() => this.isDistorted.set(false), 2000);
      }

      if (this.settings().social.notifications && Math.random() > 0.5) {
          this.sendBackgroundNotification("THE_VOID", event);
      }
  }

  private sendBackgroundNotification(title: string, body: string) {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      
      if (document.visibilityState === 'hidden') {
          new Notification(title, { body, icon: 'favicon.ico', silent: false });
      }
  }

  private generateNews() {
      const headlines = [
          "GLOBAL_NET: Corporate stocks fluctuate after mysterious buffer overflow.",
          "DARKNET: Rival syndicate 'The Phantoms' claim responsibility for BIO_LAB breach.",
          "NEWS: Interpol warns of increased O.MG cable deployments in financial districts.",
          "ALERT: Quantum nodes reporting strange decoherence in the European sector.",
          "VOID: Cryptic hex-stream detected on deep-sea cables. Experts are baffled."
      ];
      const h = headlines[Math.floor(Math.random() * headlines.length)];
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      this.newsFeed.update(n => [{ timestamp, headline: h }, ...n].slice(0, 10));
      this.incrementTabNotification('GRID');
  }

  async triggerHijack() {
    this.log('!!! WARNING: UNKNOWN_OVERRIDE DETECTED !!!');
    this.isHijacked.set(true);

    const level = this.campaignLevel();
    const puzzleTypes = ['MATH', 'HEX', 'BINARY', 'WORD'];
    const pType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    let code = '';
    let puzzlePrompt = '';
    let clarityInstruction = '';

    // Adjust clarity based on level
    if (level <= 3) clarityInstruction = "You MUST DIRECTLY tell the user the answer in a clear way.";
    else if (level <= 7) clarityInstruction = "You MUST hint strongly at the answer but do not state it directly.";
    else clarityInstruction = "You MUST be very cryptic and make the answer hard to find in your message.";

    if (pType === 'MATH') {
        if (level <= 3) {
            const a = Math.floor(Math.random() * 9) + 1;
            const b = Math.floor(Math.random() * 9) + 1;
            code = (a + b).toString();
            puzzlePrompt = `Ask what is ${a} + ${b}. Result is ${code}. ${clarityInstruction}`;
        } else {
            const a = Math.floor(Math.random() * 90) + 10;
            const b = Math.floor(Math.random() * 90) + 10;
            code = (a + b).toString();
            puzzlePrompt = `Pose a math challenge: ${a} + ${b}. Result is ${code}. ${clarityInstruction}`;
        }
    } else if (pType === 'HEX') {
        const num = level <= 5 ? Math.floor(Math.random() * 15) + 1 : Math.floor(Math.random() * 255) + 16;
        code = num.toString(16).toUpperCase();
        puzzlePrompt = `Challenge: Convert ${num} to Hex. Result is ${code}. ${clarityInstruction}`;
    } else if (pType === 'BINARY') {
        const num = level <= 5 ? Math.floor(Math.random() * 7) + 1 : Math.floor(Math.random() * 15) + 8;
        code = num.toString(2);
        puzzlePrompt = `Challenge: Convert ${num} to Binary. Result is ${code}. ${clarityInstruction}`;
    } else {
        const words = level <= 4 ? ['VOID', 'NULL', 'ROOT', 'DATA'] : ['SINGULARITY', 'BLACKOUT', 'PROTOCOL', 'OVERRIDE'];
        const word = words[Math.floor(Math.random() * words.length)];
        code = word.split('').reverse().join('');
        puzzlePrompt = `Challenge: Spell '${word}' backwards. Result is ${code}. ${clarityInstruction}`;
    }

    this.hijackUnlockCode.set(code);

    const history = this.teamMessages().map(m => m.text).join(' ');
    const augmentedHistory = `${history} [SYSTEM_SECURITY_PUZZLE: ${puzzlePrompt}]`;
    
    const obs = await this.neuralService.getHijackResponse(this.playerHandle(), augmentedHistory);
    obs.subscribe(res => {
      this.hijackMessage.set(res.response);
      if (this.settings().audio.speech) {
          this.audioService.speakCreepy(res.response);
      }
      if (this.settings().beta.neural_vibration && 'vibrate' in navigator) {
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
    const types: Mission['type'][] = ['port-scan', 'brute-force', 'sql-injection', 'rfid-clone', 'buffer-overflow', 'xss-injection', 'osint-research', 'phishing-campaign', 'mitm-attack', 'crypto-heist', 'quantum-breach', 'iot-takeover', 'social-engineering', 'physical-infiltration', 'drone-hijacking', 'stock-manipulation', 'dark-web-hit', 'corporate-espionage', 'undersea-tap', 'satellite-hacking', 'bgp-hijacking', 'election-interference', 'hacker-takedown'];
    const type = types[Math.floor(Math.random() * types.length)];
    const baseDifficulty = (['crypto-heist', 'quantum-breach', 'satellite-hacking', 'undersea-tap', 'bgp-hijacking'].includes(type)) ? 4 : 1;
    const difficulty = this.campaignLevel() + baseDifficulty + Math.floor(Math.random() * 2);
    const reward = (difficulty * 150) + Math.floor(Math.random() * 100);
    const targetPrefixes = ['GLOBAL_NET', 'CORP_NODE', 'SECURE_VAULT', 'DATA_HUB', 'VOID_LINK', 'SHADOW_SRV', 'SAT_UPLINK', 'BIO_LAB_MAINFRAME', 'CRYPTO_EXCHANGE', 'DEEP_SEA_CABLE', 'QUANTUM_NODE', 'GOV_DATACENTER'];
    const target = targetPrefixes[Math.floor(Math.random() * targetPrefixes.length)] + '_' + Math.floor(Math.random() * 9999);
    const newMission: Mission = {
      id: Math.random().toString(36).substring(7),
      name: `OP_${type.replace(/-/g, '_').toUpperCase()}`,
      target, difficulty, reward, type,
      isHoneypot: Math.random() < 0.15,
      isEntryPoint: Math.random() < 0.20
    };
    this.activeMissions.update(m => [...m, newMission]);
    this.incrementTabNotification('MISSIONS');
  }

  increaseDetection(amount: number) {
    if (this.inventory().some(i => i.id === 'red-pill')) return;
    const isFrozen = this.activeDebuffs().some(d => d.type === 'LOCK'); 
    const finalAmount = isFrozen ? amount * 2 : amount;
    const stealth = this.totalStealthBonus();
    let multiplier = this.stealthMultiplier();
    if (this.globalEvent() === 'ZERO_DAY_PANIC') multiplier *= 0.5;
    
    // Trace Spoof logic
    if (amount >= 100 && this.installedSoftware().find(s => s.id === 'trace-spoof' && s.installed) && Math.random() > 0.5) {
        this.log('TRACE_SPOOF: Disconnect faked. Redirecting trace...');
        this.detectionLevel.set(0);
        this.updateRemoteScore();
        return;
    }

    const reducedAmount = Math.max(0.1, (finalAmount - (stealth / 10)) / multiplier) * (this.supplyChainActive() ? 0.5 : 1.0);
    this.detectionLevel.update(d => Math.min(100, Number((d + reducedAmount).toFixed(1))));
    this.updateRemoteScore();
    if (this.detectionLevel() >= 100) {
      this.log('!!! CRITICAL: TRACE DETECTED. EMERGENCY DISCONNECT !!!');
      this.activeRansoms.set(0);
      this.triggerRetaliation(true);
      this.detectionLevel.set(0);
      this.updateRemoteScore();
    }
  }

  triggerRetaliation(critical = false) {
    const chance = critical ? 1.0 : 0.3;
    if (Math.random() > chance) return;
    
    // Faraday Cage immunity
    if (this.inventory().some(i => i.id === 'faraday-cage')) {
        this.log('FARADAY_CAGE: Hardware lockdown prevented.');
        return;
    }

    const types = ['RANSOM', 'GLITCH', 'LOCK', 'DATA_WIPE', 'REP_SABOTAGE', 'SWAT_RAID', 'ACCOUNT_FREEZE', 'NEURAL_FEEDBACK', 'BLACK_LISTED'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const duration = critical ? 60000 : 30000;
    
    this.applyRetaliation(type, duration, critical);
    this.updateRemoteScore();
  }

  private applyRetaliation(type: any, duration: number, critical = false) {
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
        if (this.settings().video.glitch) {
            this.matrixMode.set(true);
            setTimeout(() => this.matrixMode.set(false), duration);
        }
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
      case 'SWAT_RAID':
          this.log('!!! WARNING: PHYSICAL BREACH DETECTED. SPOOFING LOCATION... !!!');
          setTimeout(() => {
              if (Math.random() > 0.7) {
                  this.log('SWAT_RAID: Spoken to target. Mission failed.');
                  this.systemIntegrity.set(0);
              } else {
                  this.log('SWAT_RAID: Location spoofed successfully.');
              }
              this.updateRemoteScore();
          }, 5000);
          break;
      case 'ACCOUNT_FREEZE':
          this.log('!!! CRITICAL: FINANCIAL ACCOUNTS FROZEN BY BLUE_TEAM !!!');
          this.activeDebuffs.update(d => [...d, { id, name: 'ACCOUNT_FREEZE', type: 'LOCK', expiresAt: Date.now() + 120000 }]);
          break;
      case 'NEURAL_FEEDBACK':
          this.log('!!! ALERT: NEURAL FEEDBACK LOOP DETECTED. INTERFACE DISTORTED. !!!');
          this.isDistorted.set(true);
          setTimeout(() => this.isDistorted.set(false), 15000);
          break;
      case 'BLACK_LISTED':
          this.log('!!! CRITICAL: IDENTITY BLACKLISTED. SOCIAL MODULES OFFLINE. !!!');
          this.hasDarknetAccess.set(false);
          setTimeout(() => this.hasDarknetAccess.set(this.reputation() >= 1000), 60000);
          break;
    }
    this.updateRemoteScore();
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
    
    // Singularity check
    if (this.reputation() > 5000 && Math.random() > 0.995 && this.globalEvent() !== 'SINGULARITY') {
        this.globalEvent.set('SINGULARITY');
        this.log('!!! ALERT: THE SINGULARITY HAS BEGUN. THE VOID IS MERGING. !!!');
    }
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
    this.updateRemoteScore();
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
    this.updateRemoteScore();
  }

  buyHardware(item: HardwareItem) {
    if (!this.isAuthenticated()) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">HARDWARE_LINK: Identity verification required for physical module installation.</span>');
      return;
    }
    if (this.credits() >= item.price) {
      this.credits.update(c => c - item.price);
      this.inventory.update(inv => [...inv, item]);
      this.log(`HARDWARE: ${item.name.toUpperCase()} ONLINE.`);
      this.updateRemoteScore();
    }
  }

  unlockHardware(id: string, cost: number) {
    if (!this.isAuthenticated()) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">RESEARCH_DB: Access restricted to verified operatives. Authenticate to decrypt.</span>');
      return false;
    }
    if (this.experience() >= cost) {
      this.experience.update(e => e - cost);
      this.availableHardware.update(hw => hw.map(h => h.id === id ? { ...h, unlocked: true } : h));
      this.log(`RESEARCH: ${id.toUpperCase()} UNLOCKED.`);
      this.updateRemoteScore();
      return true;
    }
    return false;
  }

  addExperience(amount: number) { 
    this.experience.update(e => e + amount); 
    this.updateRemoteScore();
  }

  failMission(mission: Mission) {
    this.detectionLevel.set(0);
    this.log(`MISSION FAILED: ${mission.name.toUpperCase()}`);
    this.triggerRetaliation(false);
    this.activeMissions.update(m => m.filter(x => x.id !== mission.id));
    this.addRandomMission();
    this.updateRemoteScore();
  }

  installSoftware(id: string) {
    const pkg = this.installedSoftware().find(s => s.id === id);
    if (!pkg || pkg.installed) return false;
    if (this.credits() >= pkg.price) {
      this.credits.update(c => c - pkg.price);
      this.installedSoftware.update(sw => sw.map(s => s.id === id ? { ...s, installed: true } : s));
      this.log(`vpm: ${id} installed successfully.`);
      this.updateRemoteScore();
      return true;
    }
    return false;
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
      this.updateRemoteScore();
    }
  }

  counterIntrusion() {
    if (this.intrusionActive()) {
      if (Math.random() > 0.3) this.resolveIntrusion(true);
      else this.intrusionProgress.update(p => Math.min(100, p + 10));
    }
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

  craftArtifacts() {
      const analyzed = this.artifacts().filter(a => a.analyzed);
      if (analyzed.length >= 3) {
          const toRemove = analyzed.slice(0, 3).map(a => a.id);
          this.artifacts.update(arts => arts.filter(a => !toRemove.includes(a.id)));
          this.zeroDays.update(z => z + 1);
          this.log('CRAFT: Synchronized 3 artifacts into a Zero-Day Exploit.');
          this.audioService.playSuccess();
          this.updateRemoteScore();
          return true;
      }
      return false;
  }

  depositToSyndicate(amount: number) {
      if (this.activeTeam() && this.credits() >= amount) {
          this.credits.update(c => c - amount);
          this.reputation.update(r => r + Math.floor(amount / 10));
          this.log(`DEPOSIT: Credited ${amount}cr to ${this.activeTeam()?.name} hideout.`);
          this.audioService.playSuccess();
          this.updateRemoteScore();
          return true;
      }
      return false;
  }

  researchZeroDay() {
    if (!this.isAuthenticated()) {
      this.authRequired.set(true);
      this.log('<span style="color: #ffaa00">VULN_EXCHANGE: Darknet authentication required for 0-day research.</span>');
      return false;
    }
    if (this.experience() >= 250) {
      this.experience.update(e => e - 250);
      if (Math.random() > (this.globalEvent() === 'PATCH_TUESDAY' ? 0.85 : 0.7)) {
        this.zeroDays.update(z => z + 1);
        this.log('0-DAY ACQUIRED!');
        this.updateRemoteScore();
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
      this.updateRemoteScore();
      return true;
    }
    return false;
  }

  deployRansomware() {
    if (this.botnetSize() >= 15) {
      this.botnetSize.update(b => b - 15);
      this.activeRansoms.update(r => r + 1);
      this.log('RANSOMWARE DEPLOYED.');
      this.updateRemoteScore();
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
      this.updateRemoteScore();
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
      this.updateRemoteScore();
      return true;
    }
    return false;
  }

  buyPublicExploit(type: Mission['type']) {
    const cost = 100;
    if (this.credits() >= cost) {
      this.credits.update(c => c - cost);
      this.publicExploits.update(ex => [...ex, type]);
      this.log(`ACQUIRED 1-DAY EXPLOIT FOR ${type.toUpperCase()}.`);
      this.updateRemoteScore();
      return true;
    }
    return false;
  }

  setRouting(mode: RoutingMode) {
    const cost = mode === 'ONION' ? 50 : mode === 'VPN' ? 20 : 0;
    if (this.credits() >= cost) {
      if (cost > 0) this.credits.update(c => c - cost);
      this.routingMode.set(mode);
      this.log(`ROUTING: ${mode}`);
      this.updateRemoteScore();
    }
  }

  compromiseInternal(targetId: string) {
    const target = this.internalNetwork().find(t => t.id === targetId);
    if (!target || target.status === 'COMPROMISED') return;
    if (Math.random() > 0.4) {
      this.internalNetwork.update(nets => nets.map(n => n.id === targetId ? { ...n, status: 'COMPROMISED' } : n));
      this.credits.update(c => c + target.reward);
      this.log(`PIVOT SUCCESSFUL: EXFILTRATED ${target.reward}cr.`);
      if (target.type === 'ADMIN_CONTROLLER') {
        this.log(`SYSTEM BREACHED: ${this.activeInternalOrigin()} TOTALLY COMPROMISED.`);
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
