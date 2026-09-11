import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Crosshair, ExternalLink, Orbit, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ROGUE_PLANET_PAYLOAD,
  type RoguePlanetPass,
  type RoguePlanetPayload,
} from '@/features/endgame/roguePlanet';

export interface RoguePlanetEncounterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pass?: RoguePlanetPass | null;
  payload?: RoguePlanetPayload;
  onCapture?: (payload: RoguePlanetPayload) => void;
}

const PlanetSignal = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <div className="relative mx-auto flex aspect-square w-[min(58vw,17rem)] items-center justify-center" aria-hidden="true">
    <motion.div
      className="absolute inset-2 rounded-full border border-fuchsia-300/20"
      animate={reducedMotion ? undefined : { rotate: 360 }}
      transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
    >
      <span className="absolute left-1/2 top-[-0.35rem] h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,0.9)]" />
    </motion.div>
    <motion.div
      className="relative h-[62%] w-[62%] overflow-hidden rounded-full border border-fuchsia-100/35 bg-[radial-gradient(circle_at_33%_26%,#f5d0fe_0%,#a855f7_12%,#4c1d95_43%,#12051f_75%)] shadow-[inset_-24px_-18px_35px_rgba(0,0,0,0.7),0_0_55px_rgba(217,70,239,0.35)]"
      animate={reducedMotion ? undefined : { y: [0, -8, 0], rotate: [0, 2, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="absolute left-[18%] top-[32%] h-[12%] w-[44%] -rotate-12 rounded-full border-t border-fuchsia-100/25 bg-black/10" />
      <span className="absolute bottom-[24%] right-[10%] h-[16%] w-[34%] rotate-12 rounded-full border-t border-cyan-100/20 bg-black/15" />
    </motion.div>
    <div className="absolute inset-[20%] border-l border-t border-cyan-200/55" />
    <div className="absolute inset-[20%] border-b border-r border-cyan-200/55" />
  </div>
);

export const RoguePlanetEncounter = ({
  open,
  onOpenChange,
  pass,
  payload = ROGUE_PLANET_PAYLOAD,
  onCapture,
}: RoguePlanetEncounterProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    if (!open) setCaptured(false);
  }, [open]);

  const capture = () => {
    if (captured) return;
    setCaptured(true);
    onCapture?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto border-fuchsia-300/30 bg-[#05020b] p-0 text-white shadow-[0_0_100px_rgba(217,70,239,0.2)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_18%_12%,rgba(103,232,249,0.1),transparent_25%),radial-gradient(circle_at_82%_78%,rgba(217,70,239,0.14),transparent_32%),linear-gradient(150deg,#05020b,#080717_58%,#14051d)]" />
        <div aria-hidden="true" className="stars-bg pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative z-10 p-5 sm:p-7 lg:p-9">
          <DialogHeader className="pr-9 text-left">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fuchsia-200/70">
              <Radio className="h-3.5 w-3.5" aria-hidden="true" />
              Unregistered orbital contact
            </p>
            <DialogTitle className="font-heading text-2xl tracking-wide sm:text-3xl">
              Rogue Planet Encounter
            </DialogTitle>
            <DialogDescription className="text-white/60">
              An unmarked world is crossing the completed system. Catch it before the signal slips back into deep space.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6" aria-live="polite">
            {!captured ? (
              <section className="grid items-center gap-6 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)]" aria-labelledby="rogue-tracking-heading">
                <PlanetSignal reducedMotion={reducedMotion} />
                <div className="rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-md sm:p-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/65">Tracking solution // No catalog match</p>
                  <h2 id="rogue-tracking-heading" className="mt-3 font-heading text-2xl sm:text-3xl">
                    Something impossible just entered range.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                    Its orbit was not in the mission plan. The surface is broadcasting an encrypted build record—and the intercept window is closing.
                  </p>

                  <dl className="mt-6 grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-wider">
                    <div className="border border-white/10 bg-white/5 p-3">
                      <dt className="text-white/40">Signal strength</dt>
                      <dd className="mt-1 text-cyan-200">{pass?.signalStrengthPercent ?? 87}%</dd>
                    </div>
                    <div className="border border-white/10 bg-white/5 p-3">
                      <dt className="text-white/40">Approach vector</dt>
                      <dd className="mt-1 text-fuchsia-200">{pass?.approachAngleDeg ?? 247}&deg;</dd>
                    </div>
                  </dl>

                  <Button
                    type="button"
                    onClick={capture}
                    className="mt-6 min-h-12 w-full gap-2 bg-fuchsia-300 font-heading text-sm tracking-wide text-slate-950 hover:bg-fuchsia-200 focus-visible:ring-fuchsia-200"
                  >
                    <Crosshair className="h-4 w-4" aria-hidden="true" />
                    Catch the Rogue Planet
                  </Button>
                  <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.17em] text-white/35">
                    Keyboard and touch tractor controls synchronized
                  </p>
                </div>
              </section>
            ) : (
              <motion.article
                aria-labelledby="rogue-payload-heading"
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.35 }}
                className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)]"
              >
                <div className="flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-2xl border border-fuchsia-200/20 bg-[radial-gradient(circle_at_50%_42%,rgba(217,70,239,0.3),transparent_30%),linear-gradient(145deg,rgba(76,29,149,0.4),rgba(0,0,0,0.55))] p-6">
                  <Sparkles className="h-7 w-7 text-fuchsia-200" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-200/65">Payload decrypted</p>
                    <p className="mt-2 font-heading text-xl">{payload.revealLabel}</p>
                    <div className="mt-5 flex flex-wrap gap-2" aria-label="Prototype technologies">
                      {payload.technologies.slice(0, 5).map((technology) => (
                        <span key={technology} className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-white/60">
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-5 backdrop-blur-xl sm:p-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/65">{payload.eyebrow}</p>
                  <h2 id="rogue-payload-heading" className="mt-3 font-heading text-2xl leading-tight sm:text-3xl">
                    {payload.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">{payload.story}</p>
                  <p className="mt-4 border-l-2 border-fuchsia-300/55 pl-4 text-sm italic leading-6 text-white/55">{payload.summary}</p>

                  <ul className="mt-5 space-y-2 text-sm text-white/60" aria-label="Recovered field notes">
                    {payload.fieldNotes.slice(0, 3).map((note) => (
                      <li key={note} className="flex gap-2">
                        <Orbit className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200/70" aria-hidden="true" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="min-h-11 flex-1 gap-2 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                      <a href={payload.projectPath}>
                        Open recovered case study
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="min-h-11 flex-1 gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Release and return
                    </Button>
                  </div>
                </div>
              </motion.article>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
