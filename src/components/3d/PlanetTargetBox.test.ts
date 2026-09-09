import { describe, expect, it } from 'vitest';
import { getPlanetTargetBoxSize } from './planetTargetBoxGeometry';

describe('PlanetTargetBox geometry', () => {
  it('adds clearance around the complete target radius', () => {
    expect(getPlanetTargetBoxSize(2)).toBeCloseTo(4.7);
    expect(getPlanetTargetBoxSize(4)).toBeCloseTo(9.4);
  });
});
