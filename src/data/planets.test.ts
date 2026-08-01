import { describe, it, expect } from 'vitest';
import { planets } from './planets';
import type { PlanetSurface } from './planets';

const VALID_SURFACES: PlanetSurface[] = ['cratered', 'banded', 'earthlike', 'venusAtmo'];

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
});
