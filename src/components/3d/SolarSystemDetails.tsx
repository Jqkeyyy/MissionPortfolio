import { useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPlanetById } from '@/data/planets';
import { createAsteroidBeltPoints, MAJOR_MOONS } from '@/data/solarDetails';
import { useSimulationState } from '@/hooks/useSimulationState';
import { EARTH_DAY_SECONDS, getVisualAxialTilt, SOLAR_SYSTEM_CENTER_Y, writeBodyPosition } from './orbitalSimulation';

interface SolarSystemDetailsProps {
  asteroidCount: number;
  decorativeMotion: boolean;
}

const AsteroidBelt = ({ count, decorativeMotion }: { count: number; decorativeMotion: boolean }) => {
  const group = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    createAsteroidBeltPoints(count).forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    const value = new THREE.BufferGeometry();
    value.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return value;
  }, [count]);

  useFrame(() => {
    if (!decorativeMotion || !group.current) return;
    group.current.rotation.y = useSimulationState.getState().orbitElapsedSeconds / (4.6 * 365.25 * EARTH_DAY_SECONDS) * Math.PI * 2;
  });

  return (
    <points ref={group} geometry={geometry} raycast={() => null}>
      <pointsMaterial color="#9f8d78" size={0.075} sizeAttenuation transparent opacity={0.72} depthWrite={false} />
    </points>
  );
};

const MajorMoonSystem = () => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    if (!mesh.current) return;
    const elapsed = useSimulationState.getState().orbitElapsedSeconds;
    MAJOR_MOONS.forEach((moon, index) => {
      const parent = getPlanetById(moon.parentId);
      if (!parent) return;
      writeBodyPosition(parent, elapsed, position);
      const direction = moon.orbitalPeriodDays < 0 ? -1 : 1;
      const angle = moon.phase + direction * elapsed / (Math.abs(moon.orbitalPeriodDays) * EARTH_DAY_SECONDS) * Math.PI * 2;
      position.x += Math.cos(angle) * moon.orbitRadius;
      position.z += Math.sin(angle) * moon.orbitRadius;
      scale.setScalar(moon.displayRadius);
      matrix.compose(position, quaternion, scale);
      mesh.current!.setMatrixAt(index, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAJOR_MOONS.length]} raycast={() => null}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial color="#c7c3b7" roughness={0.9} />
    </instancedMesh>
  );
};

const Comet = ({ decorativeMotion }: { decorativeMotion: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const radial = useMemo(() => new THREE.Vector3(), []);
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);

  useFrame(() => {
    if (!group.current) return;
    const elapsed = decorativeMotion ? useSimulationState.getState().orbitElapsedSeconds : 0;
    const angle = 1.4 + elapsed / (76 * 365.25 * EARTH_DAY_SECONDS) * Math.PI * 2;
    group.current.position.set(Math.cos(angle) * 58, SOLAR_SYSTEM_CENTER_Y + Math.sin(angle) * 5, Math.sin(angle) * 18);
    radial.copy(group.current.position).sub(new THREE.Vector3(0, SOLAR_SYSTEM_CENTER_Y, 0)).normalize();
    group.current.quaternion.setFromUnitVectors(xAxis, radial);
  });

  return (
    <group ref={group} raycast={() => null}>
      <mesh>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#dff7ff" />
      </mesh>
      <Line points={[[0.15, 0, 0], [4, 0, 0]]} color="#9bdcf3" transparent opacity={0.35} lineWidth={1} raycast={() => null} />
    </group>
  );
};

const AxialTiltGuide = () => {
  const planetId = useSimulationState((state) => state.tiltGuidePlanetId);
  const group = useRef<THREE.Group>(null);
  const planet = planetId ? getPlanetById(planetId) : undefined;

  useFrame(() => {
    if (!group.current || !planet) return;
    writeBodyPosition(planet, useSimulationState.getState().orbitElapsedSeconds, group.current.position);
  });

  if (!planet) return null;
  const guideLength = Math.max(planet.size * 2.2, 1.1);
  return (
    <group
      ref={group}
      position={writeBodyPosition(planet, useSimulationState.getState().orbitElapsedSeconds, new THREE.Vector3())}
      rotation={[0, 0, THREE.MathUtils.degToRad(getVisualAxialTilt(planet.axialTiltDeg))]}
    >
      <Line
        points={[[0, -guideLength, 0], [0, guideLength, 0]]}
        color="#67e8f9"
        transparent
        opacity={0.8}
        lineWidth={1.5}
        raycast={() => null}
      />
    </group>
  );
};

export const SolarSystemDetails = ({ asteroidCount, decorativeMotion }: SolarSystemDetailsProps) => (
  <group name="illustrative-solar-details" userData={{ illustrative: true }}>
    <AsteroidBelt count={asteroidCount} decorativeMotion={decorativeMotion} />
    <MajorMoonSystem />
    <Comet decorativeMotion={decorativeMotion} />
    <AxialTiltGuide />
  </group>
);
