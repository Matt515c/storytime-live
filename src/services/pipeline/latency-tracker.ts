export interface LatencyMetrics {
  transcriptToClassification: number | null;
  classificationToPrompt: number | null;
  promptToImageRequest: number | null;
  imageRequestToImage: number | null;
  imageToDisplay: number | null;
  endToEnd: number | null;
}

export interface LatencyTracker {
  start: (stage: string) => void;
  end: (stage: string) => number;
  getMetrics: () => LatencyMetrics;
  reset: () => void;
}

export function createLatencyTracker(): LatencyTracker {
  const timers = new Map<string, number>();
  const durations = new Map<string, number>();

  const start = (stage: string): void => {
    timers.set(stage, performance.now());
  };

  const end = (stage: string): number => {
    const startTime = timers.get(stage);
    if (startTime === undefined) return 0;
    const duration = performance.now() - startTime;
    durations.set(stage, duration);
    timers.delete(stage);
    return duration;
  };

  const getMetrics = (): LatencyMetrics => ({
    transcriptToClassification: durations.get('classification') ?? null,
    classificationToPrompt: durations.get('promptConstruction') ?? null,
    promptToImageRequest: durations.get('imageRequest') ?? null,
    imageRequestToImage: durations.get('imageGeneration') ?? null,
    imageToDisplay: durations.get('display') ?? null,
    endToEnd: durations.get('endToEnd') ?? null,
  });

  const reset = (): void => {
    timers.clear();
    durations.clear();
  };

  return { start, end, getMetrics, reset };
}
