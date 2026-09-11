import { describe, expect, it } from 'vitest';
import { matchesDiscoRhythm } from './discoSun';

describe('Disco Sun rhythm', () => {
  it('accepts the short-short-long solar rhythm with human tolerance', () => {
    expect(matchesDiscoRhythm([0, 310, 650, 1310])).toBe(true);
    expect(matchesDiscoRhythm([0, 900, 1800, 2700])).toBe(false);
  });
});
