import { Server, Socket } from 'socket.io';
import { prisma } from './db.service';
import { vectorService } from './vector.service';
import { configService } from './config.service';
import { profilerService } from './profiler.service';
import { aiService } from './ai.service';
import { realWorldService } from './realworld.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
const { authenticator } = require('otplib');
import * as qrcode from 'qrcode';
import { firstNames, lastNames } from './names.data';

const EVENT_TYPES = ['CTF_ACTIVE', 'PATCH_TUESDAY', 'ZERO_DAY_PANIC', 'SINGULARITY', 'WEEKEND_OVERLOAD'] as const;
type EventType = typeof EVENT_TYPES[number] | 'NONE';

class GameState {
  globalEvent: EventType = 'NONE';
  eventTimer: number = 0;
}

export class GameService {
  private io!: Server;
  private state = new GameState();

  init(io: Server) {
    this.io = io;
    this.startEventLoop();

    // Neural Riddle Migration: Populate ChromaDB if empty
    this.populateRiddleArchive();

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Handshake: ${socket.id}`);
      this.broadcastOperativeCount();
      socket.join('global_comms');

      // --- AUTHENTICATION ---
      socket.on('auth_register', async (data) => {
        try {
          const hashed = await bcrypt.hash(data.password, 10);
          const player = await prisma.player.create({
            data: {
              username: data.username,
              password: hashed,
              name: data.username.toUpperCase(),
              reputation: 0,
              score: 0
            }
          });
          socket.emit('auth_success', { username: player.username });
        } catch (e) {
          socket.emit('error_msg', 'Username taken.');
        }
      });

      socket.on('auth_login', async (data) => {
        const player = await prisma.player.findUnique({ where: { username: data.username } });
        if (player && player.password && await bcrypt.compare(data.password, player.password)) {
          if (player.twoFactorEnabled) {
            socket.emit('auth_2fa_required', { userId: player.id });
          } else {
            const secret = await configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
            const token = jwt.sign({ id: player.id, username: player.username }, secret);
            socket.emit('auth_complete', { token, player });

            // Background Profiling
            profilerService.profileOperative(player.id, {
                name: player.name,
                username: player.username,
                email: player.username
            });
          }
        } else {
          socket.emit('error_msg', 'Invalid credentials.');
        }
      });

      socket.on('auth_2fa_verify', async (data) => {
        const player = await prisma.player.findUnique({ where: { id: data.userId } });
        if (player && player.twoFactorSecret && authenticator.check(data.code, player.twoFactorSecret)) {
          const secret = await configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
          const token = jwt.sign({ id: player.id, username: player.username }, secret);
          socket.emit('auth_complete', { token, player });
        } else {
          socket.emit('error_msg', 'Invalid 2FA code.');
        }
      });

      socket.on('auth_2fa_setup', async (data) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;
        
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(decoded.username, 'VOID_RUNNER', secret);
        const qr = await qrcode.toDataURL(otpauth);
        
        await prisma.player.update({
          where: { id: decoded.id },
          data: { twoFactorSecret: secret, twoFactorEnabled: true }
        });
        socket.emit('auth_2fa_qr', qr);
      });

      // --- SECURE SESSION HANDLERS ---
      socket.on('session_resume', async (data) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        const player = await prisma.player.findUnique({ 
          where: { id: decoded.id }, 
          include: { team: true } 
        });
        if (!player) return;

        // Ensure we are in our syndicate room, global comms, and user-specific room
        socket.join('global_comms');
        socket.join(`user_${player.id}`);
        if (player.teamId) {
            console.log(`[SOCKET] Operative ${player.username} joining room ${player.teamId}`);
            socket.join(player.teamId);
        }

        socket.emit('init_state', {
          globalEvent: this.state.globalEvent,
          eventTimer: this.state.eventTimer,
          leaderboard: await this.getLeaderboard(),
          chatMessages: await this.getChatHistory(),
          teams: await this.getTeams(),
          realWorld: realWorldService.getState(),
          player
        });

        // Refresh Dossier
        profilerService.profileOperative(player.id, {
            name: player.name,
            username: player.username
        });
      });

      socket.on('get_dossier', async (data: { token: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        const dossier = await vectorService.getCaseFile(decoded.id);
        socket.emit('dossier_data', { dossier: dossier || 'ANALYSIS_PENDING: Deep sector scan in progress.' });
      });

      socket.on('trigger_hijack', async (data: { token: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        const riddle = await vectorService.getRandomRiddle();
        if (riddle) {
            socket.emit('hijack_data', riddle);
        }
      });

      // --- MEDIA ARCHIVE HANDLERS ---
      socket.on('save_media', async (data: { token: string, type: 'IMAGE' | 'AUDIO', data: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        try {
            const capture = await prisma.mediaCapture.create({
                data: {
                    type: data.type,
                    data: data.data,
                    playerId: decoded.id
                }
            });
            console.log(`[MEDIA] Captured ${data.type} for ${decoded.username}`);
            socket.emit('media_saved', { id: capture.id });
        } catch (e) {
            console.error('[MEDIA] Failed to archive shard:', e);
        }
      });

      socket.on('get_media', async (data: { token: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        const media = await prisma.mediaCapture.findMany({
            where: { playerId: decoded.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        socket.emit('media_gallery', media);
      });

      socket.on('send_message', async (data: { token: string, text: string, teamId?: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        const msg = await prisma.chatMessage.create({
          data: {
            sender: decoded.username,
            text: data.text,
            teamId: data.teamId
          }
        });
        
        if (data.teamId) {
            this.io.to(data.teamId).emit('new_message', msg);
        } else {
            this.io.to('global_comms').emit('new_message', msg);
        }
      });

      socket.on('update_score', async (data: { 
          token: string, 
          score: number, 
          reputation: number,
          credits?: number,
          experience?: number,
          botnetSize?: number,
          campaignLevel?: number,
          inventory?: string,
          mountedHardware?: string,
          software?: string,
          systemIntegrity?: number,
          detectionLevel?: number,
          activeDebuffs?: string,
          artifacts?: string,
          publicExploits?: string,
          settings?: string
      }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        await prisma.player.update({
          where: { id: decoded.id },
          data: { 
              score: data.reputation, // Force score to match reputation for ranking consistency
              reputation: data.reputation,
              credits: data.credits ?? undefined,
              experience: data.experience ?? undefined,
              botnetSize: data.botnetSize ?? undefined,
              campaignLevel: data.campaignLevel ?? undefined,
              inventory: data.inventory ?? undefined,
              mountedHardware: data.mountedHardware ?? undefined,
              software: data.software ?? undefined,
              systemIntegrity: data.systemIntegrity ?? undefined,
              detectionLevel: data.detectionLevel ?? undefined,
              activeDebuffs: data.activeDebuffs ?? undefined,
              artifacts: data.artifacts ?? undefined,
              publicExploits: data.publicExploits ?? undefined,
              settings: data.settings ?? undefined
          }
        });
        
        // Mirror updated state to ALL devices owned by this user
        // Ensure username is preserved in the mirror packet
        this.io.to(`user_${decoded.id}`).emit('state_mirror', {
            ...data,
            username: decoded.username,
            mountedHardware: data.mountedHardware
        });
        
        this.io.emit('leaderboard_update', await this.getLeaderboard());
      });

      socket.on('create_team', async (data: { token: string, name: string, description: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        try {
          const team = await prisma.team.create({
            data: {
              name: data.name,
              description: data.description,
              leaderId: decoded.id,
              members: { connect: { id: decoded.id } }
            }
          });
          await prisma.player.update({ where: { id: decoded.id }, data: { teamId: team.id } });
          socket.join(team.id);
          this.io.emit('teams_update', await this.getTeams());
          socket.emit('team_joined', team);
        } catch (e) {
          socket.emit('error_msg', 'Team name already exists or you already lead a team.');
        }
      });

      socket.on('join_team', async (data: { token: string, teamId: string }) => {
        const decoded = await this.verifyToken(data.token);
        if (!decoded) return;

        await prisma.player.update({
          where: { id: decoded.id },
          data: { teamId: data.teamId }
        });
        socket.join(data.teamId);
        const team = await prisma.team.findUnique({ where: { id: data.teamId } });
        socket.emit('team_joined', team);
        this.io.emit('teams_update', await this.getTeams());
      });

      socket.on('disconnect', async () => {
        console.log(`[SOCKET] User disconnected: ${socket.id}`);
        this.broadcastOperativeCount();
        // We no longer delete anonymous players on disconnect if we want persistence
        const board = await this.getLeaderboard();
        this.io.emit('leaderboard_update', board);
      });
    });
  }

  private broadcastOperativeCount() {
    if (this.io) {
        const count = this.io.engine.clientsCount;
        this.io.emit('operative_count_update', { count });
    }
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const secret = await configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
      return jwt.verify(token, secret);
    } catch (e) {
      return null;
    }
  }

  private async getLeaderboard() {
    return prisma.player.findMany({
      orderBy: { reputation: 'desc' },
      take: 10,
      select: { id: true, reputation: true }
    }).then(players => players.map(p => {
        // Deterministic hashing based on ID shards
        const idChars = p.id.split('');
        const firstSum = idChars.slice(0, 18).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const lastSum = idChars.slice(18).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const firstName = firstNames[firstSum % firstNames.length];
        const lastName = lastNames[lastSum % lastNames.length];
        const maskedName = `${firstName} ${lastName}`;
        
        return {
            ...p,
            name: maskedName,
            score: p.reputation
        };
    }));
  }

  private async getChatHistory() {
    return prisma.chatMessage.findMany({
      where: { teamId: null },
      orderBy: { timestamp: 'desc' },
      take: 50
    }).then(msgs => msgs.reverse());
  }

  private async populateRiddleArchive() {
      try {
          const riddle = await vectorService.getRandomRiddle();
          if (!riddle) {
              console.log('[VECTOR] Riddle archive empty. Initiating 1000+ shard population...');
              
              // 1. Existing Data
              const existing = firstNames; // Mistake in previous thought, I need the actual RIDDLES from frontend or re-import
              // Actually, I will generate a fresh set of 1000 since I don't have access to the frontend constant easily here
              const prompt = `Generate 500 unique technical/hacker/Matrix riddles. 
              Format: JSON array of {q: "The question", a: "The short uppercase answer"}.
              Themes: CS, Matrix, Ready Player One, Cybersecurity.`;
              
              const res = await aiService.processQuery(prompt);
              const match = res.response.match(/\[.*\]/s);
              const generated = match ? JSON.parse(match[0]) : [];

              await vectorService.storeRiddles(generated);
          }
      } catch (e) {
          console.error('[VECTOR] Riddle population failed:', e);
      }
  }

  async addRandomMission() {
    const types = ['port-scan', 'brute-force', 'sql-injection', 'rfid-clone', 'buffer-overflow', 'xss-injection', 'osint-research', 'phishing-campaign', 'mitm-attack', 'crypto-heist', 'quantum-breach', 'iot-takeover', 'social-engineering', 'stock-manipulation', 'dark-web-hit', 'satellite-hacking'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Procedural Generation via AI
    const aiData = await realWorldService.sync().then(() => aiService.generateMission(this.state.globalEvent !== 'NONE' ? 5 : 1, type));

    const mission = {
      id: Math.random().toString(36).substring(2, 9),
      name: aiData.name,
      target: aiData.description,
      type: type,
      subType: aiData.subType,
      config: JSON.stringify(aiData.config),
      difficulty: Math.floor(Math.random() * 5) + 1,
      reward: Math.floor(Math.random() * 500) + 100,
      isHoneypot: Math.random() > 0.95
    };
    
    if (this.io) this.io.emit('new_mission', mission);
  }

  private async getTeams() {
    return prisma.team.findMany({
      include: { _count: { select: { members: true } } }
    });
  }

  private startRandomEvent() {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun, 2=Tue, 6=Sat
    
    let possibleEvents: EventType[] = ['CTF_ACTIVE', 'ZERO_DAY_PANIC', 'SINGULARITY'];
    
    // Temporal Logic
    if (day === 2) possibleEvents.push('PATCH_TUESDAY');
    if (day === 0 || day === 6) possibleEvents.push('WEEKEND_OVERLOAD');

    this.state.globalEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    this.state.eventTimer = 120;
    
    if (this.io) {
        this.io.emit('event_update', { event: this.state.globalEvent, timer: this.state.eventTimer });
        console.log(`[EVENT] Temporal trigger activated: ${this.state.globalEvent}`);
    }
  }

  private startEventLoop() {
    // Initial Real-World Sync
    realWorldService.sync().then(state => {
        if (this.io) this.io.emit('real_world_update', state);
    });

    setInterval(async () => {
      // Periodic Real-World Sync (every 60s)
      if (Date.now() % 60000 < 1000) {
          const state = await realWorldService.sync();
          if (this.io) this.io.emit('real_world_update', state);
          this.addRandomMission(); // Add a mission synced with real-world news
      }

      // Global Event Logic
      if (this.state.eventTimer > 0) {
        this.state.eventTimer--;
        if (this.state.eventTimer === 0) {
          this.state.globalEvent = 'NONE';
          this.io.emit('event_update', { event: 'NONE', timer: 0 });
        }
      } else if (Math.random() > 0.99) {
        this.startRandomEvent();
      }

      // Attack Sync Logic: Randomly trigger attacks for active players
      if (Math.random() > 0.98) {
          const players = await prisma.player.findMany({ take: 5 }); // Only check a subset for performance
          for (const player of players) {
              // Only trigger if player has some reputation and is likely "active"
              if (player.reputation > 10 && Math.random() > 0.95) {
                  const attackType = Math.random() > 0.5 ? 'HIJACK' : 'INTRUSION';
                  this.io.to(`user_${player.id}`).emit('server_attack', { type: attackType });
                  console.log(`[EVENT] Server-driven ${attackType} triggered for ${player.username}`);
              }
          }
      }
    }, 1000);
  }
}

export const gameService = new GameService();
