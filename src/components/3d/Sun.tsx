import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

interface SunProps {
  onClick?: () => void;
}

export const Sun = ({ onClick }: SunProps) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 15, 0]}>
      {/* Sun core */}
      <Sphere
        ref={sunRef}
        args={[2.5, 64, 64]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
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

      {/* Label when hovered */}
      {hovered && (
        <Html
          position={[0, 4, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="hud-panel px-4 py-2 rounded-lg whitespace-nowrap">
            <p className="font-heading text-sm tracking-mission text-primary">
              The Sun
            </p>
            <p className="text-xs text-muted-foreground">
              Identity / Introduction
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};
