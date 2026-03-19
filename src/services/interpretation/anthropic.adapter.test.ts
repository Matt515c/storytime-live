import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialSessionState } from '@/types/session';

import { createAnthropicInterpretationAdapter } from './anthropic.adapter';
import { IntentType } from './types';

beforeEach(() => {
  vi.stubGlobal('performance', { now: vi.fn(() => 0) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createAnthropicInterpretationAdapter', () => {
  it('classifies transcript using Anthropic API', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              intent: 'CREATIVE_DIRECTIVE',
              confidence: 0.95,
              extractedDescription: 'a red dragon',
              reasoning: 'Character creation description',
            }),
          },
        ],
      }),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const adapter = createAnthropicInterpretationAdapter('test-key');
    const result = await adapter.classify('Our hero is a red dragon', createInitialSessionState());

    expect(result.intent).toBe(IntentType.CREATIVE_DIRECTIVE);
    expect(result.confidence).toBe(0.95);
  });

  it('returns fallback on API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const adapter = createAnthropicInterpretationAdapter('test-key');
    const result = await adapter.classify('test', createInitialSessionState());

    expect(result.intent).toBe(IntentType.CONVERSATION);
  });

  it('returns fallback on invalid JSON response', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'not valid json' }],
      }),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const adapter = createAnthropicInterpretationAdapter('test-key');
    const result = await adapter.classify('test', createInitialSessionState());

    expect(result.intent).toBe(IntentType.CONVERSATION);
  });

  it('returns fallback on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const adapter = createAnthropicInterpretationAdapter('test-key');
    const result = await adapter.classify('test', createInitialSessionState());

    expect(result.intent).toBe(IntentType.CONVERSATION);
  });

  it('sends correct request to Anthropic API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              intent: 'CONVERSATION',
              confidence: 0.8,
              reasoning: 'test',
            }),
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createAnthropicInterpretationAdapter('my-api-key');
    await adapter.classify('hello', createInitialSessionState());

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'my-api-key',
        }),
      }),
    );
  });
});
