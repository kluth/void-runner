import { Server, Socket } from 'socket.io';
import { prisma } from './db.service';
import { vectorService } from './vector.service';
import { configService } from './config.service';
import { profilerService } from './profiler.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
const { authenticator } = require('otplib');
import * as qrcode from 'qrcode';

const EVENT_TYPES = ['CTF_ACTIVE', 'PATCH_TUESDAY', 'ZERO_DAY_PANIC'] as const;
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

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Handshake: ${socket.id}`);
      this.broadcastOperativeCount();

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

        if (player.teamId) socket.join(player.teamId);

        socket.emit('init_state', {
          globalEvent: this.state.globalEvent,
          eventTimer: this.state.eventTimer,
          leaderboard: await this.getLeaderboard(),
          chatMessages: await this.getChatHistory(),
          teams: await this.getTeams(),
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
            this.io.emit('new_message', msg);
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
              score: data.score, 
              reputation: data.reputation,
              credits: data.credits ?? undefined,
              experience: data.experience ?? undefined,
              botnetSize: data.botnetSize ?? undefined,
              campaignLevel: data.campaignLevel ?? undefined,
              inventory: data.inventory ?? undefined,
              software: data.software ?? undefined,
              systemIntegrity: data.systemIntegrity ?? undefined,
              detectionLevel: data.detectionLevel ?? undefined,
              activeDebuffs: data.activeDebuffs ?? undefined,
              artifacts: data.artifacts ?? undefined,
              publicExploits: data.publicExploits ?? undefined,
              settings: data.settings ?? undefined
          }
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
      select: { id: true, name: true, reputation: true, score: true }
    });
  }

  private async getChatHistory() {
    return prisma.chatMessage.findMany({
      where: { teamId: null },
      orderBy: { timestamp: 'desc' },
      take: 50
    }).then(msgs => msgs.reverse());
  }

  private async getTeams() {
    return prisma.team.findMany({
      include: { _count: { select: { members: true } } }
    });
  }

  private startRandomEvent() {
    this.state.globalEvent = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    this.state.eventTimer = 120;
    this.io.emit('event_update', { event: this.state.globalEvent, timer: this.state.eventTimer });
  }

  private startEventLoop() {
    setInterval(() => {
      if (this.state.eventTimer > 0) {
        this.state.eventTimer--;
        if (this.state.eventTimer === 0) {
          this.state.globalEvent = 'NONE';
          this.io.emit('event_update', { event: 'NONE', timer: 0 });
        }
      } else if (Math.random() > 0.99) {
        this.startRandomEvent();
      }
    }, 1000);
  }
}

export const gameService = new GameService();
