import { describe, expect, it } from 'vitest';
import { getProjectById } from '@/data/projects';
import {
  ROGUE_PLANET_CAPTURE_WINDOW_MS,
  ROGUE_PLANET_PAYLOAD,
  createRoguePlanetPayload,
  getRoguePlanetPassIndex,
  planRoguePlanetPass,
} from './roguePlanet';

describe('planRoguePlanetPass', () => {
  it('only plans encounters for completed missions and eligible rolls', () => {
    expect(planRoguePlanetPass({
      missionComplete: false,
      passIndex: 3,
      appearanceRate: 1,
    })).toBeNull();

    expect(planRoguePlanetPass({
      missionComplete: true,
      passIndex: 3,
      appearanceRate: 0,
    })).toBeNull();
  });

  it('returns stable encounter details for the same seed and pass', () => {
    const input = {
      missionComplete: true,
      passIndex: 7,
      seed: 'visitor-42',
      appearanceRate: 1,
    } as const;

    const first = planRoguePlanetPass(input);
    const replay = planRoguePlanetPass(input);

    expect(replay).toEqual(first);
    expect(first).toEqual(expect.objectContaining({
      passIndex: 7,
      captureWindowMs: ROGUE_PLANET_CAPTURE_WINDOW_MS,
    }));
    expect(first!.approachAngleDeg).toBeGreaterThanOrEqual(0);
    expect(first!.approachAngleDeg).toBeLessThan(360);
    expect(first!.signalStrengthPercent).toBeGreaterThanOrEqual(58);
    expect(first!.signalStrengthPercent).toBeLessThanOrEqual(99);
  });

  it('normalizes counters and converts elapsed time into host-owned pass indexes', () => {
    expect(getRoguePlanetPassIndex(-100, 1_000)).toBe(0);
    expect(getRoguePlanetPassIndex(2_999, 1_000)).toBe(2);
    expect(planRoguePlanetPass({
      missionComplete: true,
      passIndex: -4.8,
      appearanceRate: 1,
    })?.passIndex).toBe(0);
  });
});

describe('Rogue Planet payload', () => {
  it('derives its hidden build record from canonical project data', () => {
    const project = getProjectById('mission-portfolio')!;
    const payload = createRoguePlanetPayload(project);

    expect(payload.projectId).toBe(project.id);
    expect(payload.projectPath).toBe('/projects/mission-portfolio');
    expect(payload.summary).toBe(project.oneLineSummary);
    expect(payload.technologies).toEqual(project.technologies);
    project.caseStudy.engineeringHighlights.forEach((highlight) => {
      expect(payload.fieldNotes).toContain(highlight);
    });
    expect(ROGUE_PLANET_PAYLOAD).toEqual(payload);
  });
});
