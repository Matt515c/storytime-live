export interface AudioChunkCallback {
  (chunk: Float32Array): void;
}

export interface AudioStreamProcessor {
  start: () => void;
  stop: () => void;
}

const BUFFER_SIZE = 4096;

export function createAudioStreamProcessor(
  stream: MediaStream,
  onChunk: AudioChunkCallback,
): AudioStreamProcessor {
  let audioContext: AudioContext | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let processorNode: ScriptProcessorNode | null = null;

  const start = (): void => {
    audioContext = new AudioContext({ sampleRate: 16000 });
    sourceNode = audioContext.createMediaStreamSource(stream);
    processorNode = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    processorNode.onaudioprocess = (event: AudioProcessingEvent): void => {
      const inputData = event.inputBuffer.getChannelData(0);
      const chunk = new Float32Array(inputData.length);
      chunk.set(inputData);
      onChunk(chunk);
    };

    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);
  };

  const stop = (): void => {
    if (processorNode) {
      processorNode.disconnect();
      processorNode.onaudioprocess = null;
      processorNode = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (audioContext) {
      void audioContext.close();
      audioContext = null;
    }
  };

  return { start, stop };
}
