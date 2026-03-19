'use client';

import { useEffect, useState } from 'react';

import type { SessionPhase } from '@/types/session';

interface DebugOverlayProps {
  currentPhase: SessionPhase;
  lastClassification: string | null;
  activeTemplate: string | null;
  lastPrompt: string | null;
  transcript: string;
}

export function DebugOverlay({
  currentPhase,
  lastClassification,
  activeTemplate,
  lastPrompt,
  transcript,
}: DebugOverlayProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-testid="debug-overlay"
      className="fixed top-4 left-4 z-50 max-h-[80vh] w-96 overflow-y-auto rounded-lg bg-black/80 p-4 font-mono text-xs text-white backdrop-blur-sm"
    >
      <h3 className="mb-2 text-sm font-bold">Debug Panel</h3>
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Phase:</span> {currentPhase}
        </div>
        <div>
          <span className="text-gray-400">Classification:</span>{' '}
          {lastClassification ?? 'None'}
        </div>
        <div>
          <span className="text-gray-400">Template:</span>{' '}
          {activeTemplate ? 'Active' : 'None'}
        </div>
        <div>
          <span className="text-gray-400">Last Prompt:</span>{' '}
          {lastPrompt ?? 'None'}
        </div>
        <div>
          <span className="text-gray-400">Transcript:</span>
          <pre className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-green-400">
            {transcript || 'No transcript yet'}
          </pre>
        </div>
      </div>
    </div>
  );
}
