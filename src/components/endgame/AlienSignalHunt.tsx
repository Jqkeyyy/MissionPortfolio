import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Antenna,
  ArrowLeft,
  Check,
  LocateFixed,
  RadioTower,
  Rocket,
  Satellite,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ALIEN_SIGNAL_DECODED_MESSAGE,
  ALIEN_SIGNAL_FRAGMENTS,
  ALIEN_SIGNAL_SECRET_DESTINATION,
  collectAlienSignalFragment,
  createEmptyAlienSignalProgress,
  getAlienSignalFragmentAtPlanet,
  getNextAlienSignalFragment,
  isAlienSignalDecoded,
  persistAlienSignalProgress,
  readAlienSignalProgress,
  resolveAlienSignalStorage,
  type AlienSignalFragment,
  type AlienSignalProgress,
  type AlienSignalStorage,
} from '@/features/endgame/alienSignalHunt';

export interface AlienSignalHuntProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a planet ID only while its surface is active. Arrival captures its packet. */
  activePlanetId?: string | null;
  /** Called after the visitor chooses the next beacon. The host should begin travel. */
  onNavigateToPlanet?: (planetId: AlienSignalFragment['planetId']) => void;
  onFragmentCollected?: (fragment: AlienSignalFragment, progress: AlienSignalProgress) => void;
  onDecoded?: (progress: AlienSignalProgress) => void;
  /** Injectable for tests or non-browser hosts. Defaults to localStorage. */
  storage?: AlienSignalStorage | null;
}

type HuntView = 'receiver' | 'archive';

export const AlienSignalHunt = ({
  open,
  onOpenChange,
  activePlanetId = null,
  onNavigateToPlanet,
  onFragmentCollected,
  onDecoded,
  storage: providedStorage,
}: AlienSignalHuntProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const storage = useMemo(
    () => providedStorage === undefined ? resolveAlienSignalStorage() : providedStorage,
    [providedStorage],
  );
  const [progress, setProgress] = useState<AlienSignalProgress>(() => (
    readAlienSignalProgress(storage)
  ));
  const [view, setView] = useState<HuntView>('receiver');
  const decoded = isAlienSignalDecoded(progress);
  const nextFragment = getNextAlienSignalFragment(progress);
  const collectedCount = progress.collectedFragmentIds.length;

  useEffect(() => {
    if (!progress.started || !activePlanetId) return;

    const nextProgress = collectAlienSignalFragment(progress, activePlanetId);
    if (nextProgress === progress) return;

    const found = getAlienSignalFragmentAtPlanet(activePlanetId);
    persistAlienSignalProgress(storage, nextProgress);
    setProgress(nextProgress);
    if (found) onFragmentCollected?.(found, nextProgress);
    if (isAlienSignalDecoded(nextProgress)) onDecoded?.(nextProgress);
  }, [activePlanetId, onDecoded, onFragmentCollected, progress, storage]);

  useEffect(() => {
    if (!open) setView('receiver');
  }, [open]);

  const startHunt = () => {
    const nextProgress = { ...progress, started: true };
    setProgress(nextProgress);
    persistAlienSignalProgress(storage, nextProgress);
  };

  const plotCourse = (target: AlienSignalFragment) => {
    onOpenChange(false);
    onNavigateToPlanet?.(target.planetId);
  };

  const restartHunt = () => {
    const nextProgress = { ...createEmptyAlienSignalProgress(), started: true };
    setProgress(nextProgress);
    setView('receiver');
    persistAlienSignalProgress(storage, nextProgress);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto border-emerald-300/30 bg-[#030a0b]/[0.98] p-0 text-white shadow-[0_0_90px_rgba(52,211,153,0.16)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.16),transparent_26%),repeating-linear-gradient(0deg,transparent_0_5px,rgba(52,211,153,0.025)_6px)]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-emerald-300/10" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-emerald-300/10" />
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <DialogHeader className="pr-9 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300/70">
              Anomaly 05 // Deep-space receiver
            </p>
            <DialogTitle className="mt-1 flex items-center gap-3 font-heading text-2xl tracking-wide sm:text-3xl">
              <RadioTower className="h-6 w-6 text-emerald-300" aria-hidden="true" />
              {view === 'archive' ? ALIEN_SIGNAL_SECRET_DESTINATION : 'Alien Signal Hunt'}
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-6 text-emerald-50/60">
              {view === 'archive'
                ? 'A hidden relay assembled from five signals at the edge of the portfolio universe.'
                : 'Recover five radio fragments hidden on existing worlds, then decode the destination buried inside them.'}
            </DialogDescription>
          </DialogHeader>

          {view === 'archive' && decoded ? (
            <SignalArchive reducedMotion={reducedMotion} onReturn={() => setView('receiver')} />
          ) : (
            <ReceiverView
              progress={progress}
              decoded={decoded}
              nextFragment={nextFragment}
              collectedCount={collectedCount}
              canNavigate={Boolean(onNavigateToPlanet)}
              reducedMotion={reducedMotion}
              onStart={startHunt}
              onPlotCourse={plotCourse}
              onOpenArchive={() => setView('archive')}
              onRestart={restartHunt}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ReceiverViewProps {
  progress: AlienSignalProgress;
  decoded: boolean;
  nextFragment?: AlienSignalFragment;
  collectedCount: number;
  canNavigate: boolean;
  reducedMotion: boolean;
  onStart: () => void;
  onPlotCourse: (fragment: AlienSignalFragment) => void;
  onOpenArchive: () => void;
  onRestart: () => void;
}

const ReceiverView = ({
  progress,
  decoded,
  nextFragment,
  collectedCount,
  canNavigate,
  reducedMotion,
  onStart,
  onPlotCourse,
  onOpenArchive,
  onRestart,
}: ReceiverViewProps) => {
  if (!progress.started) {
    return (
      <section aria-labelledby="signal-detected-title" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5 sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
          <Antenna className="h-6 w-6 motion-safe:animate-pulse" aria-hidden="true" />
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/65">Unregistered carrier detected</p>
        <h2 id="signal-detected-title" className="mt-2 font-heading text-xl sm:text-2xl">Something is transmitting between the planets.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
          The receiver found a five-part hexadecimal message. Start triangulation, follow each clue, and land on a matching world to capture its packet.
        </p>
        <Button type="button" onClick={onStart} className="mt-6 min-h-12 w-full bg-emerald-300 font-heading text-xs tracking-[0.14em] text-emerald-950 hover:bg-emerald-200 sm:w-auto">
          <Satellite className="mr-2 h-4 w-4" aria-hidden="true" />
          Start Triangulation
        </Button>
      </section>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Receiver status</p>
          <p className="mt-1 font-heading text-lg text-emerald-100" role="status" aria-live="polite">
            {decoded ? 'Message decoded' : `${collectedCount} of ${ALIEN_SIGNAL_FRAGMENTS.length} fragments recovered`}
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 sm:w-56" role="progressbar" aria-label="Signal fragments recovered" aria-valuemin={0} aria-valuemax={ALIEN_SIGNAL_FRAGMENTS.length} aria-valuenow={collectedCount}>
          <motion.div
            className="h-full rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.65)]"
            initial={false}
            animate={{ width: `${(collectedCount / ALIEN_SIGNAL_FRAGMENTS.length) * 100}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.45 }}
          />
        </div>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Alien signal fragments">
        {ALIEN_SIGNAL_FRAGMENTS.map((candidate) => {
          const collected = progress.collectedFragmentIds.includes(candidate.id);
          return (
            <li key={candidate.id} className={`min-w-0 rounded-lg border p-3 ${collected ? 'border-emerald-300/35 bg-emerald-300/[0.08]' : 'border-white/10 bg-white/[0.025]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">Packet {String(candidate.sequence).padStart(2, '0')}</span>
                {collected ? <Check className="h-4 w-4 text-emerald-300" aria-label="Recovered" /> : <span className="font-mono text-xs text-white/25" aria-label="Not recovered">?</span>}
              </div>
              <p className="mt-4 truncate font-mono text-[11px] tracking-[0.12em] text-emerald-200/80">{collected ? candidate.encoded : '---- ---- ----'}</p>
              <p className="mt-2 font-heading text-sm tracking-wide text-white">{collected ? candidate.decoded : 'ENCRYPTED'}</p>
              <p className="mt-1 text-[11px] text-white/40">{collected ? `${candidate.planetName} · ${candidate.frequency}` : 'Location unknown'}</p>
            </li>
          );
        })}
      </ol>

      {decoded ? (
        <section className="mt-4 rounded-xl border border-emerald-200/35 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.15),transparent_42%),rgba(16,185,129,0.06)] p-5 sm:p-6" aria-labelledby="decoded-message-title">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300">Five packets synchronized</p>
          <h2 id="decoded-message-title" className="mt-2 font-heading text-xl sm:text-2xl">{ALIEN_SIGNAL_DECODED_MESSAGE}</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">The combined carrier contains coordinates for an unmarked destination beyond the normal mission route.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={onOpenArchive} className="min-h-12 bg-emerald-300 font-heading text-xs tracking-[0.14em] text-emerald-950 hover:bg-emerald-200">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Enter The Listening Post
            </Button>
            <Button type="button" variant="ghost" onClick={onRestart} className="min-h-12 text-white/55 hover:bg-white/10 hover:text-white">Restart hunt</Button>
          </div>
        </section>
      ) : nextFragment ? (
        <section className="mt-4 rounded-xl border border-amber-200/20 bg-amber-200/[0.04] p-5" aria-labelledby="next-carrier-title">
          <div className="flex items-start gap-3">
            <LocateFixed className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/65">Next carrier // {nextFragment.frequency}</p>
              <h2 id="next-carrier-title" className="mt-1 font-heading text-base">{nextFragment.clue}</h2>
              <p className="mt-2 text-xs leading-5 text-white/45">Land on the source world to capture the packet. The receiver remains active while this window is closed.</p>
            </div>
          </div>
          <Button type="button" variant="outline" disabled={!canNavigate} onClick={() => onPlotCourse(nextFragment)} className="mt-5 min-h-12 w-full border-amber-200/35 bg-amber-200/[0.06] font-heading text-xs tracking-[0.14em] text-amber-100 hover:bg-amber-200/15 hover:text-white sm:w-auto">
            <Rocket className="mr-2 h-4 w-4" aria-hidden="true" />
            Plot Course to {nextFragment.planetName}
          </Button>
          {!canNavigate && <p className="mt-2 text-xs text-amber-100/55">Navigation link unavailable. Close the receiver and travel to the world described above.</p>}
        </section>
      ) : null}
    </div>
  );
};

const SignalArchive = ({ reducedMotion, onReturn }: { reducedMotion: boolean; onReturn: () => void }) => (
  <motion.section
    className="mt-6 overflow-hidden rounded-xl border border-emerald-200/30 bg-emerald-950/20"
    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.5 }}
    aria-labelledby="listening-post-title"
  >
    <div className="border-b border-emerald-200/15 bg-black/25 p-5 sm:p-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/65">Coordinates 43.∞ // Node JS-1129</p>
      <h2 id="listening-post-title" className="mt-3 font-heading text-2xl sm:text-4xl">You looked closer.</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
        That instinct—to follow an odd detail, test what it means, and make the hidden system understandable—is the same curiosity behind this portfolio and the products inside it.
      </p>
    </div>
    <div className="grid gap-px bg-emerald-200/10 sm:grid-cols-3">
      {[
        ['01', 'Notice', 'Good software starts with paying attention to a real need.'],
        ['02', 'Investigate', 'Evidence, experiments, and clear constraints turn guesses into direction.'],
        ['03', 'Build', 'The best result is useful, understandable, and worth sharing.'],
      ].map(([marker, title, body]) => (
        <div key={marker} className="bg-[#061011] p-5">
          <p className="font-mono text-[10px] text-emerald-300/55">{marker}</p>
          <h3 className="mt-3 font-heading text-base text-emerald-50">{title}</h3>
          <p className="mt-2 text-xs leading-5 text-white/50">{body}</p>
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/45">Transmission complete // Open channel remains</p>
      <Button type="button" variant="outline" onClick={onReturn} className="min-h-11 border-emerald-200/30 bg-emerald-200/[0.05] text-emerald-100 hover:bg-emerald-200/10 hover:text-white">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Return to receiver
      </Button>
    </div>
  </motion.section>
);
