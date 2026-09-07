import { describe, it, expect, vi } from 'vitest';
import { AtmosphereMaterial } from './AtmosphereMaterial';

vi.mock('@react-three/fiber', () => ({ extend: vi.fn() }));

describe('AtmosphereMaterial', () => {
  it('constructs with the expected default uniforms', () => {
    const material = new AtmosphereMaterial();
    expect(material.uIntensity).toBe(1);
    expect(material.uColor.isColor).toBe(true);
  });
});
