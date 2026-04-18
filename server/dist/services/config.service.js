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
exports.configService = exports.ConfigService = void 0;
const db_service_1 = require("./db.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigService {
    requiredKeys = ['JWT_SECRET', 'SESSION_SECRET'];
    envPath = path.join(process.cwd(), '.env');
    async isConfigured() {
        const configs = await db_service_1.prisma.systemConfig.findMany();
        const keys = configs.map(c => c.key);
        // System is configured if in BASIC_MODE or if we have required keys
        if (keys.includes('SYSTEM_STATUS') && configs.find(c => c.key === 'SYSTEM_STATUS')?.value === 'BASIC_MODE') {
            return true;
        }
        return this.requiredKeys.every(k => keys.includes(k) || process.env[k]);
    }
    async get(key) {
        const dbVal = await db_service_1.prisma.systemConfig.findUnique({ where: { key } });
        if (dbVal)
            return dbVal.value;
        return process.env[key];
    }
    async saveConfig(data) {
        for (const [key, value] of Object.entries(data)) {
            if (value) {
                await db_service_1.prisma.systemConfig.upsert({
                    where: { key },
                    update: { value },
                    create: { key, value }
                });
                // Also sync to .env file for platform compatibility (Hostinger)
                this.syncToEnvFile(key, value);
            }
        }
    }
    async skipConfig() {
        await db_service_1.prisma.systemConfig.upsert({
            where: { key: 'SYSTEM_STATUS' },
            update: { value: 'BASIC_MODE' },
            create: { key: 'SYSTEM_STATUS', value: 'BASIC_MODE' }
        });
    }
    syncToEnvFile(key, value) {
        try {
            const line = `${key}=${value}\n`;
            if (fs.existsSync(this.envPath)) {
                const content = fs.readFileSync(this.envPath, 'utf8');
                if (content.includes(`${key}=`)) {
                    // Simple update (naive regex)
                    const updated = content.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
                    fs.writeFileSync(this.envPath, updated);
                }
                else {
                    fs.appendFileSync(this.envPath, line);
                }
            }
            else {
                fs.writeFileSync(this.envPath, line);
            }
        }
        catch (e) {
            console.error('[CONFIG] Failed to sync to .env file:', e);
        }
    }
}
exports.ConfigService = ConfigService;
exports.configService = new ConfigService();
