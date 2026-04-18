import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { prisma } from './db.service';
import * as jwt from 'jsonwebtoken';

vi.mock('./db.service', () => ({
  prisma: {
    player: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-token')
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  it('should return existing player if found', async () => {
    const mockPlayer = { id: 'player-id', username: 'google_123' };
    (prisma.player.findUnique as any).mockResolvedValue(mockPlayer);

    const result = await authService.validateOAuthUser({ id: '123' }, 'google');
    
    expect(prisma.player.findUnique).toHaveBeenCalled();
    expect(prisma.player.create).not.toHaveBeenCalled();
    expect(result.player).toEqual(mockPlayer);
    expect(result.token).toBe('mock-token');
  });

  it('should create new player if not found', async () => {
    (prisma.player.findUnique as any).mockResolvedValue(null);
    const mockCreatedPlayer = { id: 'new-id', username: 'discord_456' };
    (prisma.player.create as any).mockResolvedValue(mockCreatedPlayer);

    const result = await authService.validateOAuthUser({ id: '456', username: 'DiscordUser' }, 'discord');
    
    expect(prisma.player.create).toHaveBeenCalled();
    expect(result.player).toEqual(mockCreatedPlayer);
  });
});
