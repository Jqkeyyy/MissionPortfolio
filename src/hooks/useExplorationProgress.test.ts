import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  EXPLORATION_PROGRESS_STORAGE_KEY,
  createExplorationProgressStore,
  type ExplorationProgressStorage,
} from '@/lib/explorationProgress';
import { useExplorationProgress } from './useExplorationProgress';

const createStorage = (serialized: string | null = null): ExplorationProgressStorage => {
  let value = serialized;
  return {
    getItem: (key) => key === EXPLORATION_PROGRESS_STORAGE_KEY ? value : null,
    setItem: (key, next) => { if (key === EXPLORATION_PROGRESS_STORAGE_KEY) value = next; },
    removeItem: (key) => { if (key === EXPLORATION_PROGRESS_STORAGE_KEY) value = null; },
  };
};

describe('useExplorationProgress', () => {
  it('hydrates saved progress and updates every subscriber', () => {
    const store = createExplorationProgressStore(createStorage(JSON.stringify({
      version: 1,
      visitedPlanetIds: ['earth'],
      completionDismissed: false,
    })));
    const first = renderHook(() => useExplorationProgress(store));
    const second = renderHook(() => useExplorationProgress(store));

    expect(first.result.current.visitedCount).toBe(1);
    act(() => first.result.current.markVisited('mars'));
    expect(first.result.current.visitedCount).toBe(2);
    expect(second.result.current.hasVisited('mars')).toBe(true);
  });

  it('clears only through the explicit hook action', () => {
    const store = createExplorationProgressStore(createStorage());
    const { result } = renderHook(() => useExplorationProgress(store));
    act(() => result.current.markVisited('saturn'));
    expect(result.current.visitedCount).toBe(1);
    act(() => result.current.clearProgress());
    expect(result.current.visitedCount).toBe(0);
  });
});
