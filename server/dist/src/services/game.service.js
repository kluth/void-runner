"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameService = exports.GameService = void 0;
const db_service_1 = require("./db.service");
const config_service_1 = require("./config.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const { authenticator } = require('otplib');
const qrcode = __importStar(require("qrcode"));
const EVENT_TYPES = ['CTF_ACTIVE', 'PATCH_TUESDAY', 'ZERO_DAY_PANIC'];
class GameState {
    globalEvent = 'NONE';
    eventTimer = 0;
}
class GameService {
    io;
    state = new GameState();
    init(io) {
        this.io = io;
        this.startEventLoop();
        io.on('connection', (socket) => {
            console.log(`[SOCKET] Handshake: ${socket.id}`);
            // --- AUTHENTICATION ---
            socket.on('auth_register', async (data) => {
                try {
                    const hashed = await bcrypt.hash(data.password, 10);
                    const player = await db_service_1.prisma.player.create({
                        data: {
                            username: data.username,
                            password: hashed,
                            name: data.username.toUpperCase(),
                            reputation: 0,
                            score: 0
                        }
                    });
                    socket.emit('auth_success', { username: player.username });
                }
                catch (e) {
                    socket.emit('error_msg', 'Username taken.');
                }
            });
            socket.on('auth_login', async (data) => {
                const player = await db_service_1.prisma.player.findUnique({ where: { username: data.username } });
                if (player && player.password && await bcrypt.compare(data.password, player.password)) {
                    if (player.twoFactorEnabled) {
                        socket.emit('auth_2fa_required', { userId: player.id });
                    }
                    else {
                        const secret = await config_service_1.configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
                        const token = jwt.sign({ id: player.id, username: player.username }, secret);
                        socket.emit('auth_complete', { token, player });
                    }
                }
                else {
                    socket.emit('error_msg', 'Invalid credentials.');
                }
            });
            socket.on('auth_2fa_verify', async (data) => {
                const player = await db_service_1.prisma.player.findUnique({ where: { id: data.userId } });
                if (player && player.twoFactorSecret && authenticator.check(data.code, player.twoFactorSecret)) {
                    const secret = await config_service_1.configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
                    const token = jwt.sign({ id: player.id, username: player.username }, secret);
                    socket.emit('auth_complete', { token, player });
                }
                else {
                    socket.emit('error_msg', 'Invalid 2FA code.');
                }
            });
            socket.on('auth_2fa_setup', async (data) => {
                const decoded = await this.verifyToken(data.token);
                if (!decoded)
                    return;
                const secret = authenticator.generateSecret();
                const otpauth = authenticator.keyuri(decoded.username, 'VOID_RUNNER', secret);
                const qr = await qrcode.toDataURL(otpauth);
                await db_service_1.prisma.player.update({
                    where: { id: decoded.id },
                    data: { twoFactorSecret: secret, twoFactorEnabled: true }
                });
                socket.emit('auth_2fa_qr', qr);
            });
            // --- SECURE SESSION HANDLERS ---
            socket.on('session_resume', async (data) => {
                const decoded = await this.verifyToken(data.token);
                if (!decoded)
                    return;
                const player = await db_service_1.prisma.player.findUnique({
                    where: { id: decoded.id },
                    include: { team: true }
                });
                if (!player)
                    return;
                if (player.teamId)
                    socket.join(player.teamId);
                socket.emit('init_state', {
                    globalEvent: this.state.globalEvent,
                    eventTimer: this.state.eventTimer,
                    leaderboard: await this.getLeaderboard(),
                    chatMessages: await this.getChatHistory(),
                    teams: await this.getTeams(),
                    player
                });
            });
            socket.on('send_message', async (data) => {
                const decoded = await this.verifyToken(data.token);
                if (!decoded)
                    return;
                const msg = await db_service_1.prisma.chatMessage.create({
                    data: {
                        sender: decoded.username,
                        text: data.text,
                        teamId: data.teamId
                    }
                });
                if (data.teamId) {
                    this.io.to(data.teamId).emit('new_message', msg);
                }
                else {
                    this.io.emit('new_message', msg);
                }
            });
            socket.on('update_score', async (data) => {
                const decoded = await this.verifyToken(data.token);
                if (!decoded)
                    return;
                await db_service_1.prisma.player.update({
                    where: { id: decoded.id },
                    data: { score: data.score, reputation: data.reputation }
                });
                this.io.emit('leaderboard_update', await this.getLeaderboard());
            });
            socket.on('create_team', async (data) => {
                const decoded = await this.verifyToken(data.token);
                if (!decoded)
                    return;
                try {
                    const team = await db_service_1.prisma.team.create({
                        data: {
                            name: data.name,
                            description: data.description,
                            leaderId: decoded.id,
                            members: { connect: { id: decoded.id } }
                        }
                    });
                    await db_service_1.prisma.player.update({ where: { id: decoded.id }, data: { teamId: team.id } });
                    socket.join(team.id);
                    this.io.emit('teams_update', await this.getTeams());
                    socket.emit('team_joined', team);
                }
                catch (e) {
                    socket.emit('error_msg', 'Team name already exists or you already lead a team.');
                }
            });
            socket.on('join_team', async (data) => {
                const decoded = await this.verifyToken(data.token);
                if (!decoded)
                    return;
                await db_service_1.prisma.player.update({
                    where: { id: decoded.id },
                    data: { teamId: data.teamId }
                });
                socket.join(data.teamId);
                const team = await db_service_1.prisma.team.findUnique({ where: { id: data.teamId } });
                socket.emit('team_joined', team);
                this.io.emit('teams_update', await this.getTeams());
            });
            socket.on('disconnect', async () => {
                console.log(`[SOCKET] User disconnected: ${socket.id}`);
                try {
                    await db_service_1.prisma.player.delete({ where: { id: socket.id } });
                }
                catch (e) { }
                const board = await this.getLeaderboard();
                this.io.emit('leaderboard_update', board);
            });
        });
    }
    async verifyToken(token) {
        try {
            const secret = await config_service_1.configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
            return jwt.verify(token, secret);
        }
        catch (e) {
            return null;
        }
    }
    async getLeaderboard() {
        return db_service_1.prisma.player.findMany({
            orderBy: { reputation: 'desc' },
            take: 10,
            select: { id: true, name: true, reputation: true, score: true }
        });
    }
    async getChatHistory() {
        return db_service_1.prisma.chatMessage.findMany({
            where: { teamId: null },
            orderBy: { timestamp: 'desc' },
            take: 50
        }).then(msgs => msgs.reverse());
    }
    async getTeams() {
        return db_service_1.prisma.team.findMany({
            include: { _count: { select: { members: true } } }
        });
    }
    startRandomEvent() {
        this.state.globalEvent = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        this.state.eventTimer = 120;
        this.io.emit('event_update', { event: this.state.globalEvent, timer: this.state.eventTimer });
    }
    startEventLoop() {
        setInterval(() => {
            if (this.state.eventTimer > 0) {
                this.state.eventTimer--;
                if (this.state.eventTimer === 0) {
                    this.state.globalEvent = 'NONE';
                    this.io.emit('event_update', { event: 'NONE', timer: 0 });
                }
            }
            else if (Math.random() > 0.99) {
                this.startRandomEvent();
            }
        }, 1000);
    }
}
exports.GameService = GameService;
exports.gameService = new GameService();
