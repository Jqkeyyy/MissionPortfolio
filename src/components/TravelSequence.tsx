import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { getPlanetById } from '@/data/planets';

export const TravelSequence = () => {
  const { selectedPlanet } = useGameState();
  const planet = selectedPlanet ? getPlanetById(selectedPlanet) : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(222 47% 8%) 0%, hsl(222 60% 4%) 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Star streak effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-foreground/50 to-transparent"
            style={{
              top: `${Math.random() * 100}%`,
              left: 0,
              right: 0,
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{
              x: '200%',
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: Math.random() * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* HUD overlay */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm tracking-mission text-muted-foreground mb-2">
            INITIATING TRAVEL SEQUENCE
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary text-glow">
            {planet?.displayName || 'Unknown'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {planet?.description}
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="mt-8 w-64 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-px bg-border overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xs tracking-mission text-muted-foreground mt-2">
            CALCULATING TRAJECTORY...
          </p>
        </motion.div>
      </div>

      {/* Corner HUD elements */}
      <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground">
        <p>NAV_SYS: ACTIVE</p>
        <p>DIST: {Math.floor(Math.random() * 1000)}M KM</p>
      </div>
      <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground text-right">
        <p>FUEL: 87%</p>
        <p>HULL: NOMINAL</p>
      </div>
    </motion.div>
  );
};
