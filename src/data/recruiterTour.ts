import type { PlanetThemeId } from './planetThemes';

export const RECRUITER_TOUR_DWELL_MS = 12_000;

export interface RecruiterTourStop {
  planetId: PlanetThemeId;
  contentId: string;
  dwellMs: number;
}

export const recruiterTour = [
  { planetId: 'sun', contentId: 'intro-1', dwellMs: RECRUITER_TOUR_DWELL_MS },
  { planetId: 'earth', contentId: 'exp-1', dwellMs: RECRUITER_TOUR_DWELL_MS },
  { planetId: 'saturn', contentId: 'proj-1', dwellMs: RECRUITER_TOUR_DWELL_MS },
  { planetId: 'neptune', contentId: 'contact-1', dwellMs: RECRUITER_TOUR_DWELL_MS },
] as const satisfies readonly RecruiterTourStop[];

export const RECRUITER_TOUR_DWELL_TOTAL_MS = recruiterTour.reduce(
  (total, stop) => total + stop.dwellMs,
  0,
);
