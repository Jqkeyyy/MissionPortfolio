import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { Sun } from './Sun';
import { PlanetMesh } from './PlanetMesh';
import { OrbitRing } from './OrbitRing';
import { planets } from '@/data/planets';
import { useGameState } from '@/hooks/useGameState';

export const SolarSystem = () => {
  const { travelToPlanet } = useGameState();

  const handlePlanetClick = (planetId: string) => {
    travelToPlanet(planetId);
  };

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
          />
        ))}
      </Canvas>
    </div>
  );
};
