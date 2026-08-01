import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { getPlanetById } from '@/data/planets';
import { ContentSign as ContentSignType } from '@/data/planets';
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useState } from 'react';
import { PlanetTerrain } from './planet/PlanetTerrain';
import { BaseCamp } from './planet/BaseCamp';
import { BaseCampInterior } from './planet/BaseCampInterior';
import { ComputerScreen } from './planet/ComputerScreen';
import { SignModal } from './planet/SignModal';

export const PlanetSurface = () => {
  const { selectedPlanet, returnToSpace, goToNextPlanet, goToPreviousPlanet } = useGameState();
  const planet = selectedPlanet ? getPlanetById(selectedPlanet) : null;
  const [activeSign, setActiveSign] = useState<ContentSignType | null>(null);
  const [isInsideBaseCamp, setIsInsideBaseCamp] = useState(false);
  const [showComputerScreen, setShowComputerScreen] = useState(false);

  if (!planet) return null;

  const handleEnterBaseCamp = () => {
    setIsInsideBaseCamp(true);
  };

  const handleExitBaseCamp = () => {
    setIsInsideBaseCamp(false);
    setShowComputerScreen(false);
  };

  const handleAccessComputer = () => {
    setShowComputerScreen(true);
  };

  const handleCloseComputer = () => {
    setShowComputerScreen(false);
  };

  const handleSelectItem = (item: ContentSignType) => {
    setActiveSign(item);
  };

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background gradient based on planet */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            hsl(222 60% 4%) 0%,
            ${planet.color}15 30%,
            ${planet.color}25 50%,
            ${planet.color}40 100%
          )`,
        }}
      />

      {/* Stars in sky */}
      <div className="absolute inset-0 stars-bg opacity-40" />

      {/* Planet-specific terrain with curve */}
      <PlanetTerrain planet={planet} />

      {/* Physical Base Camp - click to enter */}
      <BaseCamp planet={planet} onClick={handleEnterBaseCamp} />

      {/* Navigation HUD */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <motion.button
          className="hud-panel p-3 rounded-lg hover:bg-accent/20 transition-colors"
          onClick={goToPreviousPlanet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <motion.button
          className="hud-panel px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-accent/20 transition-colors"
          onClick={returnToSpace}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Rocket className="w-4 h-4" />
          <span className="font-heading text-sm tracking-mission">Return to Space</span>
        </motion.button>

        <motion.button
          className="hud-panel p-3 rounded-lg hover:bg-accent/20 transition-colors"
          onClick={goToNextPlanet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* HUD corners */}
      <div className="fixed top-4 left-4 text-xs font-mono text-muted-foreground z-30">
        <p>LOCATION: {planet.displayName.toUpperCase()}</p>
        <p>ATMOSPHERE: STABLE</p>
        <p>SURFACE TEMP: {Math.floor(Math.random() * 200 - 100)}°C</p>
      </div>

      <div className="fixed top-4 right-4 text-xs font-mono text-muted-foreground text-right z-30">
        <p>O₂ SUPPLY: NOMINAL</p>
        <p>COMMS: ONLINE</p>
      </div>

      {/* Base Camp Interior overlay */}
      <AnimatePresence>
        {isInsideBaseCamp && (
          <BaseCampInterior
            planet={planet}
            onExit={handleExitBaseCamp}
            onAccessComputer={handleAccessComputer}
          />
        )}
      </AnimatePresence>

      {/* Computer Screen overlay */}
      <AnimatePresence>
        {showComputerScreen && (
          <ComputerScreen
            planet={planet}
            onClose={handleCloseComputer}
            onSelectItem={handleSelectItem}
          />
        )}
      </AnimatePresence>

      {/* Sign modal */}
      {activeSign && (
        <SignModal sign={activeSign} onClose={() => setActiveSign(null)} />
      )}
    </motion.div>
  );
};
