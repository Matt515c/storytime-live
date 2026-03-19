import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { StatusIndicator } from './StatusIndicator';

afterEach(() => {
  cleanup();
});

describe('StatusIndicator', () => {
  it('shows idle state with gray dot', () => {
    render(<StatusIndicator status="idle" />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
    const dot = screen.getByTestId('status-dot');
    expect(dot.className).toContain('bg-gray-400');
    expect(dot.className).not.toContain('animate-pulse');
  });

  it('shows listening state with green pulsing dot', () => {
    render(<StatusIndicator status="listening" />);
    expect(screen.getByText('Listening')).toBeInTheDocument();
    const dot = screen.getByTestId('status-dot');
    expect(dot.className).toContain('bg-green-500');
    expect(dot.className).toContain('animate-pulse');
  });

  it('shows processing state with yellow dot', () => {
    render(<StatusIndicator status="processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
    const dot = screen.getByTestId('status-dot');
    expect(dot.className).toContain('bg-yellow-500');
  });

  it('shows generating state with blue dot', () => {
    render(<StatusIndicator status="generating" />);
    expect(screen.getByText('Generating')).toBeInTheDocument();
    const dot = screen.getByTestId('status-dot');
    expect(dot.className).toContain('bg-blue-500');
  });
});
