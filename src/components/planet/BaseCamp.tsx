import { motion } from 'framer-motion';
import { DoorClosed } from 'lucide-react';
import { PlanetData } from '@/data/planets';

interface BaseCampProps {
  planet: PlanetData;
  onClick: () => void;
}

export const BaseCamp = ({ planet, onClick }: BaseCampProps) => {
  return (
    <div className="absolute bottom-[18%] left-1/2 z-10 -translate-x-1/2">
      <motion.button
        type="button"
        data-tutorial-action="enter-base-camp"
        aria-label={`Enter the base camp on ${planet.displayName}`}
        className="group block focus:outline-none"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClick}
        whileHover={{ scale: 1.015, y: -3 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="relative w-[clamp(340px,48vw,620px)] max-w-[94vw]" data-testid="base-camp-visual">
          <div
            className="absolute inset-x-[10%] bottom-[2%] h-[12%] rounded-[50%] bg-black/80 blur-xl transition-opacity duration-500 group-hover:opacity-90"
            aria-hidden="true"
          />

          <img
            src="/base-camp-exterior.png"
            alt=""
            draggable={false}
            decoding="async"
            className="relative block h-auto w-full select-none transition-[filter] duration-500"
            style={{
              filter: `saturate(0.82) contrast(0.92) brightness(0.9) drop-shadow(0 18px 15px rgba(0, 0, 0, 0.48)) drop-shadow(0 0 16px ${planet.color}16)`,
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-color"
            style={{
              backgroundColor: planet.color,
              WebkitMaskImage: 'url(/base-camp-exterior.png)',
              maskImage: 'url(/base-camp-exterior.png)',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
            }}
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute inset-x-[18%] bottom-[5%] h-[7%] rounded-[50%] opacity-25 mix-blend-screen blur-2xl"
            style={{ backgroundColor: planet.color }}
            aria-hidden="true"
          />

          <span
            className="pointer-events-none absolute left-[54%] top-[61%] h-px w-px"
            data-testid="base-camp-door-anchor"
            aria-hidden="true"
          />

          <div
            data-tutorial-target="base-camp"
            data-testid="base-camp-enter-prompt"
            className="absolute -bottom-1 left-[54%] -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2 rounded border border-primary/35 bg-black/75 px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors duration-300 group-hover:border-primary/70 group-focus-visible:border-primary">
                <DoorClosed className="h-4 w-4 text-primary" />
                <span className="whitespace-nowrap font-heading text-xs tracking-mission text-primary sm:text-sm">
                  Enter Base Camp
                </span>
              </div>
            </motion.div>
          </div>

          <div
            className="pointer-events-none absolute -top-20 left-[54%] w-max max-w-[92vw] -translate-x-1/2"
            data-testid="base-camp-status"
          >
            <div className="rounded border border-white/10 bg-black/65 px-5 py-3 text-center shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-md sm:px-6">
              <p className="mb-1 font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                BASE CAMP ESTABLISHED
              </p>
              <h1 className="font-heading text-lg text-primary text-glow sm:text-xl md:text-2xl">
                {planet.displayName}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{planet.description}</p>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};
