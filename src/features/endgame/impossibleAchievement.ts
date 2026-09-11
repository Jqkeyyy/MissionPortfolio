import { create } from 'zustand';

export const IMPOSSIBLE_ACHIEVEMENT_STORAGE_KEY = 'mission-portfolio:impossible-achievement:v1';

export const IMPOSSIBLE_MILESTONES = [
  { id: 'fusion', label: 'Create a hybrid world', clue: 'Make two destinations share one orbit.' },
  { id: 'gravity', label: 'Break a stable orbit', clue: 'Fire the gravity gun at any planet.' },
  { id: 'pet', label: 'Befriend the stowaway', clue: 'Wake the space pet and earn its trust.' },
  { id: 'disco', label: 'Teach the Sun rhythm', clue: 'Activate the forbidden solar dance protocol.' },
  { id: 'rogue', label: 'Catch the impossible', clue: 'Capture the unregistered Rogue Planet.' },
] as const;

export type ImpossibleMilestoneId = typeof IMPOSSIBLE_MILESTONES[number]['id'];

interface StoredAchievement {
  version: 1;
  completed: ImpossibleMilestoneId[];
}

interface ImpossibleAchievementState {
  completed: ImpossibleMilestoneId[];
  record: (id: ImpossibleMilestoneId) => void;
  reset: () => void;
}

const milestoneIds = new Set<ImpossibleMilestoneId>(IMPOSSIBLE_MILESTONES.map(({ id }) => id));

const readProgress = (): ImpossibleMilestoneId[] => {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(IMPOSSIBLE_ACHIEVEMENT_STORAGE_KEY) ?? 'null') as Partial<StoredAchievement> | null;
    if (value?.version !== 1 || !Array.isArray(value.completed)) return [];
    return [...new Set(value.completed.filter((id): id is ImpossibleMilestoneId => milestoneIds.has(id as ImpossibleMilestoneId)))];
  } catch {
    return [];
  }
};

const persist = (completed: ImpossibleMilestoneId[]) => {
  try {
    window.localStorage.setItem(
      IMPOSSIBLE_ACHIEVEMENT_STORAGE_KEY,
      JSON.stringify({ version: 1, completed } satisfies StoredAchievement),
    );
  } catch {
    // The challenge remains available in memory when storage is unavailable.
  }
};

export const useImpossibleAchievement = create<ImpossibleAchievementState>((set, get) => ({
  completed: readProgress(),
  record: (id) => {
    if (get().completed.includes(id)) return;
    const completed = [...get().completed, id];
    persist(completed);
    set({ completed });
  },
  reset: () => {
    try {
      window.localStorage.removeItem(IMPOSSIBLE_ACHIEVEMENT_STORAGE_KEY);
    } catch {
      // Reset still succeeds in memory.
    }
    set({ completed: [] });
  },
}));

export const isImpossibleAchievementComplete = (completed: readonly ImpossibleMilestoneId[]) => (
  IMPOSSIBLE_MILESTONES.every(({ id }) => completed.includes(id))
);
