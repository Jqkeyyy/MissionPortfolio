import { useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { Sun } from './Sun';
import { PlanetMesh } from './PlanetMesh';
import { OrbitRing } from './OrbitRing';
import { planets } from '@/data/planets';
import { useGameState } from '@/hooks/useGameState';
import { SolarSystemShip } from './SolarSystemShip';
import * as THREE from 'three';

export const SolarSystem = () => {
  const { currentView, travelToPlanet } = useGameState();
  const planetPositions = useRef(new Map<string, THREE.Vector3>([
    ['sun', new THREE.Vector3(0, 15, 0)],
  ]));

  const handlePlanetClick = (planetId: string) => {
    if (currentView !== 'space') return;
    travelToPlanet(planetId);
  };

  const updatePlanetPosition = useCallback((planetId: string, position: THREE.Vector3) => {
    const storedPosition = planetPositions.current.get(planetId);
    if (storedPosition) {
      storedPosition.copy(position);
    } else {
      planetPositions.current.set(planetId, position.clone());
    }
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 30, 80]} fov={60} />
        <OrbitControls
          enablePan={false}
          minDistance={20}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2}
          target={[0, 15, 0]}
        />
        
        {/* Ambient light */}
        <ambientLight intensity={0.15} />
        
        {/* Star background */}
        <StarField count={8000} />
        
        {/* Sun at center - clickable for introduction */}
        <Sun onClick={() => handlePlanetClick('sun')} />
        
        {/* Orbit rings */}
        {planets.filter(p => p.orbitRadius > 0).map((planet) => (
          <OrbitRing key={`orbit-${planet.id}`} radius={planet.orbitRadius} />
        ))}
        
        {/* Planets */}
        {planets.filter(p => p.orbitRadius > 0).map((planet) => (
          <PlanetMesh
            key={planet.id}
            planet={planet}
            onClick={() => handlePlanetClick(planet.id)}
            onPositionUpdate={(position) => updatePlanetPosition(planet.id, position)}
          />
        ))}

        <SolarSystemShip planetPositions={planetPositions} />
      </Canvas>
    </div>
  );
};
