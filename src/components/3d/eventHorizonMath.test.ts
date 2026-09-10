import { describe, expect, it } from 'vitest';
import { getEventHorizonGeometryBudget, sampleEventHorizonMotion } from './eventHorizonMath';

describe('event horizon visual math', () => {
  it('scales geometry cost with the selected quality tier', () => {
    const low = getEventHorizonGeometryBudget('low');
    const balanced = getEventHorizonGeometryBudget('balanced');
    const high = getEventHorizonGeometryBudget('high');

    expect(low.coreSegments).toBeLessThan(balanced.coreSegments);
    expect(balanced.coreSegments).toBeLessThan(high.coreSegments);
    expect(low.diskSegments).toBeLessThan(high.diskSegments);
  });

  it('returns a stable composition when decorative motion is disabled', () => {
    expect(sampleEventHorizonMotion(0, false)).toEqual(
      sampleEventHorizonMotion(400, false),
    );
  });

  it('keeps subtle motion within its intended bounds', () => {
    for (let time = 0; time <= 60; time += 0.25) {
      const sample = sampleEventHorizonMotion(time, true);
      expect(sample.haloPulse).toBeGreaterThanOrEqual(0.965);
      expect(sample.haloPulse).toBeLessThanOrEqual(1.035);
      expect(sample.verticalDrift).toBeGreaterThanOrEqual(-0.12);
      expect(sample.verticalDrift).toBeLessThanOrEqual(0.12);
    }
  });

  it('sanitizes negative and non-finite clock values', () => {
    expect(sampleEventHorizonMotion(-10)).toEqual(sampleEventHorizonMotion(0));
    expect(sampleEventHorizonMotion(Number.NaN)).toEqual(sampleEventHorizonMotion(0));
    expect(sampleEventHorizonMotion(Number.POSITIVE_INFINITY)).toEqual(
      sampleEventHorizonMotion(0),
    );
  });
});
