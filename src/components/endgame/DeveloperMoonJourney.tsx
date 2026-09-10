import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, ChevronLeft, ChevronRight, Flag, Map, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface DeveloperMoonJourneyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const developerMoonStops = [
  {
    id: 'why',
    marker: '00',
    eyebrow: 'The launch question',
    title: 'Why build a portfolio you can drive through?',
    body: 'I wanted the portfolio itself to demonstrate the kind of work I enjoy: taking ordinary information and turning it into a focused, memorable tool. A standard page could list my projects. A solar system could make the way I think and build visible.',
    image: '/brand/og-mission-portfolio.webp',
    alt: 'Mission Portfolio orbital JS emblem above a planet horizon',
    caption: 'The north star: make the experience feel like a mission before the first click.',
    imageClassName: 'object-cover',
  },
  {
    id: 'landing-pad',
    marker: '01',
    eyebrow: 'First terrain study',
    title: 'Every idea needed somewhere to land',
    body: 'The first useful shift was treating portfolio sections as destinations instead of menu items. That decision created the travel loop: choose a world, approach it, land, and discover what that place represents.',
    image: '/optimized/landing-pad.webp',
    alt: 'Early landing-pad artwork used while developing the planet surface experience',
    caption: 'Development artifact 01 · Landing-pad study',
    imageClassName: 'object-contain p-6 sm:p-10',
  },
  {
    id: 'base-camp',
    marker: '02',
    eyebrow: 'The surface became a place',
    title: 'A planet needed more than a backdrop',
    body: 'Landing was visually satisfying, but it was not yet exploration. The base camp gave every planet a shared physical language and a clear promise: there is something inside worth opening.',
    image: '/optimized/base-camp-exterior.webp',
    alt: 'Base-camp exterior artwork developed for the planet surfaces',
    caption: 'Development artifact 02 · Base-camp exterior',
    imageClassName: 'object-contain p-3 sm:p-6',
  },
  {
    id: 'empty-hab',
    marker: '03',
    eyebrow: 'An incomplete interior',
    title: 'The HAB worked, but the story paused here',
    body: 'This earlier interior established the room, window, workbench, and hardware. It also exposed a design problem: the computer existed, but the visitor did not have a physical action that explained how to use it.',
    image: '/optimized/base-camp-interior-v5-cutout.webp',
    alt: 'Version five of the HAB interior before the computer stool was added',
    caption: 'Development artifact 03 · HAB interior v5 · Before the stool interaction',
    imageClassName: 'object-cover',
  },
  {
    id: 'stool',
    marker: '04',
    eyebrow: 'The interaction clicked',
    title: 'One stool connected the whole experience',
    body: 'Adding a place to sit turned a screen into an action: enter, sit down, boot HAB OS, and open the mission archive. That small prop made the transition understandable and gave the tutorial something physical to teach.',
    image: '/optimized/base-camp-interior-v6-stool.webp',
    alt: 'Version six of the HAB interior with a stool positioned at the mission computer',
    caption: 'Development artifact 04 · HAB interior v6 · The seated-computer loop arrives',
    imageClassName: 'object-cover',
  },
  {
    id: 'today',
    marker: '05',
    eyebrow: 'The experiment became a product',
    title: 'Memorable still had to mean usable',
    body: 'The later work was less visible but just as important: a fast Quick Portfolio, keyboard and screen-reader paths, reduced-motion behavior, persistent progress, shareable routes, and tests around the full journey. The spectacle earns attention; the craft makes it hold up.',
    image: '/project-media/mission-portfolio.webp',
    alt: 'Finished Mission Portfolio route-selection screen',
    caption: 'Current mission · The immersive and recruiter-friendly routes now live together',
    imageClassName: 'object-cover',
  },
] as const;

const MoonBackdrop = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(165,243,252,0.14),transparent_22%),linear-gradient(180deg,#02050a_0%,#07101a_52%,#14171b_100%)]" />
    <div className="stars-bg absolute inset-0 opacity-35" />
    <div className="absolute -bottom-[18%] left-[-8%] h-[52%] w-[116%] rounded-[50%] border-t border-cyan-100/20 bg-[radial-gradient(ellipse_at_48%_0%,#5d656c_0%,#2b3035_42%,#111418_76%)] shadow-[0_-24px_80px_rgba(165,243,252,0.08)]" />
    {[
      ['9%', '78%', '5rem'],
      ['31%', '84%', '8rem'],
      ['63%', '80%', '4rem'],
      ['84%', '88%', '9rem'],
    ].map(([left, top, size]) => (
      <span
        key={left}
        className="absolute rounded-full border border-white/5 bg-black/20 shadow-[inset_8px_9px_16px_rgba(0,0,0,0.35)]"
        style={{ left, top, width: size, height: `calc(${size} * .38)` }}
      />
    ))}
  </div>
);

export const DeveloperMoonJourney = ({ open, onOpenChange }: DeveloperMoonJourneyProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const stop = developerMoonStops[currentStopIndex];
  const isFirst = currentStopIndex === 0;
  const isLast = currentStopIndex === developerMoonStops.length - 1;
  const roverProgress = (currentStopIndex / (developerMoonStops.length - 1)) * 100;

  const visitStop = (index: number) => {
    setCurrentStopIndex(Math.max(0, Math.min(developerMoonStops.length - 1, index)));
  };

  useEffect(() => {
    if (!open) setCurrentStopIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && !isLast) visitStop(currentStopIndex + 1);
      if (event.key === 'ArrowLeft' && !isFirst) visitStop(currentStopIndex - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStopIndex, isFirst, isLast, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        className="h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none overflow-hidden border-cyan-200/25 bg-[#03070c] p-0 text-white shadow-[0_0_100px_rgba(103,232,249,0.16)] sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl"
      >
        <MoonBackdrop />

        <div className="relative z-10 flex h-full min-h-0 flex-col p-4 sm:p-6 lg:p-8">
          <DialogHeader className="shrink-0 pr-10 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">
              Anomaly 04 // Developer Moon // Rover link active
            </p>
            <DialogTitle className="mt-1 font-heading text-2xl tracking-wide sm:text-3xl">
              The Build Behind the Mission
            </DialogTitle>
            <DialogDescription className="sr-only">
              Drive a rover through six story stops about why Mission Portfolio was built and how its visual experience developed.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 shrink-0 rounded-xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md sm:mt-5">
            <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
              <span className="flex items-center gap-2"><Map className="h-3.5 w-3.5" /> Development route</span>
              <span>Stop {currentStopIndex + 1} / {developerMoonStops.length}</span>
            </div>
            <div className="relative mx-3 h-8" aria-hidden="true">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
              <div className="absolute left-0 top-1/2 h-px bg-cyan-300/80" style={{ width: `${roverProgress}%` }} />
              {developerMoonStops.map((item, index) => (
                <span
                  key={item.id}
                  className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border ${index <= currentStopIndex ? 'border-cyan-100 bg-cyan-300' : 'border-white/30 bg-slate-800'}`}
                  style={{ left: `${(index / (developerMoonStops.length - 1)) * 100}%` }}
                />
              ))}
              <motion.span
                className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-200/70 bg-slate-950 text-amber-200 shadow-[0_0_18px_rgba(253,230,138,0.32)]"
                animate={{ left: `${roverProgress}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.55, ease: 'easeInOut' }}
              >
                <Bot className="h-4 w-4" />
              </motion.span>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1 sm:mt-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={stop.id}
                aria-labelledby={`developer-moon-${stop.id}`}
                className="grid h-full min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-xl lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:overflow-hidden"
                initial={reducedMotion ? false : { opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -28 }}
                transition={{ duration: reducedMotion ? 0 : 0.28 }}
              >
                <figure className="relative min-h-[15rem] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(148,163,184,0.17),rgba(2,6,12,0.92)_72%)] lg:min-h-0 lg:border-b-0 lg:border-r">
                  <img
                    src={stop.image}
                    alt={stop.alt}
                    className={`h-full max-h-[42dvh] w-full ${stop.imageClassName} lg:max-h-none`}
                  />
                  <figcaption className="absolute inset-x-3 bottom-3 rounded-md border border-white/10 bg-black/70 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/65 backdrop-blur-md">
                    {stop.caption}
                  </figcaption>
                </figure>

                <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-200/75">
                    Rover log {stop.marker} · {stop.eyebrow}
                  </p>
                  <h2 id={`developer-moon-${stop.id}`} className="mt-3 font-heading text-2xl leading-tight tracking-wide sm:text-3xl">
                    {stop.title}
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">
                    {stop.body}
                  </p>
                  <p className="mt-6 border-l-2 border-cyan-300/60 pl-4 font-mono text-[10px] uppercase leading-5 tracking-[0.13em] text-cyan-100/55">
                    Use the route markers or your left and right arrow keys to drive.
                  </p>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex shrink-0 items-center gap-3">
            <Button
              type="button"
              variant="outline"
              aria-label="Previous log"
              disabled={isFirst}
              onClick={() => visitStop(currentStopIndex - 1)}
              className="min-h-11 border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous log</span>
            </Button>

            <div className="flex flex-1 justify-center gap-1.5" aria-label="Developer Moon story stops">
              {developerMoonStops.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Visit rover stop ${index + 1}: ${item.title}`}
                  aria-current={index === currentStopIndex ? 'step' : undefined}
                  onClick={() => visitStop(index)}
                  className={`h-3 min-w-3 rounded-full transition-[width,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${index === currentStopIndex ? 'w-8 bg-cyan-300' : 'w-3 bg-white/25 hover:bg-white/45'}`}
                />
              ))}
            </div>

            {isLast ? (
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="min-h-11 bg-amber-300 text-slate-950 hover:bg-amber-200"
              >
                <Flag className="h-4 w-4" />
                Finish ride
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => visitStop(currentStopIndex + 1)}
                className="min-h-11 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              >
                Next log
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isLast && (
            <button
              type="button"
              onClick={() => visitStop(0)}
              className="mt-2 self-center rounded px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <RotateCcw className="mr-1 inline h-3 w-3" /> Replay rover route
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
