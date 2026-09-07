import { describe, it, expect } from 'vitest';
import { planets } from './planets';
import type { ContentSign, PlanetSurface } from './planets';
import { projects } from './projects';

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
      expect(Number.isFinite(planet.orbitalPeriodDays)).toBe(true);
      expect(planet.orbitalPeriodDays).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(planet.orbitalEccentricity)).toBe(true);
      expect(planet.orbitalEccentricity).toBeGreaterThanOrEqual(0);
      expect(planet.orbitalEccentricity).toBeLessThan(1);
      expect(Number.isFinite(planet.orbitInclinationDeg)).toBe(true);
      expect(Number.isFinite(planet.rotationPeriodHours)).toBe(true);
      expect(planet.rotationPeriodHours).not.toBe(0);
      expect(Number.isFinite(planet.axialTiltDeg)).toBe(true);
      expect(planet.axialTiltDeg).toBeGreaterThanOrEqual(0);
      expect(planet.axialTiltDeg).toBeLessThanOrEqual(180);
      expect(planet.content.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('models rings on all four giant planets and no other bodies', () => {
    expect(planets.filter((planet) => planet.rings).map((planet) => planet.id)).toEqual([
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
    ]);

    for (const planet of planets.filter((candidate) => candidate.rings)) {
      const rings = planet.rings!;
      expect(rings.innerRadiusMultiplier).toBeGreaterThan(1);
      expect(rings.outerRadiusMultiplier).toBeGreaterThan(rings.innerRadiusMultiplier);
      expect(rings.colorA).toMatch(/^#[0-9a-f]{6}$/i);
      expect(rings.colorB).toMatch(/^#[0-9a-f]{6}$/i);
      expect(rings.opacity).toBeGreaterThan(0);
      expect(rings.opacity).toBeLessThanOrEqual(1);
    }
  });

  it('makes the Moon an Earth satellite', () => {
    expect(planets.find((planet) => planet.id === 'moon')?.orbitParentId).toBe('earth');
    expect(planets.filter((planet) => planet.orbitParentId).map((planet) => planet.id)).toEqual([
      'moon',
    ]);
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

  it('connects every Saturn and Uranus archive entry to one catalog project', () => {
    const archiveEntries = planets
      .filter((planet) => planet.id === 'saturn' || planet.id === 'uranus')
      .flatMap((planet) => planet.content);
    const projectIds = new Set(projects.map((project) => project.id));

    expect(archiveEntries.map((entry) => entry.projectId)).toHaveLength(projects.length);
    expect(new Set(archiveEntries.map((entry) => entry.projectId))).toEqual(projectIds);
  });
});
