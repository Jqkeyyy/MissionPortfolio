import { create } from 'zustand';

export const ANOMALY_PROGRESS_STORAGE_KEY = 'mission-portfolio:anomaly-progress:v1';

export type AnomalyEvent =
  | 'moon-clue'
  | 'moon-complete'
  | 'chaos-enabled'
  | 'gravity-fired'
  | 'signal-decoded'
  | 'orbit-replay-complete'
  | 'terminal-coffee'
  | 'sun-rhythm'
  | 'event-horizon-crossed'
  | 'rogue-captured'
  | 'impossible-started';

export type AnomalyFeatureId =
  | 'developer-moon' | 'chaos' | 'alien-signal' | 'orbit-replay'
  | 'cosmic-architect' | 'gravity-gun' | 'planet-fusion' | 'rogue-planet' | 'event-horizon'
  | 'hab-terminal' | 'space-pet' | 'disco-sun' | 'supernova' | 'impossible-achievement';

export type AnomalyStatus = 'available' | 'locked' | 'hidden';

export const ANOMALY_FEATURE_NAMES: Record<AnomalyFeatureId, string> = {
  'developer-moon': 'Developer Moon', chaos: 'Chaos Mode', 'alien-signal': 'Alien Signal Hunt',
  'orbit-replay': 'Orbit Replay', 'cosmic-architect': 'Cosmic Architect',
  'gravity-gun': 'Gravity Gun', 'planet-fusion': 'Planet Fusion',
  'rogue-planet': 'Rogue Planet', 'event-horizon': 'The Event Horizon',
  'hab-terminal': 'Secret HAB Terminal', 'space-pet': 'Space Pet M-0',
  'disco-sun': 'Disco Sun', supernova: 'Supernova Button',
  'impossible-achievement': 'Impossible Achievement',
};

const eventIds = new Set<AnomalyEvent>([
  'moon-clue', 'moon-complete', 'chaos-enabled', 'gravity-fired', 'signal-decoded',
  'orbit-replay-complete', 'terminal-coffee', 'sun-rhythm', 'event-horizon-crossed',
  'rogue-captured', 'impossible-started',
]);

const requirements: Partial<Record<AnomalyFeatureId, readonly AnomalyEvent[]>> = {
  'cosmic-architect': ['moon-complete'],
  'gravity-gun': ['chaos-enabled'],
  'planet-fusion': ['gravity-fired'],
  'rogue-planet': ['signal-decoded'],
  'event-horizon': ['orbit-replay-complete'],
  'hab-terminal': ['moon-clue'],
  'space-pet': ['terminal-coffee'],
  'disco-sun': ['sun-rhythm'],
  supernova: ['event-horizon-crossed', 'rogue-captured'],
  'impossible-achievement': ['impossible-started'],
};

const hiddenFeatures = new Set<AnomalyFeatureId>([
  'hab-terminal', 'space-pet', 'disco-sun', 'supernova', 'impossible-achievement',
]);

export const getAnomalyStatus = (
  feature: AnomalyFeatureId,
  events: readonly AnomalyEvent[],
  freeExplore = false,
): AnomalyStatus => {
  if (freeExplore || (requirements[feature] ?? []).every((event) => events.includes(event))) return 'available';
  return hiddenFeatures.has(feature) ? 'hidden' : 'locked';
};

interface StoredProgress { version: 1; events: AnomalyEvent[]; freeExplore: boolean }
interface AnomalyProgressState {
  events: AnomalyEvent[];
  freeExplore: boolean;
  record: (event: AnomalyEvent) => AnomalyFeatureId[];
  setFreeExplore: (enabled: boolean) => void;
}

const readProgress = (): Pick<StoredProgress, 'events' | 'freeExplore'> => {
  if (typeof window === 'undefined') return { events: [], freeExplore: false };
  try {
    const value = JSON.parse(window.localStorage.getItem(ANOMALY_PROGRESS_STORAGE_KEY) ?? 'null') as Partial<StoredProgress> | null;
    if (value?.version !== 1 || !Array.isArray(value.events)) return { events: [], freeExplore: false };
    return {
      events: [...new Set(value.events.filter((event): event is AnomalyEvent => eventIds.has(event as AnomalyEvent)))],
      freeExplore: value.freeExplore === true,
    };
  } catch {
    return { events: [], freeExplore: false };
  }
};

const persist = (events: AnomalyEvent[], freeExplore: boolean) => {
  try {
    window.localStorage.setItem(ANOMALY_PROGRESS_STORAGE_KEY, JSON.stringify({ version: 1, events, freeExplore } satisfies StoredProgress));
  } catch {
    // Progress remains available in memory when local storage is unavailable.
  }
};

export const useAnomalyProgress = create<AnomalyProgressState>((set, get) => ({
  ...readProgress(),
  record: (event) => {
    const { events, freeExplore } = get();
    if (events.includes(event)) return [];
    const nextEvents = [...events, event];
    persist(nextEvents, freeExplore);
    set({ events: nextEvents });
    return (Object.keys(ANOMALY_FEATURE_NAMES) as AnomalyFeatureId[]).filter((feature) =>
      getAnomalyStatus(feature, events) !== 'available' && getAnomalyStatus(feature, nextEvents) === 'available',
    );
  },
  setFreeExplore: (enabled) => {
    const events = get().events;
    persist(events, enabled);
    set({ freeExplore: enabled });
  },
}));
