import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  Armchair,
  DoorOpen,
  Gauge,
  Radio,
  ShieldCheck,
  Wind,
} from 'lucide-react';
import { PlanetData } from '@/data/planets';
import {
  formatTelemetryReading,
  getHabitatFamily,
  getPlanetTheme,
  getTelemetryReading,
  type TelemetryReadingId,
} from '@/data/planetThemes';
import { PlanetTerrain } from './PlanetTerrain';
import {
  getPlanetThemeCssVariables,
  getPlanetThemeDataAttributes,
} from './theme/themeStyles';

const loadHabitatDesktop = () => import('./HabitatDesktop').then((module) => ({
  default: module.HabitatDesktop,
}));

const HabitatDesktop = lazy(loadHabitatDesktop);

interface BaseCampInteriorProps {
  planet: PlanetData;
  onExit: () => void;
  onAccessComputer: () => void;
  onLeaveComputer?: () => void;
  computerActive?: boolean;
  bootStartedAt?: number | null;
}

const telemetryItems: readonly { id: TelemetryReadingId; icon: typeof Wind }[] = [
  { id: 'oxygen-reserve', icon: Wind },
  { id: 'hab-pressure', icon: Gauge },
  { id: 'comms-link', icon: Radio },
];

const roomParticles = [
  { left: '18%', top: '29%', delay: 0.4, duration: 7.2 },
  { left: '29%', top: '63%', delay: 1.8, duration: 6.4 },
  { left: '41%', top: '35%', delay: 2.6, duration: 8.1 },
  { left: '55%', top: '72%', delay: 0.9, duration: 7.8 },
  { left: '67%', top: '42%', delay: 3.1, duration: 6.8 },
  { left: '79%', top: '59%', delay: 1.2, duration: 8.4 },
];

const COMPUTER_ZOOM_SCALE = 7.9;
const MONITOR_RENDER_SCALE = 1 / COMPUTER_ZOOM_SCALE;

const DesktopBootScreen = ({ planetName }: { planetName: string }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#020609] text-center text-cyan-100" aria-busy="true">
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(34,211,238,0.12),transparent_34%)]" />
    <div role="status" aria-live="polite" className="relative">
      <div className="mx-auto mb-8 grid h-20 w-20 grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.span
            key={index}
            className="rounded-sm bg-cyan-300"
            animate={{ opacity: [0.28, 1, 0.28] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.12 }}
          />
        ))}
      </div>
      <p className="font-heading text-[52px] tracking-[0.18em]">HAB/OS</p>
      <p className="mt-5 font-mono text-[18px] uppercase tracking-[0.22em] text-cyan-100/45">
        Waking {planetName} mission station
      </p>
      <div className="mx-auto mt-8 h-1 w-72 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.65)]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.15, ease: 'easeInOut' }}
        />
      </div>
    </div>
  </div>
);

const DesktopSleeping = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#010304]">
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(118deg,transparent_20%,rgba(255,255,255,0.025)_43%,transparent_62%)]" />
    <span aria-hidden="true" className="absolute bottom-5 right-6 h-2 w-2 rounded-full bg-amber-300/70 shadow-[0_0_12px_rgba(252,211,77,0.55)]" />
  </div>
);

export const BaseCampInterior = ({
  planet,
  onExit,
  onAccessComputer,
  onLeaveComputer = () => {},
  computerActive = false,
  bootStartedAt,
}: BaseCampInteriorProps) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [desktopMounted, setDesktopMounted] = useState(false);
  const theme = getPlanetTheme(planet.id)!;
  const family = getHabitatFamily(theme.family);

  useEffect(() => {
    if (!computerActive) {
      setDesktopMounted(false);
      return;
    }

    // Reduced-motion visitors do not have a camera move to use as a loading veil.
    if (prefersReducedMotion) setDesktopMounted(true);
  }, [computerActive, prefersReducedMotion]);

  useEffect(() => {
    if (!computerActive) return;
    // Fetch and parse the large desktop chunk while the lightweight wake screen is
    // being composited. Its React tree is deliberately held back until zoom ends.
    void loadHabitatDesktop();
  }, [computerActive]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !computerActive) onExit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [computerActive, onExit]);

  const accentStyle = {
    ...getPlanetThemeCssVariables(theme),
    '--camp-accent': theme.palette.accent,
  } as CSSProperties;

  const telemetry = telemetryItems.map(({ id, icon }) => {
    const reading = getTelemetryReading(theme, id);
    return { ...reading, formattedValue: formatTelemetryReading(reading), icon };
  });

  return (
    <motion.section
      aria-label={`${planet.displayName} base camp interior`}
      className={`planet-theme-scope camp-themed-interior fixed inset-0 z-40 isolate overflow-hidden ${computerActive ? 'camp-computer-active' : ''}`}
      {...getPlanetThemeDataAttributes(theme)}
      style={accentStyle}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
    >
      <div
        className="camp-room-stage pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          className="absolute inset-0 origin-center"
          initial={prefersReducedMotion ? false : { scale: 1.035 }}
          animate={{
            scale: computerActive ? COMPUTER_ZOOM_SCALE : 1,
            x: computerActive ? '4%' : '0%',
            y: computerActive ? '3%' : '0%',
          }}
          transition={{ duration: prefersReducedMotion ? 0 : computerActive ? 2.3 : 1.2, ease: [0.65, 0, 0.35, 1] }}
          style={{
            transformOrigin: '49.55% 52.84%',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
          onAnimationComplete={() => {
            if (computerActive) setDesktopMounted(true);
          }}
        >
          <div className="camp-window-view absolute overflow-hidden bg-[#040b12]">
            <div className="stars-bg absolute inset-0 opacity-35" />
            <PlanetTerrain planet={planet} fillBackground idSuffix="interior" />
            <div className="camp-window-treatment absolute inset-0" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_32%,rgba(1,6,10,0.16))]" />
          </div>

          <picture>
            <source srcSet="/optimized/base-camp-interior-v6-stool.webp" type="image/webp" />
            <img
              src="/base-camp-interior-v6-stool.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              decoding="async"
              width="1672"
              height="940"
              className="absolute inset-0 z-10 h-full w-full select-none"
            />
          </picture>

          <div aria-hidden="true" className="camp-shell-theme absolute inset-0 z-[11]" />

          <motion.div
            className="camp-terminal-monitor pointer-events-auto absolute z-20 focus:outline-none"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: MONITOR_RENDER_SCALE * 0.9 }}
            animate={{ opacity: 1, scale: MONITOR_RENDER_SCALE }}
            transition={prefersReducedMotion
              ? { duration: 0 }
              : { delay: 0.55, type: 'spring', stiffness: 190, damping: 18 }}
            whileHover={computerActive ? undefined : { scale: MONITOR_RENDER_SCALE * 1.045 }}
            whileTap={computerActive ? undefined : { scale: MONITOR_RENDER_SCALE * 0.98 }}
          >
            <span
              className={`relative block overflow-hidden rounded-[0.55rem] border-[clamp(2px,0.32vw,6px)] border-[#afb1ad] bg-[#d9d8d0] p-[3.5%] transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-cyan-200 ${
                computerActive
                  ? 'shadow-[0_8px_24px_rgba(0,0,0,0.58),0_0_18px_rgba(103,232,249,0.24)]'
                  : 'shadow-[0_8px_18px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.58),0_0_18px_rgba(103,232,249,0.24)]'
              }`}
            >
              <span className="absolute left-1/2 top-[1.5%] h-[3%] min-h-px w-[3%] min-w-px -translate-x-1/2 rounded-full bg-[#313a3d]" />
              <span className="relative block aspect-video w-full overflow-hidden rounded-[0.2rem] border border-black/75 bg-[#061017]">
                <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-hidden={!computerActive} className="absolute inset-0 h-full w-full">
                  <foreignObject x="0" y="0" width="1600" height="900">
                    <div className="h-[900px] w-[1600px] overflow-hidden">
                      <div className={`${computerActive ? 'pointer-events-auto' : 'pointer-events-none'} h-full w-full select-none`} aria-hidden={!computerActive}>
                        {computerActive ? desktopMounted ? (
                          <Suspense fallback={<DesktopBootScreen planetName={planet.displayName} />}>
                            <HabitatDesktop
                              planet={planet}
                              onStandUp={onLeaveComputer}
                              bootStartedAt={bootStartedAt}
                            />
                          </Suspense>
                        ) : (
                          <DesktopBootScreen planetName={planet.displayName} />
                        ) : <DesktopSleeping />}
                      </div>
                    </div>
                  </foreignObject>
                </svg>
              </span>
            </span>
            <span className="mx-auto block h-8 w-[24%] bg-gradient-to-b from-[#8c918e] to-[#555b59]" />
            <span className="mx-auto block h-3 w-[52%] rounded-b bg-[#777c79] shadow-[0_4px_8px_rgba(0,0,0,0.45)]" />
            {!computerActive && (
              <button
                type="button"
                data-tutorial-action="sit-computer"
                aria-label="Sit down at the mission computer"
                onClick={onAccessComputer}
                className="absolute inset-0 z-20 rounded-[0.55rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              />
            )}
          </motion.div>

          <motion.button
            type="button"
            data-tutorial-target="sit-computer"
            data-tutorial-action="sit-computer"
            aria-label="Sit on the stool to view the mission computer"
            onClick={onAccessComputer}
            className={`camp-terminal-seat group absolute z-20 focus:outline-none ${computerActive ? 'pointer-events-none' : 'pointer-events-auto'}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: computerActive ? 0 : 1, y: computerActive ? 28 : 0 }}
            transition={{ delay: prefersReducedMotion || computerActive ? 0 : 0.72, duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeOut' }}
            whileHover={{ scale: 1.045, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute bottom-[calc(100%-0.3rem)] left-1/2 w-max -translate-x-1/2">
              <motion.span
                className="camp-glass-panel flex w-max items-center gap-2 border-amber-200/25 px-3 py-2 font-mono text-[clamp(0.55rem,0.72vw,0.78rem)] uppercase tracking-[0.15em] text-amber-50 shadow-[0_12px_32px_rgba(0,0,0,0.4),0_0_18px_rgba(245,158,11,0.08)]"
                style={{ '--camp-accent': '#f59e0b' } as CSSProperties}
                animate={prefersReducedMotion ? undefined : { y: [0, -2, 0], opacity: [0.78, 1, 0.78] }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Armchair className="h-3.5 w-3.5 text-amber-300" />
                SIT DOWN TO VIEW
              </motion.span>
            </span>

            <span
              aria-hidden="true"
              className="absolute -inset-[12%] rounded-[42%] border border-amber-300/0 bg-amber-300/0 transition-all duration-300 group-hover:border-amber-300/30 group-hover:bg-amber-300/[0.025] group-hover:shadow-[0_0_24px_rgba(245,158,11,0.12)] group-focus-visible:border-amber-200/60"
            />
          </motion.button>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-color"
        style={{ backgroundColor: theme.palette.accent }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,8,0.16)_0%,transparent_25%,transparent_60%,rgba(1,4,7,0.66)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.68)_115%)]"
      />
      <div aria-hidden="true" className="camp-scanlines pointer-events-none absolute inset-0 opacity-[0.055]" />

      {!computerActive && !prefersReducedMotion && roomParticles.map((particle, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="absolute h-px w-px rounded-full bg-cyan-100/60 shadow-[0_0_6px_rgba(165,243,252,0.6)]"
          style={{ left: particle.left, top: particle.top }}
          animate={{ y: [0, -18, 0], opacity: [0, 0.55, 0] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.header
        className={`absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-5 ${computerActive ? 'pointer-events-none' : ''}`}
        initial={prefersReducedMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: computerActive ? 0 : 1, y: computerActive ? -18 : 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.55 }}
      >
        <div className="camp-glass-panel min-w-0 px-4 py-3 sm:px-5">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgb(52_211_153)]" />
            <span>BASE CAMP INTERIOR</span>
            <span aria-hidden="true">·</span>
            <span>{family.label.toUpperCase()}</span>
          </div>
          <h1 className="truncate font-heading text-lg font-medium tracking-[0.12em] text-white sm:text-2xl">
            <span>{planet.displayName}</span> <span className="text-white/35">/</span> Habitat 01
          </h1>
        </div>

        <div className="camp-glass-panel hidden items-center gap-3 px-4 py-3 text-right sm:flex">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">Station status</p>
            <p className="text-sm font-medium text-white/90">Secure · Online</p>
          </div>
        </div>
      </motion.header>

      <motion.aside
        aria-label="Habitat telemetry"
        className="camp-glass-panel pointer-events-none absolute right-6 top-1/2 z-20 hidden w-52 -translate-y-1/2 overflow-hidden lg:block"
        initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: computerActive ? 0 : 1, x: computerActive ? 24 : 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.45, duration: prefersReducedMotion ? 0 : 0.55 }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Activity className="h-4 w-4 text-[var(--camp-accent)]" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">Live telemetry</span>
        </div>
        <div className="divide-y divide-white/10 px-4">
          {telemetry.map(({ id, label, formattedValue, status, icon: Icon }) => (
            <div key={id} className="flex items-center gap-3 py-3" data-telemetry-status={status}>
              <Icon className="h-4 w-4 text-white/35" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/45">{label}</p>
                <p className="truncate font-mono text-sm text-white/85">{formattedValue}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="h-0.5 w-full bg-white/5">
          <motion.div
            className="h-full bg-[var(--camp-accent)] shadow-[0_0_12px_var(--camp-accent)]"
            initial={{ width: '0%' }}
            animate={{ width: '82%' }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.7, duration: prefersReducedMotion ? 0 : 1.1 }}
          />
        </div>
      </motion.aside>

      <motion.aside
        aria-label={`${planet.displayName} habitat identity`}
        className="camp-glass-panel pointer-events-none absolute bottom-24 left-1/2 z-20 hidden w-[min(38rem,58vw)] -translate-x-1/2 px-5 py-3 xl:block"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: computerActive ? 0 : 1, y: computerActive ? 16 : 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.55, duration: prefersReducedMotion ? 0 : 0.45 }}
      >
        <p className="text-sm leading-6 text-white/80">{theme.identityCue}</p>
        <div className="mt-2 grid grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          <p><span className="text-[var(--camp-accent)]">Field kit:</span> {theme.props.join(' · ')}</p>
          <p><span className="text-[var(--camp-accent)]">Mission marks:</span> {theme.decals.join(' · ')}</p>
        </div>
      </motion.aside>

      <motion.button
        type="button"
        aria-label="Exit through the habitat airlock"
        onClick={onExit}
        className={`group absolute left-[15%] top-[55%] z-20 hidden -translate-x-1/2 -translate-y-1/2 focus:outline-none sm:block ${computerActive ? 'pointer-events-none' : ''}`}
        initial={prefersReducedMotion ? false : { opacity: 0, x: -14 }}
        animate={{ opacity: computerActive ? 0 : 1, x: computerActive ? -18 : 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.65, duration: prefersReducedMotion ? 0 : 0.55 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/15 transition-all duration-500 group-hover:h-24 group-hover:w-24 group-hover:border-amber-300/40" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/45 bg-[#181006]/85 shadow-[0_0_24px_rgba(251,146,60,0.22)] backdrop-blur-md group-focus-visible:ring-2 group-focus-visible:ring-amber-200 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-black">
          <DoorOpen className="h-5 w-5 text-amber-200" />
        </span>
        <span className="camp-glass-panel absolute left-1/2 top-[calc(100%+0.75rem)] w-max -translate-x-1/2 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-amber-100/85">
          Surface Airlock
        </span>
      </motion.button>

      {computerActive && (
        <div className="absolute bottom-4 right-4 z-50 sm:bottom-5 sm:right-6">
          <motion.button
            type="button"
            aria-label="Stand up from the mission computer"
            onClick={onLeaveComputer}
            className="camp-glass-panel flex min-h-12 items-center gap-2 border-amber-200/35 bg-[#160e05]/90 px-4 py-3 font-heading text-sm tracking-[0.12em] text-amber-50 shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_20px_rgba(245,158,11,0.12)] transition-colors hover:border-amber-200/65 hover:bg-amber-300/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.55, duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Armchair className="h-4 w-4 text-amber-300" />
            Stand Up
          </motion.button>
        </div>
      )}

      <motion.footer
        className={`absolute inset-x-3 bottom-3 z-30 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-5 ${computerActive ? 'pointer-events-none' : ''}`}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: computerActive ? 0 : 1, y: computerActive ? 18 : 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.7, duration: prefersReducedMotion ? 0 : 0.55 }}
      >
        <div className="camp-glass-panel hidden max-w-md px-4 py-3 md:block">
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.18em] text-white/40">{family.label} · {planet.description}</p>
          <p className="text-sm leading-relaxed text-white/80">{planet.description}</p>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="camp-glass-panel ml-auto flex min-h-12 items-center gap-3 px-4 py-3 text-sm text-white/80 transition-all hover:border-amber-300/50 hover:bg-amber-300/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 sm:px-5"
        >
          <DoorOpen className="h-5 w-5 text-amber-200" />
          <span className="font-heading tracking-[0.12em]">Exit Base Camp</span>
          <span className="hidden rounded border border-white/15 px-1.5 py-0.5 font-mono text-xs text-white/35 sm:inline">ESC</span>
        </button>
      </motion.footer>
    </motion.section>
  );
};
