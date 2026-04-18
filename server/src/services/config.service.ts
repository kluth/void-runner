import { prisma } from './db.service';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigService {
  private requiredKeys = ['JWT_SECRET', 'SESSION_SECRET'];
  private envPath = path.join(process.cwd(), '.env');

  async isConfigured(): Promise<boolean> {
    const configs = await prisma.systemConfig.findMany();
    const keys = configs.map(c => c.key);
    
    // System is configured if in BASIC_MODE or if we have required keys
    if (keys.includes('SYSTEM_STATUS') && configs.find(c => c.key === 'SYSTEM_STATUS')?.value === 'BASIC_MODE') {
      return true;
    }

    return this.requiredKeys.every(k => keys.includes(k) || process.env[k]);
  }

  async get(key: string): Promise<string | undefined> {
    const dbVal = await prisma.systemConfig.findUnique({ where: { key } });
    if (dbVal) return dbVal.value;
    return process.env[key];
  }

  async saveConfig(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      if (value) {
        await prisma.systemConfig.upsert({
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
    await prisma.systemConfig.upsert({
      where: { key: 'SYSTEM_STATUS' },
      update: { value: 'BASIC_MODE' },
      create: { key: 'SYSTEM_STATUS', value: 'BASIC_MODE' }
    });
  }

  private syncToEnvFile(key: string, value: string) {
    try {
      const line = `${key}=${value}\n`;
      if (fs.existsSync(this.envPath)) {
        const content = fs.readFileSync(this.envPath, 'utf8');
        if (content.includes(`${key}=`)) {
           // Simple update (naive regex)
           const updated = content.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
           fs.writeFileSync(this.envPath, updated);
        } else {
           fs.appendFileSync(this.envPath, line);
        }
      } else {
        fs.writeFileSync(this.envPath, line);
      }
    } catch (e) {
      console.error('[CONFIG] Failed to sync to .env file:', e);
    }
  }
}

export const configService = new ConfigService();
