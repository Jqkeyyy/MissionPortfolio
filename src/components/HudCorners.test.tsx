import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HudCorners } from './HudCorners';

describe('HudCorners', () => {
  it('is hidden (opacity-0) when inactive', () => {
    render(<HudCorners active={false} />);
    expect(screen.getByTestId('hud-corners').className).toContain('opacity-0');
  });

  it('is visible (opacity-100) when active', () => {
    render(<HudCorners active />);
    expect(screen.getByTestId('hud-corners').className).toContain('opacity-100');
  });

  it('applies converge translate classes to a corner when active and converging', () => {
    const { container } = render(<HudCorners active converge size="md" />);
    const corner = container.querySelector('span');
    expect(corner?.className?.split(' ')).toContain('translate-x-6');
  });

  it('renders smaller corner marks for size="sm"', () => {
    const { container } = render(<HudCorners active size="sm" />);
    const corner = container.querySelector('span');
    expect(corner?.className).toContain('w-2 h-2');
  });

  it('defaults to size="md" corner marks when size is omitted', () => {
    const { container } = render(<HudCorners active />);
    const corner = container.querySelector('span');
    expect(corner?.className).toContain('w-4 h-4');
  });

  it('has pointer-events-none so it never blocks clicks on its parent', () => {
    render(<HudCorners active />);
    expect(screen.getByTestId('hud-corners').className).toContain('pointer-events-none');
  });

  it('does not apply converge translate classes when converge is false', () => {
    const { container } = render(<HudCorners active converge={false} size="md" />);
    const corner = container.querySelector('span');
    expect(corner?.className).not.toContain('translate-x-6');
  });
});
