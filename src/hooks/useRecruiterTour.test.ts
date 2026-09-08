import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecruiterTour } from './useRecruiterTour';

describe('useRecruiterTour', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => {
    const onTravelTo = vi.fn();
    const onAnnounce = vi.fn();
    const onComplete = vi.fn();
    const onExit = vi.fn();
    let currentView = 'space';
    let currentPlanetId: string | null = null;
    let isRecovering = false;

    const hook = renderHook(() => useRecruiterTour({
      currentView,
      currentPlanetId,
      isRecovering,
      onTravelTo,
      onAnnounce,
      onComplete,
      onExit,
    }));

    return {
      ...hook,
      onTravelTo,
      onAnnounce,
      onComplete,
      onExit,
      arrive(planetId: string) {
        currentView = 'planet';
        currentPlanetId = planetId;
        hook.rerender();
      },
      recover() {
        isRecovering = true;
        hook.rerender();
      },
    };
  };

  it('starts at the Sun but does not count dwell time before arrival', () => {
    const tour = setup();
    act(() => tour.result.current.start());

    expect(tour.result.current.status).toBe('running');
    expect(tour.onTravelTo).toHaveBeenCalledWith('sun');

    act(() => vi.advanceTimersByTime(30_000));
    expect(tour.onTravelTo).toHaveBeenCalledTimes(1);

    act(() => tour.arrive('sun'));
    act(() => vi.advanceTimersByTime(12_000));
    expect(tour.onTravelTo).toHaveBeenLastCalledWith('earth');
  });

  it('preserves the dwell remainder across pause and resume', () => {
    const tour = setup();
    act(() => tour.result.current.start());
    act(() => tour.arrive('sun'));
    act(() => vi.advanceTimersByTime(5_000));
    act(() => tour.result.current.pause());

    expect(tour.result.current.status).toBe('paused');
    expect(tour.result.current.remainingDwellMs).toBe(7_000);
    act(() => vi.advanceTimersByTime(20_000));
    expect(tour.onTravelTo).toHaveBeenCalledTimes(1);

    act(() => tour.result.current.resume());
    act(() => vi.advanceTimersByTime(6_999));
    expect(tour.onTravelTo).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1));
    expect(tour.onTravelTo).toHaveBeenLastCalledWith('earth');
  });

  it('dispatches only one destination for repeated next-stop actions', () => {
    const tour = setup();
    act(() => tour.result.current.start());
    act(() => tour.arrive('sun'));

    act(() => {
      tour.result.current.nextStop();
      tour.result.current.nextStop();
    });

    expect(tour.onTravelTo.mock.calls.map(([id]) => id)).toEqual(['sun', 'earth']);
    expect(tour.result.current.currentStepIndex).toBe(1);
  });

  it('finishes after the Neptune dwell and invokes completion once', () => {
    const tour = setup();
    act(() => tour.result.current.start());

    for (const planetId of ['sun', 'earth', 'saturn', 'neptune']) {
      act(() => tour.arrive(planetId));
      act(() => vi.advanceTimersByTime(12_000));
    }

    expect(tour.result.current.status).toBe('complete');
    expect(tour.onTravelTo.mock.calls.map(([id]) => id)).toEqual([
      'sun',
      'earth',
      'saturn',
      'neptune',
    ]);
    expect(tour.onComplete).toHaveBeenCalledTimes(1);
    expect(tour.result.current.announcement).toMatch(/tour complete at neptune/i);
  });

  it('clears dwell timers on exit, recovery, and unmount without moving the visitor', () => {
    const exited = setup();
    act(() => exited.result.current.start());
    act(() => exited.arrive('sun'));
    act(() => exited.result.current.exit());
    act(() => vi.advanceTimersByTime(20_000));
    expect(exited.onTravelTo).toHaveBeenCalledTimes(1);
    expect(exited.onExit).toHaveBeenCalledWith('exit');

    const recovered = setup();
    act(() => recovered.result.current.start());
    act(() => recovered.arrive('sun'));
    act(() => recovered.recover());
    act(() => vi.advanceTimersByTime(20_000));
    expect(recovered.onTravelTo).toHaveBeenCalledTimes(1);
    expect(recovered.onExit).toHaveBeenCalledWith('recovery');

    const unmounted = setup();
    act(() => unmounted.result.current.start());
    act(() => unmounted.arrive('sun'));
    unmounted.unmount();
    act(() => vi.advanceTimersByTime(20_000));
    expect(unmounted.onTravelTo).toHaveBeenCalledTimes(1);
  });
});
