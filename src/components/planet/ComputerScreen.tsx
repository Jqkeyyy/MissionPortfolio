import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { ContentSign, PlanetData } from '@/data/planets';
import { HabitatDesktop } from './HabitatDesktop';

interface ComputerScreenProps {
  planet: PlanetData;
  onClose: () => void;
  onSelectItem?: (sign: ContentSign) => void;
  bootStartedAt?: number | null;
}

export const ComputerScreen = ({ planet, onClose, onSelectItem, bootStartedAt }: ComputerScreenProps) => {
  const terminalStyle = {
    '--terminal-accent': planet.color,
  } as CSSProperties;

  return (
    <motion.section
      aria-label={`${planet.displayName} mission computer`}
      className="fixed inset-0 z-50 isolate flex items-center justify-center overflow-hidden bg-black/10 p-2 sm:p-4"
      style={terminalStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.66, duration: 0.22, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } }}
    >
      <motion.div
        className="seated-monitor-frame relative overflow-hidden rounded-[1rem] border-[6px] border-[#aeb2af] bg-[#d7d8d2] p-2 shadow-[0_35px_110px_rgba(0,0,0,0.88),0_0_0_1px_rgba(255,255,255,0.65),inset_0_1px_0_rgba(255,255,255,0.95)] sm:rounded-[1.4rem] sm:border-[9px] sm:p-3"
        initial={{ scale: 0.96 }}
        animate={{ scale: 1, transition: { delay: 0.62, duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' } }}
      >
        <span aria-hidden="true" className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#313a3d] shadow-[0_0_0_2px_rgba(255,255,255,0.2)] sm:top-1.5" />

        <div className="relative h-full w-full overflow-hidden rounded-lg border border-black/80 bg-[#020609] shadow-[inset_0_0_45px_rgba(0,0,0,0.68)]">
          <HabitatDesktop planet={planet} onStandUp={onClose} onSelectItem={onSelectItem} bootStartedAt={bootStartedAt} />

          <button
            data-testid="computer-screen-close"
            type="button"
            aria-label="Stand up from the mission computer"
            onClick={onClose}
            className="absolute right-2 top-2 z-[500] flex min-h-9 items-center gap-1.5 rounded-md border border-white/15 bg-black/45 px-2.5 text-xs text-white/55 opacity-60 shadow-lg backdrop-blur-md transition-all hover:border-cyan-200/35 hover:bg-black/70 hover:text-white hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:right-3 sm:top-3 sm:gap-2 sm:px-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Stand up</span>
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
};
