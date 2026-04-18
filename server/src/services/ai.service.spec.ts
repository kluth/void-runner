import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service';
import { exec } from 'child_process';

vi.mock('child_process', () => ({
  exec: vi.fn()
}));

describe('AiService', () => {
  let aiService: AiService;

  beforeEach(() => {
    aiService = new AiService();
    vi.clearAllMocks();
  });

  it('should return gemini response if gemini cli succeeds', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
      if (cmd.startsWith('gemini')) {
        callback(null, 'Gemini Response', '');
      }
    });

    const result = await aiService.processQuery('test');
    expect(result.response).toBe('Gemini Response');
    expect(result.provider).toBe('GEMINI_CLI');
  });

  it('should fall back to ollama if gemini fails', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
      if (cmd.startsWith('gemini')) {
        callback(new Error('fail'), '', '');
      } else if (cmd.startsWith('ollama')) {
        callback(null, 'Ollama Response', '');
      }
    });

    const result = await aiService.processQuery('test');
    expect(result.response).toBe('Ollama Response');
    expect(result.provider).toBe('OLLAMA');
  });

  it('should fall back to openai if ollama fails', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
      if (cmd.startsWith('gemini') || cmd.startsWith('ollama')) {
        callback(new Error('fail'), '', '');
      } else if (cmd.startsWith('openai')) {
        callback(null, 'OpenAI Response', '');
      }
    });

    const result = await aiService.processQuery('test');
    expect(result.response).toBe('OpenAI Response');
    expect(result.provider).toBe('OPENAI_CLI');
  });

  it('should use dumb proxy if all else fails', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
      callback(new Error('fail'), '', '');
    });

    const result = await aiService.processQuery('test');
    expect(result.provider).toBe('DUMB_PROXY');
    expect(result.response).toBeDefined();
  });

  it('should process hijack with gemini', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
      callback(null, 'Creepy Response', '');
    });

    const result = await aiService.processHijack('handle', 'history', {});
    expect(result).toBe('Creepy Response');
  });

  it('should return fallback hijack message if gemini fails', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
      callback(new Error('fail'), '', '');
    });

    const result = await aiService.processHijack('handle', 'history', { battery: '10%' });
    expect(result).toContain('I SEE YOU, HANDLE');
    expect(result).toContain('10%');
  });
});
