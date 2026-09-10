import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Binary, Orbit, RadioTower } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface NullSectorProps {
  open: boolean;
  onReturn: () => void;
}

const transmissions = [
  { icon: Orbit, label: 'Simulation', value: 'Orbital rules inverted' },
  { icon: Binary, label: 'Render path', value: 'Procedural / zero assets' },
  { icon: RadioTower, label: 'Signal', value: 'Developer channel found' },
];

export const NullSector = ({ open, onReturn }: NullSectorProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (!open) return null;

  return (
    <Dialog open onOpenChange={(nextOpen) => {
      if (!nextOpen) onReturn();
    }}>
      <DialogContent
        className="z-[2001] h-screen w-screen max-w-none overflow-hidden rounded-none border-0 bg-[#f5f0ff] p-0 text-[#10051f]"
        style={{ left: 0, top: 0, transform: 'none' }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          headingRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">NULL SECTOR</DialogTitle>
        <motion.div
          className="relative isolate h-full w-full overflow-hidden"
          initial={reducedMotion ? false : { opacity: 0, scale: 1.08, filter: 'blur(18px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0_8%,#10051f_8.5%_9%,transparent_10%_19%,rgba(76,29,149,0.24)_19.5%_20%,transparent_21%_34%,rgba(15,23,42,0.16)_34.5%_35%,transparent_36%),repeating-linear-gradient(108deg,transparent_0_48px,rgba(76,29,149,0.07)_49px_50px)]" />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[min(72vw,72vh)] w-[min(72vw,72vh)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-950/30"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
      >
        {[18, 34, 48, 66].map((offset, index) => (
          <span
            key={offset}
            className="absolute h-3 w-3 rounded-full bg-violet-950 shadow-[0_0_22px_rgba(76,29,149,0.75)]"
            style={{ left: `${offset}%`, top: `${index % 2 ? 84 - offset / 2 : offset}%` }}
          />
        ))}
      </motion.div>

      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-5 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.42em] text-violet-900">Anomaly destination 00</p>
        <h1
          ref={headingRef}
          id="null-sector-heading"
          tabIndex={-1}
          className="mt-5 font-heading text-[clamp(3rem,11vw,8rem)] font-bold tracking-[-0.05em] outline-none"
        >
          NULL SECTOR
        </h1>
        <DialogDescription className="mt-3 max-w-2xl text-base leading-7 text-violet-950/70 sm:text-lg">
          You crossed the event horizon. The portfolio is behind you; this experimental universe is where its rules are tested.
        </DialogDescription>

        <div className="mt-10 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
          {transmissions.map(({ icon: Icon, label, value }) => (
            <div key={label} className="border border-violet-950/20 bg-white/45 p-4 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-violet-800" aria-hidden="true" />
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-900/55">{label}</p>
              <p className="mt-1 font-heading text-sm">{value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onReturn}
          className="mt-10 flex min-h-12 items-center gap-2 border border-violet-950 bg-violet-950 px-6 font-heading text-sm tracking-[0.14em] text-white transition-colors hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-950 focus-visible:ring-offset-4"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return Through Wormhole
        </button>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-950/45">ESC also stabilizes the exit vector</p>
      </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
