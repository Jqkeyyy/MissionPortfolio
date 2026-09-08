import type { PlanetThemeId } from './planetThemes';

export interface AsteroidPoint {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface MajorMoonDetail {
  id: string;
  parentId: PlanetThemeId;
  color: string;
  displayRadius: number;
  orbitRadius: number;
  orbitalPeriodDays: number;
  phase: number;
}

export const MAJOR_MOONS: readonly MajorMoonDetail[] = [
  { id: 'io', parentId: 'jupiter', color: '#e8c56f', displayRadius: 0.12, orbitRadius: 2.7, orbitalPeriodDays: 1.769, phase: 0.2 },
  { id: 'europa', parentId: 'jupiter', color: '#d9d1b8', displayRadius: 0.1, orbitRadius: 3.2, orbitalPeriodDays: 3.551, phase: 2.1 },
  { id: 'titan', parentId: 'saturn', color: '#d29b55', displayRadius: 0.14, orbitRadius: 4.5, orbitalPeriodDays: 15.945, phase: 4.2 },
  { id: 'titania', parentId: 'uranus', color: '#b8c8c9', displayRadius: 0.1, orbitRadius: 2.7, orbitalPeriodDays: 8.706, phase: 1.3 },
  { id: 'triton', parentId: 'neptune', color: '#c9bdad', displayRadius: 0.11, orbitRadius: 2.5, orbitalPeriodDays: -5.877, phase: 3.4 },
] as const;

const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296;
  };
};

export const createAsteroidBeltPoints = (count: number, seed = 20260907): AsteroidPoint[] => {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    const radius = 24.2 + random() * 3.2;
    return {
      x: Math.cos(angle) * radius,
      y: 15 + (random() - 0.5) * 0.8,
      z: Math.sin(angle) * radius,
      scale: 0.025 + random() * 0.055,
    };
  });
};
