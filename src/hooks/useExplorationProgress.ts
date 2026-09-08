import { useCallback, useSyncExternalStore } from 'react';
import {
  EXPLORATION_DESTINATION_COUNT,
  explorationProgressStore,
  isExplorationPlanetId,
  type ExplorationProgressStore,
} from '@/lib/explorationProgress';

export const useExplorationProgress = (
  store: ExplorationProgressStore = explorationProgressStore,
) => {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const hasVisited = useCallback(
    (planetId: string) => isExplorationPlanetId(planetId) && snapshot.visitedPlanetIds.includes(planetId),
    [snapshot.visitedPlanetIds],
  );

  const visitedCount = snapshot.visitedPlanetIds.length;
  const isComplete = visitedCount === EXPLORATION_DESTINATION_COUNT;

  return {
    ...snapshot,
    visitedCount,
    totalDestinations: EXPLORATION_DESTINATION_COUNT,
    isComplete,
    achievementVisible: isComplete && !snapshot.completionDismissed,
    hasVisited,
    markVisited: store.markVisited,
    dismissCompletion: store.dismissCompletion,
    clearProgress: store.clearProgress,
  };
};
