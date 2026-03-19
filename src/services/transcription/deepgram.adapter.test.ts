import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDeepgramAdapter } from './deepgram.adapter';

let mockWsInstance: {
  onopen: (() => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  close: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  readyState: number;
};

beforeEach(() => {
  mockWsInstance = {
    onopen: null,
    onerror: null,
    onclose: null,
    onmessage: null,
    close: vi.fn(),
    send: vi.fn(),
    readyState: 1, // OPEN
  };

  vi.stubGlobal(
    'WebSocket',
    vi.fn(() => mockWsInstance),
  );
  Object.defineProperty(globalThis, 'WebSocket', {
    value: Object.assign(vi.fn(() => mockWsInstance), { OPEN: 1 }),
    writable: true,
  });

  vi.stubGlobal('performance', { now: vi.fn(() => 0) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createDeepgramAdapter', () => {
  it('connects via WebSocket', async () => {
    const adapter = createDeepgramAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;
    expect(adapter.isConnected()).toBe(true);
  });

  it('rejects on connection error', async () => {
    const adapter = createDeepgramAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onerror?.();
    await expect(connectPromise).rejects.toThrow('Deepgram WebSocket connection failed');
  });

  it('calls transcriptCallback on final transcript', async () => {
    const adapter = createDeepgramAdapter();
    const callback = vi.fn();
    adapter.onTranscript(callback);

    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    mockWsInstance.onmessage?.({
      data: JSON.stringify({
        channel: { alternatives: [{ transcript: 'hello world', confidence: 0.98 }] },
        is_final: true,
      }),
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].text).toBe('hello world');
    expect(callback.mock.calls[0][0].isFinal).toBe(true);
  });

  it('calls partialCallback on interim transcript', async () => {
    const adapter = createDeepgramAdapter();
    const callback = vi.fn();
    adapter.onPartialTranscript(callback);

    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    mockWsInstance.onmessage?.({
      data: JSON.stringify({
        channel: { alternatives: [{ transcript: 'hel', confidence: 0.7 }] },
        is_final: false,
      }),
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].isFinal).toBe(false);
  });

  it('ignores empty transcripts', async () => {
    const adapter = createDeepgramAdapter();
    const callback = vi.fn();
    adapter.onTranscript(callback);

    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    mockWsInstance.onmessage?.({
      data: JSON.stringify({
        channel: { alternatives: [{ transcript: '', confidence: 0 }] },
        is_final: true,
      }),
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('sends audio as PCM16', async () => {
    const adapter = createDeepgramAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    const chunk = new Float32Array([0.5, -0.5]);
    adapter.sendAudio(chunk);
    expect(mockWsInstance.send).toHaveBeenCalledOnce();
  });

  it('disconnects properly', async () => {
    const adapter = createDeepgramAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    adapter.disconnect();
    expect(mockWsInstance.close).toHaveBeenCalledOnce();
    expect(adapter.isConnected()).toBe(false);
  });
});
