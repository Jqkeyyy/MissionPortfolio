import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  REDUCED_MOTION_TRANSITION_DURATION_MS,
  SOLAR_INTERCEPT_DURATION_MS,
  useGameState,
} from './useGameState';

const setReducedMotion = (matches: boolean) => {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('useGameState accessible travel controls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReducedMotion(false);
    useGameState.setState({
      currentView: 'space',
      selectedPlanet: null,
      previousPlanet: null,
      isTransitioning: false,
      travelDirection: null,
      activeSign: null,
      quickPortfolioOpen: false,
      announcement: 'Solar system map ready.',
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('announces each stage of a planet journey', () => {
    act(() => useGameState.getState().travelToPlanet('mars'));
    expect(useGameState.getState().announcement).toMatch(/destination mars selected/i);

    act(() => vi.advanceTimersByTime(SOLAR_INTERCEPT_DURATION_MS));
    expect(useGameState.getState().announcement).toBe('Close approach to Mars.');
  });

  it('shortens both travel stages when reduced motion is requested', () => {
    setReducedMotion(true);
    act(() => useGameState.getState().travelToPlanet('mars'));

    act(() => vi.advanceTimersByTime(REDUCED_MOTION_TRANSITION_DURATION_MS));
    expect(useGameState.getState().currentView).toBe('traveling');

    act(() => vi.advanceTimersByTime(REDUCED_MOTION_TRANSITION_DURATION_MS));
    expect(useGameState.getState().currentView).toBe('planet');
    expect(useGameState.getState().announcement).toMatch(/arrived at mars/i);
  });

  it('skips travel immediately and ignores the superseded timers', () => {
    act(() => useGameState.getState().travelToPlanet('earth'));
    act(() => useGameState.getState().skipTravel());

    expect(useGameState.getState()).toMatchObject({
      currentView: 'planet',
      selectedPlanet: 'earth',
      isTransitioning: false,
      travelDirection: null,
    });
    expect(useGameState.getState().announcement).toMatch(/travel skipped/i);

    act(() => vi.runAllTimers());
    expect(useGameState.getState().currentView).toBe('planet');
  });

  it('skips a return trip to the solar system', () => {
    useGameState.setState({ currentView: 'planet', selectedPlanet: 'saturn' });
    act(() => useGameState.getState().returnToSpace());
    act(() => useGameState.getState().skipTravel());

    expect(useGameState.getState()).toMatchObject({
      currentView: 'space',
      selectedPlanet: 'saturn',
      isTransitioning: false,
      travelDirection: null,
    });
  });
});
