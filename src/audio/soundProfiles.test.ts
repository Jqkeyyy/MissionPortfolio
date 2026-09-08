import { describe, expect, it } from 'vitest';
import { PLANET_THEME_IDS } from '@/data/planetThemes';
import {
  MISSION_CUE_PROFILES,
  PLANET_SOUND_PROFILES,
  getPlanetSoundProfile,
} from './soundProfiles';

describe('soundProfiles', () => {
  it('provides a restrained ambience profile for every destination', () => {
    expect(Object.keys(PLANET_SOUND_PROFILES)).toEqual([...PLANET_THEME_IDS]);
    PLANET_THEME_IDS.forEach((planetId) => {
      const profile = getPlanetSoundProfile(planetId);
      expect(profile.carrierHz).toBeGreaterThanOrEqual(70);
      expect(profile.carrierHz).toBeLessThan(250);
      expect(profile.gain).toBeGreaterThan(0);
      expect(profile.gain).toBeLessThanOrEqual(0.22);
    });
  });

  it('defines brief, quiet lock-on, travel, and arrival cues', () => {
    expect(Object.keys(MISSION_CUE_PROFILES)).toEqual(['lock-on', 'travel', 'arrival']);
    Object.values(MISSION_CUE_PROFILES).forEach((cue) => {
      expect(cue.durationSeconds).toBeLessThan(0.5);
      expect(cue.gain).toBeLessThan(0.08);
    });
  });
});
