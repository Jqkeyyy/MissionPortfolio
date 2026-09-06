import { describe, it, expect } from 'vitest';
import { planets } from './planets';
import type { ContentSign, PlanetSurface } from './planets';

const VALID_SURFACES: PlanetSurface[] = ['cratered', 'banded', 'earthlike', 'venusAtmo'];
const VALID_CONTENT_TYPES: ContentSign['type'][] = ['sign', 'tablet', 'console', 'crate'];
const EXPECTED_IDS = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

describe('planets data', () => {
  it('gives every planet a valid surface type', () => {
    for (const planet of planets) {
      expect(VALID_SURFACES).toContain(planet.surface);
    }
  });

  it('assigns earthlike to Earth and banded to the gas giants', () => {
    const byId = Object.fromEntries(planets.map((p) => [p.id, p.surface]));
    expect(byId.earth).toBe('earthlike');
    expect(byId.jupiter).toBe('banded');
    expect(byId.saturn).toBe('banded');
    expect(byId.uranus).toBe('banded');
    expect(byId.neptune).toBe('banded');
  });

  it('assigns cratered to the rocky bodies and venusAtmo to Venus', () => {
    const byId = Object.fromEntries(planets.map((p) => [p.id, p.surface]));
    expect(byId.mercury).toBe('cratered');
    expect(byId.moon).toBe('cratered');
    expect(byId.mars).toBe('cratered');
    expect(byId.venus).toBe('venusAtmo');
  });

  it('contains every expected destination exactly once', () => {
    expect(planets.map((planet) => planet.id)).toEqual(EXPECTED_IDS);
    expect(new Set(planets.map((planet) => planet.id)).size).toBe(planets.length);
    expect(new Set(planets.map((planet) => planet.name)).size).toBe(planets.length);
  });

  it('gives every destination complete, valid display data', () => {
    for (const planet of planets) {
      expect(planet.name.trim()).not.toBe('');
      expect(planet.displayName.trim()).not.toBe('');
      expect(planet.description.trim()).not.toBe('');
      expect(planet.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(Number.isFinite(planet.size)).toBe(true);
      expect(planet.size).toBeGreaterThan(0);
      expect(Number.isFinite(planet.orbitRadius)).toBe(true);
      expect(planet.orbitRadius).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(planet.orbitSpeed)).toBe(true);
      expect(planet.orbitSpeed).toBeGreaterThanOrEqual(0);
      expect(planet.content.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('gives every content file a unique id and meaningful copy', () => {
    const files = planets.flatMap((planet) => planet.content);

    expect(new Set(files.map((file) => file.id)).size).toBe(files.length);
    for (const file of files) {
      expect(file.id.trim()).not.toBe('');
      expect(file.title.trim().length).toBeGreaterThanOrEqual(3);
      expect(file.content.trim().length).toBeGreaterThanOrEqual(20);
      expect(VALID_CONTENT_TYPES).toContain(file.type);
    }
  });

  it('does not ship known template or placeholder claims', () => {
    const portfolioCopy = JSON.stringify(planets);

    for (const placeholder of [
      'jake@example.com',
      'TechCorp',
      'StartupXYZ',
      'John Smith, CTO',
      'Sarah Johnson, PM',
      'Lorem ipsum',
      'TBD',
    ]) {
      expect(portfolioCopy).not.toContain(placeholder);
    }
  });
});
