import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ControlOverlay } from './ControlOverlay';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('ControlOverlay', () => {
  it('renders Start Session button when idle', () => {
    render(<ControlOverlay status="idle" onStartSession={vi.fn()} onStopSession={vi.fn()} />);
    expect(screen.getByTestId('start-session-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('stop-session-btn')).not.toBeInTheDocument();
  });

  it('renders Stop Session button when in session', () => {
    render(<ControlOverlay status="listening" onStartSession={vi.fn()} onStopSession={vi.fn()} />);
    expect(screen.getByTestId('stop-session-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('start-session-btn')).not.toBeInTheDocument();
  });

  it('calls onStartSession when Start button is clicked', () => {
    const onStart = vi.fn();
    render(<ControlOverlay status="idle" onStartSession={onStart} onStopSession={vi.fn()} />);
    fireEvent.click(screen.getByTestId('start-session-btn'));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('calls onStopSession when Stop button is clicked', () => {
    const onStop = vi.fn();
    render(<ControlOverlay status="listening" onStartSession={vi.fn()} onStopSession={onStop} />);
    fireEvent.click(screen.getByTestId('stop-session-btn'));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('auto-hides after 3 seconds of inactivity', () => {
    render(<ControlOverlay status="idle" onStartSession={vi.fn()} onStopSession={vi.fn()} />);
    const overlay = screen.getByTestId('control-overlay');
    expect(overlay.className).toContain('opacity-100');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(overlay.className).toContain('opacity-0');
  });

  it('reappears on mouse movement', () => {
    render(<ControlOverlay status="idle" onStartSession={vi.fn()} onStopSession={vi.fn()} />);
    const overlay = screen.getByTestId('control-overlay');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(overlay.className).toContain('opacity-0');

    act(() => {
      fireEvent.mouseMove(window);
    });
    expect(overlay.className).toContain('opacity-100');
  });
});
