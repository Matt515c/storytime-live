'use client';

import { useEffect, useRef, useState } from 'react';

import type { SessionStatus } from '@/types/session';

import { StatusIndicator } from './StatusIndicator';

interface ControlOverlayProps {
  status: SessionStatus;
  onStartSession: () => void;
  onStopSession: () => void;
}

const AUTO_HIDE_DELAY = 3000;

export function ControlOverlay({
  status,
  onStartSession,
  onStopSession,
}: ControlOverlayProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const startHideTimer = (): void => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, AUTO_HIDE_DELAY);
    };

    const handleMouseMove = (): void => {
      setIsVisible(true);
      startHideTimer();
    };

    startHideTimer();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isInSession = status !== 'idle';

  return (
    <div
      data-testid="control-overlay"
      className={`fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-black/60 px-4 py-3 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <StatusIndicator status={status} />
      {!isInSession ? (
        <button
          data-testid="start-session-btn"
          onClick={onStartSession}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Start Session
        </button>
      ) : (
        <button
          data-testid="stop-session-btn"
          onClick={onStopSession}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Stop Session
        </button>
      )}
    </div>
  );
}
