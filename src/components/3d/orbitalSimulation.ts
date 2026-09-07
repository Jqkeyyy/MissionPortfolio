import * as THREE from 'three';
import { getPlanetById, type PlanetData } from '@/data/planets';

export const EARTH_YEAR_DAYS = 365.25;
export const ORBITAL_EARTH_YEAR_SECONDS = 60;
export const ROTATION_EARTH_DAY_SECONDS = 12;
export const SOLAR_SYSTEM_CENTER_Y = 15;

const TAU = Math.PI * 2;

// Stable presentation phases keep the map deterministic. They are not a live ephemeris.
export const getInitialOrbitAngle = (planetId: string) => {
  const phaseDegrees = [...planetId].reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  ) % 360;
  return THREE.MathUtils.degToRad(phaseDegrees);
};

export const getOrbitDurationSeconds = (planet: PlanetData) => (
  planet.orbitalPeriodDays <= 0
    ? Number.POSITIVE_INFINITY
    : (planet.orbitalPeriodDays / EARTH_YEAR_DAYS) * ORBITAL_EARTH_YEAR_SECONDS
);

export const getRotationDurationSeconds = (planet: PlanetData) => {
  if (planet.id === 'moon') return getOrbitDurationSeconds(planet);
  return (Math.abs(planet.rotationPeriodHours) / 24) * ROTATION_EARTH_DAY_SECONDS;
};

export const getVisualAxialTilt = (axialTiltDeg: number) => (
  axialTiltDeg > 90 ? 180 - axialTiltDeg : axialTiltDeg
);

export const solveEccentricAnomaly = (meanAnomaly: number, eccentricity: number) => {
  let eccentricAnomaly = meanAnomaly;

  for (let iteration = 0; iteration < 6; iteration += 1) {
    eccentricAnomaly -= (
      eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly
    ) / (1 - eccentricity * Math.cos(eccentricAnomaly));
  }

  return eccentricAnomaly;
};

const writeLocalOrbitPosition = (
  planet: PlanetData,
  elapsedSeconds: number,
  target: THREE.Vector3,
) => {
  const duration = getOrbitDurationSeconds(planet);
  const meanAnomaly = getInitialOrbitAngle(planet.id)
    + (Number.isFinite(duration) ? (elapsedSeconds / duration) * TAU : 0);
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, planet.orbitalEccentricity);
  const semiMajorAxis = planet.orbitRadius;
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - planet.orbitalEccentricity ** 2);
  const inclination = THREE.MathUtils.degToRad(planet.orbitInclinationDeg);
  const planeX = semiMajorAxis * (Math.cos(eccentricAnomaly) - planet.orbitalEccentricity);
  const planeZ = semiMinorAxis * Math.sin(eccentricAnomaly);

  return target.set(
    planeX,
    planeZ * Math.sin(inclination),
    planeZ * Math.cos(inclination),
  );
};

export const writeOrbitCenterPosition = (
  planet: PlanetData,
  elapsedSeconds: number,
  target: THREE.Vector3,
) => {
  if (!planet.orbitParentId) return target.set(0, SOLAR_SYSTEM_CENTER_Y, 0);

  const parent = getPlanetById(planet.orbitParentId);
  return parent
    ? writeBodyPosition(parent, elapsedSeconds, target)
    : target.set(0, SOLAR_SYSTEM_CENTER_Y, 0);
};

const localPosition = new THREE.Vector3();

export const writeBodyPosition = (
  planet: PlanetData,
  elapsedSeconds: number,
  target: THREE.Vector3,
) => {
  writeOrbitCenterPosition(planet, elapsedSeconds, target);
  if (planet.orbitRadius <= 0) return target;

  writeLocalOrbitPosition(planet, elapsedSeconds, localPosition);
  return target.add(localPosition);
};

export const getOrbitPathPoints = (planet: PlanetData, segments = 160) => {
  const points: THREE.Vector3[] = [];
  const eccentricity = planet.orbitalEccentricity;
  const semiMajorAxis = planet.orbitRadius;
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2);
  const inclination = THREE.MathUtils.degToRad(planet.orbitInclinationDeg);

  for (let index = 0; index <= segments; index += 1) {
    const eccentricAnomaly = (index / segments) * TAU;
    const planeX = semiMajorAxis * (Math.cos(eccentricAnomaly) - eccentricity);
    const planeZ = semiMinorAxis * Math.sin(eccentricAnomaly);
    points.push(new THREE.Vector3(
      planeX,
      planeZ * Math.sin(inclination),
      planeZ * Math.cos(inclination),
    ));
  }

  return points;
};

export const getAxialRotationStep = (planet: PlanetData, deltaSeconds: number) => {
  const duration = getRotationDurationSeconds(planet);
  if (!Number.isFinite(duration) || duration <= 0) return 0;

  const direction = planet.rotationPeriodHours < 0 ? -1 : 1;
  return direction * (deltaSeconds / duration) * TAU;
};
