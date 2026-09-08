import { describe, expect, it } from 'vitest';
import { planets } from './planets';
import { getPlanetScience, planetScience } from './planetScience';

describe('planet science catalog', () => {
  it('has exactly one supplemental record for every modeled body', () => {
    expect(planetScience.map(({ bodyId }) => bodyId).sort()).toEqual(
      planets.map(({ id }) => id).sort(),
    );
    expect(new Set(planetScience.map(({ bodyId }) => bodyId)).size).toBe(planets.length);
  });

  it('uses authoritative NASA HTTPS sources', () => {
    for (const record of planetScience) {
      const source = new URL(record.sourceUrl);
      expect(source.protocol).toBe('https:');
      expect(source.hostname).toBe('science.nasa.gov');
      expect(record.sourceLabel).toMatch(/^NASA /);
    }
  });

  it('keeps ring summaries on the four ringed giant planets', () => {
    expect(planetScience.filter(({ ringSummary }) => ringSummary).map(({ bodyId }) => bodyId))
      .toEqual(['jupiter', 'saturn', 'uranus', 'neptune']);
  });

  it('looks up a record by its existing body id', () => {
    expect(getPlanetScience('moon')?.bodyType).toBe('natural satellite');
  });
});
