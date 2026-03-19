import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialSessionState } from '@/types/session';

import {
  buildFallbackPrompt,
  createAnthropicPromptConstructor,
  createMockPromptConstructor,
} from './prompt-constructor';

beforeEach(() => {
  vi.stubGlobal('performance', { now: vi.fn(() => 0) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildFallbackPrompt', () => {
  it('appends art style suffix', () => {
    const result = buildFallbackPrompt('a red dragon');
    expect(result).toContain('a red dragon');
    expect(result).toContain('storybook illustration style');
  });
});

describe('createMockPromptConstructor', () => {
  it('returns fallback prompt', async () => {
    const constructor = createMockPromptConstructor();
    const result = await constructor.constructPrompt('a red dragon', createInitialSessionState());
    expect(result).toContain('a red dragon');
    expect(result).toContain('storybook illustration');
  });
});

describe('createAnthropicPromptConstructor', () => {
  it('constructs prompt via API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                prompt: 'A majestic red dragon with shimmering scales, storybook illustration',
              }),
            },
          ],
        }),
      }),
    );

    const constructor = createAnthropicPromptConstructor('test-key');
    const result = await constructor.constructPrompt(
      'a red dragon',
      createInitialSessionState(),
    );
    expect(result).toContain('dragon');
  });

  it('returns fallback on API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const constructor = createAnthropicPromptConstructor('test-key');
    const result = await constructor.constructPrompt(
      'a red dragon',
      createInitialSessionState(),
    );
    expect(result).toContain('a red dragon');
    expect(result).toContain('storybook illustration');
  });

  it('returns fallback on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const constructor = createAnthropicPromptConstructor('test-key');
    const result = await constructor.constructPrompt('test', createInitialSessionState());
    expect(result).toContain('test');
  });
});
