/* eslint-disable react-refresh/only-export-components -- graphics profiling is colocated with its sole Canvas consumer and exported for focused verification. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
import { useGraphicsSettings, type GraphicsPreference, type GraphicsTier } from '@/hooks/useGraphicsSettings';
import { EventHorizon } from './EventHorizon';
import {
  createChaosSystemSnapshotWriter,
  type ChaosSystemSnapshotWriter,
} from '@/features/endgame/chaosMode';
import { getChaosModeSettings, useChaosMode } from '@/features/endgame/useChaosMode';
import { applyCosmicArchitectOverrides } from '@/features/endgame/cosmicArchitect';
import { useCosmicArchitect } from '@/features/endgame/useCosmicArchitect';

const OPTIMIZED_SHUTTLE_URL = '/optimized/mission-shuttle.webp';

// Three's loaders resolve through the default manager. Rewriting this one known
// transparent texture lets the existing ship component share its animation logic
// while requesting the 33 kB WebP instead of the 282 kB PNG.
THREE.DefaultLoadingManager.setURLModifier((url) => (
  url.endsWith('/mission-shuttle.png') ? OPTIMIZED_SHUTTLE_URL : url
));

export interface GraphicsProfile {
  dpr: [number, number];
  starCount: number;
  antialias: boolean;
  powerPreference: WebGLPowerPreference;
  asteroidCount: number;
  decorativeMotion: boolean;
}

const GRAPHICS_PROFILES: Record<GraphicsTier, GraphicsProfile> = {
  low: { dpr: [1, 1], starCount: 1600, antialias: false, powerPreference: 'low-power', asteroidCount: 100, decorativeMotion: false },
  balanced: { dpr: [1, 1.25], starCount: 3500, antialias: true, powerPreference: 'default', asteroidCount: 280, decorativeMotion: true },
  high: { dpr: [1, 1.5], starCount: 6000, antialias: true, powerPreference: 'high-performance', asteroidCount: 560, decorativeMotion: true },
};

export const nextAdaptiveTier = (tier: GraphicsTier, framesPerSecond: number): GraphicsTier => {
  if (framesPerSecond < 42) return tier === 'high' ? 'balanced' : 'low';
  if (framesPerSecond > 57) return tier === 'low' ? 'balanced' : 'high';
  return tier;
};

export const resolveGraphicsProfile = (
  preference: GraphicsPreference,
  automaticTier: GraphicsTier,
): GraphicsProfile => GRAPHICS_PROFILES[preference === 'auto' ? automaticTier : preference];

const FrameRateMonitor = ({ enabled, onSample }: { enabled: boolean; onSample: (fps: number) => void }) => {
  const sampleStartedAt = useRef(0);
  const frames = useRef(0);

  useFrame(({ clock }) => {
    if (!enabled) return;
    const elapsed = clock.elapsedTime;
    if (sampleStartedAt.current === 0) sampleStartedAt.current = elapsed;
    frames.current += 1;
    const duration = elapsed - sampleStartedAt.current;
    if (duration < 4) return;
    onSample(frames.current / duration);
    frames.current = 0;
    sampleStartedAt.current = elapsed;
  });

  return null;
};

const ChaosFrameUpdater = ({
  enabled,
  writer,
}: {
  enabled: boolean;
  writer: ChaosSystemSnapshotWriter;
}) => {
  useFrame((state) => {
    if (enabled) writer.update(state.clock.elapsedTime, getChaosModeSettings());
  }, -1);
  return null;
};

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
  eventHorizonVisible?: boolean;
  onEnterEventHorizon?: () => void;
}

export const SolarSystem = ({
  onUnavailable,
  onOpenQuickPortfolio,
  eventHorizonVisible = false,
  onEnterEventHorizon,
}: SolarSystemProps) => {
  const { currentView, travelToPlanet } = useGameState();
  const chaosModeEnabled = useChaosMode((state) => state.enabled);
  const architectOverrides = useCosmicArchitect((state) => state.overrides);
  const preference = useGraphicsSettings((state) => state.preference);
  const deviceProfile = useMemo(getGraphicsProfile, []);
  const initialTier: GraphicsTier = deviceProfile.powerPreference === 'low-power' ? 'low' : 'high';
  const [automaticTier, setAutomaticTier] = useState<GraphicsTier>(initialTier);
  const chaosWriter = useMemo(() => createChaosSystemSnapshotWriter(planets), []);
  const renderedPlanets = useMemo(
    () => chaosModeEnabled ? planets : applyCosmicArchitectOverrides(planets, architectOverrides),
    [architectOverrides, chaosModeEnabled],
  );
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const selectedGraphics = resolveGraphicsProfile(preference, automaticTier);
  const graphics = reducedMotion ? { ...selectedGraphics, decorativeMotion: false } : selectedGraphics;
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

  const handleFrameRateSample = useCallback((framesPerSecond: number) => {
    setAutomaticTier((current) => (
      deviceProfile.powerPreference === 'low-power' ? 'low' : nextAdaptiveTier(current, framesPerSecond)
    ));
  }, [deviceProfile.powerPreference]);

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
        <ChaosFrameUpdater enabled={chaosModeEnabled} writer={chaosWriter} />
        <FrameRateMonitor enabled={preference === 'auto'} onSample={handleFrameRateSample} />
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
        {!chaosModeEnabled && renderedPlanets.filter(p => p.orbitRadius > 0).map((planet) => (
          <OrbitRing key={`orbit-${planet.id}`} planet={planet} />
        ))}
        
        {/* Planets */}
        {renderedPlanets.filter(p => p.orbitRadius > 0).map((planet) => (
          <PlanetMesh
            key={planet.id}
            planet={planet}
            chaosModeEnabled={chaosModeEnabled}
            chaosSnapshot={chaosWriter.snapshot}
            onClick={() => handlePlanetClick(planet.id)}
            onPositionUpdate={(position) => updatePlanetPosition(planet.id, position)}
          />
        ))}

        {eventHorizonVisible && (
          <EventHorizon
            position={[0, 17, -68]}
            quality={preference === 'auto' ? automaticTier : preference}
            decorativeMotion={graphics.decorativeMotion}
            reducedMotion={reducedMotion}
            onActivate={onEnterEventHorizon}
          />
        )}

        <SolarSystemShip planetPositions={planetPositions} />
      </Canvas>
    </div>
  );
};
