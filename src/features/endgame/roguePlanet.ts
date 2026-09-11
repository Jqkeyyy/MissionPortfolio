import { getProjectById } from '@/data/projects';
import type { PortfolioProject, ProjectLink } from '@/types/portfolio';

export const ROGUE_PLANET_PASS_INTERVAL_MS = 75_000;
export const ROGUE_PLANET_CAPTURE_WINDOW_MS = 18_000;
export const ROGUE_PLANET_DEFAULT_APPEARANCE_RATE = 0.22;
export const ROGUE_PLANET_DEFAULT_SEED = 'mission-portfolio-rogue-planet';

export interface RoguePlanetPassInput {
  /** Rogue Planet is an endgame reward and cannot appear before mission completion. */
  missionComplete: boolean;
  /** A monotonically increasing orbit, timer, or encounter counter supplied by the host. */
  passIndex: number;
  /** Stable per visitor/session seed. Equal seeds and pass indexes always produce equal results. */
  seed?: string;
  /** A value from 0 to 1. Defaults to an occasional 22% of eligible passes. */
  appearanceRate?: number;
}

export interface RoguePlanetPass {
  encounterId: string;
  passIndex: number;
  approachAngleDeg: number;
  signalStrengthPercent: number;
  captureWindowMs: number;
}

export interface RoguePlanetPayload {
  id: string;
  projectId: string;
  projectPath: string;
  eyebrow: string;
  title: string;
  summary: string;
  story: string;
  revealLabel: string;
  technologies: readonly string[];
  fieldNotes: readonly string[];
  links: readonly ProjectLink[];
}

const clamp = (value: number, min: number, max: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

/** FNV-1a gives us a tiny, platform-independent source of repeatable encounter rolls. */
const hashToUnitInterval = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 0x1_0000_0000;
};

export const getRoguePlanetPassIndex = (
  elapsedMs: number,
  passIntervalMs = ROGUE_PLANET_PASS_INTERVAL_MS,
) => {
  const safeElapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const safeInterval = Math.max(1, Number.isFinite(passIntervalMs) ? passIntervalMs : ROGUE_PLANET_PASS_INTERVAL_MS);
  return Math.floor(safeElapsed / safeInterval);
};

/**
 * Plans an occasional Rogue Planet flyby without reading time or random globals.
 * The host owns the pass counter, so the same inputs can be replayed exactly.
 */
export const planRoguePlanetPass = ({
  missionComplete,
  passIndex,
  seed = ROGUE_PLANET_DEFAULT_SEED,
  appearanceRate = ROGUE_PLANET_DEFAULT_APPEARANCE_RATE,
}: RoguePlanetPassInput): RoguePlanetPass | null => {
  if (!missionComplete) return null;

  const safePassIndex = Math.max(0, Math.floor(Number.isFinite(passIndex) ? passIndex : 0));
  const safeRate = clamp(appearanceRate, 0, 1, ROGUE_PLANET_DEFAULT_APPEARANCE_RATE);
  const encounterKey = `${seed}:${safePassIndex}`;
  if (hashToUnitInterval(`${encounterKey}:appearance`) >= safeRate) return null;

  return {
    encounterId: `rogue-${safePassIndex}-${Math.floor(hashToUnitInterval(encounterKey) * 0xffffff).toString(16).padStart(6, '0')}`,
    passIndex: safePassIndex,
    approachAngleDeg: Math.round(hashToUnitInterval(`${encounterKey}:angle`) * 359),
    signalStrengthPercent: 58 + Math.round(hashToUnitInterval(`${encounterKey}:signal`) * 41),
    captureWindowMs: ROGUE_PLANET_CAPTURE_WINDOW_MS,
  };
};

export const createRoguePlanetPayload = (project: PortfolioProject): RoguePlanetPayload => ({
  id: `prototype-zero-${project.id}`,
  projectId: project.id,
  projectPath: `/projects/${project.id}`,
  eyebrow: 'Recovered prototype // Personal build log',
  title: 'Prototype Zero: The Page That Became a Place',
  summary: project.oneLineSummary,
  story: 'This mission began with a stubborn question: could a portfolio demonstrate curiosity before anyone read a case study? The first prototype was only a few orbiting shapes. Keeping that playful idea alive while adding a fast recruiter route, real evidence, and accessible controls became the project behind the projects.',
  revealLabel: `Hidden build record for ${project.name}`,
  technologies: project.technologies,
  fieldNotes: [
    ...project.caseStudy.engineeringHighlights,
    'The strange parts stayed only when they made the professional story easier to remember.',
  ],
  links: project.links,
});

const missionPortfolioProject = getProjectById('mission-portfolio');

if (!missionPortfolioProject) {
  throw new Error('Rogue Planet requires the canonical Mission Portfolio project record.');
}

export const ROGUE_PLANET_PAYLOAD = createRoguePlanetPayload(missionPortfolioProject);
