import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { planets } from '@/data/planets';
import { PlanetLandingShip } from './PlanetLandingShip';

describe('PlanetLandingShip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('targets the selected planet landing pad and renders the shuttle', () => {
    const targetRef = createRef<HTMLSpanElement>();
    const target = document.createElement('span');
    target.getBoundingClientRect = () => ({
      x: 240,
      y: 520,
      left: 240,
      top: 520,
      right: 241,
      bottom: 521,
      width: 1,
      height: 1,
      toJSON: () => ({}),
    });
    document.body.appendChild(target);
    Object.defineProperty(targetRef, 'current', { value: target });

    const mars = planets.find((planet) => planet.id === 'mars')!;
    const { container } = render(<PlanetLandingShip planet={mars} targetRef={targetRef} />);

    act(() => {
      vi.advanceTimersByTime(1400);
    });

    expect(container.querySelector('[data-planet-landing="mars"]')).toHaveAttribute('data-landing-state');
    expect(container.querySelector('img')).toHaveAttribute('src', '/mission-shuttle.png');
    expect(container.querySelector('[data-flight-facing="left"]')).toHaveStyle({
      transform: 'scaleX(-1)',
    });

    target.remove();
  });
});
