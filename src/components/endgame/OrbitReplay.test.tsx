import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrbitReplay } from './OrbitReplay';

afterEach(() => {
  vi.useRealTimers();
});

describe('OrbitReplay', () => {
  it('recaps completed destinations and exposes portfolio statistics', () => {
    render(
      <OrbitReplay
        open
        initialPlaying={false}
        onOpenChange={() => {}}
        visitedPlanetIds={['sun', 'saturn', 'uranus']}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Mission Orbit Replay');
    expect(screen.getByRole('heading', { name: 'Welcome, Pilot' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Portfolio mission statistics' })).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: 'Play autopilot' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Next destination' }));
    expect(screen.getByRole('heading', { name: 'Fantasy Football Decision-Support Platform' })).toBeInTheDocument();
  });

  it('advances automatically, pauses, and reports completion', () => {
    vi.useFakeTimers();
    const onReplayComplete = vi.fn();
    render(
      <OrbitReplay
        open
        autoPlayIntervalMs={250}
        onOpenChange={() => {}}
        onReplayComplete={onReplayComplete}
        visitedPlanetIds={['sun', 'mercury']}
      />,
    );

    expect(screen.getByRole('button', { name: 'Pause autopilot' })).toHaveAttribute('aria-pressed', 'true');
    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByRole('heading', { name: 'UW-Whitewater' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(250));
    expect(onReplayComplete).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Play autopilot' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts paused and keeps manual navigation available for reduced motion', () => {
    render(
      <OrbitReplay
        open
        reducedMotion
        onOpenChange={() => {}}
        visitedPlanetIds={['sun', 'saturn']}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('data-reduced-motion', 'true');
    expect(screen.getByRole('button', { name: 'Play autopilot' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next destination' }));
    expect(screen.getByRole('heading', { name: 'Fantasy Football Decision-Support Platform' })).toBeInTheDocument();
  });

  it('keeps a direct exit available and handles an empty route', () => {
    const onOpenChange = vi.fn();
    render(<OrbitReplay open onOpenChange={onOpenChange} visitedPlanetIds={[]} />);

    expect(screen.getByRole('heading', { name: 'No flight path recorded' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next destination' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Exit replay' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
