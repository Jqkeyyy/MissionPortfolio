import { motion } from 'framer-motion';
import { Ref } from 'react';
import { PlanetData } from '@/data/planets';

interface LandingPadProps {
  planet: PlanetData;
  targetRef?: Ref<HTMLSpanElement>;
}

const beaconPositions = [
  { left: 14, top: 49 },
  { left: 35, top: 31 },
  { left: 65, top: 31 },
  { left: 86, top: 49 },
  { left: 88, top: 64 },
  { left: 69, top: 75 },
  { left: 31, top: 75 },
  { left: 12, top: 64 },
];

export const LandingPad = ({ planet, targetRef }: LandingPadProps) => {
  return (
    <motion.div
      id="landing-pad"
      data-landing-zone="primary"
      data-status="ready"
      className="pointer-events-none absolute bottom-[17%] left-[8%] z-[8] w-[clamp(180px,24vw,320px)] max-sm:bottom-[20%] max-sm:left-[-6%] max-sm:w-[210px]"
      initial={{ opacity: 0, x: -24, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <div className="relative">
        <img
          src="/landing-pad.png"
          alt=""
          draggable={false}
          decoding="async"
          className="block h-auto w-full select-none"
          style={{
            filter: `saturate(0.8) contrast(0.9) brightness(0.86) drop-shadow(0 14px 12px rgba(0, 0, 0, 0.48)) drop-shadow(0 0 12px ${planet.color}14)`,
          }}
        />

        <div
          className="absolute inset-0 opacity-10 mix-blend-color"
          style={{
            backgroundColor: planet.color,
            WebkitMaskImage: 'url(/landing-pad.png)',
            maskImage: 'url(/landing-pad.png)',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
          }}
        />

        {beaconPositions.map((position, index) => (
          <span
            key={index}
            className="landing-beacon absolute h-1 w-1 rounded-full bg-amber-300"
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}

        <span
          ref={targetRef}
          id="ship-landing-target"
          data-landing-target="true"
          className="absolute left-1/2 top-[54%] h-px w-px -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </motion.div>
  );
};
