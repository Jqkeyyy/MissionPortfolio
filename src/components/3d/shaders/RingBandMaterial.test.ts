import { describe, it, expect } from 'vitest';
import { RingBandMaterial } from './RingBandMaterial';

describe('RingBandMaterial', () => {
  it('constructs with the expected default uniforms', () => {
    const material = new RingBandMaterial();
    expect(material.uSeed).toBe(0);
    expect(material.uInnerRadius).toBe(1);
    expect(material.uOuterRadius).toBe(2);
    expect(material.uColorA.isColor).toBe(true);
    expect(material.uColorB.isColor).toBe(true);
  });
});
