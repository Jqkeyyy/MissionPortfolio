import { getPlanetById } from '@/data/planets';
import type { PlanetThemeId } from '@/data/planetThemes';

export const ALIEN_SIGNAL_STORAGE_KEY = 'mission-portfolio:alien-signal-hunt:v1';
export const ALIEN_SIGNAL_PROGRESS_VERSION = 1 as const;

export interface AlienSignalFragment {
  id: string;
  planetId: PlanetThemeId;
  planetName: string;
  sequence: number;
  frequency: string;
  encoded: string;
  decoded: string;
  clue: string;
}

const fragment = (
  definition: Omit<AlienSignalFragment, 'planetName'>,
): AlienSignalFragment => ({
  ...definition,
  planetName: getPlanetById(definition.planetId)?.displayName ?? definition.planetId,
});

/**
 * The sequence intentionally crosses the existing portfolio destinations from
 * the inner system to its edge. Keeping this list in the domain module lets the
 * solar-system UI add signal treatments without duplicating hunt knowledge.
 */
export const ALIEN_SIGNAL_FRAGMENTS = [
  fragment({
    id: 'carrier-01',
    planetId: 'mercury',
    sequence: 1,
    frequency: '88.1 MHz',
    encoded: '5354 4159',
    decoded: 'STAY',
    clue: 'The first carrier skips across the smallest world, closest to the star.',
  }),
  fragment({
    id: 'carrier-02',
    planetId: 'moon',
    sequence: 2,
    frequency: '27.3 MHz',
    encoded: '4355 5249 4F55 53',
    decoded: 'CURIOUS',
    clue: 'A familiar satellite reflects the second pulse toward home.',
  }),
  fragment({
    id: 'carrier-03',
    planetId: 'mars',
    sequence: 3,
    frequency: '68.7 MHz',
    encoded: '4255 494C 44',
    decoded: 'BUILD',
    clue: 'The builder channel is buried beneath iron-red dust.',
  }),
  fragment({
    id: 'carrier-04',
    planetId: 'saturn',
    sequence: 4,
    frequency: '10.7 MHz',
    encoded: '5553 4546 554C',
    decoded: 'USEFUL',
    clue: 'The fourth packet is divided across a bright ring plane.',
  }),
  fragment({
    id: 'carrier-05',
    planetId: 'neptune',
    sequence: 5,
    frequency: '60.2 MHz',
    encoded: '5448 494E 4753',
    decoded: 'THINGS',
    clue: 'The final carrier waits at the blue edge of the mission map.',
  }),
] as const satisfies readonly AlienSignalFragment[];

export type AlienSignalFragmentId = (typeof ALIEN_SIGNAL_FRAGMENTS)[number]['id'];

export interface AlienSignalProgress {
  version: typeof ALIEN_SIGNAL_PROGRESS_VERSION;
  started: boolean;
  collectedFragmentIds: AlienSignalFragmentId[];
}

export interface AlienSignalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
}

const fragmentIds = new Set<string>(
  ALIEN_SIGNAL_FRAGMENTS.map((candidate) => candidate.id),
);

export const createEmptyAlienSignalProgress = (): AlienSignalProgress => ({
  version: ALIEN_SIGNAL_PROGRESS_VERSION,
  started: false,
  collectedFragmentIds: [],
});

export const normalizeAlienSignalFragmentIds = (
  value: unknown,
): AlienSignalFragmentId[] => {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value.reduce<AlienSignalFragmentId[]>((result, candidate) => {
    if (
      typeof candidate === 'string'
      && fragmentIds.has(candidate)
      && !seen.has(candidate)
    ) {
      seen.add(candidate);
      result.push(candidate as AlienSignalFragmentId);
    }
    return result;
  }, []);
};

export const parseAlienSignalProgress = (
  serialized: string | null,
): AlienSignalProgress => {
  if (!serialized) return createEmptyAlienSignalProgress();

  try {
    const value: unknown = JSON.parse(serialized);
    if (
      typeof value !== 'object'
      || value === null
      || !('version' in value)
      || value.version !== ALIEN_SIGNAL_PROGRESS_VERSION
    ) {
      return createEmptyAlienSignalProgress();
    }

    const record = value as Record<string, unknown>;
    const collectedFragmentIds = normalizeAlienSignalFragmentIds(
      record.collectedFragmentIds,
    );
    return {
      version: ALIEN_SIGNAL_PROGRESS_VERSION,
      started: record.started === true || collectedFragmentIds.length > 0,
      collectedFragmentIds,
    };
  } catch {
    return createEmptyAlienSignalProgress();
  }
};

export const getAlienSignalFragmentAtPlanet = (
  planetId: string | null | undefined,
): AlienSignalFragment | undefined => (
  ALIEN_SIGNAL_FRAGMENTS.find((candidate) => candidate.planetId === planetId)
);

export const collectAlienSignalFragment = (
  progress: AlienSignalProgress,
  planetId: string | null | undefined,
): AlienSignalProgress => {
  if (!progress.started) return progress;

  const found = getAlienSignalFragmentAtPlanet(planetId);
  if (!found || progress.collectedFragmentIds.includes(found.id)) return progress;

  return {
    ...progress,
    collectedFragmentIds: [...progress.collectedFragmentIds, found.id],
  };
};

export const getCollectedAlienSignalFragments = (
  progress: AlienSignalProgress,
): AlienSignalFragment[] => ALIEN_SIGNAL_FRAGMENTS.filter((candidate) => (
  progress.collectedFragmentIds.includes(candidate.id)
));

export const getNextAlienSignalFragment = (
  progress: AlienSignalProgress,
): AlienSignalFragment | undefined => ALIEN_SIGNAL_FRAGMENTS.find((candidate) => (
  !progress.collectedFragmentIds.includes(candidate.id)
));

export const isAlienSignalDecoded = (progress: AlienSignalProgress): boolean => (
  ALIEN_SIGNAL_FRAGMENTS.every((candidate) => (
    progress.collectedFragmentIds.includes(candidate.id)
  ))
);

export const ALIEN_SIGNAL_DECODED_MESSAGE = 'STAY CURIOUS. BUILD USEFUL THINGS.';
export const ALIEN_SIGNAL_SECRET_DESTINATION = 'THE LISTENING POST';

export const resolveAlienSignalStorage = (): AlienSignalStorage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readAlienSignalProgress = (
  storage: AlienSignalStorage | null,
): AlienSignalProgress => {
  if (!storage) return createEmptyAlienSignalProgress();
  try {
    return parseAlienSignalProgress(storage.getItem(ALIEN_SIGNAL_STORAGE_KEY));
  } catch {
    return createEmptyAlienSignalProgress();
  }
};

export const persistAlienSignalProgress = (
  storage: AlienSignalStorage | null,
  progress: AlienSignalProgress,
): void => {
  if (!storage) return;
  try {
    storage.setItem(ALIEN_SIGNAL_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage may be unavailable in privacy mode. The in-memory hunt continues.
  }
};
