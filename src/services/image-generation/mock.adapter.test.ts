import { describe, expect, it } from 'vitest';

import { createMockImageAdapter } from './mock.adapter';

describe('createMockImageAdapter', () => {
  it('returns placeholder image URL', async () => {
    const adapter = createMockImageAdapter();
    const result = await adapter.generate({ prompt: 'a dragon', width: 1024, height: 1024 });
    expect(result.url).toContain('placeholder.test');
    expect(result.durationMs).toBeTypeOf('number');
  });

  it('respects custom delay and URL', async () => {
    const adapter = createMockImageAdapter({
      delayMs: 10,
      imageUrl: 'https://custom.test/img.png',
    });
    const result = await adapter.generate({ prompt: 'test', width: 1024, height: 1024 });
    expect(result.url).toContain('custom.test');
  });

  it('increments image URL per generation', async () => {
    const adapter = createMockImageAdapter();
    const r1 = await adapter.generate({ prompt: 'test1', width: 1024, height: 1024 });
    const r2 = await adapter.generate({ prompt: 'test2', width: 1024, height: 1024 });
    expect(r1.url).not.toBe(r2.url);
  });
});
