import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { prisma } from './db.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

const hoisted = vi.hoisted(() => ({
  mockAuthenticator: {
    generateSecret: vi.fn().mockReturnValue('secret'),
    keyuri: vi.fn().mockReturnValue('uri'),
    check: vi.fn().mockReturnValue(true)
  },
  mockQrcode: {
    toDataURL: vi.fn().mockResolvedValue('qr-data-url')
  }
}));

vi.mock('otplib', () => ({ authenticator: hoisted.mockAuthenticator }));
vi.mock('qrcode', () => hoisted.mockQrcode);

vi.mock('./db.service', () => ({
  prisma: {
    player: {
      upsert: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn()
    },
    chatMessage: {
      create: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue(Promise.resolve([]))
    },
    team: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([])
    }
  }
}));

vi.mock('./vector.service', () => ({
  vectorService: { storeEmbedding: vi.fn() }
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn().mockResolvedValue(true)
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('token'),
  verify: vi.fn().mockReturnValue({ id: 'uid', username: 'uname' })
}));

describe('GameService Mastery Coverage', () => {
  let gameService: GameService;
  let mockIo: any;
  let mockSocket: any;
  let handlers: Map<string, Function> = new Map();

  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    gameService = new GameService();
    mockIo = { 
        on: vi.fn((event, cb) => { if(event === 'connection') mockIo.connCb = cb; }), 
        emit: vi.fn(), 
        to: vi.fn().mockReturnThis() 
    };
    mockSocket = { 
        id: 'sid', 
        on: vi.fn((event, cb) => { handlers.set(event, cb); }), 
        emit: vi.fn(), 
        join: vi.fn() 
    };
    gameService.init(mockIo as any);
    mockIo.connCb(mockSocket);
  });

  it('should cover everything systematically', async () => {
    // Auth Register
    (prisma.player.create as any).mockResolvedValueOnce({ username: 'u' });
    await handlers.get('auth_register')!({ username: 'u', password: 'p' });
    (prisma.player.create as any).mockRejectedValueOnce(new Error());
    await handlers.get('auth_register')!({ username: 'u', password: 'p' });

    // Auth Login
    (prisma.player.findUnique as any).mockResolvedValue({ id: 'i', username: 'u', password: 'h', twoFactorEnabled: false });
    await handlers.get('auth_login')!({ username: 'u', password: 'p' });
    (bcrypt.compare as any).mockResolvedValueOnce(false);
    await handlers.get('auth_login')!({ username: 'u', password: 'p' });
    (prisma.player.findUnique as any).mockResolvedValueOnce(null);
    await handlers.get('auth_login')!({ username: 'u', password: 'p' });
    (prisma.player.findUnique as any).mockResolvedValue({ id: 'i', username: 'u', password: 'h', twoFactorEnabled: true });
    await handlers.get('auth_login')!({ username: 'u', password: 'p' });

    // Auth 2FA
    hoisted.mockAuthenticator.check.mockReturnValueOnce(true);
    await handlers.get('auth_2fa_verify')!({ userId: 'i', code: 'c' });
    hoisted.mockAuthenticator.check.mockReturnValueOnce(false);
    await handlers.get('auth_2fa_verify')!({ userId: 'i', code: 'c' });
    await handlers.get('auth_2fa_setup')!({ token: 't' });

    // Session
    (prisma.player.findUnique as any).mockResolvedValue({ id: 'i', teamId: 'tid' });
    await handlers.get('session_resume')!({ token: 't' });
    (prisma.player.findUnique as any).mockResolvedValueOnce(null);
    await handlers.get('session_resume')!({ token: 't' });

    // 6. Messages
    await handlers.get('send_message')!({ token: 't', text: 'hi' });
    await handlers.get('send_message')!({ token: 't', text: 'hi', teamId: 'tid' });

    // 8. Teams Create & Join
    (prisma.team.create as any).mockResolvedValueOnce({ id: 'tid' });
    await handlers.get('create_team')!({ token: 't', name: 'n' });
    (prisma.team.create as any).mockRejectedValueOnce(new Error());
    await handlers.get('create_team')!({ token: 't', name: 'n' });
    await handlers.get('join_team')!({ token: 't', teamId: 'tid' });

    // 9. Disconnect
    await handlers.get('disconnect')!();
    (prisma.player.delete as any).mockRejectedValueOnce(new Error());
    await handlers.get('disconnect')!();
    
    // Timers
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.995);
    gameService.init(mockIo as any);
    vi.advanceTimersByTime(1000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    for(let i=0; i<130; i++) vi.advanceTimersByTime(1000);
  });
});
