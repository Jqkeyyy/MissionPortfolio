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
    expect(vi.getTimerCount()).toBe(1);
    act(() => useGameState.getState().skipTravel());

    expect(useGameState.getState()).toMatchObject({
      currentView: 'planet',
      selectedPlanet: 'earth',
      isTransitioning: false,
      travelDirection: null,
    });
    expect(useGameState.getState().announcement).toMatch(/travel skipped/i);
    expect(vi.getTimerCount()).toBe(0);

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
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels an inbound journey before scheduling a return', () => {
    act(() => useGameState.getState().travelToPlanet('saturn'));
    act(() => useGameState.getState().returnToSpace());

    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.runAllTimers());
    expect(useGameState.getState()).toMatchObject({
      currentView: 'space',
      isTransitioning: false,
      travelDirection: null,
    });
  });

  it('resets exploration and clears every pending transition', () => {
    act(() => useGameState.getState().travelToPlanet('mars'));
    act(() => useGameState.getState().resetExploration());

    expect(vi.getTimerCount()).toBe(0);
    expect(useGameState.getState()).toMatchObject({
      currentView: 'space',
      selectedPlanet: null,
      isTransitioning: false,
      travelDirection: null,
    });
  });

  it('hydrates a shared planet route without scheduling travel timers', () => {
    act(() => useGameState.getState().arriveAtPlanet('venus'));
    expect(useGameState.getState()).toMatchObject({
      currentView: 'planet',
      selectedPlanet: 'venus',
      isTransitioning: false,
      travelDirection: null,
    });
    expect(useGameState.getState().announcement).toMatch(/shared mission link/i);
    expect(vi.getTimerCount()).toBe(0);
  });
});
