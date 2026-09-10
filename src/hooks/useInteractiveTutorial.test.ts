import { act, fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInteractiveTutorial } from './useInteractiveTutorial';
import type { ViewMode } from './useGameState';

describe('useInteractiveTutorial', () => {
  it('advances only when the visitor performs each real tutorial action', () => {
    const onComplete = vi.fn();
    const onExit = vi.fn();
    const { result, rerender } = renderHook(
      ({ currentView, currentPlanetId }: { currentView: ViewMode; currentPlanetId: string | null }) => (
        useInteractiveTutorial({ currentView, currentPlanetId, onComplete, onExit })
      ),
      { initialProps: { currentView: 'space' as ViewMode, currentPlanetId: null as string | null } },
    );

    act(() => result.current.start());
    expect(result.current.currentStep.id).toBe('select-sun');

    rerender({ currentView: 'intercepting', currentPlanetId: 'sun' });
    expect(result.current.currentStep.id).toBe('travel-to-sun');

    rerender({ currentView: 'planet', currentPlanetId: 'sun' });
    expect(result.current.currentStep.id).toBe('enter-base-camp');

    const action = document.createElement('button');
    document.body.append(action);
    for (const actionName of [
      'enter-base-camp',
      'sit-computer',
      'open-archive',
      'open-file-intro-1',
      'close-mission-file',
      'open-file-intro-2',
      'stand-up',
      'exit-base-camp',
    ]) {
      action.dataset.tutorialAction = actionName;
      fireEvent.click(action);
    }

    expect(result.current.currentStep.id).toBe('choose-next-destination');
    rerender({ currentView: 'traveling', currentPlanetId: 'mercury' });
    expect(result.current.currentStep.id).toBe('travel-to-next-destination');
    rerender({ currentView: 'planet', currentPlanetId: 'mercury' });
    expect(result.current.status).toBe('complete');
    expect(onComplete).toHaveBeenCalledTimes(1);
    act(() => result.current.exit());
    expect(onExit).not.toHaveBeenCalled();
    action.remove();
  });

  it('accepts arriving directly at another planet from the surface navigation', () => {
    const { result, rerender } = renderHook(
      ({ currentView, currentPlanetId }: { currentView: ViewMode; currentPlanetId: string | null }) => (
        useInteractiveTutorial({ currentView, currentPlanetId })
      ),
      { initialProps: { currentView: 'space' as ViewMode, currentPlanetId: null as string | null } },
    );

    act(() => result.current.start());
    rerender({ currentView: 'planet', currentPlanetId: 'sun' });
    const action = document.createElement('button');
    document.body.append(action);
    for (const actionName of [
      'enter-base-camp',
      'sit-computer',
      'open-archive',
      'open-file-intro-1',
      'close-mission-file',
      'open-file-intro-2',
      'stand-up',
      'exit-base-camp',
    ]) {
      action.dataset.tutorialAction = actionName;
      fireEvent.click(action);
    }

    rerender({ currentView: 'planet', currentPlanetId: 'mercury' });
    expect(result.current.status).toBe('complete');
    action.remove();
  });

  it('can be exited with Escape without changing exploration state', () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useInteractiveTutorial({
      currentView: 'space',
      currentPlanetId: null,
      onExit,
    }));

    act(() => result.current.start());
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(result.current.status).toBe('idle');
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
