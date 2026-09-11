import { planets } from '@/data/planets';
import { projects } from '@/data/projects';
import type { PlanetThemeId } from '@/data/planetThemes';

export interface OrbitReplayFlyby {
  id: PlanetThemeId;
  destinationName: string;
  topic: string;
  color: string;
  milestoneTitle: string;
  milestoneSummary: string;
  projectNames: readonly string[];
  metric?: {
    value: string;
    label: string;
  };
}

export interface OrbitReplayStatistics {
  destinations: number;
  missionLogs: number;
  featuredProjects: number;
  liveProjects: number;
  technologies: number;
}

export interface OrbitReplayManifest {
  flybys: readonly OrbitReplayFlyby[];
  statistics: OrbitReplayStatistics;
}

/**
 * Builds a stable replay in solar-system order from persisted exploration progress.
 * Unknown and duplicate IDs are intentionally ignored so old storage cannot break
 * the endgame experience.
 */
export const createOrbitReplayManifest = (
  visitedPlanetIds: readonly string[],
): OrbitReplayManifest => {
  const visitedIds = new Set(visitedPlanetIds);
  const completedPlanets = planets.filter((planet) => visitedIds.has(planet.id));
  const completedProjectIds = new Set<string>(
    completedPlanets.flatMap((planet) => (
      planet.content.flatMap((entry) => entry.projectId ? [entry.projectId] : [])
    )),
  );
  const completedProjects = projects.filter((project) => completedProjectIds.has(project.id));
  const technologies = new Set(completedProjects.flatMap((project) => [...project.technologies]));

  const flybys = completedPlanets.map<OrbitReplayFlyby>((planet) => {
    const planetProjects = projects.filter((project) => (
      planet.content.some((entry) => entry.projectId === project.id)
    ));
    const leadProject = planetProjects[0];
    const leadLog = planet.content[0];

    return {
      id: planet.id,
      destinationName: planet.displayName,
      topic: planet.description,
      color: planet.color,
      milestoneTitle: leadProject?.name ?? leadLog?.title ?? planet.description,
      milestoneSummary: leadProject?.oneLineSummary ?? leadLog?.content ?? planet.description,
      projectNames: planetProjects.map((project) => project.name),
      metric: leadProject?.metrics[0]
        ? {
            value: leadProject.metrics[0].value,
            label: leadProject.metrics[0].label,
          }
        : undefined,
    };
  });

  return {
    flybys,
    statistics: {
      destinations: completedPlanets.length,
      missionLogs: completedPlanets.reduce((total, planet) => total + planet.content.length, 0),
      featuredProjects: completedProjects.length,
      liveProjects: completedProjects.filter((project) => project.status === 'live').length,
      technologies: technologies.size,
    },
  };
};
