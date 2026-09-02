import { motion, useReducedMotion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { getPlanetById } from '@/data/planets';

const streaks = Array.from({ length: 28 }, (_, index) => ({
  top: 4 + ((index * 37) % 92),
  width: 18 + ((index * 29) % 32),
  delay: (index % 9) * 0.075,
  duration: 0.62 + (index % 5) * 0.08,
  opacity: 0.2 + (index % 4) * 0.1,
}));

export const TravelSequence = () => {
  const { selectedPlanet, travelDirection } = useGameState();
  const reducedMotion = useReducedMotion();
  const planet = selectedPlanet ? getPlanetById(selectedPlanet) : null;
  const approachingPlanet = travelDirection !== 'toSpace';
  const distance = planet ? Math.max(12, Math.round((planet.orbitRadius || 4) * 11.8)) : 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: approachingPlanet && planet
          ? `radial-gradient(ellipse at 84% 50%, ${planet.color}28 0%, hsl(222 47% 8%) 36%, hsl(222 60% 4%) 100%)`
          : 'radial-gradient(ellipse at center, hsl(222 47% 8%) 0%, hsl(222 60% 4%) 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {streaks.map((streak, index) => (
          <motion.span
            key={index}
            className="absolute left-0 h-px bg-gradient-to-r from-transparent via-foreground/60 to-transparent"
            style={{
              top: `${streak.top}%`,
              width: `${streak.width}%`,
              opacity: streak.opacity,
            }}
            initial={{ x: '-45vw' }}
            animate={{ x: reducedMotion ? '30vw' : '145vw' }}
            transition={{
              duration: reducedMotion ? 1.2 : streak.duration,
              delay: streak.delay,
              repeat: reducedMotion ? 0 : Infinity,
              repeatDelay: 0.28 + (index % 4) * 0.05,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {approachingPlanet && planet && (
        <motion.div
          className="absolute right-[-12vw] top-1/2 z-[1] aspect-square w-[clamp(170px,30vw,400px)] -translate-y-1/2 md:right-[3vw] md:w-[clamp(220px,24vw,360px)]"
          data-destination-planet={planet.id}
          initial={{ opacity: 0, scale: 0.3, x: 90 }}
          animate={reducedMotion
            ? { opacity: 0.7, scale: 0.72, x: 0 }
            : { opacity: [0, 0.76, 1], scale: [0.3, 0.58, 1], x: [90, 42, 0] }}
          transition={{ duration: reducedMotion ? 0.8 : 2.25, ease: [0.2, 0.7, 0.15, 1] }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-[-8%] rounded-full border"
            style={{ borderColor: `${planet.color}38`, boxShadow: `0 0 65px ${planet.color}24` }}
            animate={reducedMotion ? undefined : { scale: [0.92, 1.08], opacity: [0.2, 0.65, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {planet.id === 'saturn' && (
            <div
              className="absolute left-1/2 top-1/2 h-[28%] w-[152%] -translate-x-1/2 -translate-y-1/2 -rotate-[12deg] rounded-[50%] border-[10px] border-[#d5bc87]/40"
            />
          )}

          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 31% 26%, rgba(255,255,255,0.55) 0%, ${planet.color} 13%, ${planet.color} 48%, hsl(222 50% 8%) 88%)`,
              boxShadow: `inset -34px -25px 48px rgba(0,0,0,0.68), inset 12px 9px 22px rgba(255,255,255,0.12), 0 0 46px ${planet.color}3d`,
            }}
          >
            <div
              className="absolute inset-[8%] rounded-full opacity-25 mix-blend-overlay"
              style={{
                background: `repeating-linear-gradient(8deg, transparent 0 12px, ${planet.color} 13px 17px, transparent 18px 29px)`,
              }}
            />
          </div>
        </motion.div>
      )}

      <div className="absolute left-1/2 top-1/2 z-10 w-[min(88vw,430px)] -translate-x-1/2 -translate-y-1/2 text-center md:left-[34%]">
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-2 text-sm tracking-mission text-muted-foreground">
            {approachingPlanet ? 'DESTINATION APPROACH ACTIVE' : 'RETURN VECTOR ACTIVE'}
          </p>
          <h2 className="font-heading text-3xl text-primary text-glow md:text-5xl">
            {approachingPlanet ? planet?.displayName || 'Unknown' : 'Solar System'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {approachingPlanet ? planet?.description : 'Clearing planetary orbit'}
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 w-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="h-px overflow-hidden bg-border">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: approachingPlanet ? 2.2 : 1.25, ease: 'easeInOut' }}
            />
          </div>
          <p className="mt-2 text-xs tracking-mission text-muted-foreground">
            {approachingPlanet ? 'CLOSING ON DESTINATION...' : 'RESTORING SYSTEM MAP...'}
          </p>
        </motion.div>
      </div>

      <div className="absolute left-4 top-4 z-10 text-xs font-mono text-muted-foreground">
        <p>NAV_SYS: ACTIVE</p>
        <p>DIST: {distance}M KM</p>
      </div>
      <div className="absolute right-4 top-4 z-10 text-right text-xs font-mono text-muted-foreground">
        <p>FUEL: 87%</p>
        <p>HULL: NOMINAL</p>
      </div>
    </motion.div>
  );
};
