import { aiService } from './ai.service';
import { vectorService } from './vector.service';

export class ProfilerService {
  async profileOperative(playerId: string, data: { name: string, email?: string, username: string }) {
    console.log(`[PROFILER] Beginning Digital Dust Audit for Operative ${data.username}...`);

    const prompt = `You are an NSA-level OSINT analysis bot. 
    RESEARCH TARGET: 
    - Name: ${data.name}
    - Email: ${data.email || 'REDACTED'}
    - Handle: ${data.username}

    TASK: Generate a CREEPY, comprehensive 'Case File' dossier. 
    Include (plausible but simulated if not found):
    1. Digital Footprint (linked accounts, forum mentions)
    2. Estimated Geolocation (based on timezones/node latency)
    3. Potential Security Vulnerabilities (leaked passwords, common aliases)
    4. Psychological Profile (risk level, syndicate potential)
    
    Keep it fun for a game, but make it UNSETTLING. Use terminal-style formatting. Max 300 words.`;

    try {
      const res = await aiService.processQuery(prompt);
      const dossier = res.response;

      await vectorService.storeCaseFile(playerId, dossier, {
        username: data.username,
        email: data.email || 'N/A',
        auditDate: new Date().toISOString()
      });

      return dossier;
    } catch (e) {
      console.error('[PROFILER] Audit failed:', e);
      return null;
    }
  }
}

export const profilerService = new ProfilerService();
