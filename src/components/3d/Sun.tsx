import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetLockOn } from '@/hooks/usePlanetLockOn';
import { PlanetReticle } from './PlanetReticle';

interface SunProps {
  onClick?: () => void;
}

export const Sun = ({ onClick }: SunProps) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const { hovered, locking, setHovered, trigger } = usePlanetLockOn(() => onClick?.());

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    trigger();
  };

  return (
    <group position={[0, 15, 0]}>
      {/* Sun core */}
      <Sphere
        ref={sunRef}
        args={[2.5, 64, 64]}
        scale={locking ? 1.08 : 1}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshBasicMaterial color="#FDB813" />
      </Sphere>

      {/* Inner glow */}
      <Sphere ref={glowRef} args={[3, 32, 32]}>
        <meshBasicMaterial
          color="#FF9500"
          transparent
          opacity={hovered ? 0.5 : 0.3}
        />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[4, 32, 32]}>
        <meshBasicMaterial
          color="#FF6B00"
          transparent
          opacity={hovered ? 0.2 : 0.1}
        />
      </Sphere>

      {/* Point light from sun */}
      <pointLight
        color="#FFF4E0"
        intensity={2}
        distance={200}
        decay={2}
      />

      {/* Reticle with lock-on animation */}
      <Html position={[0, 4, 0]} center style={{ pointerEvents: 'none' }}>
        <PlanetReticle
          name="The Sun"
          description="Identity / Introduction"
          hovered={hovered}
          locking={locking}
        />
      </Html>
    </group>
  );
};
