import { AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { SolarSystem } from '@/components/3d/SolarSystem';
import { TravelSequence } from '@/components/TravelSequence';
import { PlanetSurface } from '@/components/PlanetSurface';
import { SpaceHUD } from '@/components/SpaceHUD';

const Index = () => {
  const { currentView } = useGameState();

  return (
    <div className="w-screen h-screen overflow-hidden bg-background">
      {/* Space view with 3D solar system */}
      {currentView === 'space' && (
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
    </div>
  );
};

export default Index;
