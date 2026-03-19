import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createElevenLabsAdapter } from './elevenlabs.adapter';

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
    readyState: 1,
  };

  Object.defineProperty(globalThis, 'WebSocket', {
    value: Object.assign(
      vi.fn(() => mockWsInstance),
      { OPEN: 1 },
    ),
    writable: true,
  });

  vi.stubGlobal('performance', { now: vi.fn(() => 0) });
  vi.stubGlobal(
    'btoa',
    vi.fn(() => 'base64data'),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createElevenLabsAdapter', () => {
  it('connects via WebSocket to ElevenLabs', async () => {
    const adapter = createElevenLabsAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;
    expect(adapter.isConnected()).toBe(true);
  });

  it('rejects on connection error', async () => {
    const adapter = createElevenLabsAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onerror?.();
    await expect(connectPromise).rejects.toThrow('ElevenLabs WebSocket connection failed');
  });

  it('calls transcriptCallback on committed_transcript', async () => {
    const adapter = createElevenLabsAdapter();
    const callback = vi.fn();
    adapter.onTranscript(callback);

    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    mockWsInstance.onmessage?.({
      data: JSON.stringify({
        message_type: 'committed_transcript',
        text: 'hello world',
      }),
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].text).toBe('hello world');
    expect(callback.mock.calls[0][0].isFinal).toBe(true);
  });

  it('calls partialCallback on partial_transcript', async () => {
    const adapter = createElevenLabsAdapter();
    const callback = vi.fn();
    adapter.onPartialTranscript(callback);

    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    mockWsInstance.onmessage?.({
      data: JSON.stringify({
        message_type: 'partial_transcript',
        text: 'hel',
      }),
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].isFinal).toBe(false);
  });

  it('ignores messages without text', async () => {
    const adapter = createElevenLabsAdapter();
    const callback = vi.fn();
    adapter.onTranscript(callback);

    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    mockWsInstance.onmessage?.({
      data: JSON.stringify({
        message_type: 'session_started',
      }),
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('sends audio as base64-encoded JSON message', async () => {
    const adapter = createElevenLabsAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    const chunk = new Float32Array([0.5, -0.5]);
    adapter.sendAudio(chunk);

    expect(mockWsInstance.send).toHaveBeenCalledOnce();
    const sent = JSON.parse(mockWsInstance.send.mock.calls[0][0] as string) as Record<
      string,
      unknown
    >;
    expect(sent.message_type).toBe('input_audio_chunk');
    expect(sent.audio_base_64).toBe('base64data');
  });

  it('disconnects properly', async () => {
    const adapter = createElevenLabsAdapter();
    const connectPromise = adapter.connect('test-key');
    mockWsInstance.onopen?.();
    await connectPromise;

    adapter.disconnect();
    expect(mockWsInstance.close).toHaveBeenCalledOnce();
    expect(adapter.isConnected()).toBe(false);
  });
});
