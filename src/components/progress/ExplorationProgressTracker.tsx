import { useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useExplorationProgress } from '@/hooks/useExplorationProgress';
import type { ExplorationProgressStore } from '@/lib/explorationProgress';

interface ExplorationProgressTrackerProps {
  store?: ExplorationProgressStore;
}

export const ExplorationProgressTracker = ({ store }: ExplorationProgressTrackerProps) => {
  const currentView = useGameState((state) => state.currentView);
  const selectedPlanet = useGameState((state) => state.selectedPlanet);
  const { markVisited } = useExplorationProgress(store);

  useEffect(() => {
    if (currentView === 'planet' && selectedPlanet) {
      markVisited(selectedPlanet);
    }
  }, [currentView, markVisited, selectedPlanet]);

  return null;
};
