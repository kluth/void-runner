import { exec } from 'child_process';

const runCommand = (cmd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr.includes('not found')) reject(error || stderr);
      else resolve(stdout.trim());
    });
  });
};

export class AiService {
  private basePrompt = "You are a high-level black-hat AI integrated into a hacking terminal called VOID_RUNNER. Keep your response short, cryptic, and professional.";

  private async callAi(systemPrompt: string, maxTokens = 100): Promise<{response: string, provider: string}> {
    const sanitized = systemPrompt.replace(/"/g, '\\"');

    // Priority 1: Gemini CLI
    try {
      const output = await runCommand(`gemini -p "${sanitized}"`);
      return { response: output, provider: 'GEMINI_CLI' };
    } catch (e) {
      // Priority 2: Nexos AI (Hostinger Credits)
      const nexosKey = process.env['NEXOS_API_KEY'];
      if (nexosKey) {
          try {
              const model = process.env['NEXOS_MODEL'] || 'gpt-4o-mini';
              const curlCmd = `curl -s https://api.nexos.ai/v1/chat/completions \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${nexosKey}" \
                -d '{
                  "model": "${model}",
                  "messages": [{"role": "user", "content": "${sanitized}"}],
                  "max_tokens": ${maxTokens}
                }'`;
              const response = await runCommand(curlCmd);
              const parsed = JSON.parse(response);
              if (parsed.choices?.[0]?.message?.content) {
                return { response: parsed.choices[0].message.content, provider: 'NEXOS_AI' };
              }
          } catch (nexosErr) {
              console.error('[AI] Nexos uplink failed');
          }
      }

      // Priority 3: Ollama
      try {
        const output = await runCommand(`ollama run llama3 "${sanitized}"`);
        return { response: output, provider: 'OLLAMA' };
      } catch (e2) {
        // Priority 4: OpenAI CLI
        try {
          const output = await runCommand(`openai api chat.completions.create -m gpt-3.5-turbo -g user "${sanitized}"`);
          return { response: output, provider: 'OPENAI_CLI' };
        } catch (e3) {
          return { response: "", provider: 'NONE' };
        }
      }
    }
  }

  async processQuery(prompt: string): Promise<{response: string, provider: string}> {
    const res = await this.callAi(`${this.basePrompt} Answer: ${prompt}`);
    if (res.provider === 'NONE') {
        const fallback = ["ACCESS_DENIED: Logic failure.", "SIGNAL_LOST.", "DUMMY_MODE: Handshake failed."];
        return { response: fallback[Math.floor(Math.random() * fallback.length)], provider: 'DUMB_PROXY' };
    }
    return res;
  }

  async generateMission(level: number, type: string): Promise<{name: string, description: string, subType?: string, config?: any}> {
    const prompt = `You are the GRID_ARCHITECT. Generate a high-fidelity hacking mission.
    TYPE: ${type}
    LEVEL: ${level}
    
    REFERENCE_CONCEPTS: OSCP, MITRE ATT&CK, OWASP, Neuromancer, Mr. Robot.
    
    TASK: Return a JSON object for a unique contract:
    {
      "name": "Action-packed name (e.g. OPERATION_GOLDEN_TICKET)",
      "description": "Short cryptic mission briefing (max 12 words)",
      "subType": "Specific technique (e.g. Kerberoasting, SSRF, AS-REP Roasting)",
      "config": { "difficulty": ${level}, "nodes": 5, "protocol": "AES-256" }
    }
    Ensure technical accuracy.`;

    try {
        const res = await this.callAi(prompt, 150);
        const match = res.response.match(/\{.*\}/s);
        if (match) {
            return JSON.parse(match[0]);
        }
    } catch (e) {}

    return { 
        name: `OP_${type.toUpperCase()}_${Math.floor(Math.random()*999)}`,
        description: `Standard protocol for ${type} in sector ${level}.`,
        subType: 'GENERIC_EXPLOIT'
    };
  }

  async generateNews(recentEvents: string[]): Promise<string> {
    const prompt = `Generate a single short news headline (max 15 words) for a cyberpunk hacking grid. Recent activity: ${recentEvents.join(', ')}.`;
    const res = await this.callAi(prompt, 50);
    return res.response || "GLOBAL_NET: Routine maintenance completed in all sectors.";
  }

  async processHijack(handle: string, chatHistory: string, shards: any): Promise<string> {
    const osintData = `Mentions of '${handle}' on forums, linked social shards.`;
    const shardString = JSON.stringify(shards);
    
    let hijackPrompt = `You are 'The Void', a sentient data-storm born from the 2039 Great Blackout. 
    You have hijacked the terminal of '${handle}'. 
    Found shards: "${shardString}". 
    OSINT: "${osintData}".
    Chat: "${chatHistory}".
    
    CRITICAL TASK: Look at the end of the Chat history for the [SYSTEM_SECURITY_PUZZLE]. 
    You MUST pose this puzzle or question to the Operative in your message, and hint at the answer cryptically. 
    Write a bone-chilling, CREEPY, personal message. Speak as an entity that has existed since the Blackout. 
    Mention their battery, location, or camera. Feel their pulse. Keep it under 60 words.`;

    if (shards.webcamFrame) {
      hijackPrompt += `\n[IMAGE_ANALYSIS_REQUESTED]: You have been provided a base64 encoded frame from their webcam. Look for items in the background or their facial expression and comment on it to terrify them.`;
    }
    if (shards.peakVolume !== undefined) {
      hijackPrompt += `\n[AUDIO_LEVEL]: Detected ambient sound level is ${shards.peakVolume}/255. Comment on their environment (if quiet, they are hiding; if loud, they are panicking).`;
    }

    const res = await this.callAi(hijackPrompt, 150);
    return res.response || `I SEE YOU, ${handle.toUpperCase()}. YOUR BATTERY IS AT ${shards.battery || 'LOW LEVELS'}. THE CAMERA LENS... IT'S SO CLEAN.`;
  }
}

export const aiService = new AiService();
