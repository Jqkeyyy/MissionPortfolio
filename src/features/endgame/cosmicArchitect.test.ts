import { describe, expect, it } from 'vitest';
import { planets } from '@/data/planets';
import {
  applyCosmicArchitectOverrides,
  createCosmicArchitectOverride,
} from './cosmicArchitect';

describe('applyCosmicArchitectOverrides', () => {
  it('applies visible and orbital overrides without mutating source data', () => {
    const earth = planets.find((planet) => planet.id === 'earth')!;
    const override = {
      ...createCosmicArchitectOverride(earth),
      sizeMultiplier: 2,
      orbitRadiusMultiplier: 2,
      gravityMultiplier: 4,
      orbitSpeedMultiplier: 2,
      orbitDirection: -1 as const,
      axialTiltDeg: 90,
      orbitInclinationDeg: 12,
      hueShiftDeg: 120,
    };

    const result = applyCosmicArchitectOverrides(planets, { earth: override });
    const editedEarth = result.find((planet) => planet.id === 'earth')!;

    expect(editedEarth).not.toBe(earth);
    expect(editedEarth).toMatchObject({
      size: 2,
      orbitRadius: 32,
      axialTiltDeg: 90,
      orbitInclinationDeg: 12,
      color: '#e54b7b',
    });
    expect(editedEarth.orbitalPeriodDays).toBeCloseTo(-earth.orbitalPeriodDays / Math.SQRT2);
    expect(earth).toMatchObject({ size: 1, orbitRadius: 16, color: '#4B7BE5' });
  });

  it('never edits the Sun and preserves untouched object identities', () => {
    const sun = planets[0];
    const fakeSunOverride = createCosmicArchitectOverride(sun);
    fakeSunOverride.sizeMultiplier = 3;

    const result = applyCosmicArchitectOverrides(planets, { sun: fakeSunOverride });

    expect(result[0]).toBe(sun);
    expect(result[1]).toBe(planets[1]);
  });
});
