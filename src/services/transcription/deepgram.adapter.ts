import type { TranscriptionAdapter, TranscriptCallback } from './transcription.interface';
import type { TranscriptResult } from './types';

export function createDeepgramAdapter(): TranscriptionAdapter {
  let ws: WebSocket | null = null;
  let connected = false;
  let transcriptCallback: TranscriptCallback | null = null;
  let partialCallback: TranscriptCallback | null = null;

  const connect = async (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&model=nova-2&punctuate=true&interim_results=true`;

      ws = new WebSocket(url, ['token', apiKey]);

      ws.onopen = (): void => {
        connected = true;
        resolve();
      };

      ws.onerror = (): void => {
        connected = false;
        reject(new Error('Deepgram WebSocket connection failed'));
      };

      ws.onclose = (): void => {
        connected = false;
      };

      ws.onmessage = (event: MessageEvent): void => {
        const startTime = performance.now();
        try {
          const data = JSON.parse(event.data as string) as {
            channel?: {
              alternatives?: Array<{ transcript?: string; confidence?: number }>;
            };
            is_final?: boolean;
          };
          const transcript = data.channel?.alternatives?.[0]?.transcript ?? '';
          const confidence = data.channel?.alternatives?.[0]?.confidence ?? 0;
          const isFinal = data.is_final ?? false;

          if (!transcript) return;

          const result: TranscriptResult = {
            text: transcript,
            isFinal,
            confidence,
            durationMs: performance.now() - startTime,
          };

          if (isFinal && transcriptCallback) {
            transcriptCallback(result);
          } else if (!isFinal && partialCallback) {
            partialCallback(result);
          }
        } catch {
          // Ignore non-JSON messages
        }
      };
    });
  };

  const disconnect = (): void => {
    if (ws) {
      ws.close();
      ws = null;
    }
    connected = false;
  };

  const sendAudio = (chunk: Float32Array): void => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const pcm16 = new Int16Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      const s = Math.max(-1, Math.min(1, chunk[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    ws.send(pcm16.buffer);
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
