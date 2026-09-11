import type { PlanetThemeId } from '@/data/planetThemes';

export interface GravityGunVector {
  x: number;
  y: number;
  z: number;
}

export interface GravityGunBodyMotion {
  offset: GravityGunVector;
  velocity: GravityGunVector;
}

export interface GravityGunBodyDescriptor {
  id: PlanetThemeId;
  canonicalPosition: GravityGunVector;
  radius: number;
}

export interface GravityGunCollisionEvent {
  id: string;
  tick: number;
  bodies: readonly [PlanetThemeId, PlanetThemeId];
  position: GravityGunVector;
  impactSpeed: number;
}

export interface GravityGunSystemState {
  motions: Partial<Record<PlanetThemeId, GravityGunBodyMotion>>;
  collisionEvents: GravityGunCollisionEvent[];
  activeContacts: string[];
  tick: number;
}

export interface GravityGunStepOptions {
  springStrength?: number;
  damping?: number;
  maxOffset?: number;
  maxCollisionEvents?: number;
}

export const GRAVITY_GUN_DEFAULTS = {
  springStrength: 0.42,
  damping: 0.18,
  maxOffset: 24,
  maxCollisionEvents: 6,
  maxDeltaSeconds: 0.1,
} as const;

export const ZERO_GRAVITY_GUN_VECTOR: Readonly<GravityGunVector> = Object.freeze({
  x: 0,
  y: 0,
  z: 0,
});

const isFiniteVector = (vector: GravityGunVector) =>
  Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);

const magnitude = (vector: GravityGunVector) => Math.hypot(vector.x, vector.y, vector.z);

const add = (a: GravityGunVector, b: GravityGunVector): GravityGunVector => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

const scale = (vector: GravityGunVector, amount: number): GravityGunVector => ({
  x: vector.x * amount,
  y: vector.y * amount,
  z: vector.z * amount,
});

const normalize = (vector: GravityGunVector): GravityGunVector | null => {
  if (!isFiniteVector(vector)) return null;
  const length = magnitude(vector);
  if (length < Number.EPSILON) return null;
  return scale(vector, 1 / length);
};

const clampOffset = (
  motion: GravityGunBodyMotion,
  maxOffset: number,
): GravityGunBodyMotion => {
  const length = magnitude(motion.offset);
  if (length <= maxOffset) return motion;

  // The safety shell converts an escape trajectory into a soft rebound.
  return {
    offset: scale(motion.offset, maxOffset / length),
    velocity: scale(motion.velocity, -0.22),
  };
};

const contactKey = (left: PlanetThemeId, right: PlanetThemeId) =>
  [left, right].sort().join(':');

export const createGravityGunSystem = (): GravityGunSystemState => ({
  motions: {},
  collisionEvents: [],
  activeContacts: [],
  tick: 0,
});

export const applyGravityGunImpulse = (
  state: GravityGunSystemState,
  planetId: PlanetThemeId,
  direction: GravityGunVector,
  force: number,
): GravityGunSystemState => {
  if (planetId === 'sun' || !Number.isFinite(force) || force <= 0) return state;
  const unitDirection = normalize(direction);
  if (!unitDirection) return state;

  const current = state.motions[planetId] ?? {
    offset: { ...ZERO_GRAVITY_GUN_VECTOR },
    velocity: { ...ZERO_GRAVITY_GUN_VECTOR },
  };

  return {
    ...state,
    motions: {
      ...state.motions,
      [planetId]: {
        offset: { ...current.offset },
        velocity: add(current.velocity, scale(unitDirection, force)),
      },
    },
  };
};

export const restoreGravityGunBody = (
  state: GravityGunSystemState,
  planetId: PlanetThemeId,
): GravityGunSystemState => {
  if (!state.motions[planetId]) return state;
  const motions = { ...state.motions };
  delete motions[planetId];
  return {
    ...state,
    motions,
    activeContacts: state.activeContacts.filter((key) => !key.split(':').includes(planetId)),
  };
};

export const restoreGravityGunSystem = (): GravityGunSystemState =>
  createGravityGunSystem();

export const getGravityGunOffset = (
  state: GravityGunSystemState,
  planetId: PlanetThemeId,
): GravityGunVector => state.motions[planetId]?.offset ?? ZERO_GRAVITY_GUN_VECTOR;

export const getGravityGunOffsetTuple = (
  state: GravityGunSystemState,
  planetId: PlanetThemeId,
): readonly [number, number, number] => {
  const offset = getGravityGunOffset(state, planetId);
  return [offset.x, offset.y, offset.z];
};

/** Adds the transient offset to a freshly-computed canonical position in place. */
export const applyGravityGunOffsetToPosition = <T extends GravityGunVector>(
  position: T,
  offset: GravityGunVector,
): T => {
  position.x += offset.x;
  position.y += offset.y;
  position.z += offset.z;
  return position;
};

/**
 * Advances the reversible displacement layer. Collisions emit events for
 * particles/audio, but never move canonical bodies or deal damage.
 */
export const stepGravityGunSystem = (
  state: GravityGunSystemState,
  deltaSeconds: number,
  bodies: readonly GravityGunBodyDescriptor[] = [],
  options: GravityGunStepOptions = {},
): GravityGunSystemState => {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return state;

  const delta = Math.min(deltaSeconds, GRAVITY_GUN_DEFAULTS.maxDeltaSeconds);
  const springStrength = options.springStrength ?? GRAVITY_GUN_DEFAULTS.springStrength;
  const damping = options.damping ?? GRAVITY_GUN_DEFAULTS.damping;
  const maxOffset = Math.max(0.1, options.maxOffset ?? GRAVITY_GUN_DEFAULTS.maxOffset);
  const decay = Math.exp(-Math.max(0, damping) * delta);
  const nextMotions: GravityGunSystemState['motions'] = {};

  Object.entries(state.motions).forEach(([planetId, current]) => {
    if (!current) return;
    const acceleration = scale(current.offset, -Math.max(0, springStrength));
    const velocity = scale(add(current.velocity, scale(acceleration, delta)), decay);
    const offset = add(current.offset, scale(velocity, delta));
    const settled = magnitude(offset) < 0.002 && magnitude(velocity) < 0.002;
    if (!settled) {
      nextMotions[planetId as PlanetThemeId] = clampOffset({ offset, velocity }, maxOffset);
    }
  });

  const tick = state.tick + 1;
  const contacts: string[] = [];
  const newEvents: GravityGunCollisionEvent[] = [];

  for (let leftIndex = 0; leftIndex < bodies.length; leftIndex += 1) {
    const left = bodies[leftIndex];
    if (left.id === 'sun') continue;
    for (let rightIndex = leftIndex + 1; rightIndex < bodies.length; rightIndex += 1) {
      const right = bodies[rightIndex];
      if (right.id === 'sun') continue;
      const leftMotion = nextMotions[left.id];
      const rightMotion = nextMotions[right.id];
      if (!leftMotion && !rightMotion) continue;

      const leftPosition = add(left.canonicalPosition, leftMotion?.offset ?? ZERO_GRAVITY_GUN_VECTOR);
      const rightPosition = add(right.canonicalPosition, rightMotion?.offset ?? ZERO_GRAVITY_GUN_VECTOR);
      const separation = {
        x: rightPosition.x - leftPosition.x,
        y: rightPosition.y - leftPosition.y,
        z: rightPosition.z - leftPosition.z,
      };
      const combinedRadius = Math.max(0, left.radius) + Math.max(0, right.radius);
      if (magnitude(separation) > combinedRadius) continue;

      const key = contactKey(left.id, right.id);
      contacts.push(key);
      if (!state.activeContacts.includes(key)) {
        const relativeVelocity = {
          x: (rightMotion?.velocity.x ?? 0) - (leftMotion?.velocity.x ?? 0),
          y: (rightMotion?.velocity.y ?? 0) - (leftMotion?.velocity.y ?? 0),
          z: (rightMotion?.velocity.z ?? 0) - (leftMotion?.velocity.z ?? 0),
        };
        newEvents.push({
          id: `${tick}:${key}`,
          tick,
          bodies: [left.id, right.id],
          position: scale(add(leftPosition, rightPosition), 0.5),
          impactSpeed: magnitude(relativeVelocity),
        });
      }
    }
  }

  const maxCollisionEvents = Math.max(
    0,
    Math.floor(options.maxCollisionEvents ?? GRAVITY_GUN_DEFAULTS.maxCollisionEvents),
  );

  return {
    motions: nextMotions,
    collisionEvents: newEvents.length > 0
      ? [...state.collisionEvents, ...newEvents].slice(-maxCollisionEvents)
      : state.collisionEvents,
    activeContacts: contacts.sort(),
    tick,
  };
};
