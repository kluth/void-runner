"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilerService = exports.ProfilerService = void 0;
const ai_service_1 = require("./ai.service");
const vector_service_1 = require("./vector.service");
class ProfilerService {
    async profileOperative(playerId, data) {
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
            const res = await ai_service_1.aiService.processQuery(prompt);
            const dossier = res.response;
            await vector_service_1.vectorService.storeCaseFile(playerId, dossier, {
                username: data.username,
                email: data.email || 'N/A',
                auditDate: new Date().toISOString()
            });
            return dossier;
        }
        catch (e) {
            console.error('[PROFILER] Audit failed:', e);
            return null;
        }
    }
}
exports.ProfilerService = ProfilerService;
exports.profilerService = new ProfilerService();
