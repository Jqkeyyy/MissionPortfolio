import { AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { SolarSystem } from '@/components/3d/SolarSystem';
import { TravelSequence } from '@/components/TravelSequence';
import { PlanetSurface } from '@/components/PlanetSurface';
import { SpaceHUD } from '@/components/SpaceHUD';
import { ShipFlightLayer } from '@/components/ShipFlightLayer';

const Index = () => {
  const { currentView } = useGameState();

  return (
    <div className="w-screen h-screen overflow-hidden bg-background">
      {/* Space view with 3D solar system */}
      {(currentView === 'space' || currentView === 'intercepting') && (
        <>
          <SolarSystem />
          <SpaceHUD />
        </>
      )}

      {/* Travel transition */}
      <AnimatePresence>
        {currentView === 'traveling' && <TravelSequence />}
      </AnimatePresence>

      {/* Planet surface view */}
      <AnimatePresence>
        {currentView === 'planet' && <PlanetSurface />}
      </AnimatePresence>

      {/* Lightweight ship sprite shared by cruise and travel views */}
      <ShipFlightLayer />
    </div>
  );
};

export default Index;
