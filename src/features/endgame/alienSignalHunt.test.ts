import { describe, expect, it } from 'vitest';
import {
  ALIEN_SIGNAL_FRAGMENTS,
  collectAlienSignalFragment,
  createEmptyAlienSignalProgress,
  getNextAlienSignalFragment,
  isAlienSignalDecoded,
  parseAlienSignalProgress,
} from './alienSignalHunt';

describe('alienSignalHunt', () => {
  it('uses real portfolio planet IDs and presents the route in sequence', () => {
    expect(ALIEN_SIGNAL_FRAGMENTS.map((fragment) => fragment.planetId)).toEqual([
      'mercury',
      'moon',
      'mars',
      'saturn',
      'neptune',
    ]);
    expect(ALIEN_SIGNAL_FRAGMENTS.map((fragment) => fragment.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(ALIEN_SIGNAL_FRAGMENTS.every((fragment) => fragment.planetName.length > 0)).toBe(true);
  });

  it('collects a fragment only after the hunt starts and remains idempotent', () => {
    const empty = createEmptyAlienSignalProgress();
    expect(collectAlienSignalFragment(empty, 'mercury')).toBe(empty);

    const started = { ...empty, started: true };
    const collected = collectAlienSignalFragment(started, 'mercury');
    expect(collected).not.toBe(started);
    expect(collected.collectedFragmentIds).toEqual(['carrier-01']);
    expect(collectAlienSignalFragment(collected, 'mercury')).toBe(collected);
    expect(collectAlienSignalFragment(collected, 'earth')).toBe(collected);
  });

  it('normalizes persisted data and safely rejects unknown versions', () => {
    expect(parseAlienSignalProgress(JSON.stringify({
      version: 1,
      started: false,
      collectedFragmentIds: ['carrier-02', 'unknown', 'carrier-02'],
    }))).toEqual({
      version: 1,
      started: true,
      collectedFragmentIds: ['carrier-02'],
    });
    expect(parseAlienSignalProgress('{broken')).toEqual(createEmptyAlienSignalProgress());
    expect(parseAlienSignalProgress(JSON.stringify({ version: 2 }))).toEqual(createEmptyAlienSignalProgress());
  });

  it('decodes only after every fragment has been recovered', () => {
    let progress = { ...createEmptyAlienSignalProgress(), started: true };
    expect(getNextAlienSignalFragment(progress)?.planetId).toBe('mercury');

    ALIEN_SIGNAL_FRAGMENTS.forEach(({ planetId }) => {
      progress = collectAlienSignalFragment(progress, planetId);
    });

    expect(isAlienSignalDecoded(progress)).toBe(true);
    expect(getNextAlienSignalFragment(progress)).toBeUndefined();
  });
});
