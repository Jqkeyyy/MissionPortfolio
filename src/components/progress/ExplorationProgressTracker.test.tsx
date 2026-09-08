import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameState } from '@/hooks/useGameState';
import { createExplorationProgressStore } from '@/lib/explorationProgress';
import { ExplorationProgressTracker } from './ExplorationProgressTracker';

describe('ExplorationProgressTracker', () => {
  beforeEach(() => {
    useGameState.setState({
      currentView: 'space',
      selectedPlanet: null,
      isTransitioning: false,
      travelDirection: null,
    });
  });

  it('counts only arrival on a planet surface', () => {
    const store = createExplorationProgressStore(null);
    render(<ExplorationProgressTracker store={store} />);

    act(() => useGameState.setState({ selectedPlanet: 'mars' }));
    expect(store.getSnapshot().visitedPlanetIds).toEqual([]);
    act(() => useGameState.setState({ currentView: 'intercepting' }));
    expect(store.getSnapshot().visitedPlanetIds).toEqual([]);
    act(() => useGameState.setState({ currentView: 'planet' }));
    expect(store.getSnapshot().visitedPlanetIds).toEqual(['mars']);
  });

  it('counts a skipped flight because it reaches the planet view', () => {
    const store = createExplorationProgressStore(null);
    useGameState.setState({
      currentView: 'traveling',
      selectedPlanet: 'saturn',
      isTransitioning: true,
      travelDirection: 'toPlanet',
    });
    render(<ExplorationProgressTracker store={store} />);

    act(() => useGameState.getState().skipTravel());
    expect(store.getSnapshot().visitedPlanetIds).toEqual(['saturn']);
  });

  it('keeps progress through navigation reset', () => {
    const store = createExplorationProgressStore(null);
    useGameState.setState({ currentView: 'planet', selectedPlanet: 'earth' });
    render(<ExplorationProgressTracker store={store} />);
    expect(store.getSnapshot().visitedPlanetIds).toEqual(['earth']);

    act(() => useGameState.getState().resetExploration());
    expect(store.getSnapshot().visitedPlanetIds).toEqual(['earth']);
  });
});
