import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SessionPhase } from '@/types/session';

import { DebugOverlay } from './DebugOverlay';

afterEach(() => {
  cleanup();
});

const defaultProps = {
  currentPhase: SessionPhase.CHARACTER_CREATION,
  lastClassification: null,
  activeTemplate: null,
  lastPrompt: null,
  transcript: '',
};

describe('DebugOverlay', () => {
  it('is hidden by default', () => {
    render(<DebugOverlay {...defaultProps} />);
    expect(screen.queryByTestId('debug-overlay')).not.toBeInTheDocument();
  });

  it('appears when Ctrl+Shift+D is pressed', () => {
    render(<DebugOverlay {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByTestId('debug-overlay')).toBeInTheDocument();
  });

  it('toggles off when Ctrl+Shift+D is pressed again', () => {
    render(<DebugOverlay {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByTestId('debug-overlay')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.queryByTestId('debug-overlay')).not.toBeInTheDocument();
  });

  it('displays current phase', () => {
    render(<DebugOverlay {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByText('CHARACTER_CREATION')).toBeInTheDocument();
  });

  it('displays classification when provided', () => {
    render(<DebugOverlay {...defaultProps} lastClassification="CREATIVE_DIRECTIVE" />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByText('CREATIVE_DIRECTIVE')).toBeInTheDocument();
  });

  it('displays template status', () => {
    render(<DebugOverlay {...defaultProps} activeTemplate="some template" />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays transcript', () => {
    render(<DebugOverlay {...defaultProps} transcript="Hello children" />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    expect(screen.getByText('Hello children')).toBeInTheDocument();
  });

  it('does not toggle on unrelated key presses', () => {
    render(<DebugOverlay {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: false, shiftKey: true });
    expect(screen.queryByTestId('debug-overlay')).not.toBeInTheDocument();
  });
});
