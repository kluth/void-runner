"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ai_service_1 = require("./ai.service");
const child_process_1 = require("child_process");
vitest_1.vi.mock('child_process', () => ({
    exec: vitest_1.vi.fn()
}));
(0, vitest_1.describe)('AiService Hijack with Image (TDD)', () => {
    let aiService;
    (0, vitest_1.beforeEach)(() => {
        aiService = new ai_service_1.AiService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should include image data in hijack prompt if provided', async () => {
        child_process_1.exec.mockImplementation((cmd, callback) => {
            callback(null, 'AI Response', '');
        });
        const shards = { webcamFrame: 'data:image/png;base64,IMAGEDATA' };
        await aiService.processHijack('handle', 'history', shards);
        const lastCall = child_process_1.exec.mock.calls[child_process_1.exec.mock.calls.length - 1][0];
        (0, vitest_1.expect)(lastCall).toContain('IMAGEDATA');
        (0, vitest_1.expect)(lastCall).toContain('IMAGE_ANALYSIS_REQUESTED');
    });
});
