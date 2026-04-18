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
const vitest_1 = require("vitest");
const game_service_1 = require("./game.service");
const db_service_1 = require("./db.service");
const bcrypt = __importStar(require("bcrypt"));
const hoisted = vitest_1.vi.hoisted(() => ({
    mockAuthenticator: {
        generateSecret: vitest_1.vi.fn().mockReturnValue('secret'),
        keyuri: vitest_1.vi.fn().mockReturnValue('uri'),
        check: vitest_1.vi.fn().mockReturnValue(true)
    },
    mockQrcode: {
        toDataURL: vitest_1.vi.fn().mockResolvedValue('qr-data-url')
    }
}));
vitest_1.vi.mock('otplib', () => ({ authenticator: hoisted.mockAuthenticator }));
vitest_1.vi.mock('qrcode', () => hoisted.mockQrcode);
vitest_1.vi.mock('./db.service', () => ({
    prisma: {
        player: {
            upsert: vitest_1.vi.fn(),
            update: vitest_1.vi.fn().mockResolvedValue({}),
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn().mockResolvedValue([]),
            create: vitest_1.vi.fn(),
            delete: vitest_1.vi.fn()
        },
        chatMessage: {
            create: vitest_1.vi.fn().mockResolvedValue({}),
            findMany: vitest_1.vi.fn().mockResolvedValue(Promise.resolve([]))
        },
        team: {
            create: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn().mockResolvedValue([])
        }
    }
}));
vitest_1.vi.mock('./vector.service', () => ({
    vectorService: { storeEmbedding: vitest_1.vi.fn() }
}));
vitest_1.vi.mock('bcrypt', () => ({
    hash: vitest_1.vi.fn().mockResolvedValue('hashed'),
    compare: vitest_1.vi.fn().mockResolvedValue(true)
}));
vitest_1.vi.mock('jsonwebtoken', () => ({
    sign: vitest_1.vi.fn().mockReturnValue('token'),
    verify: vitest_1.vi.fn().mockReturnValue({ id: 'uid', username: 'uname' })
}));
(0, vitest_1.describe)('GameService Mastery Coverage', () => {
    let gameService;
    let mockIo;
    let mockSocket;
    let handlers = new Map();
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        handlers.clear();
        gameService = new game_service_1.GameService();
        mockIo = {
            on: vitest_1.vi.fn((event, cb) => { if (event === 'connection')
                mockIo.connCb = cb; }),
            emit: vitest_1.vi.fn(),
            to: vitest_1.vi.fn().mockReturnThis()
        };
        mockSocket = {
            id: 'sid',
            on: vitest_1.vi.fn((event, cb) => { handlers.set(event, cb); }),
            emit: vitest_1.vi.fn(),
            join: vitest_1.vi.fn()
        };
        gameService.init(mockIo);
        mockIo.connCb(mockSocket);
    });
    (0, vitest_1.it)('should cover everything systematically', async () => {
        // Auth Register
        db_service_1.prisma.player.create.mockResolvedValueOnce({ username: 'u' });
        await handlers.get('auth_register')({ username: 'u', password: 'p' });
        db_service_1.prisma.player.create.mockRejectedValueOnce(new Error());
        await handlers.get('auth_register')({ username: 'u', password: 'p' });
        // Auth Login
        db_service_1.prisma.player.findUnique.mockResolvedValue({ id: 'i', username: 'u', password: 'h', twoFactorEnabled: false });
        await handlers.get('auth_login')({ username: 'u', password: 'p' });
        bcrypt.compare.mockResolvedValueOnce(false);
        await handlers.get('auth_login')({ username: 'u', password: 'p' });
        db_service_1.prisma.player.findUnique.mockResolvedValueOnce(null);
        await handlers.get('auth_login')({ username: 'u', password: 'p' });
        db_service_1.prisma.player.findUnique.mockResolvedValue({ id: 'i', username: 'u', password: 'h', twoFactorEnabled: true });
        await handlers.get('auth_login')({ username: 'u', password: 'p' });
        // Auth 2FA
        hoisted.mockAuthenticator.check.mockReturnValueOnce(true);
        await handlers.get('auth_2fa_verify')({ userId: 'i', code: 'c' });
        hoisted.mockAuthenticator.check.mockReturnValueOnce(false);
        await handlers.get('auth_2fa_verify')({ userId: 'i', code: 'c' });
        await handlers.get('auth_2fa_setup')({ token: 't' });
        // Session
        db_service_1.prisma.player.findUnique.mockResolvedValue({ id: 'i', teamId: 'tid' });
        await handlers.get('session_resume')({ token: 't' });
        db_service_1.prisma.player.findUnique.mockResolvedValueOnce(null);
        await handlers.get('session_resume')({ token: 't' });
        // 6. Messages
        await handlers.get('send_message')({ token: 't', text: 'hi' });
        await handlers.get('send_message')({ token: 't', text: 'hi', teamId: 'tid' });
        // 8. Teams Create & Join
        db_service_1.prisma.team.create.mockResolvedValueOnce({ id: 'tid' });
        await handlers.get('create_team')({ token: 't', name: 'n' });
        db_service_1.prisma.team.create.mockRejectedValueOnce(new Error());
        await handlers.get('create_team')({ token: 't', name: 'n' });
        await handlers.get('join_team')({ token: 't', teamId: 'tid' });
        // 9. Disconnect
        await handlers.get('disconnect')();
        db_service_1.prisma.player.delete.mockRejectedValueOnce(new Error());
        await handlers.get('disconnect')();
        // Timers
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.spyOn(Math, 'random').mockReturnValue(0.995);
        gameService.init(mockIo);
        vitest_1.vi.advanceTimersByTime(1000);
        vitest_1.vi.spyOn(Math, 'random').mockReturnValue(0.5);
        for (let i = 0; i < 130; i++)
            vitest_1.vi.advanceTimersByTime(1000);
    });
});
