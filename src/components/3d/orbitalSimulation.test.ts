import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getPlanetById } from '@/data/planets';
import {
  getAxialRotationStep,
  getAxialRotationAngle,
  getOrbitDurationSeconds,
  getOrbitPathPoints,
  getRotationDurationSeconds,
  getVisualAxialTilt,
  EARTH_DAY_SECONDS,
  writeBodyPosition,
} from './orbitalSimulation';

const requiredPlanet = (id: string) => {
  const planet = getPlanetById(id);
  if (!planet) throw new Error(`Missing test planet: ${id}`);
  return planet;
};

describe('orbital simulation', () => {
  it('uses physical seconds for every orbital period', () => {
    expect(getOrbitDurationSeconds(requiredPlanet('earth'))).toBeCloseTo(
      365.25 * EARTH_DAY_SECONDS,
      5,
    );
    expect(getOrbitDurationSeconds(requiredPlanet('mercury'))).toBeLessThan(
      getOrbitDurationSeconds(requiredPlanet('earth')),
    );
    expect(getOrbitDurationSeconds(requiredPlanet('neptune'))).toBeGreaterThan(
      getOrbitDurationSeconds(requiredPlanet('saturn')),
    );
  });

  it('preserves fast giant-planet spins and retrograde rotation', () => {
    const jupiter = requiredPlanet('jupiter');
    const venus = requiredPlanet('venus');
    expect(getRotationDurationSeconds(jupiter)).toBeLessThan(
      getRotationDurationSeconds(requiredPlanet('earth')),
    );
    expect(getAxialRotationStep(jupiter, 1)).toBeGreaterThan(0);
    expect(getAxialRotationStep(venus, 1)).toBeLessThan(0);
  });

  it('derives the Moon spin from orbital time instead of the separate rotation clock', () => {
    const moon = requiredPlanet('moon');
    const quarterOrbit = getOrbitDurationSeconds(moon) / 4;
    expect(getAxialRotationAngle(moon, 0, quarterOrbit)).toBeCloseTo(Math.PI / 2, 6);
    expect(getAxialRotationAngle(moon, 999_999, quarterOrbit)).toBeCloseTo(Math.PI / 2, 6);
  });

  it('renders retrograde obliquities as the same axis line with reversed spin', () => {
    expect(getVisualAxialTilt(177.36)).toBeCloseTo(2.64, 5);
    expect(getVisualAxialTilt(97.77)).toBeCloseTo(82.23, 5);
    expect(getVisualAxialTilt(23.4)).toBe(23.4);
  });

  it('places the Moon around the moving Earth instead of around the Sun', () => {
    const earthPosition = writeBodyPosition(requiredPlanet('earth'), 8, new THREE.Vector3());
    const moonPosition = writeBodyPosition(requiredPlanet('moon'), 8, new THREE.Vector3());
    expect(moonPosition.distanceTo(earthPosition)).toBeGreaterThan(2);
    expect(moonPosition.distanceTo(earthPosition)).toBeLessThan(2.4);
  });

  it('builds a closed eccentric orbit path', () => {
    const points = getOrbitPathPoints(requiredPlanet('mercury'));
    expect(points[0].distanceTo(points.at(-1)!)).toBeLessThan(0.000001);
    expect(points.length).toBe(161);
  });
});
