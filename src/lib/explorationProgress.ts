import { PLANET_THEME_IDS, type PlanetThemeId } from '@/data/planetThemes';

export const EXPLORATION_PROGRESS_STORAGE_KEY = 'mission-portfolio:exploration-progress:v1';
export const EXPLORATION_PROGRESS_VERSION = 1 as const;
export const EXPLORATION_DESTINATION_COUNT = PLANET_THEME_IDS.length;

export interface ExplorationProgressState {
  version: typeof EXPLORATION_PROGRESS_VERSION;
  visitedPlanetIds: PlanetThemeId[];
  completionDismissed: boolean;
}

export interface ExplorationProgressStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface ExplorationProgressStore {
  getSnapshot: () => ExplorationProgressState;
  getServerSnapshot: () => ExplorationProgressState;
  subscribe: (listener: () => void) => () => void;
  hydrate: () => void;
  markVisited: (planetId: string) => boolean;
  dismissCompletion: () => boolean;
  clearProgress: () => void;
}

const validPlanetIds = new Set<string>(PLANET_THEME_IDS);

export const createEmptyExplorationProgress = (): ExplorationProgressState => ({
  version: EXPLORATION_PROGRESS_VERSION,
  visitedPlanetIds: [],
  completionDismissed: false,
});

export const isExplorationPlanetId = (value: unknown): value is PlanetThemeId =>
  typeof value === 'string' && validPlanetIds.has(value);

export const normalizeVisitedPlanetIds = (value: unknown): PlanetThemeId[] => {
  if (!Array.isArray(value)) return [];

  const seen = new Set<PlanetThemeId>();
  return value.reduce<PlanetThemeId[]>((ids, candidate) => {
    if (isExplorationPlanetId(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
      ids.push(candidate);
    }
    return ids;
  }, []);
};

export const parseExplorationProgress = (serialized: string | null): ExplorationProgressState => {
  if (!serialized) return createEmptyExplorationProgress();

  try {
    const candidate: unknown = JSON.parse(serialized);
    if (
      typeof candidate !== 'object'
      || candidate === null
      || !('version' in candidate)
      || candidate.version !== EXPLORATION_PROGRESS_VERSION
    ) {
      return createEmptyExplorationProgress();
    }

    const record = candidate as Record<string, unknown>;
    return {
      version: EXPLORATION_PROGRESS_VERSION,
      visitedPlanetIds: normalizeVisitedPlanetIds(record.visitedPlanetIds),
      completionDismissed: record.completionDismissed === true,
    };
  } catch {
    return createEmptyExplorationProgress();
  }
};

const resolveBrowserStorage = (): ExplorationProgressStorage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readProgress = (storage: ExplorationProgressStorage | null): ExplorationProgressState => {
  if (storage) {
    try {
      return parseExplorationProgress(storage.getItem(EXPLORATION_PROGRESS_STORAGE_KEY));
    } catch {
      // Browsers can deny storage access. Progress still works in memory.
    }
  }
  return createEmptyExplorationProgress();
};

const persistProgress = (
  storage: ExplorationProgressStorage | null,
  state: ExplorationProgressState,
) => {
  if (!storage) return;
  try {
    storage.setItem(EXPLORATION_PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota and privacy-mode failures must never interrupt exploration.
  }
};

export const createExplorationProgressStore = (
  storage: ExplorationProgressStorage | null = resolveBrowserStorage(),
): ExplorationProgressStore => {
  let state = readProgress(storage);
  const listeners = new Set<() => void>();

  const publish = (nextState: ExplorationProgressState) => {
    state = nextState;
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrate: () => publish(readProgress(storage)),
    markVisited: (planetId) => {
      if (!isExplorationPlanetId(planetId) || state.visitedPlanetIds.includes(planetId)) {
        return false;
      }

      const nextState = {
        ...state,
        visitedPlanetIds: [...state.visitedPlanetIds, planetId],
      };
      persistProgress(storage, nextState);
      publish(nextState);
      return true;
    },
    dismissCompletion: () => {
      if (
        state.visitedPlanetIds.length !== EXPLORATION_DESTINATION_COUNT
        || state.completionDismissed
      ) {
        return false;
      }

      const nextState = { ...state, completionDismissed: true };
      persistProgress(storage, nextState);
      publish(nextState);
      return true;
    },
    clearProgress: () => {
      if (storage) {
        try {
          storage.removeItem(EXPLORATION_PROGRESS_STORAGE_KEY);
        } catch {
          // Clearing in-memory state is still useful if storage is unavailable.
        }
      }
      publish(createEmptyExplorationProgress());
    },
  };
};

export const explorationProgressStore = createExplorationProgressStore();
