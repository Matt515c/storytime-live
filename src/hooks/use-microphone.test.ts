import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMicrophone } from './use-microphone';

const mockStop = vi.fn();
const mockTrack = { stop: mockStop } as unknown as MediaStreamTrack;
const mockStream = {
  getTracks: () => [mockTrack],
} as unknown as MediaStream;

beforeEach(() => {
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi.fn(),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMicrophone', () => {
  it('initializes with inactive state', () => {
    const { result } = renderHook(() => useMicrophone());
    expect(result.current.stream).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('requests mic-only access via getUserMedia with audio: true, video: false', async () => {
    const getUserMedia = vi.fn().mockResolvedValue(mockStream);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const { result } = renderHook(() => useMicrophone());
    await act(async () => {
      await result.current.startCapture();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(result.current.isActive).toBe(true);
    expect(result.current.stream).toBe(mockStream);
  });

  it('sets error on getUserMedia failure', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const { result } = renderHook(() => useMicrophone());
    await act(async () => {
      await result.current.startCapture();
    });

    expect(result.current.error).toBe('Permission denied');
    expect(result.current.isActive).toBe(false);
  });

  it('stops capture and cleans up tracks', async () => {
    const getUserMedia = vi.fn().mockResolvedValue(mockStream);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const { result } = renderHook(() => useMicrophone());
    await act(async () => {
      await result.current.startCapture();
    });

    act(() => {
      result.current.stopCapture();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.isActive).toBe(false);
    expect(result.current.stream).toBeNull();
  });

  it('cleans up stream on unmount', async () => {
    const getUserMedia = vi.fn().mockResolvedValue(mockStream);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const { result, unmount } = renderHook(() => useMicrophone());
    await act(async () => {
      await result.current.startCapture();
    });

    mockStop.mockClear();
    unmount();
    expect(mockStop).toHaveBeenCalled();
  });
});
