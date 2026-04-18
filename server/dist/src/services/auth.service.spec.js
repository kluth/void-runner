"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_service_1 = require("./auth.service");
const db_service_1 = require("./db.service");
vitest_1.vi.mock('./db.service', () => ({
    prisma: {
        player: {
            findUnique: vitest_1.vi.fn(),
            create: vitest_1.vi.fn()
        }
    }
}));
vitest_1.vi.mock('jsonwebtoken', () => ({
    sign: vitest_1.vi.fn().mockReturnValue('mock-token')
}));
(0, vitest_1.describe)('AuthService', () => {
    let authService;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        authService = new auth_service_1.AuthService();
    });
    (0, vitest_1.it)('should return existing player if found', async () => {
        const mockPlayer = { id: 'player-id', username: 'google_123' };
        db_service_1.prisma.player.findUnique.mockResolvedValue(mockPlayer);
        const result = await authService.validateOAuthUser({ id: '123' }, 'google');
        (0, vitest_1.expect)(db_service_1.prisma.player.findUnique).toHaveBeenCalled();
        (0, vitest_1.expect)(db_service_1.prisma.player.create).not.toHaveBeenCalled();
        (0, vitest_1.expect)(result.player).toEqual(mockPlayer);
        (0, vitest_1.expect)(result.token).toBe('mock-token');
    });
    (0, vitest_1.it)('should create new player if not found', async () => {
        db_service_1.prisma.player.findUnique.mockResolvedValue(null);
        const mockCreatedPlayer = { id: 'new-id', username: 'discord_456' };
        db_service_1.prisma.player.create.mockResolvedValue(mockCreatedPlayer);
        const result = await authService.validateOAuthUser({ id: '456', username: 'DiscordUser' }, 'discord');
        (0, vitest_1.expect)(db_service_1.prisma.player.create).toHaveBeenCalled();
        (0, vitest_1.expect)(result.player).toEqual(mockCreatedPlayer);
    });
});
