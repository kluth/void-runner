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
const config_service_1 = require("./config.service");
const db_service_1 = require("./db.service");
const fs = __importStar(require("fs"));
vitest_1.vi.mock('./db.service', () => ({
    prisma: {
        systemConfig: {
            count: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            upsert: vitest_1.vi.fn()
        }
    }
}));
vitest_1.vi.mock('fs', () => ({
    appendFileSync: vitest_1.vi.fn(),
    existsSync: vitest_1.vi.fn().mockReturnValue(true),
    readFileSync: vitest_1.vi.fn().mockReturnValue('')
}));
(0, vitest_1.describe)('ConfigService (TDD) v2', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new config_service_1.ConfigService();
    });
    (0, vitest_1.it)('should handle skip configuration', async () => {
        await service.skipConfig();
        (0, vitest_1.expect)(db_service_1.prisma.systemConfig.upsert).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            create: { key: 'SYSTEM_STATUS', value: 'BASIC_MODE' }
        }));
    });
    (0, vitest_1.it)('should return true for isConfigured if system is in BASIC_MODE', async () => {
        db_service_1.prisma.systemConfig.findMany.mockResolvedValue([{ key: 'SYSTEM_STATUS', value: 'BASIC_MODE' }]);
        const configured = await service.isConfigured();
        (0, vitest_1.expect)(configured).toBe(true);
    });
    (0, vitest_1.it)('should attempt to write to .env file when saving', async () => {
        await service.saveConfig({ 'JWT_SECRET': 'new-secret' });
        (0, vitest_1.expect)(fs.appendFileSync).toHaveBeenCalled();
    });
});
