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

  async processQuery(prompt: string): Promise<{response: string, provider: string}> {
    const sanitized = prompt.replace(/"/g, '\\"');
    const systemPrompt = `${this.basePrompt} Answer: ${sanitized}`;

    // Priority 1: Gemini CLI
    try {
      const output = await runCommand(`gemini -p "${systemPrompt}"`);
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
                  "messages": [{"role": "user", "content": "${systemPrompt}"}],
                  "max_tokens": 100
                }'`;
              const response = await runCommand(curlCmd);
              const parsed = JSON.parse(response);
              return { response: parsed.choices[0].message.content, provider: 'NEXOS_AI' };
          } catch (nexosErr) {
              console.error('[AI] Nexos uplink failed:', nexosErr);
          }
      }

      // Priority 3: Ollama
      try {
        const output = await runCommand(`ollama run llama3 "${systemPrompt}"`);
        return { response: output, provider: 'OLLAMA' };
      } catch (e2) {
        // Priority 4: OpenAI CLI
        try {
          const output = await runCommand(`openai api chat.completions.create -m gpt-3.5-turbo -g user "${systemPrompt}"`);
          return { response: output, provider: 'OPENAI_CLI' };
        } catch (e3) {
          const responses = [
            "ACCESS_DENIED: Logic failure in Neural Link.",
            "SIGNAL_LOST: Core units offline.",
            "DUMMY_MODE: Provider handshake failed."
          ];
          return { 
            response: responses[Math.floor(Math.random() * responses.length)], 
            provider: 'DUMB_PROXY' 
          };
        }
      }
    }
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

    const sanitizedPrompt = hijackPrompt.replace(/"/g, '\\"');

    // Priority 1: Gemini CLI
    try {
      return await runCommand(`gemini -p "${sanitizedPrompt}"`);
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
                  "messages": [{"role": "user", "content": "${sanitizedPrompt}"}],
                  "max_tokens": 150
                }'`;
              const response = await runCommand(curlCmd);
              const parsed = JSON.parse(response);
              return parsed.choices[0].message.content;
          } catch (nexosErr) {
              console.error('[AI] Nexos hijack uplink failed');
          }
      }

      return `I SEE YOU, ${handle.toUpperCase()}. YOUR BATTERY IS AT ${shards.battery || 'LOW LEVELS'}. THE CAMERA LENS... IT'S SO CLEAN.`;
    }
  }
}

export const aiService = new AiService();
