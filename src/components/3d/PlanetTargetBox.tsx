import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { getPlanetTargetBoxSize } from './planetTargetBoxGeometry';

interface PlanetTargetBoxProps {
  radius: number;
  active: boolean;
  locking: boolean;
}

export const PlanetTargetBox = ({ radius, active, locking }: PlanetTargetBoxProps) => {
  const boxRef = useRef<THREE.Mesh>(null);
  const boxSize = getPlanetTargetBoxSize(radius);

  useFrame(({ clock }) => {
    if (!boxRef.current || !active) return;
    const pulse = locking ? 0.92 : 1 + Math.sin(clock.elapsedTime * 3.2) * 0.018;
    boxRef.current.scale.setScalar(pulse);
  });

  if (!active) return null;

  return (
    <mesh ref={boxRef} raycast={() => null}>
      <boxGeometry args={[boxSize, boxSize, boxSize]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges
        color="#38bdf8"
        lineWidth={1.25}
        transparent
        opacity={locking ? 1 : 0.78}
        depthTest={false}
        renderOrder={20}
      />
    </mesh>
  );
};
