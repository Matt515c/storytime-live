import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SessionDisplay } from './SessionDisplay';

afterEach(() => {
  cleanup();
});

describe('SessionDisplay', () => {
  it('renders empty state with dark background when no image', () => {
    render(<SessionDisplay imageUrl={null} isLoading={false} />);
    const element = screen.getByTestId('session-display-empty');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-label', 'Waiting for story to begin');
  });

  it('renders image when imageUrl is provided', () => {
    render(<SessionDisplay imageUrl="/test-image.png" isLoading={false} />);
    const element = screen.getByTestId('session-display');
    expect(element).toBeInTheDocument();
    const img = screen.getByAltText('Story scene');
    expect(img).toBeInTheDocument();
  });

  it('applies loading opacity when isLoading is true', () => {
    render(<SessionDisplay imageUrl="/test-image.png" isLoading={true} />);
    const img = screen.getByAltText('Story scene');
    expect(img.className).toContain('opacity-0');
  });

  it('applies full opacity when isLoading is false', () => {
    render(<SessionDisplay imageUrl="/test-image.png" isLoading={false} />);
    const img = screen.getByAltText('Story scene');
    expect(img.className).toContain('opacity-100');
  });
});
