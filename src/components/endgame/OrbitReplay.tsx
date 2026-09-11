import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  BookOpenText,
  ChevronRight,
  CircleStop,
  Code2,
  Pause,
  Play,
  Rocket,
  Satellite,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PlanetThemeId } from '@/data/planetThemes';
import {
  createOrbitReplayManifest,
  type OrbitReplayFlyby,
} from '@/features/endgame/orbitReplay';
import { cn } from '@/lib/utils';

export interface OrbitReplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Persisted destinations; invalid and duplicate IDs are ignored. */
  visitedPlanetIds: readonly (PlanetThemeId | string)[];
  /** Time each destination remains on screen while autopilot is running. */
  autoPlayIntervalMs?: number;
  initialPlaying?: boolean;
  /** Overrides the visitor preference, primarily for embedded contexts and tests. */
  reducedMotion?: boolean;
  onFlybyChange?: (flyby: OrbitReplayFlyby, index: number) => void;
  onReplayComplete?: () => void;
  className?: string;
}

const statisticCards = [
  { key: 'destinations', label: 'Destinations', icon: Satellite },
  { key: 'missionLogs', label: 'Mission logs', icon: BookOpenText },
  { key: 'featuredProjects', label: 'Projects', icon: BarChart3 },
  { key: 'technologies', label: 'Technologies', icon: Code2 },
] as const;

export const OrbitReplay = ({
  open,
  onOpenChange,
  visitedPlanetIds,
  autoPlayIntervalMs = 6500,
  initialPlaying = true,
  reducedMotion: reducedMotionOverride,
  onFlybyChange,
  onReplayComplete,
  className,
}: OrbitReplayProps) => {
  const systemReducedMotion = Boolean(useReducedMotion());
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;
  const manifest = useMemo(
    () => createOrbitReplayManifest(visitedPlanetIds),
    [visitedPlanetIds],
  );
  const { flybys, statistics } = manifest;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(initialPlaying && !reducedMotion && flybys.length > 0);
  const currentFlyby = flybys[currentIndex];
  const isFinalFlyby = currentIndex === flybys.length - 1;
  const progress = flybys.length > 0 ? ((currentIndex + 1) / flybys.length) * 100 : 0;

  useEffect(() => {
    setCurrentIndex(0);
    setPlaying(open && initialPlaying && !reducedMotion && flybys.length > 0);
  }, [flybys.length, initialPlaying, open, reducedMotion]);

  useEffect(() => {
    if (!open || !currentFlyby) return;
    onFlybyChange?.(currentFlyby, currentIndex);
  }, [currentFlyby, currentIndex, onFlybyChange, open]);

  useEffect(() => {
    if (!open || !playing || flybys.length === 0) return;

    const timer = window.setTimeout(() => {
      if (isFinalFlyby) {
        setPlaying(false);
        onReplayComplete?.();
        return;
      }
      setCurrentIndex((index) => index + 1);
    }, Math.max(250, autoPlayIntervalMs));

    return () => window.clearTimeout(timer);
  }, [autoPlayIntervalMs, flybys.length, isFinalFlyby, onReplayComplete, open, playing]);

  const togglePlayback = () => {
    if (flybys.length === 0) return;
    if (!playing && isFinalFlyby) setCurrentIndex(0);
    setPlaying((isPlaying) => !isPlaying);
  };

  const visitNext = () => {
    if (flybys.length === 0) return;
    setCurrentIndex((index) => (index + 1) % flybys.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        className={cn(
          'h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none overflow-hidden border-cyan-300/25 bg-[#020711] p-0 text-white shadow-[0_0_100px_rgba(34,211,238,0.14)] sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl [&>button]:hidden',
          className,
        )}
      >
        <ReplayBackdrop playing={playing} reducedMotion={reducedMotion} color={currentFlyby?.color} />

        <div className="relative z-10 flex h-full min-h-0 flex-col p-4 sm:p-6 lg:p-8">
          <DialogHeader className="shrink-0 pr-12 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/65">
              Anomaly // Orbit Replay // {playing ? 'Autopilot engaged' : 'Manual control'}
            </p>
            <DialogTitle className="mt-1 font-heading text-2xl tracking-wide sm:text-3xl">
              Mission Orbit Replay
            </DialogTitle>
            <DialogDescription className="sr-only">
              An autopilot recap of completed portfolio destinations, milestones, and mission statistics.
            </DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            variant="outline"
            aria-label="Exit replay"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 min-h-11 border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exit replay</span>
            <span className="sr-only sm:hidden">Exit replay</span>
          </Button>

          <section aria-label="Portfolio mission statistics" className="mt-4 grid shrink-0 grid-cols-2 gap-2 sm:mt-5 lg:grid-cols-4">
            {statisticCards.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 text-cyan-200/60">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{label}</span>
                </div>
                <p className="mt-1 font-heading text-xl text-white sm:text-2xl">{statistics[key]}</p>
              </div>
            ))}
          </section>

          <div className="mt-4 min-h-0 flex-1 sm:mt-5">
            {currentFlyby ? (
              <motion.article
                key={currentFlyby.id}
                aria-live="polite"
                aria-atomic="true"
                className="grid h-full min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-xl lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:overflow-hidden"
                initial={reducedMotion ? false : { opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.38, ease: 'easeOut' }}
              >
                <div className="relative flex min-h-52 items-center justify-center overflow-hidden border-b border-white/10 p-8 lg:min-h-0 lg:border-b-0 lg:border-r">
                  <div
                    aria-hidden="true"
                    className="absolute h-[min(42vw,42vh)] w-[min(42vw,42vh)] rounded-full border border-white/10"
                  />
                  <motion.div
                    aria-hidden="true"
                    className="relative h-32 w-32 rounded-full border border-white/30 shadow-[inset_-22px_-16px_34px_rgba(0,0,0,0.48),0_0_56px_var(--flyby-glow)] sm:h-44 sm:w-44"
                    style={{
                      background: `radial-gradient(circle at 34% 28%, white 0%, ${currentFlyby.color} 12%, ${currentFlyby.color} 45%, #030712 100%)`,
                      ['--flyby-glow' as string]: `${currentFlyby.color}66`,
                    }}
                    animate={reducedMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
                  />
                  <div className="absolute bottom-5 left-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                    Flyby {String(currentIndex + 1).padStart(2, '0')} / {String(flybys.length).padStart(2, '0')}
                  </div>
                </div>

                <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/65">
                    {currentFlyby.destinationName} // {currentFlyby.topic}
                  </p>
                  <h2 className="mt-3 font-heading text-2xl leading-tight tracking-wide sm:text-4xl">
                    {currentFlyby.milestoneTitle}
                  </h2>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                    {currentFlyby.milestoneSummary}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {currentFlyby.projectNames.map((projectName) => (
                      <span key={projectName} className="rounded-full border border-cyan-200/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-100/70">
                        {projectName}
                      </span>
                    ))}
                    {currentFlyby.metric && (
                      <span className="rounded-full border border-amber-200/25 bg-amber-300/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-100/75">
                        {currentFlyby.metric.value} {currentFlyby.metric.label}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/75 px-6 text-center backdrop-blur-xl">
                <CircleStop className="h-10 w-10 text-cyan-200/60" aria-hidden="true" />
                <h2 className="mt-4 font-heading text-2xl">No flight path recorded</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/60">
                  Complete a destination before launching Orbit Replay.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 shrink-0">
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-cyan-300"
                animate={{ width: `${progress}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.35 }}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                aria-pressed={playing}
                disabled={flybys.length === 0}
                onClick={togglePlayback}
                className="min-h-11 border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white disabled:opacity-45"
              >
                {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                {playing ? 'Pause autopilot' : 'Play autopilot'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={flybys.length === 0}
                onClick={visitNext}
                className="min-h-11 border-white/20 bg-black/30 text-white hover:bg-white/10 hover:text-white"
              >
                Next destination
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <p className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.14em] text-white/40 sm:block">
                {reducedMotion ? 'Static transitions active' : `${statistics.liveProjects} live projects transmitting`}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ReplayBackdrop = ({
  playing,
  reducedMotion,
  color,
}: {
  playing: boolean;
  reducedMotion: boolean;
  color?: string;
}) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-70 transition-colors duration-700"
      style={{ background: `radial-gradient(circle at 75% 18%, ${color ?? '#22d3ee'}22, transparent 28%), linear-gradient(180deg, #020711 0%, #071525 58%, #02050a 100%)` }}
    />
    <div className="stars-bg absolute inset-0 opacity-40" />
    <motion.div
      className="absolute -left-[20vw] top-[62%] h-px w-[140vw] bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent"
      animate={!reducedMotion && playing ? { x: ['-8%', '8%', '-8%'] } : undefined}
      transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
    />
    <Rocket className="absolute bottom-[9%] right-[7%] h-5 w-5 rotate-[-25deg] text-cyan-100/20" />
  </div>
);
