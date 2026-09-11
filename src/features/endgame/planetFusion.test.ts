import { describe, expect, it } from 'vitest';
import { planets } from '@/data/planets';
import {
  FUSIBLE_PLANETS,
  applyPlanetFusionToPlanets,
  createPlanetFusion,
  mixFusionColors,
} from './planetFusion';

describe('planet fusion', () => {
  it('offers every canonical non-solar world exactly once', () => {
    expect(FUSIBLE_PLANETS.map(({ id }) => id)).toEqual([
      'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
    ]);
  });

  it('creates the iconic Marsurn profile deterministically', () => {
    const fusion = createPlanetFusion('mars', 'saturn');
    expect(fusion).toEqual(createPlanetFusion('mars', 'saturn'));
    expect(fusion).toMatchObject({
      id: 'fusion:mars:saturn',
      name: 'Marsurn',
      primaryId: 'mars',
      secondaryId: 'saturn',
      surface: { rendererSurface: 'banded' },
    });
    expect(fusion.description).toContain('about me');
    expect(fusion.description).toContain('flagship projects');
    expect(fusion.palette.accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(fusion.habitat.identity).toContain('Prototype sketches');
  });

  it('rejects duplicate worlds and blends colors without mutating inputs', () => {
    expect(() => createPlanetFusion('earth', 'earth')).toThrow(/distinct/i);
    expect(mixFusionColors('#000', '#ffffff')).toBe('#808080');
    expect(mixFusionColors('#ff0000', '#0000ff', 0.25)).toBe('#bf0040');
  });

  it('adapts the renderer catalog while preserving routes and source data', () => {
    const originalMars = planets.find(({ id }) => id === 'mars')!;
    const output = applyPlanetFusionToPlanets(planets, createPlanetFusion('mars', 'saturn'));
    const marsurn = output.find(({ id }) => id === 'mars')!;

    expect(output).toHaveLength(planets.length - 1);
    expect(output.some(({ id }) => id === 'saturn')).toBe(false);
    expect(marsurn).toMatchObject({ id: 'mars', displayName: 'Marsurn', surface: 'banded' });
    expect(marsurn.content).toHaveLength(originalMars.content.length + 3);
    expect(originalMars.displayName).toBe('Mars');
  });

  it('keeps moon hierarchies valid when a parent world is consumed', () => {
    const output = applyPlanetFusionToPlanets(planets, createPlanetFusion('mars', 'earth'));
    expect(output.find(({ id }) => id === 'moon')?.orbitParentId).toBe('mars');

    const moonPrimary = applyPlanetFusionToPlanets(planets, createPlanetFusion('moon', 'earth'));
    expect(moonPrimary.find(({ id }) => id === 'moon')?.orbitParentId).toBeUndefined();
  });
});
