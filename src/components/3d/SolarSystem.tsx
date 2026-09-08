/* eslint-disable react-refresh/only-export-components -- graphics profiling is colocated with its sole Canvas consumer and exported for focused verification. */
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { SimulationClock } from './SimulationClock';
import { SolarSystemDetails } from './SolarSystemDetails';

const OPTIMIZED_SHUTTLE_URL = '/optimized/mission-shuttle.webp';

// Three's loaders resolve through the default manager. Rewriting this one known
// transparent texture lets the existing ship component share its animation logic
// while requesting the 33 kB WebP instead of the 282 kB PNG.
THREE.DefaultLoadingManager.setURLModifier((url) => (
  url.endsWith('/mission-shuttle.png') ? OPTIMIZED_SHUTTLE_URL : url
));

interface GraphicsProfile {
  dpr: [number, number];
  starCount: number;
  antialias: boolean;
  powerPreference: WebGLPowerPreference;
  asteroidCount: number;
  decorativeMotion: boolean;
}

export const registerWebGLContextLoss = (
  canvas: HTMLCanvasElement,
  onUnavailable?: () => void,
) => {
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onUnavailable?.();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost);
  return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
};

export const getGraphicsProfile = (): GraphicsProfile => {
  if (typeof window === 'undefined') {
    return { dpr: [1, 1.5], starCount: 6000, antialias: true, powerPreference: 'high-performance', asteroidCount: 560, decorativeMotion: true };
  }

  const navigatorWithCapabilities = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const limitedCpu = typeof navigatorWithCapabilities.hardwareConcurrency === 'number'
    && navigatorWithCapabilities.hardwareConcurrency <= 4;
  const limitedMemory = typeof navigatorWithCapabilities.deviceMemory === 'number'
    && navigatorWithCapabilities.deviceMemory <= 4;
  const saveData = navigatorWithCapabilities.connection?.saveData === true;
  const reducedCapability = reducedMotion || limitedCpu || limitedMemory || saveData;

  return reducedCapability
    ? { dpr: [1, 1], starCount: 2200, antialias: false, powerPreference: 'low-power', asteroidCount: 160, decorativeMotion: false }
    : { dpr: [1, 1.5], starCount: 6000, antialias: true, powerPreference: 'high-performance', asteroidCount: 560, decorativeMotion: true };
};

const CanvasUnavailable = ({
  onOpenQuickPortfolio,
}: {
  onOpenQuickPortfolio: () => void;
}) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#02070d] px-6 text-center text-white" role="alert">
      <div className="max-w-lg">
        <h2 className="font-heading text-2xl tracking-[0.08em]">Immersive view unavailable</h2>
        <p className="mt-3 text-sm leading-6 text-white/65">
          This browser could not start WebGL. The complete projects, experience, resume, and contact details remain available.
        </p>
        <button
          type="button"
          onClick={onOpenQuickPortfolio}
          className="mt-6 min-h-12 rounded-md bg-orange-400 px-6 font-heading text-sm tracking-[0.1em] text-slate-950 hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          View Quick Portfolio
        </button>
      </div>
    </div>
  );
};

interface SolarSystemProps {
  onUnavailable?: () => void;
  onOpenQuickPortfolio: () => void;
}

export const SolarSystem = ({ onUnavailable, onOpenQuickPortfolio }: SolarSystemProps) => {
  const { currentView, travelToPlanet } = useGameState();
  const graphics = useMemo(getGraphicsProfile, []);
  const planetPositions = useRef(new Map<string, THREE.Vector3>([
    ['sun', new THREE.Vector3(0, 15, 0)],
  ]));
  const removeContextLossListener = useRef<(() => void) | null>(null);

  useEffect(() => () => removeContextLossListener.current?.(), []);

  const handleCanvasCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    removeContextLossListener.current?.();
    removeContextLossListener.current = registerWebGLContextLoss(gl.domElement, onUnavailable);
  }, [onUnavailable]);

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
      <Canvas
        onCreated={handleCanvasCreated}
        dpr={graphics.dpr}
        gl={{
          antialias: graphics.antialias,
          alpha: false,
          powerPreference: graphics.powerPreference,
          stencil: false,
        }}
        performance={{ min: 0.5 }}
        fallback={(
          <CanvasUnavailable
            onOpenQuickPortfolio={onOpenQuickPortfolio}
          />
        )}
      >
        <SimulationClock />
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
        <StarField count={graphics.starCount} />

        {/* Lightweight, illustrative context: belt, selected major moons, and comet. */}
        <SolarSystemDetails
          asteroidCount={graphics.asteroidCount}
          decorativeMotion={graphics.decorativeMotion}
        />
        
        {/* Sun at center - clickable for introduction */}
        <Sun onClick={() => handlePlanetClick('sun')} />
        
        {/* Orbit rings */}
        {planets.filter(p => p.orbitRadius > 0).map((planet) => (
          <OrbitRing key={`orbit-${planet.id}`} planet={planet} />
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
