export interface Bounty {
  id: string;
  target: string;
  targetType?: 'PLAYER' | 'NPC' | 'SYSTEM';
  issuer: string;
  issuerType?: 'NPC' | 'PLAYER' | 'FACTION' | 'SYSTEM';
  type: 'CAPTURE' | 'HACK' | 'SABOTAGE' | 'TRACE' | 'BREACH' | 'STEAL' | 'ELIMINATE' | string;
  reward: number;
  description?: string;
  difficulty: number;
  difficultyLabel?: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE' | 'IMPOSSIBLE';
  status: 'OPEN' | 'CLAIMED' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
  createdAt: number;
  expiresAt: number;
  expiresIn?: string;
  factionId?: string;
  requirements?: string[];
  bonusReward?: number;
  hardwareReward?: any;
}

export interface Mission {
  id: string;
  name: string;
  target: string;
  difficulty: number;
  difficultyLabel?: string;
  reward: number;
  type: string;
  lat: number;
  lng: number;
  isHoneypot: boolean;
  isEntryPoint?: boolean;
  hardwareReward?: any;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'CORE' | 'SHELL' | 'VECTOR' | 'DATA' | 'binary' | 'encrypted_log' | 'firmware' | 'cloud_dump';
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
  value?: number;
  data?: string;
  analysisProgress: number;
  analyzed: boolean;
  rewardType: 'zero-day' | 'data' | 'target_intel' | 'credits';
}

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  price: number;
  bonusType: 'recon' | 'exploit' | 'stealth' | 'social' | 'defense' | 'cloud';
  bonusValue: number;
  unlocked: boolean;
  powerDraw: number;
}
