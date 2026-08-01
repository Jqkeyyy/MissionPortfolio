import { describe, it, expect } from 'vitest';
import { AtmosphereMaterial } from './AtmosphereMaterial';

describe('AtmosphereMaterial', () => {
  it('constructs with the expected default uniforms', () => {
    const material = new AtmosphereMaterial();
    expect(material.uIntensity).toBe(1);
    expect(material.uColor.isColor).toBe(true);
  });
});
