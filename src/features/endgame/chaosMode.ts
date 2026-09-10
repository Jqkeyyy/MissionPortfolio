import * as THREE from 'three';
import type { PlanetData } from '@/data/planets';
import type { PlanetThemeId } from '@/data/planetThemes';

const TAU = Math.PI * 2;
const EARTH_DAY_SECONDS = 24 * 60 * 60;
const MISSION_ORBIT_TIME_FACTOR = (365.25 * EARTH_DAY_SECONDS) / 60;
const SOLAR_SYSTEM_CENTER_Y = 15;
const DEFAULT_PARENT_SHIFT_SECONDS = 18;
const PARENT_TRANSITION_PORTION = 0.3;

export type ChaosPresetId = 'physics-left-chat' | 'cosmic-shuffle';

export interface ChaosModeSettings {
  enabled: boolean;
  seed: number;
  intensity: number;
  presetId: ChaosPresetId;
  parentShiftSeconds: number;
}

export interface ChaosParentTransition {
  fromId?: PlanetThemeId;
  toId?: PlanetThemeId;
  progress: number;
}

export interface ChaosPlanetFrame {
  id: PlanetThemeId;
  color: string;
  scale: number;
  orbitSpeedMultiplier: number;
  orbitInclinationDeg: number;
  axialTiltDeg: number;
  orbitRadius: number;
  orbitParentId?: PlanetThemeId;
  parentTransition: ChaosParentTransition;
}

export interface ChaosSystemSnapshot {
  elapsedSeconds: number;
  readonly frames: ReadonlyMap<PlanetThemeId, ChaosPlanetFrame>;
  readonly positions: ReadonlyMap<PlanetThemeId, THREE.Vector3>;
}

export interface ChaosSystemSnapshotWriter {
  readonly snapshot: ChaosSystemSnapshot;
  update: (
    elapsedSeconds: number,
    settings?: Partial<ChaosModeSettings>,
  ) => ChaosSystemSnapshot;
}

export const DEFAULT_CHAOS_MODE_SETTINGS: Readonly<ChaosModeSettings> = {
  enabled: false,
  seed: 0xc0ffee,
  intensity: 0.72,
  presetId: 'physics-left-chat',
  parentShiftSeconds: DEFAULT_PARENT_SHIFT_SECONDS,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number) => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

const hashString = (value: string, seed: number) => {
  let hash = (2166136261 ^ seed) >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;
  return hash >>> 0;
};

const seededUnit = (seed: number, key: string) => hashString(key, seed) / 0xffffffff;

const planetWave = (
  planetId: PlanetThemeId,
  elapsedSeconds: number,
  seed: number,
  channel: string,
  minimumPeriod: number,
  maximumPeriod: number,
) => {
  const phase = seededUnit(seed, `${planetId}:${channel}:phase`) * TAU;
  const period = minimumPeriod
    + seededUnit(seed, `${planetId}:${channel}:period`) * (maximumPeriod - minimumPeriod);
  const primary = Math.sin(phase + (elapsedSeconds / period) * TAU);
  const secondary = Math.sin(phase * 0.47 + (elapsedSeconds / (period * 0.61)) * TAU);
  return primary * 0.72 + secondary * 0.28;
};

const normalizeSettings = (
  settings: Partial<ChaosModeSettings> = {},
): ChaosModeSettings => ({
  ...DEFAULT_CHAOS_MODE_SETTINGS,
  ...settings,
  seed: Number.isFinite(settings.seed)
    ? Math.trunc(settings.seed!) >>> 0
    : DEFAULT_CHAOS_MODE_SETTINGS.seed,
  intensity: clamp01(
    Number.isFinite(settings.intensity)
      ? settings.intensity!
      : DEFAULT_CHAOS_MODE_SETTINGS.intensity,
  ),
  parentShiftSeconds: Math.max(
    4,
    Number.isFinite(settings.parentShiftSeconds)
      ? settings.parentShiftSeconds!
      : DEFAULT_PARENT_SHIFT_SECONDS,
  ),
});

const getChaosHierarchy = (
  planets: readonly PlanetData[],
  presetId: ChaosPresetId,
) => {
  const ids = planets.map((planet) => planet.id);
  const hasEarthMoonPair = ids.includes('earth') && ids.includes('moon');
  const preferred = presetId === 'physics-left-chat' && hasEarthMoonPair
    ? ['sun', 'moon', 'earth'] satisfies PlanetThemeId[]
    : ['sun'] satisfies PlanetThemeId[];
  const preferredIds = new Set<PlanetThemeId>(preferred);
  return [
    ...preferred.filter((id) => ids.includes(id)),
    ...ids.filter((id) => !preferredIds.has(id)),
  ];
};

const selectParent = (
  planetId: PlanetThemeId,
  epoch: number,
  hierarchy: readonly PlanetThemeId[],
  settings: ChaosModeSettings,
) => {
  if (planetId === 'sun') return undefined;
  if (
    settings.presetId === 'physics-left-chat'
    && planetId === 'earth'
    && hierarchy.includes('moon')
  ) {
    return 'moon';
  }

  const rank = hierarchy.indexOf(planetId);
  if (rank <= 0) return undefined;
  const candidates = hierarchy.slice(0, rank);
  const initialIndex = hashString(`${planetId}:parent`, settings.seed) % candidates.length;
  const epochIndex = ((epoch % candidates.length) + candidates.length) % candidates.length;
  return candidates[(initialIndex + epochIndex) % candidates.length];
};

const getParentTransition = (
  planetId: PlanetThemeId,
  elapsedSeconds: number,
  hierarchy: readonly PlanetThemeId[],
  settings: ChaosModeSettings,
): ChaosParentTransition => {
  const epochPosition = Math.max(0, elapsedSeconds) / settings.parentShiftSeconds;
  const epoch = Math.floor(epochPosition);
  const epochProgress = epochPosition - epoch;
  const transitionStart = 1 - PARENT_TRANSITION_PORTION;
  const progress = smoothstep(
    (epochProgress - transitionStart) / PARENT_TRANSITION_PORTION,
  );

  return {
    fromId: selectParent(planetId, epoch, hierarchy, settings),
    toId: selectParent(planetId, epoch + 1, hierarchy, settings),
    progress,
  };
};

const getOrbitRadiusForParent = (
  planet: PlanetData,
  parentId: PlanetThemeId | undefined,
  planetsById: ReadonlyMap<PlanetThemeId, PlanetData>,
  seed: number,
) => {
  if (planet.orbitRadius <= 0) return 0;
  if (!parentId || parentId === 'sun') return planet.orbitRadius;

  const parent = planetsById.get(parentId);
  const clearance = planet.size + (parent?.size ?? 1);
  const spacing = 1.9 + seededUnit(seed, `${planet.id}:${parentId}:spacing`) * 1.7;
  return Math.max(2.25, clearance * spacing);
};

const getFrameValues = (
  planet: PlanetData,
  elapsedSeconds: number,
  settings: ChaosModeSettings,
) => {
  const intensity = settings.enabled ? settings.intensity : 0;
  const speedWave = planetWave(planet.id, elapsedSeconds, settings.seed, 'speed', 14, 38);
  const tiltWave = planetWave(planet.id, elapsedSeconds, settings.seed, 'tilt', 19, 47);
  const axialWave = planetWave(planet.id, elapsedSeconds, settings.seed, 'axial', 23, 53);
  const scaleWave = planetWave(planet.id, elapsedSeconds, settings.seed, 'scale', 11, 31);
  const hueWave = planetWave(planet.id, elapsedSeconds, settings.seed, 'hue', 9, 27);

  // At higher intensities this deliberately crosses zero, briefly reversing an orbit.
  const orbitSpeedMultiplier = 1
    + intensity * (0.65 + speedWave * 2.45);
  const orbitInclinationDeg = planet.orbitInclinationDeg
    + intensity * (tiltWave * 72 + seededUnit(settings.seed, `${planet.id}:tilt:bias`) * 18 - 9);
  const axialTiltDeg = planet.axialTiltDeg + intensity * axialWave * 110;
  const scale = Math.max(0.35, 1 + intensity * scaleWave * 0.62);

  const color = new THREE.Color(planet.color);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  color.setHSL(
    (hsl.h + intensity * (0.34 + hueWave * 0.28) + 1) % 1,
    Math.min(1, Math.max(0.46, hsl.s + intensity * 0.34)),
    Math.min(0.72, Math.max(0.3, hsl.l + intensity * hueWave * 0.16)),
  );

  return {
    color: `#${color.getHexString()}`,
    scale,
    orbitSpeedMultiplier,
    orbitInclinationDeg,
    axialTiltDeg,
  };
};

const buildChaosPlanetFrame = (
  planet: PlanetData,
  elapsedSeconds: number,
  settings: ChaosModeSettings,
  hierarchy: readonly PlanetThemeId[],
  parentsById: ReadonlyMap<PlanetThemeId, PlanetData>,
): ChaosPlanetFrame => {
  if (!settings.enabled) {
    return {
      id: planet.id,
      color: planet.color,
      scale: 1,
      orbitSpeedMultiplier: 1,
      orbitInclinationDeg: planet.orbitInclinationDeg,
      axialTiltDeg: planet.axialTiltDeg,
      orbitRadius: planet.orbitRadius,
      orbitParentId: planet.orbitParentId,
      parentTransition: {
        fromId: planet.orbitParentId,
        toId: planet.orbitParentId,
        progress: 0,
      },
    };
  }

  const parentTransition = getParentTransition(
    planet.id,
    elapsedSeconds,
    hierarchy,
    settings,
  );
  const fromRadius = getOrbitRadiusForParent(
    planet,
    parentTransition.fromId,
    parentsById,
    settings.seed,
  );
  const toRadius = getOrbitRadiusForParent(
    planet,
    parentTransition.toId,
    parentsById,
    settings.seed,
  );

  return {
    id: planet.id,
    ...getFrameValues(planet, elapsedSeconds, settings),
    orbitRadius: THREE.MathUtils.lerp(fromRadius, toRadius, parentTransition.progress),
    orbitParentId: parentTransition.progress < 0.5
      ? parentTransition.fromId
      : parentTransition.toId,
    parentTransition,
  };
};

export const getChaosPlanetFrame = (
  planets: readonly PlanetData[],
  planetId: PlanetThemeId,
  elapsedSeconds: number,
  partialSettings: Partial<ChaosModeSettings> = {},
): ChaosPlanetFrame | undefined => {
  const planet = planets.find((candidate) => candidate.id === planetId);
  if (!planet) return undefined;
  const settings = normalizeSettings(partialSettings);
  const hierarchy = getChaosHierarchy(planets, settings.presetId);
  const parentsById = new Map(planets.map((candidate) => [candidate.id, candidate]));
  return buildChaosPlanetFrame(
    planet,
    elapsedSeconds,
    settings,
    hierarchy,
    parentsById,
  );
};

export const getChaosSystemFrame = (
  planets: readonly PlanetData[],
  elapsedSeconds: number,
  partialSettings: Partial<ChaosModeSettings> = {},
) => {
  const settings = normalizeSettings(partialSettings);
  const hierarchy = getChaosHierarchy(planets, settings.presetId);
  const parentsById = new Map(planets.map((planet) => [planet.id, planet]));
  return new Map(
    planets.map((planet) => [
      planet.id,
      buildChaosPlanetFrame(
        planet,
        elapsedSeconds,
        settings,
        hierarchy,
        parentsById,
      ),
    ]),
  );
};

const getIntegratedOrbitTime = (
  planet: PlanetData,
  elapsedSeconds: number,
  settings: ChaosModeSettings,
) => {
  const intensity = settings.intensity;
  const period = 14
    + seededUnit(settings.seed, `${planet.id}:speed:period`) * (38 - 14);
  const angularFrequency = TAU / period;
  const phase = seededUnit(settings.seed, `${planet.id}:speed:phase`) * TAU;
  const center = 1 + intensity * 0.65;
  const amplitude = intensity * 2.45;
  const secondaryPeriod = period * 0.61;
  const secondaryFrequency = TAU / secondaryPeriod;
  const secondaryPhase = phase * 0.47;

  const primaryIntegral = (
    Math.cos(phase) - Math.cos(phase + angularFrequency * elapsedSeconds)
  ) / angularFrequency;
  const secondaryIntegral = (
    Math.cos(secondaryPhase) - Math.cos(secondaryPhase + secondaryFrequency * elapsedSeconds)
  ) / secondaryFrequency;

  return center * elapsedSeconds
    + amplitude * (primaryIntegral * 0.72 + secondaryIntegral * 0.28);
};

const writeLocalPosition = (
  planet: PlanetData,
  frame: ChaosPlanetFrame,
  elapsedSeconds: number,
  settings: ChaosModeSettings,
  target: THREE.Vector3,
) => {
  if (frame.orbitRadius <= 0 || planet.orbitalPeriodDays <= 0) return target.set(0, 0, 0);
  const durationSeconds = planet.orbitalPeriodDays * EARTH_DAY_SECONDS;
  const phase = seededUnit(settings.seed, `${planet.id}:orbit:phase`) * TAU
    + (
      getIntegratedOrbitTime(planet, elapsedSeconds, settings)
      * MISSION_ORBIT_TIME_FACTOR
      / durationSeconds
    ) * TAU;
  const eccentricity = Math.min(0.72, Math.max(0, planet.orbitalEccentricity));
  const eccentricAnomaly = phase + eccentricity * Math.sin(phase);
  const semiMinorAxis = frame.orbitRadius * Math.sqrt(1 - eccentricity ** 2);
  const planeX = frame.orbitRadius * (Math.cos(eccentricAnomaly) - eccentricity);
  const planeZ = semiMinorAxis * Math.sin(eccentricAnomaly);
  const inclination = THREE.MathUtils.degToRad(frame.orbitInclinationDeg);
  return target.set(
    planeX,
    planeZ * Math.sin(inclination),
    planeZ * Math.cos(inclination),
  );
};

/**
 * Writes a smoothly animated Chaos Mode position without ever following a cyclic
 * parent graph. Pass R3F's real `state.clock.elapsedTime`, not the accelerated
 * physical orbit clock used by the normal simulation.
 */
export const writeChaosBodyPosition = (
  planets: readonly PlanetData[],
  planetId: PlanetThemeId,
  elapsedSeconds: number,
  target: THREE.Vector3,
  partialSettings: Partial<ChaosModeSettings> = {},
) => {
  const settings = normalizeSettings(partialSettings);
  const planetById = new Map(planets.map((planet) => [planet.id, planet]));
  const frameById = getChaosSystemFrame(planets, elapsedSeconds, settings);
  const resolved = new Map<PlanetThemeId, THREE.Vector3>();

  const resolve = (id: PlanetThemeId): THREE.Vector3 => {
    const cached = resolved.get(id);
    if (cached) return cached;
    const planet = planetById.get(id);
    const frame = frameById.get(id);
    if (!planet || !frame) return new THREE.Vector3(0, SOLAR_SYSTEM_CENTER_Y, 0);
    if (planet.orbitRadius <= 0) {
      const center = new THREE.Vector3(0, SOLAR_SYSTEM_CENTER_Y, 0);
      resolved.set(id, center);
      return center;
    }

    const getCenter = (parentId?: PlanetThemeId) => (
      parentId ? resolve(parentId) : new THREE.Vector3(0, SOLAR_SYSTEM_CENTER_Y, 0)
    );
    const center = getCenter(frame.parentTransition.fromId).clone().lerp(
      getCenter(frame.parentTransition.toId),
      frame.parentTransition.progress,
    );
    const local = writeLocalPosition(
      planet,
      frame,
      Math.max(0, elapsedSeconds),
      settings,
      new THREE.Vector3(),
    );
    center.add(local);
    resolved.set(id, center);
    return center;
  };

  const position = resolve(planetId);
  return target.copy(position);
};

/**
 * Creates a Canvas-level Chaos Mode calculator. Its snapshot object, maps, and
 * position vectors keep stable identities between updates so meshes can read the
 * latest values from a shared ref without triggering React renders or rebuilding
 * the solar system once per planet.
 */
export const createChaosSystemSnapshotWriter = (
  planets: readonly PlanetData[],
): ChaosSystemSnapshotWriter => {
  const planetById = new Map(planets.map((planet) => [planet.id, planet]));
  const frames = new Map<PlanetThemeId, ChaosPlanetFrame>();
  const positions = new Map<PlanetThemeId, THREE.Vector3>();
  const localPositions = new Map<PlanetThemeId, THREE.Vector3>();
  const resolved = new Set<PlanetThemeId>();
  const solarCenter = new THREE.Vector3(0, SOLAR_SYSTEM_CENTER_Y, 0);

  for (const planet of planets) {
    positions.set(planet.id, new THREE.Vector3());
    localPositions.set(planet.id, new THREE.Vector3());
  }

  const snapshot: ChaosSystemSnapshot = {
    elapsedSeconds: 0,
    frames,
    positions,
  };

  const update = (
    elapsedSeconds: number,
    partialSettings: Partial<ChaosModeSettings> = {},
  ) => {
    const safeElapsedSeconds = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    const settings = normalizeSettings(partialSettings);
    const hierarchy = getChaosHierarchy(planets, settings.presetId);

    for (const planet of planets) {
      const nextFrame = buildChaosPlanetFrame(
        planet,
        safeElapsedSeconds,
        settings,
        hierarchy,
        planetById,
      );
      const existingFrame = frames.get(planet.id);
      if (existingFrame) {
        const parentTransition = existingFrame.parentTransition;
        Object.assign(existingFrame, nextFrame, { parentTransition });
        Object.assign(parentTransition, nextFrame.parentTransition);
      } else {
        frames.set(planet.id, nextFrame);
      }
    }

    resolved.clear();
    const resolve = (id: PlanetThemeId): THREE.Vector3 => {
      const target = positions.get(id);
      const planet = planetById.get(id);
      const frame = frames.get(id);
      if (!target || !planet || !frame) {
        return target?.set(0, SOLAR_SYSTEM_CENTER_Y, 0)
          ?? solarCenter;
      }
      if (resolved.has(id)) return target;
      if (planet.orbitRadius <= 0) {
        resolved.add(id);
        return target.set(0, SOLAR_SYSTEM_CENTER_Y, 0);
      }

      const fromPosition = frame.parentTransition.fromId
        ? resolve(frame.parentTransition.fromId)
        : undefined;
      target.copy(fromPosition ?? solarCenter);
      if (frame.parentTransition.toId !== frame.parentTransition.fromId) {
        const toPosition = frame.parentTransition.toId
          ? resolve(frame.parentTransition.toId)
          : undefined;
        if (toPosition) {
          target.lerp(toPosition, frame.parentTransition.progress);
        } else {
          target.lerp(solarCenter, frame.parentTransition.progress);
        }
      }

      const local = localPositions.get(id)!;
      writeLocalPosition(planet, frame, safeElapsedSeconds, settings, local);
      target.add(local);
      resolved.add(id);
      return target;
    };

    for (const planet of planets) resolve(planet.id);
    snapshot.elapsedSeconds = safeElapsedSeconds;
    return snapshot;
  };

  return { snapshot, update };
};

/**
 * Convenience adapter for render paths that already consume PlanetData. Position
 * code should still use writeChaosBodyPosition so signed speed and parent blending
 * are preserved.
 */
export const applyChaosFrameToPlanets = (
  planets: readonly PlanetData[],
  elapsedSeconds: number,
  settings: Partial<ChaosModeSettings> = {},
): PlanetData[] => {
  const frameById = getChaosSystemFrame(planets, elapsedSeconds, settings);
  return planets.map((planet) => {
    const frame = frameById.get(planet.id)!;
    return {
      ...planet,
      color: frame.color,
      size: planet.size * frame.scale,
      orbitRadius: frame.orbitRadius,
      orbitalPeriodDays: planet.orbitalPeriodDays > 0
        ? planet.orbitalPeriodDays / Math.max(0.08, Math.abs(frame.orbitSpeedMultiplier))
        : planet.orbitalPeriodDays,
      orbitInclinationDeg: frame.orbitInclinationDeg,
      axialTiltDeg: frame.axialTiltDeg,
      orbitParentId: frame.orbitParentId,
    };
  });
};
