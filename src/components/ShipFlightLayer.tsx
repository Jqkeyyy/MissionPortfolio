import { motion, useReducedMotion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';

const shipImage = (
  <div className="relative">
    <span className="ship-engine-glow absolute left-[1%] top-[42%] h-[18%] w-[28%] -translate-x-1/2 rounded-full" />
    <img
      src="/mission-shuttle.png"
      alt=""
      draggable={false}
      decoding="async"
      className="relative block h-auto w-full select-none drop-shadow-[0_12px_14px_rgba(0,0,0,0.45)]"
    />
  </div>
);

export const ShipFlightLayer = () => {
  const { currentView, travelDirection } = useGameState();
  const reducedMotion = useReducedMotion();

  if (currentView !== 'traveling') return null;

  const returningToSpace = travelDirection === 'toSpace';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      data-flight-mode={returningToSpace ? 'departing-planet' : 'approaching-planet'}
      aria-hidden="true"
    >
      <motion.div
        className="absolute left-0 top-0 w-[clamp(185px,25vw,340px)]"
        initial={returningToSpace
          ? { x: '110vw', y: '18vh', opacity: 0, scale: 0.35, rotate: 170 }
          : { x: '-28vw', y: '72vh', opacity: 0, scale: 0.45, rotate: -11 }}
        animate={reducedMotion
          ? { x: '42vw', y: '42vh', opacity: [0, 0.72, 0], scale: 0.72 }
          : returningToSpace
            ? {
                x: ['110vw', '65vw', '30vw', '-30vw'],
                y: ['18vh', '34vh', '48vh', '72vh'],
                opacity: [0, 1, 1, 0],
                scale: [0.35, 1.02, 0.88, 0.42],
                rotate: [170, 176, 181, 188],
              }
            : {
                x: ['-28vw', '18vw', '48vw', '70vw'],
                y: ['72vh', '53vh', '41vh', '36vh'],
                opacity: [0, 1, 1, 0],
                scale: [0.45, 0.92, 0.7, 0.14],
                rotate: [-11, -5, -1, 4],
              }}
        transition={{
          duration: reducedMotion ? 0.8 : returningToSpace ? 1.35 : 2.2,
          ease: [0.3, 0.05, 0.18, 1],
        }}
      >
        {shipImage}
      </motion.div>
    </div>
  );
};
