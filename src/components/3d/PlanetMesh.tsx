import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Sphere, Ring, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import type { PlanetSurface } from '@/data/planets';
import { useGameState } from '@/hooks/useGameState';
import { usePlanetLockOn } from '@/hooks/usePlanetLockOn';
import { PlanetReticle } from './PlanetReticle';
import { PlanetTargetBox } from './PlanetTargetBox';
import { PlanetSurfaceMaterial, SURFACE_TYPES } from './shaders/PlanetSurfaceMaterial';
import { AtmosphereMaterial } from './shaders/AtmosphereMaterial';
import { RingBandMaterial } from './shaders/RingBandMaterial';
import {
  getAxialRotationAngle,
  getVisualAxialTilt,
  writeBodyPosition,
} from './orbitalSimulation';
import { MISSION_ROTATION_TIME_FACTOR, useSimulationState } from '@/hooks/useSimulationState';

// Each shader module also calls extend() itself as a module-level side effect, but
// tsconfig.app.json sets neither verbatimModuleSyntax nor preserveValueImports, so
// esbuild/SWC elides an import whose binding never appears in a value position in the
// importing file. AtmosphereMaterial/RingBandMaterial were only referenced via the
// lowercase JSX intrinsics <atmosphereMaterial>/<ringBandMaterial> (string tags, not
// value references), so those imports — and their extend() side effects — were dropped
// entirely, in production builds too, not just dev. Extending explicitly here forces a
// value-position usage of each binding, guaranteeing registration.
extend({ PlanetSurfaceMaterial, AtmosphereMaterial, RingBandMaterial });

interface PlanetMeshProps {
  planet: PlanetData;
  onClick?: () => void;
  onPositionUpdate?: (position: THREE.Vector3) => void;
}

const SUN_WORLD_POSITION = new THREE.Vector3(0, 15, 0);

const ATMOSPHERE_INTENSITY: Record<PlanetSurface, number> = {
  cratered: 0.35,
  banded: 0.55,
  earthlike: 1.1,
  venusAtmo: 0.9,
};

const deriveAccentColor = (baseHex: string, surface: PlanetSurface): THREE.Color => {
  const base = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  switch (surface) {
    case 'cratered':
      return new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, Math.max(hsl.l - 0.22, 0.05));
    case 'banded':
      return new THREE.Color().setHSL((hsl.h + 0.04) % 1, Math.min(hsl.s + 0.1, 1), Math.min(hsl.l + 0.18, 0.9));
    case 'earthlike':
      return new THREE.Color().setHSL(0.32, 0.45, 0.32);
    case 'venusAtmo':
      return new THREE.Color().setHSL((hsl.h + 0.08) % 1, hsl.s * 0.6, Math.min(hsl.l + 0.15, 0.85));
    default:
      return base.clone().multiplyScalar(0.7);
  }
};

export const PlanetMesh = ({ planet, onClick, onPositionUpdate }: PlanetMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<InstanceType<typeof PlanetSurfaceMaterial>>(null);
  const { selectedPlanet } = useGameState();
  const isSelected = selectedPlanet === planet.id;
  const surface = planet.surface;

  const seed = useRef(Math.random() * 100);
  const planetWorldPosRef = useRef(new THREE.Vector3());
  const lightDirRef = useRef(new THREE.Vector3());
  const initialPosition = useMemo(
    () => writeBodyPosition(planet, 0, new THREE.Vector3()).toArray() as [number, number, number],
    [planet],
  );

  const baseColor = useMemo(() => new THREE.Color(planet.color), [planet.color]);
  const accentColor = useMemo(() => deriveAccentColor(planet.color, surface), [planet.color, surface]);
  const ringColors = useMemo(() => planet.rings ? {
    colorA: new THREE.Color(planet.rings.colorA),
    colorB: new THREE.Color(planet.rings.colorB),
  } : null, [planet.rings]);
  const targetRadius = planet.rings
    ? planet.size * planet.rings.outerRadiusMultiplier
    : planet.size * 1.15;

  const { hovered, locking, setHovered, trigger } = usePlanetLockOn(() => onClick?.());

  useFrame((state) => {
    const { orbitElapsedSeconds, rotationElapsedSeconds } = useSimulationState.getState();

    if (groupRef.current && planet.orbitRadius > 0) {
      writeBodyPosition(planet, orbitElapsedSeconds, groupRef.current.position);
    }

    if (planetRef.current) {
      planetRef.current.rotation.y = getAxialRotationAngle(
        planet,
        rotationElapsedSeconds,
        orbitElapsedSeconds,
      );
    }

    if (materialRef.current) {
      materialRef.current.uTime = rotationElapsedSeconds / MISSION_ROTATION_TIME_FACTOR;
    }

    if (materialRef.current && groupRef.current) {
      const planetWorldPos = groupRef.current.getWorldPosition(planetWorldPosRef.current);
      onPositionUpdate?.(planetWorldPos);
      const lightDir = lightDirRef.current
        .subVectors(SUN_WORLD_POSITION, planetWorldPos)
        .normalize()
        .transformDirection(state.camera.matrixWorldInverse);
      materialRef.current.uLightDirection = lightDir;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    trigger();
  };

  return (
    <group ref={groupRef} position={initialPosition}>
      <group rotation={[0, 0, THREE.MathUtils.degToRad(getVisualAxialTilt(planet.axialTiltDeg))]}>
        <Sphere
          ref={planetRef}
          args={[planet.size, 64, 64]}
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
          <planetSurfaceMaterial
            ref={materialRef}
            uBaseColor={baseColor}
            uAccentColor={accentColor}
            uSeed={seed.current}
            uSurfaceType={SURFACE_TYPES[surface]}
          />
        </Sphere>

        {planet.rings && ringColors && (
          <Ring
            args={[
              planet.size * planet.rings.innerRadiusMultiplier,
              planet.size * planet.rings.outerRadiusMultiplier,
              96,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringBandMaterial
              uColorA={ringColors.colorA}
              uColorB={ringColors.colorB}
              uSeed={seed.current}
              uInnerRadius={planet.size * planet.rings.innerRadiusMultiplier}
              uOuterRadius={planet.size * planet.rings.outerRadiusMultiplier}
              uOpacity={planet.rings.opacity}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </Ring>
        )}

        <Sphere args={[planet.size * 1.15, 32, 32]}>
          <atmosphereMaterial
            uColor={baseColor}
            uIntensity={ATMOSPHERE_INTENSITY[surface] * (hovered || isSelected ? 1.6 : 1)}
            transparent
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      </group>

      <PlanetTargetBox
        radius={targetRadius}
        active={hovered || locking}
        locking={locking}
      />

      <Html position={[0, targetRadius + 1.2, 0]} center style={{ pointerEvents: 'none' }}>
        <PlanetReticle
          name={planet.displayName}
          description={planet.description}
          hovered={hovered}
          locking={locking}
        />
      </Html>
    </group>
  );
};
