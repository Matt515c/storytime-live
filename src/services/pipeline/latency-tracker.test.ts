import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLatencyTracker } from './latency-tracker';

beforeEach(() => {
  let now = 0;
  vi.stubGlobal('performance', {
    now: vi.fn(() => {
      now += 100;
      return now;
    }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createLatencyTracker', () => {
  it('tracks start and end of stages', () => {
    const tracker = createLatencyTracker();
    tracker.start('classification');
    const duration = tracker.end('classification');
    expect(duration).toBeGreaterThan(0);
  });

  it('returns 0 for unstarted stages', () => {
    const tracker = createLatencyTracker();
    expect(tracker.end('unknown')).toBe(0);
  });

  it('reports metrics', () => {
    const tracker = createLatencyTracker();
    tracker.start('classification');
    tracker.end('classification');

    const metrics = tracker.getMetrics();
    expect(metrics.transcriptToClassification).toBeGreaterThan(0);
  });

  it('resets all metrics', () => {
    const tracker = createLatencyTracker();
    tracker.start('classification');
    tracker.end('classification');
    tracker.reset();

    const metrics = tracker.getMetrics();
    expect(metrics.transcriptToClassification).toBeNull();
  });
});
