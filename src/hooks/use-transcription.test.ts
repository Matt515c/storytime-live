import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockTranscriptionAdapter } from '@/services/transcription';

import { useTranscription } from './use-transcription';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useTranscription', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useTranscription());
    expect(result.current.transcript).toBe('');
    expect(result.current.partialTranscript).toBe('');
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('connects to adapter', async () => {
    const adapter = createMockTranscriptionAdapter();
    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.connect(adapter, 'key');
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('accumulates final transcripts', async () => {
    const adapter = createMockTranscriptionAdapter({
      transcripts: [
        { text: 'hello', delayMs: 100, isFinal: true },
        { text: 'world', delayMs: 100, isFinal: true },
      ],
    });
    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.connect(adapter, 'key');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.transcript).toBe('hello');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.transcript).toBe('hello world');
  });

  it('shows partial transcripts', async () => {
    const adapter = createMockTranscriptionAdapter({
      transcripts: [{ text: 'hel', delayMs: 50, isFinal: false }],
    });
    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.connect(adapter, 'key');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.partialTranscript).toBe('hel');
  });

  it('disconnects and updates state', async () => {
    const adapter = createMockTranscriptionAdapter();
    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.connect(adapter, 'key');
    });

    act(() => {
      result.current.disconnect();
    });
    expect(result.current.isConnected).toBe(false);
  });
});
