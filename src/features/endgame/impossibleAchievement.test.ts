import { beforeEach, describe, expect, it } from 'vitest';
import {
  IMPOSSIBLE_ACHIEVEMENT_STORAGE_KEY,
  IMPOSSIBLE_MILESTONES,
  isImpossibleAchievementComplete,
  useImpossibleAchievement,
} from './impossibleAchievement';

describe('Impossible Achievement', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useImpossibleAchievement.setState({ completed: [] });
  });

  it('requires every cross-feature milestone', () => {
    expect(isImpossibleAchievementComplete(['fusion', 'gravity', 'pet', 'disco'])).toBe(false);
    expect(isImpossibleAchievementComplete(IMPOSSIBLE_MILESTONES.map(({ id }) => id))).toBe(true);
  });

  it('records milestones idempotently and persists them locally', () => {
    useImpossibleAchievement.getState().record('fusion');
    useImpossibleAchievement.getState().record('fusion');
    expect(useImpossibleAchievement.getState().completed).toEqual(['fusion']);
    expect(window.localStorage.getItem(IMPOSSIBLE_ACHIEVEMENT_STORAGE_KEY)).toContain('fusion');
  });
});
