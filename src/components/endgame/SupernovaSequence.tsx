import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Sparkles, Sun } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

type SupernovaPhase = 'armed' | 'collapse' | 'reborn';

interface SupernovaSequenceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReform: () => void;
}

export const SupernovaSequence = ({ open, onOpenChange, onReform }: SupernovaSequenceProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<SupernovaPhase>('armed');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) setPhase('armed');
  }, [open]);

  useEffect(() => {
    if (phase !== 'collapse') return;
    const timer = window.setTimeout(() => setPhase('reborn'), reducedMotion ? 250 : 2400);
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  const enterNewGamePlus = () => {
    onReform();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[2200] h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 bg-[#02030a] p-0 text-white"
        style={{ left: 0, top: 0, transform: 'none' }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          headingRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Supernova protocol</DialogTitle>
        <DialogDescription className="sr-only">
          An optional cinematic sequence that reforms the completed mission as New Game Plus.
        </DialogDescription>

        <div className="relative flex h-full items-center justify-center overflow-hidden px-5 text-center">
          <motion.div
            aria-hidden="true"
            className="absolute h-[min(70vw,70vh)] w-[min(70vw,70vh)] rounded-full bg-[radial-gradient(circle,#fff_0_5%,#fde68a_12%,#fb923c_32%,#e11d48_52%,transparent_72%)] blur-[1px]"
            initial={false}
            animate={phase === 'armed'
              ? { scale: 0.35, opacity: 0.82 }
              : phase === 'collapse'
                ? { scale: reducedMotion ? 1.2 : [0.35, 0.05, 4.5], opacity: reducedMotion ? 0.2 : [0.82, 1, 0] }
                : { scale: 0.22, opacity: 0.95, filter: 'hue-rotate(150deg)' }}
            transition={{ duration: phase === 'collapse' ? (reducedMotion ? 0.15 : 2.25) : 0.8, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_center,transparent_0_36px,rgba(255,255,255,0.08)_37px_38px)]"
            animate={phase === 'collapse' && !reducedMotion ? { scale: [1, 2.8], opacity: [0.2, 0] } : { opacity: 0.18 }}
            transition={{ duration: 2.2 }}
          />

          <section className="relative z-10 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.38em] text-orange-200">
              {phase === 'reborn' ? 'TIMELINE 02 // STABLE' : 'RESTRICTED STELLAR CONTROL'}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-5 font-heading text-[clamp(2.6rem,9vw,6.5rem)] leading-none tracking-[-0.04em] outline-none"
            >
              {phase === 'armed' ? 'SUPERNOVA' : phase === 'collapse' ? 'SYSTEM REFORMING' : 'NEW GAME+'}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base" aria-live="polite">
              {phase === 'armed'
                ? 'One unprotected control will collapse the completed system and rebuild it with an altered spectrum. Mission progress will be preserved.'
                : phase === 'collapse'
                  ? 'Orbit records secured. Compressing star. Re-seeding color space.'
                  : 'The system survived, but its light did not return unchanged. Every completed destination remains in your flight log.'}
            </p>

            {phase === 'armed' && (
              <button
                type="button"
                onClick={() => setPhase('collapse')}
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded border border-orange-300/55 bg-orange-400/15 px-6 font-heading text-sm tracking-wide text-orange-100 hover:bg-orange-400/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Sun aria-hidden="true" className="h-4 w-4" /> Initiate supernova
              </button>
            )}
            {phase === 'collapse' && (
              <p role="status" className="mt-8 font-mono text-xs tracking-[0.24em] text-orange-100">PLEASE STAND BY</p>
            )}
            {phase === 'reborn' && (
              <button
                type="button"
                onClick={enterNewGamePlus}
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded border border-cyan-200/55 bg-cyan-300/15 px-6 font-heading text-sm tracking-wide text-cyan-50 hover:bg-cyan-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" /> Enter New Game+
              </button>
            )}
          </section>

          {phase !== 'collapse' && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute bottom-6 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 rounded px-4 font-mono text-xs text-white/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" /> Return without changes
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
