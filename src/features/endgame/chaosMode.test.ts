import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { planets } from '@/data/planets';
import {
  applyChaosFrameToPlanets,
  createChaosSystemSnapshotWriter,
  DEFAULT_CHAOS_MODE_SETTINGS,
  getChaosPlanetFrame,
  getChaosSystemFrame,
  writeChaosBodyPosition,
} from './chaosMode';
import { getChaosModeSettings, useChaosMode } from './useChaosMode';

const enabledSettings = {
  ...DEFAULT_CHAOS_MODE_SETTINGS,
  enabled: true,
  seed: 4242,
};

describe('Chaos Mode model', () => {
  afterEach(() => useChaosMode.getState().reset());

  it('is deterministic for a seed and changes smoothly over time', () => {
    const first = getChaosPlanetFrame(planets, 'jupiter', 12.5, enabledSettings)!;
    const replay = getChaosPlanetFrame(planets, 'jupiter', 12.5, enabledSettings)!;
    const shortlyAfter = getChaosPlanetFrame(planets, 'jupiter', 12.51, enabledSettings)!;
    const later = getChaosPlanetFrame(planets, 'jupiter', 14.5, enabledSettings)!;

    expect(replay).toEqual(first);
    expect(later.color).not.toBe(first.color);
    expect(Math.abs(shortlyAfter.scale - first.scale)).toBeLessThan(0.01);
    expect(Math.abs(shortlyAfter.orbitInclinationDeg - first.orbitInclinationDeg)).toBeLessThan(0.2);
  });

  it('turns into an identity transform while disabled', () => {
    const earth = planets.find((planet) => planet.id === 'earth')!;
    const frame = getChaosPlanetFrame(planets, 'earth', 999, {
      ...enabledSettings,
      enabled: false,
    })!;

    expect(frame.color).toBe(earth.color);
    expect(frame.scale).toBe(1);
    expect(frame.orbitSpeedMultiplier).toBe(1);
    expect(frame.orbitInclinationDeg).toBe(earth.orbitInclinationDeg);
    expect(frame.orbitParentId).toBe(earth.orbitParentId);
  });

  it('makes Earth orbit the Moon without creating an Earth/Moon cycle', () => {
    const frame = getChaosSystemFrame(planets, 4, enabledSettings);
    expect(frame.get('earth')?.orbitParentId).toBe('moon');
    expect(frame.get('moon')?.orbitParentId).toBe('sun');

    const earth = writeChaosBodyPosition(
      planets,
      'earth',
      4,
      new THREE.Vector3(),
      enabledSettings,
    );
    const moon = writeChaosBodyPosition(
      planets,
      'moon',
      4,
      new THREE.Vector3(),
      enabledSettings,
    );
    expect(Number.isFinite(earth.length())).toBe(true);
    expect(earth.distanceTo(moon)).toBeGreaterThan(2);
    expect(earth.distanceTo(moon)).toBeLessThan(8);
  });

  it('moves on a visible mission-timescale when driven by a real-time Canvas clock', () => {
    const start = writeChaosBodyPosition(
      planets,
      'earth',
      0,
      new THREE.Vector3(),
      enabledSettings,
    );
    const oneSecondLater = writeChaosBodyPosition(
      planets,
      'earth',
      1,
      new THREE.Vector3(),
      enabledSettings,
    );

    expect(oneSecondLater.distanceTo(start)).toBeGreaterThan(0.05);
  });

  it('keeps every generated parent graph acyclic as relationships change', () => {
    for (let elapsedSeconds = 0; elapsedSeconds <= 180; elapsedSeconds += 3) {
      const frame = getChaosSystemFrame(planets, elapsedSeconds, {
        ...enabledSettings,
        presetId: 'cosmic-shuffle',
      });

      for (const planet of planets) {
        const visited = new Set<string>();
        let currentId: string | undefined = planet.id;
        while (currentId) {
          expect(visited.has(currentId)).toBe(false);
          visited.add(currentId);
          currentId = frame.get(currentId as typeof planet.id)?.orbitParentId;
        }
      }
    }
  });

  it('changes parent relationships through a blended handoff', () => {
    const before = getChaosPlanetFrame(planets, 'neptune', 12.5, enabledSettings)!;
    const during = getChaosPlanetFrame(planets, 'neptune', 16.5, enabledSettings)!;
    const after = getChaosPlanetFrame(planets, 'neptune', 18, enabledSettings)!;

    expect(before.parentTransition.progress).toBe(0);
    expect(during.parentTransition.progress).toBeGreaterThan(0);
    expect(during.parentTransition.progress).toBeLessThan(1);
    expect(after.parentTransition.fromId).toBe(during.parentTransition.toId);
  });

  it('adapts visual values to PlanetData without mutating the source catalog', () => {
    const originalEarth = planets.find((planet) => planet.id === 'earth')!;
    const chaotic = applyChaosFrameToPlanets(planets, 7, enabledSettings);
    const chaoticEarth = chaotic.find((planet) => planet.id === 'earth')!;

    expect(chaoticEarth).not.toBe(originalEarth);
    expect(chaoticEarth.color).not.toBe(originalEarth.color);
    expect(chaoticEarth.size).not.toBe(originalEarth.size);
    expect(chaoticEarth.orbitParentId).toBe('moon');
    expect(planets.find((planet) => planet.id === 'earth')).toBe(originalEarth);
  });

  it('updates one reusable system snapshot for Canvas-level consumers', () => {
    const writer = createChaosSystemSnapshotWriter(planets);
    const firstSnapshot = writer.update(2, enabledSettings);
    const frames = firstSnapshot.frames;
    const positions = firstSnapshot.positions;
    const earthFrame = firstSnapshot.frames.get('earth');
    const earthPosition = firstSnapshot.positions.get('earth');
    const firstEarthCoordinates = earthPosition?.toArray();

    const nextSnapshot = writer.update(8, enabledSettings);

    expect(nextSnapshot).toBe(firstSnapshot);
    expect(nextSnapshot.frames).toBe(frames);
    expect(nextSnapshot.positions).toBe(positions);
    expect(nextSnapshot.frames.get('earth')).toBe(earthFrame);
    expect(nextSnapshot.positions.get('earth')).toBe(earthPosition);
    expect(nextSnapshot.positions.get('earth')?.toArray()).not.toEqual(firstEarthCoordinates);
    expect(nextSnapshot.elapsedSeconds).toBe(8);
  });

  it('provides clamped, rerollable state for a HUD controller', () => {
    useChaosMode.getState().enable();
    useChaosMode.getState().setIntensity(10);
    useChaosMode.getState().reroll(99.8);

    expect(getChaosModeSettings()).toMatchObject({
      enabled: true,
      intensity: 1,
      seed: 99,
    });

    useChaosMode.getState().toggle();
    expect(useChaosMode.getState().enabled).toBe(false);
  });
});
