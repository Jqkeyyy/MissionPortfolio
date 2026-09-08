import { describe, expect, it } from 'vitest';
import {
  RECRUITER_TOUR_DWELL_MS,
  RECRUITER_TOUR_DWELL_TOTAL_MS,
  recruiterTour,
} from './recruiterTour';
import { planets } from './planets';
import {
  PLANET_TRAVEL_DURATION_MS,
  SOLAR_INTERCEPT_DURATION_MS,
} from '@/hooks/useGameState';

describe('recruiterTour', () => {
  it('uses the exact Sun to Earth to Saturn to Neptune route', () => {
    expect(recruiterTour.map((stop) => stop.planetId)).toEqual([
      'sun',
      'earth',
      'saturn',
      'neptune',
    ]);
  });

  it('references existing planets and content instead of duplicating portfolio copy', () => {
    recruiterTour.forEach((stop) => {
      const planet = planets.find(({ id }) => id === stop.planetId);
      expect(planet).toBeDefined();
      expect(planet?.content.some(({ id }) => id === stop.contentId)).toBe(true);
      expect(stop).not.toHaveProperty('content');
    });
  });

  it('has four 12-second dwells and an approximately 61-second full route', () => {
    expect(recruiterTour.every((stop) => stop.dwellMs === RECRUITER_TOUR_DWELL_MS)).toBe(true);
    expect(RECRUITER_TOUR_DWELL_TOTAL_MS).toBe(48_000);

    const estimatedDuration = RECRUITER_TOUR_DWELL_TOTAL_MS
      + SOLAR_INTERCEPT_DURATION_MS
      + recruiterTour.length * PLANET_TRAVEL_DURATION_MS;
    expect(estimatedDuration).toBe(60_800);
  });
});
