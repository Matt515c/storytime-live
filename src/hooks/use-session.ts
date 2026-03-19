'use client';

import { useCallback, useState } from 'react';

import { createInitialSessionState, SessionPhase } from '@/types/session';
import type { SessionState, SessionStatus } from '@/types/session';

interface UseSessionReturn {
  sessionState: SessionState;
  startSession: () => void;
  stopSession: () => void;
  updateStatus: (status: SessionStatus) => void;
  updatePhase: (phase: SessionPhase) => void;
  updateSceneImage: (imageUrl: string) => void;
}

export function useSession(): UseSessionReturn {
  const [sessionState, setSessionState] = useState<SessionState>(createInitialSessionState);

  const startSession = useCallback((): void => {
    setSessionState((prev) => ({
      ...prev,
      sessionStatus: 'listening',
      currentPhase: SessionPhase.CHARACTER_CREATION,
    }));
  }, []);

  const stopSession = useCallback((): void => {
    setSessionState(createInitialSessionState());
  }, []);

  const updateStatus = useCallback((status: SessionStatus): void => {
    setSessionState((prev) => ({ ...prev, sessionStatus: status }));
  }, []);

  const updatePhase = useCallback((phase: SessionPhase): void => {
    setSessionState((prev) => ({ ...prev, currentPhase: phase }));
  }, []);

  const updateSceneImage = useCallback((imageUrl: string): void => {
    setSessionState((prev) => ({ ...prev, currentSceneImage: imageUrl }));
  }, []);

  return {
    sessionState,
    startSession,
    stopSession,
    updateStatus,
    updatePhase,
    updateSceneImage,
  };
}
