import type { TranscriptionAdapter, TranscriptCallback } from './transcription.interface';
import type { TranscriptResult } from './types';

export function createElevenLabsAdapter(): TranscriptionAdapter {
  let ws: WebSocket | null = null;
  let connected = false;
  let transcriptCallback: TranscriptCallback | null = null;
  let partialCallback: TranscriptCallback | null = null;

  const connect = async (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2&audio_format=pcm_16000&commit_strategy=vad`;

      ws = new WebSocket(url, {
        headers: { 'xi-api-key': apiKey },
      } as unknown as string[]);

      ws.onopen = (): void => {
        connected = true;
        resolve();
      };

      ws.onerror = (): void => {
        connected = false;
        reject(new Error('ElevenLabs WebSocket connection failed'));
      };

      ws.onclose = (): void => {
        connected = false;
      };

      ws.onmessage = (event: MessageEvent): void => {
        const startTime = performance.now();
        try {
          const data = JSON.parse(event.data as string) as {
            message_type?: string;
            text?: string;
          };

          if (!data.text) return;

          if (data.message_type === 'committed_transcript' && transcriptCallback) {
            const result: TranscriptResult = {
              text: data.text,
              isFinal: true,
              confidence: 0.95,
              durationMs: performance.now() - startTime,
            };
            transcriptCallback(result);
          } else if (data.message_type === 'partial_transcript' && partialCallback) {
            const result: TranscriptResult = {
              text: data.text,
              isFinal: false,
              confidence: 0.8,
              durationMs: performance.now() - startTime,
            };
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

    const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

    const message = JSON.stringify({
      message_type: 'input_audio_chunk',
      audio_base_64: base64,
    });

    ws.send(message);
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
