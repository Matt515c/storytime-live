'use client';

import { useCallback, useRef, useState } from 'react';

import { ControlOverlay } from '@/components/ControlOverlay';
import { DebugOverlay } from '@/components/DebugOverlay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SessionDisplay } from '@/components/SessionDisplay';
import { useSession } from '@/hooks/use-session';
import type { SessionStatus } from '@/types/session';

export default function Home() {
  const { sessionState, startSession, stopSession, updateStatus, updateSceneImage } = useSession();
  const [lastClassification, setLastClassification] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const pipelineRef = useRef<{
    processTranscript: (t: string) => Promise<void>;
  } | null>(null);

  const handleStartSession = useCallback(async (): Promise<void> => {
    startSession();

    const [
      { createMockInterpretationAdapter },
      { createMockImageAdapter },
      { createMockPromptConstructor },
      { createMockTemplateManager },
      { createSessionStateManager },
      { createStoryPipeline },
    ] = await Promise.all([
      import('@/services/interpretation'),
      import('@/services/image-generation'),
      import('@/services/prompt-construction'),
      import('@/services/template-manager'),
      import('@/services/session-state'),
      import('@/services/pipeline'),
    ]);

    const stateManager = createSessionStateManager();
    stateManager.updateStatus('listening');

    const pipeline = createStoryPipeline({
      interpretationAdapter: createMockInterpretationAdapter(),
      imageAdapter: createMockImageAdapter({ delayMs: 500 }),
      promptConstructor: createMockPromptConstructor(),
      templateManager: createMockTemplateManager(),
      stateManager,
      apiKey: '',
      onImageGenerated: (imageUrl: string) => {
        updateSceneImage(imageUrl);
      },
      onStatusChange: (status: SessionStatus) => {
        updateStatus(status);
      },
    });

    pipelineRef.current = pipeline;
  }, [startSession, updateSceneImage, updateStatus]);

  const handleStopSession = useCallback((): void => {
    pipelineRef.current = null;
    stopSession();
    setLastClassification(null);
    setLastPrompt(null);
    setTranscript('');
  }, [stopSession]);

  void lastPrompt;
  void setLastClassification;
  void setLastPrompt;
  void setTranscript;

  return (
    <ErrorBoundary>
      <SessionDisplay
        imageUrl={sessionState.currentSceneImage}
        isLoading={sessionState.sessionStatus === 'generating'}
      />
      <ControlOverlay
        status={sessionState.sessionStatus}
        onStartSession={() => void handleStartSession()}
        onStopSession={handleStopSession}
      />
      <DebugOverlay
        currentPhase={sessionState.currentPhase}
        lastClassification={lastClassification}
        activeTemplate={sessionState.activeTemplate}
        lastPrompt={lastPrompt}
        transcript={transcript}
      />
    </ErrorBoundary>
  );
}
