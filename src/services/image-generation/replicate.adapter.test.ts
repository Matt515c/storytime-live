import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createReplicateAdapter } from './replicate.adapter';

beforeEach(() => {
  vi.stubGlobal('performance', { now: vi.fn(() => 0) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createReplicateAdapter', () => {
  it('generates image via Replicate API with Flux Kontext Pro', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          output: 'https://replicate.delivery/generated/image.png',
          status: 'succeeded',
          error: null,
        }),
      }),
    );

    const adapter = createReplicateAdapter('test-token');
    const result = await adapter.generate({ prompt: 'a dragon', width: 1024, height: 1024 });

    expect(result.url).toBe('https://replicate.delivery/generated/image.png');
    expect(result.durationMs).toBeTypeOf('number');
  });

  it('handles array output format', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          output: ['https://replicate.delivery/generated/image.png'],
          status: 'succeeded',
          error: null,
        }),
      }),
    );

    const adapter = createReplicateAdapter('test-token');
    const result = await adapter.generate({ prompt: 'a dragon', width: 1024, height: 1024 });
    expect(result.url).toBe('https://replicate.delivery/generated/image.png');
  });

  it('includes reference image when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        output: 'https://replicate.delivery/generated/image.png',
        status: 'succeeded',
        error: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createReplicateAdapter('test-token');
    await adapter.generate({
      prompt: 'a dragon in a castle',
      referenceImageUrl: 'https://prev-scene.png',
      width: 1024,
      height: 1024,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as {
      input: Record<string, unknown>;
    };
    expect(body.input.image_url).toBe('https://prev-scene.png');
  });

  it('throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const adapter = createReplicateAdapter('test-token');
    await expect(adapter.generate({ prompt: 'test', width: 1024, height: 1024 })).rejects.toThrow(
      'Replicate API error: 500',
    );
  });

  it('throws on prediction error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          output: null,
          status: 'failed',
          error: 'Model failed',
        }),
      }),
    );

    const adapter = createReplicateAdapter('test-token');
    await expect(adapter.generate({ prompt: 'test', width: 1024, height: 1024 })).rejects.toThrow(
      'Replicate prediction error: Model failed',
    );
  });

  it('throws when no output returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          output: null,
          status: 'succeeded',
          error: null,
        }),
      }),
    );

    const adapter = createReplicateAdapter('test-token');
    await expect(adapter.generate({ prompt: 'test', width: 1024, height: 1024 })).rejects.toThrow(
      'No image returned from Replicate',
    );
  });

  it('sends correct authorization header and uses sync mode', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        output: 'https://replicate.delivery/generated/image.png',
        status: 'succeeded',
        error: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createReplicateAdapter('r8_my-token');
    await adapter.generate({ prompt: 'test', width: 1024, height: 1024 });

    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer r8_my-token');
    expect(headers.Prefer).toBe('wait');
  });

  it('calls the correct Flux Kontext Pro model endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        output: 'https://replicate.delivery/generated/image.png',
        status: 'succeeded',
        error: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createReplicateAdapter('test-token');
    await adapter.generate({ prompt: 'test', width: 1024, height: 1024 });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('flux-kontext-pro');
    expect(url).toContain('replicate.com');
  });
});
