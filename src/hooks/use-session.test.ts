import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SessionPhase } from '@/types/session';

import { useSession } from './use-session';

describe('useSession', () => {
  it('initializes with idle status and CHARACTER_CREATION phase', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.sessionState.sessionStatus).toBe('idle');
    expect(result.current.sessionState.currentPhase).toBe(SessionPhase.CHARACTER_CREATION);
  });

  it('starts session with listening status', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.startSession();
    });
    expect(result.current.sessionState.sessionStatus).toBe('listening');
  });

  it('stops session and resets state', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.startSession();
    });
    act(() => {
      result.current.stopSession();
    });
    expect(result.current.sessionState.sessionStatus).toBe('idle');
    expect(result.current.sessionState.currentSceneImage).toBeNull();
  });

  it('updates status', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.updateStatus('processing');
    });
    expect(result.current.sessionState.sessionStatus).toBe('processing');
  });

  it('updates phase', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.updatePhase(SessionPhase.ACTIVE_STORYTELLING);
    });
    expect(result.current.sessionState.currentPhase).toBe(SessionPhase.ACTIVE_STORYTELLING);
  });

  it('updates scene image', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.updateSceneImage('/new-scene.png');
    });
    expect(result.current.sessionState.currentSceneImage).toBe('/new-scene.png');
  });
});
