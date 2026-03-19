'use client';

import { ControlOverlay } from '@/components/ControlOverlay';
import { DebugOverlay } from '@/components/DebugOverlay';
import { SessionDisplay } from '@/components/SessionDisplay';
import { useSession } from '@/hooks/use-session';

export default function Home() {
  const { sessionState, startSession, stopSession } = useSession();

  return (
    <>
      <SessionDisplay
        imageUrl={sessionState.currentSceneImage}
        isLoading={sessionState.sessionStatus === 'generating'}
      />
      <ControlOverlay
        status={sessionState.sessionStatus}
        onStartSession={startSession}
        onStopSession={stopSession}
      />
      <DebugOverlay
        currentPhase={sessionState.currentPhase}
        lastClassification={null}
        activeTemplate={sessionState.activeTemplate}
        lastPrompt={null}
        transcript=""
      />
    </>
  );
}
