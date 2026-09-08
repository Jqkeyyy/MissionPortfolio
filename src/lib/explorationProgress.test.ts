import { describe, expect, it, vi } from 'vitest';
import { PLANET_THEME_IDS } from '@/data/planetThemes';
import {
  EXPLORATION_PROGRESS_STORAGE_KEY,
  createExplorationProgressStore,
  parseExplorationProgress,
  type ExplorationProgressStorage,
} from './explorationProgress';

const memoryStorage = (initial: Record<string, string> = {}): ExplorationProgressStorage => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
};

describe('exploration progress persistence', () => {
  it('rejects corrupt data and unsupported versions', () => {
    expect(parseExplorationProgress('{')).toMatchObject({ visitedPlanetIds: [] });
    expect(parseExplorationProgress(JSON.stringify({ version: 2, visitedPlanetIds: ['earth'] })))
      .toMatchObject({ visitedPlanetIds: [] });
  });

  it('filters unknown IDs and removes duplicates', () => {
    const result = parseExplorationProgress(JSON.stringify({
      version: 1,
      visitedPlanetIds: ['earth', 'pluto', 'earth', 42, 'mars'],
      completionDismissed: true,
    }));

    expect(result).toEqual({
      version: 1,
      visitedPlanetIds: ['earth', 'mars'],
      completionDismissed: true,
    });
  });

  it('hydrates, marks idempotently, and writes only the versioned key', () => {
    const storage = memoryStorage({
      [EXPLORATION_PROGRESS_STORAGE_KEY]: JSON.stringify({
        version: 1,
        visitedPlanetIds: ['earth'],
        completionDismissed: false,
      }),
    });
    const setItem = vi.spyOn(storage, 'setItem');
    const store = createExplorationProgressStore(storage);

    expect(store.getSnapshot().visitedPlanetIds).toEqual(['earth']);
    expect(store.markVisited('earth')).toBe(false);
    expect(store.markVisited('mars')).toBe(true);
    expect(store.markVisited('pluto')).toBe(false);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith(EXPLORATION_PROGRESS_STORAGE_KEY, expect.any(String));

    const reloadedStore = createExplorationProgressStore(storage);
    expect(reloadedStore.getSnapshot().visitedPlanetIds).toEqual(['earth', 'mars']);
  });

  it('keeps in-memory progress when storage is unavailable or quota-limited', () => {
    const storage: ExplorationProgressStorage = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('quota'); },
      removeItem: () => { throw new Error('denied'); },
    };
    const store = createExplorationProgressStore(storage);

    expect(() => store.markVisited('venus')).not.toThrow();
    expect(store.getSnapshot().visitedPlanetIds).toEqual(['venus']);
    expect(() => store.clearProgress()).not.toThrow();
    expect(store.getSnapshot().visitedPlanetIds).toEqual([]);
  });

  it('dismisses completion only after all ten destinations are visited', () => {
    const store = createExplorationProgressStore(memoryStorage());
    expect(store.dismissCompletion()).toBe(false);
    PLANET_THEME_IDS.forEach((id) => store.markVisited(id));
    expect(store.dismissCompletion()).toBe(true);
    expect(store.getSnapshot().completionDismissed).toBe(true);
  });
});
