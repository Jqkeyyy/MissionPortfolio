import { describe, it, expect, vi } from 'vitest';
import { PlanetSurfaceMaterial, SURFACE_TYPES } from './PlanetSurfaceMaterial';

vi.mock('@react-three/fiber', () => ({ extend: vi.fn() }));

describe('PlanetSurfaceMaterial', () => {
  it('exposes the expected surface type indices', () => {
    expect(SURFACE_TYPES).toEqual({
      cratered: 0,
      banded: 1,
      earthlike: 2,
      venusAtmo: 3,
    });
  });

  it('constructs with the expected default uniforms', () => {
    const material = new PlanetSurfaceMaterial();
    expect(material.uTime).toBe(0);
    expect(material.uSeed).toBe(0);
    expect(material.uSurfaceType).toBe(0);
    expect(material.uBaseColor.isColor).toBe(true);
    expect(material.uAccentColor.isColor).toBe(true);
  });
});
