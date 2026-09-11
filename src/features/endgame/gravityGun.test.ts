import { describe, expect, it } from 'vitest';
import {
  applyGravityGunImpulse,
  applyGravityGunOffsetToPosition,
  createGravityGunSystem,
  getGravityGunOffset,
  restoreGravityGunBody,
  stepGravityGunSystem,
} from './gravityGun';

describe('gravity gun physics', () => {
  it('rejects the Sun and applies a normalized, deterministic impulse', () => {
    const initial = createGravityGunSystem();
    expect(applyGravityGunImpulse(initial, 'sun', { x: 1, y: 0, z: 0 }, 8)).toBe(initial);

    const launched = applyGravityGunImpulse(initial, 'earth', { x: 3, y: 4, z: 0 }, 10);
    expect(launched.motions.earth?.velocity.x).toBeCloseTo(6);
    expect(launched.motions.earth?.velocity.y).toBeCloseTo(8);
    const stepped = stepGravityGunSystem(launched, 0.1, [], { springStrength: 0, damping: 0 });
    expect(getGravityGunOffset(stepped, 'earth')).toEqual({ x: 0.6000000000000001, y: 0.8, z: 0 });
  });

  it('caps frame time and keeps displacements inside the safety shell', () => {
    const initial = applyGravityGunImpulse(
      createGravityGunSystem(),
      'mars',
      { x: 1, y: 0, z: 0 },
      1_000,
    );
    const stepped = stepGravityGunSystem(initial, 5, [], {
      springStrength: 0,
      damping: 0,
      maxOffset: 4,
    });

    expect(getGravityGunOffset(stepped, 'mars')).toEqual({ x: 4, y: 0, z: 0 });
    expect(stepped.motions.mars?.velocity.x).toBe(-220);
  });

  it('composes an offset onto a canonical renderer position', () => {
    const position = { x: 10, y: 2, z: -4 };
    expect(applyGravityGunOffsetToPosition(position, { x: 1, y: -2, z: 3 })).toBe(position);
    expect(position).toEqual({ x: 11, y: 0, z: -1 });
  });

  it('emits one harmless event per contact and can restore canonical state', () => {
    let state = applyGravityGunImpulse(
      createGravityGunSystem(),
      'earth',
      { x: 1, y: 0, z: 0 },
      2,
    );
    const bodies = [
      { id: 'earth' as const, canonicalPosition: { x: 0, y: 0, z: 0 }, radius: 1 },
      { id: 'mars' as const, canonicalPosition: { x: 1.5, y: 0, z: 0 }, radius: 1 },
    ];

    state = stepGravityGunSystem(state, 0.01, bodies, { springStrength: 0, damping: 0 });
    expect(state.collisionEvents).toHaveLength(1);
    expect(state.collisionEvents[0]).toMatchObject({ bodies: ['earth', 'mars'], impactSpeed: 2 });

    state = stepGravityGunSystem(state, 0.01, bodies, { springStrength: 0, damping: 0 });
    expect(state.collisionEvents).toHaveLength(1);

    const restored = restoreGravityGunBody(state, 'earth');
    expect(restored.motions.earth).toBeUndefined();
    expect(getGravityGunOffset(restored, 'earth')).toEqual({ x: 0, y: 0, z: 0 });
  });
});
