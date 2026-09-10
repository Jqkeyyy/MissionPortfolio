import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventHorizon } from './EventHorizon';

vi.mock('@react-three/fiber', () => ({
  useFrame: () => undefined,
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('EventHorizon', () => {
  it('exposes a keyboard-accessible activation control', () => {
    const onActivate = vi.fn();

    render(
      <EventHorizon
        ariaLabel="Travel through the anomaly"
        onActivate={onActivate}
      />,
    );

    const control = screen.getByRole('button', { name: 'Travel through the anomaly' });
    fireEvent.click(control);

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(screen.getByText('EVENT HORIZON')).toBeInTheDocument();
    expect(screen.getByText('Unknown destination')).toBeInTheDocument();
  });

  it('prevents activation while the destination is disabled', () => {
    const onActivate = vi.fn();

    render(<EventHorizon disabled onActivate={onActivate} />);
    const control = screen.getByRole('button', { name: 'Enter the event horizon' });

    expect(control).toBeDisabled();
    fireEvent.click(control);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('reports keyboard hover state for HUD integration', () => {
    const onHoverChange = vi.fn();

    render(<EventHorizon onHoverChange={onHoverChange} />);
    const control = screen.getByRole('button', { name: 'Enter the event horizon' });
    fireEvent.focus(control);

    expect(onHoverChange).toHaveBeenLastCalledWith(true);

    fireEvent.blur(control);
    expect(onHoverChange).toHaveBeenLastCalledWith(false);
  });
});
