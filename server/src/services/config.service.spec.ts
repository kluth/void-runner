import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from './config.service';
import { prisma } from './db.service';
import * as fs from 'fs';

vi.mock('./db.service', () => ({
  prisma: {
    systemConfig: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn()
    }
  }
}));

vi.mock('fs', () => ({
  appendFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  readFileSync: vi.fn().mockReturnValue('')
}));

describe('ConfigService (TDD) v2', () => {
  let service: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConfigService();
  });

  it('should handle skip configuration', async () => {
    await service.skipConfig();
    expect(prisma.systemConfig.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: { key: 'SYSTEM_STATUS', value: 'BASIC_MODE' }
    }));
  });

  it('should return true for isConfigured if system is in BASIC_MODE', async () => {
    (prisma.systemConfig.findMany as any).mockResolvedValue([{ key: 'SYSTEM_STATUS', value: 'BASIC_MODE' }]);
    const configured = await service.isConfigured();
    expect(configured).toBe(true);
  });

  it('should attempt to write to .env file when saving', async () => {
    await service.saveConfig({ 'JWT_SECRET': 'new-secret' });
    expect(fs.appendFileSync).toHaveBeenCalled();
  });
});
