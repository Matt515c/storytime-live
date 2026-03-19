'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TranscriptionAdapter, TranscriptResult } from '@/services/transcription';

interface UseTranscriptionReturn {
  transcript: string;
  partialTranscript: string;
  isConnected: boolean;
  error: string | null;
  connect: (adapter: TranscriptionAdapter, apiKey: string) => Promise<void>;
  disconnect: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const adapterRef = useRef<TranscriptionAdapter | null>(null);

  const connect = useCallback(async (adapter: TranscriptionAdapter, apiKey: string): Promise<void> => {
    try {
      setError(null);
      adapterRef.current = adapter;

      adapter.onTranscript((result: TranscriptResult) => {
        setTranscript((prev) => (prev ? `${prev} ${result.text}` : result.text));
        setPartialTranscript('');
      });

      adapter.onPartialTranscript((result: TranscriptResult) => {
        setPartialTranscript(result.text);
      });

      await adapter.connect(apiKey);
      setIsConnected(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription connection failed';
      setError(message);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback((): void => {
    if (adapterRef.current) {
      adapterRef.current.disconnect();
      adapterRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      if (adapterRef.current) {
        adapterRef.current.disconnect();
      }
    };
  }, []);

  return { transcript, partialTranscript, isConnected, error, connect, disconnect };
}
