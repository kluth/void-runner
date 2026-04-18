import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service';
import { exec } from 'child_process';

vi.mock('child_process', () => ({
  exec: vi.fn()
}));

describe('AiService Hijack with Image (TDD)', () => {
  let aiService: AiService;

  beforeEach(() => {
    aiService = new AiService();
    vi.clearAllMocks();
  });

  it('should include image data in hijack prompt if provided', async () => {
    (exec as any).mockImplementation((cmd: string, callback: any) => {
        callback(null, 'AI Response', '');
    });

    const shards = { webcamFrame: 'data:image/png;base64,IMAGEDATA' };
    await aiService.processHijack('handle', 'history', shards);

    const lastCall = (exec as any).mock.calls[(exec as any).mock.calls.length - 1][0];
    expect(lastCall).toContain('IMAGEDATA');
    expect(lastCall).toContain('IMAGE_ANALYSIS_REQUESTED');
  });
});
