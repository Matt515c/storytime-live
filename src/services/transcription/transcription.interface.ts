import type { TranscriptResult } from './types';

export type TranscriptCallback = (result: TranscriptResult) => void;

export interface TranscriptionAdapter {
  connect: (apiKey: string) => Promise<void>;
  disconnect: () => void;
  sendAudio: (chunk: Float32Array) => void;
  onTranscript: (callback: TranscriptCallback) => void;
  onPartialTranscript: (callback: TranscriptCallback) => void;
  isConnected: () => boolean;
}
