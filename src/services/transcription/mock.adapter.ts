import type { TranscriptionAdapter, TranscriptCallback } from './transcription.interface';
import type { TranscriptResult } from './types';

interface MockAdapterOptions {
  transcripts?: Array<{ text: string; delayMs?: number; isFinal?: boolean }>;
}

export function createMockTranscriptionAdapter(
  options: MockAdapterOptions = {},
): TranscriptionAdapter {
  let connected = false;
  let transcriptCallback: TranscriptCallback | null = null;
  let partialCallback: TranscriptCallback | null = null;
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  const connect = async (): Promise<void> => {
    connected = true;

    if (options.transcripts) {
      let cumulativeDelay = 0;
      for (const t of options.transcripts) {
        cumulativeDelay += t.delayMs ?? 100;
        const isFinal = t.isFinal ?? true;
        const timeout = setTimeout(() => {
          const result: TranscriptResult = {
            text: t.text,
            isFinal,
            confidence: 0.95,
            durationMs: t.delayMs ?? 100,
          };
          if (isFinal && transcriptCallback) {
            transcriptCallback(result);
          } else if (!isFinal && partialCallback) {
            partialCallback(result);
          }
        }, cumulativeDelay);
        timeouts.push(timeout);
      }
    }
  };

  const disconnect = (): void => {
    connected = false;
    for (const t of timeouts) {
      clearTimeout(t);
    }
    timeouts = [];
  };

  const sendAudio = (): void => {
    // Mock: no-op
  };

  const onTranscript = (callback: TranscriptCallback): void => {
    transcriptCallback = callback;
  };

  const onPartialTranscript = (callback: TranscriptCallback): void => {
    partialCallback = callback;
  };

  const isConnected = (): boolean => connected;

  return {
    connect,
    disconnect,
    sendAudio,
    onTranscript,
    onPartialTranscript,
    isConnected,
  };
}
