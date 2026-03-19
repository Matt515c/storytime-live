import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFalAdapter } from './fal.adapter';

beforeEach(() => {
  vi.stubGlobal('performance', { now: vi.fn(() => 0) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createFalAdapter', () => {
  it('generates image via fal.ai API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          images: [{ url: 'https://fal.ai/generated/image.png' }],
        }),
      }),
    );

    const adapter = createFalAdapter('test-key');
    const result = await adapter.generate({ prompt: 'a dragon', width: 1024, height: 1024 });

    expect(result.url).toBe('https://fal.ai/generated/image.png');
    expect(result.durationMs).toBeTypeOf('number');
  });

  it('includes reference image when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        images: [{ url: 'https://fal.ai/generated/image.png' }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createFalAdapter('test-key');
    await adapter.generate({
      prompt: 'a dragon in a castle',
      referenceImageUrl: 'https://prev-scene.png',
      width: 1024,
      height: 1024,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as Record<string, unknown>;
    expect(body.image_url).toBe('https://prev-scene.png');
  });

  it('throws on API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const adapter = createFalAdapter('test-key');
    await expect(
      adapter.generate({ prompt: 'test', width: 1024, height: 1024 }),
    ).rejects.toThrow('fal.ai API error: 500');
  });

  it('throws when no image returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ images: [] }),
      }),
    );

    const adapter = createFalAdapter('test-key');
    await expect(
      adapter.generate({ prompt: 'test', width: 1024, height: 1024 }),
    ).rejects.toThrow('No image returned from fal.ai');
  });

  it('sends correct authorization header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        images: [{ url: 'https://fal.ai/generated/image.png' }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createFalAdapter('my-fal-key');
    await adapter.generate({ prompt: 'test', width: 1024, height: 1024 });

    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Key my-fal-key');
  });
});
