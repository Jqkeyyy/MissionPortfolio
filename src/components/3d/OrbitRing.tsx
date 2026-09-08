import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { PlanetData } from '@/data/planets';
import { getOrbitPathPoints, writeOrbitCenterPosition } from './orbitalSimulation';
import { useSimulationState } from '@/hooks/useSimulationState';

interface OrbitRingProps {
  planet: PlanetData;
  color?: string;
}

export const OrbitRing = ({ planet, color = '#3d5a80' }: OrbitRingProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => getOrbitPathPoints(planet), [planet]);
  const initialCenter = useMemo(
    () => writeOrbitCenterPosition(planet, 0, new THREE.Vector3()).toArray() as [number, number, number],
    [planet],
  );

  useFrame(() => {
    if (planet.orbitParentId && groupRef.current) {
      writeOrbitCenterPosition(
        planet,
        useSimulationState.getState().orbitElapsedSeconds,
        groupRef.current.position,
      );
    }
  });

  return (
    <group ref={groupRef} position={initialCenter}>
      <Line
        points={points}
        color={color}
        lineWidth={1}
        transparent
        opacity={planet.orbitParentId ? 0.3 : 0.4}
      />
    </group>
  );
};
