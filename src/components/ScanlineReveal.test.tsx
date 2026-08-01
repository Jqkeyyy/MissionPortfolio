import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ScanlineReveal } from './ScanlineReveal';

describe('ScanlineReveal', () => {
  it('renders its children', () => {
    render(
      <ScanlineReveal>
        <p>Reveal me</p>
      </ScanlineReveal>
    );
    expect(screen.getByText('Reveal me')).toBeInTheDocument();
  });

  it('renders children when active is explicitly false', () => {
    render(
      <ScanlineReveal active={false}>
        <p>Still present</p>
      </ScanlineReveal>
    );
    expect(screen.getByText('Still present')).toBeInTheDocument();
  });

  it('starts fully clipped when active is false', () => {
    const { container } = render(
      <ScanlineReveal active={false}>
        <p>Clipped</p>
      </ScanlineReveal>
    );
    expect(container.firstChild).toHaveStyle({ clipPath: 'inset(0 100% 0 0)' });
  });

  it('re-triggers the reveal when active flips from false to true', async () => {
    const { container, rerender } = render(
      <ScanlineReveal active={false}>
        <p>Revealed</p>
      </ScanlineReveal>
    );
    expect(container.firstChild).toHaveStyle({ clipPath: 'inset(0 100% 0 0)' });

    rerender(
      <ScanlineReveal active>
        <p>Revealed</p>
      </ScanlineReveal>
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveStyle({ clipPath: 'inset(0 0% 0 0)' });
    });
  });
});
