import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockTranscriptionAdapter } from './mock.adapter';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createMockTranscriptionAdapter', () => {
  it('connects successfully', async () => {
    const adapter = createMockTranscriptionAdapter();
    await adapter.connect('');
    expect(adapter.isConnected()).toBe(true);
  });

  it('delivers final transcripts after configured delay', async () => {
    const callback = vi.fn();
    const adapter = createMockTranscriptionAdapter({
      transcripts: [{ text: 'hello', delayMs: 100, isFinal: true }],
    });
    adapter.onTranscript(callback);
    await adapter.connect('');

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].text).toBe('hello');
    expect(callback.mock.calls[0][0].isFinal).toBe(true);
  });

  it('delivers partial transcripts', async () => {
    const callback = vi.fn();
    const adapter = createMockTranscriptionAdapter({
      transcripts: [{ text: 'hel', delayMs: 50, isFinal: false }],
    });
    adapter.onPartialTranscript(callback);
    await adapter.connect('');

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].isFinal).toBe(false);
  });

  it('delivers multiple transcripts sequentially', async () => {
    const callback = vi.fn();
    const adapter = createMockTranscriptionAdapter({
      transcripts: [
        { text: 'first', delayMs: 100 },
        { text: 'second', delayMs: 100 },
      ],
    });
    adapter.onTranscript(callback);
    await adapter.connect('');

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('disconnects and stops delivering', async () => {
    const callback = vi.fn();
    const adapter = createMockTranscriptionAdapter({
      transcripts: [{ text: 'hello', delayMs: 200 }],
    });
    adapter.onTranscript(callback);
    await adapter.connect('');

    adapter.disconnect();
    expect(adapter.isConnected()).toBe(false);

    vi.advanceTimersByTime(200);
    expect(callback).not.toHaveBeenCalled();
  });

  it('sendAudio is a no-op', async () => {
    const adapter = createMockTranscriptionAdapter();
    await adapter.connect('');
    expect(() => adapter.sendAudio(new Float32Array([0.1]))).not.toThrow();
  });
});
