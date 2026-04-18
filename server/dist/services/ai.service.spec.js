"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ai_service_1 = require("./ai.service");
const child_process_1 = require("child_process");
vitest_1.vi.mock('child_process', () => ({
    exec: vitest_1.vi.fn()
}));
(0, vitest_1.describe)('AiService', () => {
    let aiService;
    (0, vitest_1.beforeEach)(() => {
        aiService = new ai_service_1.AiService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should return gemini response if gemini cli succeeds', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            if (cmd.startsWith('gemini')) {
                callback(null, 'Gemini Response', '');
            }
        });
        const result = await aiService.processQuery('test');
        (0, vitest_1.expect)(result.response).toBe('Gemini Response');
        (0, vitest_1.expect)(result.provider).toBe('GEMINI_CLI');
    });
    (0, vitest_1.it)('should fall back to ollama if gemini fails', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            if (cmd.startsWith('gemini')) {
                callback(new Error('fail'), '', '');
            }
            else if (cmd.startsWith('ollama')) {
                callback(null, 'Ollama Response', '');
            }
        });
        const result = await aiService.processQuery('test');
        (0, vitest_1.expect)(result.response).toBe('Ollama Response');
        (0, vitest_1.expect)(result.provider).toBe('OLLAMA');
    });
    (0, vitest_1.it)('should fall back to openai if ollama fails', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            if (cmd.startsWith('gemini') || cmd.startsWith('ollama')) {
                callback(new Error('fail'), '', '');
            }
            else if (cmd.startsWith('openai')) {
                callback(null, 'OpenAI Response', '');
            }
        });
        const result = await aiService.processQuery('test');
        (0, vitest_1.expect)(result.response).toBe('OpenAI Response');
        (0, vitest_1.expect)(result.provider).toBe('OPENAI_CLI');
    });
    (0, vitest_1.it)('should use dumb proxy if all else fails', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            callback(new Error('fail'), '', '');
        });
        const result = await aiService.processQuery('test');
        (0, vitest_1.expect)(result.provider).toBe('DUMB_PROXY');
        (0, vitest_1.expect)(result.response).toBeDefined();
    });
    (0, vitest_1.it)('should process hijack with gemini', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            callback(null, 'Creepy Response', '');
        });
        const result = await aiService.processHijack('handle', 'history', {});
        (0, vitest_1.expect)(result).toBe('Creepy Response');
    });
    (0, vitest_1.it)('should return fallback hijack message if gemini fails', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            callback(new Error('fail'), '', '');
        });
        const result = await aiService.processHijack('handle', 'history', { battery: '10%' });
        (0, vitest_1.expect)(result).toContain('I SEE YOU, HANDLE');
        (0, vitest_1.expect)(result).toContain('10%');
    });
});
