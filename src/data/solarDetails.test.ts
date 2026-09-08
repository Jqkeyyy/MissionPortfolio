import { describe, expect, it } from 'vitest';
import { createAsteroidBeltPoints, MAJOR_MOONS } from './solarDetails';

describe('solar details', () => {
  it('generates deterministic asteroid points between Mars and Jupiter', () => {
    const first = createAsteroidBeltPoints(20, 42);
    expect(first).toEqual(createAsteroidBeltPoints(20, 42));
    first.forEach(({ x, z }) => expect(Math.hypot(x, z)).toBeGreaterThanOrEqual(24.2));
    first.forEach(({ x, z }) => expect(Math.hypot(x, z)).toBeLessThanOrEqual(27.4));
  });

  it('defines unique major moons attached to giant planets', () => {
    expect(new Set(MAJOR_MOONS.map(({ id }) => id)).size).toBe(MAJOR_MOONS.length);
    const giantPlanetIds = new Set(['jupiter', 'saturn', 'uranus', 'neptune']);
    expect(MAJOR_MOONS.map(({ parentId }) => giantPlanetIds.has(parentId)))
      .toEqual(MAJOR_MOONS.map(() => true));
  });
});
