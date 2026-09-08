import type { PlanetThemeId } from '@/data/planetThemes';

export interface PlanetSoundProfile {
  carrierHz: number;
  wave: OscillatorType;
  gain: number;
}

export const PLANET_SOUND_PROFILES = {
  sun: { carrierHz: 110, wave: 'sine', gain: 0.22 },
  mercury: { carrierHz: 196, wave: 'triangle', gain: 0.12 },
  venus: { carrierHz: 146.83, wave: 'sine', gain: 0.18 },
  earth: { carrierHz: 174.61, wave: 'sine', gain: 0.14 },
  moon: { carrierHz: 233.08, wave: 'triangle', gain: 0.08 },
  mars: { carrierHz: 130.81, wave: 'triangle', gain: 0.13 },
  jupiter: { carrierHz: 73.42, wave: 'sine', gain: 0.2 },
  saturn: { carrierHz: 82.41, wave: 'sine', gain: 0.17 },
  uranus: { carrierHz: 123.47, wave: 'triangle', gain: 0.11 },
  neptune: { carrierHz: 98, wave: 'sine', gain: 0.16 },
} as const satisfies Record<PlanetThemeId, PlanetSoundProfile>;

export type MissionCue = 'lock-on' | 'travel' | 'arrival';

export const MISSION_CUE_PROFILES = {
  'lock-on': { startHz: 440, endHz: 660, durationSeconds: 0.12, gain: 0.07 },
  travel: { startHz: 130, endHz: 196, durationSeconds: 0.42, gain: 0.055 },
  arrival: { startHz: 523.25, endHz: 783.99, durationSeconds: 0.28, gain: 0.065 },
} as const satisfies Record<MissionCue, {
  startHz: number;
  endHz: number;
  durationSeconds: number;
  gain: number;
}>;

export const getPlanetSoundProfile = (planetId: PlanetThemeId): PlanetSoundProfile => (
  PLANET_SOUND_PROFILES[planetId]
);
