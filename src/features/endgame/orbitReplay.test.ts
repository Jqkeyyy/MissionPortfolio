import { describe, expect, it } from 'vitest';
import { createOrbitReplayManifest } from './orbitReplay';

describe('createOrbitReplayManifest', () => {
  it('creates flybys in solar-system order and ignores invalid or duplicate progress', () => {
    const manifest = createOrbitReplayManifest([
      'saturn',
      'sun',
      'saturn',
      'not-a-destination',
    ]);

    expect(manifest.flybys.map((flyby) => flyby.id)).toEqual(['sun', 'saturn']);
    expect(manifest.flybys[1]).toMatchObject({
      destinationName: 'Saturn',
      topic: 'Flagship Projects',
      milestoneTitle: 'Fantasy Football Decision-Support Platform',
    });
    expect(manifest.statistics).toMatchObject({
      destinations: 2,
      featuredProjects: 3,
      liveProjects: 1,
    });
    expect(manifest.statistics.missionLogs).toBeGreaterThan(3);
    expect(manifest.statistics.technologies).toBeGreaterThan(0);
  });

  it('returns an empty, zeroed manifest without completed destinations', () => {
    expect(createOrbitReplayManifest([])).toEqual({
      flybys: [],
      statistics: {
        destinations: 0,
        missionLogs: 0,
        featuredProjects: 0,
        liveProjects: 0,
        technologies: 0,
      },
    });
  });
});
