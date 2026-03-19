import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAudioStreamProcessor } from './audio-stream';

const mockDisconnect = vi.fn();
const mockConnect = vi.fn();
const mockClose = vi.fn().mockResolvedValue(undefined);

let audioProcessHandler: ((event: AudioProcessingEvent) => void) | null = null;

const mockProcessorNode = {
  connect: mockConnect,
  disconnect: mockDisconnect,
  set onaudioprocess(handler: ((event: AudioProcessingEvent) => void) | null) {
    audioProcessHandler = handler;
  },
  get onaudioprocess() {
    return audioProcessHandler;
  },
};

const mockSourceNode = {
  connect: mockConnect,
  disconnect: mockDisconnect,
};

const mockAudioContext = {
  createMediaStreamSource: vi.fn(() => mockSourceNode),
  createScriptProcessor: vi.fn(() => mockProcessorNode),
  close: mockClose,
  destination: {},
};

const mockStream = {} as MediaStream;

beforeEach(() => {
  vi.stubGlobal(
    'AudioContext',
    vi.fn(() => mockAudioContext),
  );
  audioProcessHandler = null;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createAudioStreamProcessor', () => {
  it('creates a processor with start and stop methods', () => {
    const processor = createAudioStreamProcessor(mockStream, vi.fn());
    expect(processor.start).toBeTypeOf('function');
    expect(processor.stop).toBeTypeOf('function');
  });

  it('creates AudioContext with 16kHz sample rate on start', () => {
    const processor = createAudioStreamProcessor(mockStream, vi.fn());
    processor.start();
    expect(AudioContext).toHaveBeenCalledWith({ sampleRate: 16000 });
  });

  it('connects source to processor to destination', () => {
    const processor = createAudioStreamProcessor(mockStream, vi.fn());
    processor.start();
    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(mockStream);
    expect(mockConnect).toHaveBeenCalled();
  });

  it('calls onChunk with audio data when audio is processed', () => {
    const onChunk = vi.fn();
    const processor = createAudioStreamProcessor(mockStream, onChunk);
    processor.start();

    const fakeData = new Float32Array([0.1, 0.2, 0.3]);
    const fakeEvent = {
      inputBuffer: {
        getChannelData: () => fakeData,
      },
    } as unknown as AudioProcessingEvent;

    audioProcessHandler?.(fakeEvent);
    expect(onChunk).toHaveBeenCalledOnce();
    const chunk = onChunk.mock.calls[0][0] as Float32Array;
    expect(chunk).toBeInstanceOf(Float32Array);
    expect(chunk.length).toBe(3);
  });

  it('disconnects and closes on stop', () => {
    const processor = createAudioStreamProcessor(mockStream, vi.fn());
    processor.start();
    processor.stop();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });
});
