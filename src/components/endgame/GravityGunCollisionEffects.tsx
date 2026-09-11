import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGravityGun } from '@/features/endgame/gravityGunStore';
import type { GravityGunCollisionEvent } from '@/features/endgame/gravityGun';

const BURST_PARTICLES = 12;
const BURST_LIFETIME_SECONDS = 0.9;

const CollisionBurst = ({ event }: { event: GravityGunCollisionEvent }) => {
  const groupRef = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);
  const directions = useMemo(() => Array.from({ length: BURST_PARTICLES }, (_, index) => {
    const y = 1 - (index / (BURST_PARTICLES - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).multiplyScalar(0.65);
  }), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const progress = (clock.elapsedTime - startedAt.current) / BURST_LIFETIME_SECONDS;
    group.visible = progress < 1;
    group.scale.setScalar(0.3 + progress * 3.2);
    group.rotation.y = progress * 1.8;
    group.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
        object.material.opacity = Math.max(0, 1 - progress);
      }
    });
  });

  return (
    <group ref={groupRef} position={[event.position.x, event.position.y, event.position.z]}>
      {directions.map((direction, index) => (
        <mesh key={index} position={direction}>
          <sphereGeometry args={[0.11 + (index % 3) * 0.025, 8, 8]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? '#f0abfc' : '#67e8f9'}
            transparent
            opacity={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Short, harmless visual confirmation for Gravity Gun body contacts. */
export const GravityGunCollisionEffects = ({ enabled = true }: { enabled?: boolean }) => {
  const collisionEvents = useGravityGun((state) => state.collisionEvents);
  if (!enabled) return null;

  return (
    <>
      {collisionEvents.map((event) => <CollisionBurst key={event.id} event={event} />)}
    </>
  );
};
