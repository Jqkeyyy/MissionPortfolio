import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitRingProps {
  radius: number;
  color?: string;
}

export const OrbitRing = ({ radius, color = '#3d5a80' }: OrbitRingProps) => {
  const points = useMemo(() => {
    const segments = 128;
    const pts: THREE.Vector3[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        15,
        Math.sin(angle) * radius
      ));
    }
    
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
};
