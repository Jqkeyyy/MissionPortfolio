import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPlanetById } from '@/data/planets';
import { SOLAR_INTERCEPT_DURATION_MS, useGameState } from '@/hooks/useGameState';

interface SolarSystemShipProps {
  planetPositions: MutableRefObject<Map<string, THREE.Vector3>>;
}

const CRUISE_RADIUS_X = 29;
const CRUISE_RADIUS_Z = 21;

export const SolarSystemShip = ({ planetPositions }: SolarSystemShipProps) => {
  const shipRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const texture = useTexture('/mission-shuttle.png');
  const { currentView, selectedPlanet } = useGameState();
  const activeTargetRef = useRef<string | null>(null);
  const interceptProgressRef = useRef(0);
  const startPositionRef = useRef(new THREE.Vector3());
  const previousPositionRef = useRef(new THREE.Vector3());
  const targetRef = useRef(new THREE.Vector3());
  const endRef = useRef(new THREE.Vector3());
  const controlRef = useRef(new THREE.Vector3());
  const destinationRef = useRef(new THREE.Vector3());
  const glowColor = useMemo(() => new THREE.Color('#55dfff'), []);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame((state, delta) => {
    const ship = shipRef.current;
    if (!ship) return;

    previousPositionRef.current.copy(ship.position);

    if (currentView === 'intercepting' && selectedPlanet) {
      if (activeTargetRef.current !== selectedPlanet) {
        activeTargetRef.current = selectedPlanet;
        interceptProgressRef.current = 0;
        startPositionRef.current.copy(ship.position);
      }

      interceptProgressRef.current = Math.min(
        1,
        interceptProgressRef.current + (delta * 1000) / SOLAR_INTERCEPT_DURATION_MS,
      );

      const planet = getPlanetById(selectedPlanet);
      const liveTarget = planetPositions.current.get(selectedPlanet);
      targetRef.current.copy(liveTarget ?? new THREE.Vector3(0, 15, 0));

      const clearance = Math.max((planet?.size ?? 1) * 1.45, 1.5);
      endRef.current.copy(targetRef.current);
      endRef.current.y += clearance;
      endRef.current.z += Math.max(clearance, 2.2);

      controlRef.current.lerpVectors(startPositionRef.current, endRef.current, 0.52);
      controlRef.current.y += 8;
      controlRef.current.z += 3;

      const progress = interceptProgressRef.current;
      const eased = 1 - Math.pow(1 - progress, 3);
      const inverse = 1 - eased;

      destinationRef.current
        .copy(startPositionRef.current)
        .multiplyScalar(inverse * inverse)
        .addScaledVector(controlRef.current, 2 * inverse * eased)
        .addScaledVector(endRef.current, eased * eased);
      ship.position.copy(destinationRef.current);

      const arrivalScale = THREE.MathUtils.lerp(1, 0.38, Math.max(0, (eased - 0.62) / 0.38));
      ship.scale.setScalar(arrivalScale);
    } else {
      activeTargetRef.current = null;
      interceptProgressRef.current = 0;
      ship.scale.setScalar(1);

      const time = state.clock.elapsedTime;
      const cruiseTarget = targetRef.current.set(
        Math.cos(time * 0.18) * CRUISE_RADIUS_X,
        19 + Math.sin(time * 0.31) * 4,
        Math.sin(time * 0.18) * CRUISE_RADIUS_Z,
      );
      ship.position.lerp(cruiseTarget, 1 - Math.exp(-delta * 1.3));
    }

    if (visualRef.current) {
      const movementX = ship.position.x - previousPositionRef.current.x;
      if (Math.abs(movementX) > 0.002) {
        visualRef.current.scale.x = movementX < 0 ? -1 : 1;
      }
    }
  });

  return (
    <group ref={shipRef} position={[-27, 20, 9]} frustumCulled={false}>
      <Billboard follow>
        <group ref={visualRef}>
          {[0, 1, 2, 3].map((index) => (
            <mesh
              key={index}
              position={[-4.3 - index * 1.25, -0.1, -0.04]}
              scale={[2.2 - index * 0.3, 0.65 - index * 0.09, 1]}
              renderOrder={19}
            >
              <circleGeometry args={[0.82, 20]} />
              <meshBasicMaterial
                color={glowColor}
                transparent
                opacity={0.32 - index * 0.055}
                blending={THREE.AdditiveBlending}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>
          ))}
          <mesh position={[-4.05, -0.05, -0.02]} scale={[2.5, 1, 1]} renderOrder={19}>
            <circleGeometry args={[0.94, 24]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.62}
              blending={THREE.AdditiveBlending}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
          <mesh renderOrder={20}>
            <planeGeometry args={[10.2, 6.8]} />
            <meshBasicMaterial
              map={texture}
              transparent
              alphaTest={0.04}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      </Billboard>
      <pointLight color={glowColor} intensity={2.1} distance={12} decay={2} position={[-4, 0, 0]} />
    </group>
  );
};
