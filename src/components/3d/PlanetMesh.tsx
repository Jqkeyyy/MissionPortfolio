import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { useGameState } from '@/hooks/useGameState';

interface PlanetMeshProps {
  planet: PlanetData;
  onClick?: () => void;
}

export const PlanetMesh = ({ planet, onClick }: PlanetMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedPlanet } = useGameState();
  const isSelected = selectedPlanet === planet.id;

  // Calculate initial position on orbit
  const initialAngle = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current && planet.orbitRadius > 0) {
      const time = state.clock.elapsedTime;
      const angle = initialAngle.current + time * planet.orbitSpeed * 0.05;
      
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
    }

    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick?.();
  };

  const isSaturn = planet.id === 'saturn';

  return (
    <group ref={groupRef} position={[planet.orbitRadius, 15, 0]}>
      {/* Planet sphere */}
      <Sphere
        ref={planetRef}
        args={[planet.size, 64, 64]}
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
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={hovered || isSelected ? 0.4 : 0.1}
          roughness={0.7}
          metalness={0.3}
        />
      </Sphere>

      {/* Saturn's rings */}
      {isSaturn && (
        <Ring
          args={[planet.size * 1.4, planet.size * 2.2, 64]}
          rotation={[-Math.PI / 3, 0, 0]}
        >
          <meshBasicMaterial
            color="#C4B28E"
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </Ring>
      )}

      {/* Glow effect when hovered */}
      {(hovered || isSelected) && (
        <Sphere args={[planet.size * 1.2, 32, 32]}>
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={0.15}
          />
        </Sphere>
      )}

      {/* Planet label */}
      {hovered && (
        <Html
          position={[0, planet.size + 1.5, 0]}
          center
          style={{
            pointerEvents: 'none',
          }}
        >
          <div className="hud-panel px-4 py-2 rounded-lg whitespace-nowrap">
            <p className="font-heading text-sm tracking-mission text-primary">
              {planet.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              {planet.description}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};
