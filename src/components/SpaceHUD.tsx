import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { planets } from '@/data/planets';
import { Rocket, ChevronDown, ChevronUp, FileUser, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HudCorners } from '@/components/HudCorners';
import { getPlanetById } from '@/data/planets';
import {
  getSimulationSpeedPreset,
  useSimulationState,
} from '@/hooks/useSimulationState';
import { SimulationControls } from '@/components/SimulationControls';
import { PlanetScienceConsole } from '@/components/PlanetScienceConsole';
import { ExplorationProgress } from '@/components/progress';
import { useExplorationProgress } from '@/hooks/useExplorationProgress';
import { MissionSoundControl } from '@/components/MissionSoundControl';

const EARTH_YEAR_SECONDS = 365.25 * 24 * 60 * 60;
const EARTH_DAY_SECONDS = 24 * 60 * 60;

const formatVisualDuration = (seconds: number) => {
  if (seconds >= EARTH_YEAR_SECONDS * 0.999) return '1 EARTH YEAR';
  if (seconds >= EARTH_DAY_SECONDS) return `${(seconds / EARTH_DAY_SECONDS).toLocaleString('en-US', { maximumFractionDigits: 2 })}D`;
  if (seconds >= 60 * 60) return `${(seconds / (60 * 60)).toLocaleString('en-US', { maximumFractionDigits: 1 })}H`;
  if (seconds > 120) return `${(seconds / 60).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  return `${seconds.toLocaleString('en-US', { maximumFractionDigits: 1 })}S`;
};

interface SpaceHUDProps {
  onStartTour?: () => void;
}

export const SpaceHUD = ({ onStartTour }: SpaceHUDProps) => {
  const {
    announcement,
    currentView,
    selectedPlanet,
    travelToPlanet,
    openQuickPortfolio,
    skipTravel,
  } = useGameState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const speedPresetId = useSimulationState((state) => state.speedPresetId);
  const isPaused = useSimulationState((state) => state.isPaused);
  const activePreset = getSimulationSpeedPreset(speedPresetId);
  const progress = useExplorationProgress();
  const orbitScale = formatVisualDuration(EARTH_YEAR_SECONDS / activePreset.orbitTimeFactor);
  const spinScale = formatVisualDuration(EARTH_DAY_SECONDS / activePreset.rotationTimeFactor);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const interceptSkipRef = useRef<HTMLButtonElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileDestinationRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (currentView === 'space') headingRef.current?.focus();
    if (currentView === 'intercepting') interceptSkipRef.current?.focus();
  }, [currentView]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    firstMobileDestinationRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      mobileMenuToggleRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  if (currentView === 'intercepting') {
    const destination = selectedPlanet ? getPlanetById(selectedPlanet) : null;

    return (
      <div
        className="pointer-events-none fixed inset-0 z-10"
        data-testid="solar-intercept-status"
      >
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <motion.div
          className="absolute left-1/2 top-6 w-[min(88vw,430px)] -translate-x-1/2 rounded-md border border-primary/35 bg-background/75 px-5 py-3 text-center shadow-[0_0_30px_hsl(var(--primary)/0.14)] backdrop-blur-sm md:top-8"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] tracking-mission text-primary">AUTOPILOT INTERCEPT</p>
          <p className="mt-1 font-heading text-lg tracking-wide text-foreground md:text-xl">
            SHUTTLE EN ROUTE TO {destination?.displayName.toUpperCase() ?? 'DESTINATION'}
          </p>
          <div className="mt-2 h-px overflow-hidden bg-border/70">
            <motion.div
              className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: reducedMotion ? 0.1 : 3.1, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded border border-primary/25 bg-background/65 px-4 py-2 font-mono text-[10px] tracking-mission text-primary backdrop-blur-sm"
          animate={reducedMotion ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.1, repeat: reducedMotion ? 0 : Infinity }}
        >
          TRACKING LIVE ORBIT • VISUAL LOCK CONFIRMED
        </motion.div>
        <button
          ref={interceptSkipRef}
          type="button"
          onClick={skipTravel}
          className="pointer-events-auto absolute bottom-20 left-1/2 min-h-11 -translate-x-1/2 rounded border border-primary/45 bg-background/85 px-5 py-3 font-heading text-sm tracking-mission text-primary shadow-lg backdrop-blur-sm hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Skip travel
        </button>
      </div>
    );
  }

  if (currentView !== 'space') return null;

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {/* Title overlay */}
      <motion.div
        className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 text-center z-10 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl md:text-5xl tracking-mission text-primary text-glow focus:outline-none"
        >
          Mission Portfolio
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 tracking-wide text-sm md:text-base">
          Jake Sass — Select a Planet to Explore
        </p>
      </motion.div>

      {/* Desktop: Planet quick-select sidebar */}
      <motion.div
        className="fixed right-4 top-1/2 z-10 hidden md:block"
        initial={{ opacity: 0, x: 20, y: '-50%' }}
        animate={{ opacity: 1, x: 0, y: '-50%' }}
        transition={{ delay: 0.7 }}
      >
        <nav
          aria-label="Solar system destinations"
          className="hud-panel p-3 rounded-lg space-y-1 max-h-[70vh] overflow-y-auto"
        >
          <button
            type="button"
            data-testid="desktop-quick-portfolio"
            onClick={openQuickPortfolio}
            className="mb-3 flex min-h-11 w-full items-center justify-center gap-2 rounded border border-primary/35 bg-primary/10 px-3 font-heading text-xs tracking-wide text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <FileUser className="h-4 w-4" aria-hidden="true" />
            Quick Portfolio
          </button>
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="mb-3 flex min-h-11 w-full items-center justify-center rounded border border-orange-300/35 bg-orange-300/[0.06] px-3 font-heading text-xs tracking-wide text-orange-100 transition-colors hover:bg-orange-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
            >
              Take guided tour
            </button>
          )}
          <MissionSoundControl className="mb-3 w-full" />
          <p className="text-xs tracking-mission text-muted-foreground text-center mb-3">
            DESTINATIONS
          </p>

          {/* Sun/Intro */}
          <div className="flex items-center gap-1">
            <motion.button
              className={`relative flex min-h-11 flex-1 items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors ${
                selectedPlanet === 'sun'
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-accent/20 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => travelToPlanet('sun')}
              onMouseEnter={() => setHoveredDestination('sun')}
              onMouseLeave={() => setHoveredDestination(null)}
              onFocus={() => setHoveredDestination('sun')}
              onBlur={() => setHoveredDestination(null)}
              whileHover={{ x: -3 }}
            >
              <HudCorners active={hoveredDestination === 'sun'} size="sm" />
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#FDB813' }}
              />
              <span className="font-heading tracking-wide text-xs">☀ Intro</span>
              <span className="sr-only">{progress.hasVisited('sun') ? 'Visited' : 'Not visited'}</span>
            </motion.button>
            <PlanetScienceConsole planetId="sun" />
          </div>

          <div className="h-px bg-border/30 my-2" />

          {planets.filter(p => p.id !== 'sun').map((planet) => (
            <div key={planet.id} className="flex items-center gap-1">
              <motion.button
                className={`relative flex min-h-11 flex-1 items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors ${
                  selectedPlanet === planet.id
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-accent/20 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => travelToPlanet(planet.id)}
                onMouseEnter={() => setHoveredDestination(planet.id)}
                onMouseLeave={() => setHoveredDestination(null)}
                onFocus={() => setHoveredDestination(planet.id)}
                onBlur={() => setHoveredDestination(null)}
                whileHover={{ x: -3 }}
              >
                <HudCorners active={hoveredDestination === planet.id} size="sm" />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color }}
                />
                <span className="font-heading tracking-wide text-xs">
                  {planet.displayName}
                </span>
                <span className="sr-only">{progress.hasVisited(planet.id) ? 'Visited' : 'Not visited'}</span>
              </motion.button>
              <PlanetScienceConsole planetId={planet.id} />
            </div>
          ))}
        </nav>
      </motion.div>

      {/* Mobile: Expandable menu */}
      <div className="fixed bottom-4 left-4 right-4 z-10 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="hud-panel mb-2 flex min-h-12 w-full items-center justify-center rounded-lg border-orange-300/40 bg-orange-300/[0.06] px-4 font-heading text-sm tracking-mission text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
            >
              Take guided tour
            </button>
          )}
          <MissionSoundControl className="hud-panel mb-2 w-full" />
          <button
            type="button"
            data-testid="mobile-quick-portfolio"
            onClick={openQuickPortfolio}
            className="hud-panel mb-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-primary/40 bg-primary/10 px-4 font-heading text-sm tracking-mission text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <FileUser className="h-4 w-4" aria-hidden="true" />
            Quick Portfolio
          </button>
          <button
            ref={mobileMenuToggleRef}
            type="button"
            aria-label="Select destination"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-destination-menu"
            className="hud-panel w-full px-4 py-3 rounded-lg flex items-center justify-between"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="font-heading text-sm tracking-mission">SELECT DESTINATION</span>
            </div>
            {mobileMenuOpen ? (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                id="mobile-destination-menu"
                aria-label="Mobile solar system destinations"
                className="hud-panel mt-2 p-3 rounded-lg max-h-[50vh] overflow-y-auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <SimulationControls className="mb-3" />
                <div className="mb-3 rounded border border-primary/20 bg-background/55 p-3">
                  <ExplorationProgress showDestinationStatus={false} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      ref={firstMobileDestinationRef}
                      className="flex min-h-11 flex-1 items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-accent/20"
                      onClick={() => {
                        travelToPlanet('sun');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FDB813' }} />
                      <span className="text-xs">☀ Intro</span>
                      <span className="sr-only">{progress.hasVisited('sun') ? 'Visited' : 'Not visited'}</span>
                    </button>
                    <PlanetScienceConsole planetId="sun" />
                  </div>
                  {planets.filter(p => p.id !== 'sun').map((planet) => (
                    <div key={planet.id} className="flex min-w-0 items-center gap-1">
                      <button
                        className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-accent/20"
                        onClick={() => {
                          travelToPlanet(planet.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: planet.color }}
                        />
                        <span className="truncate text-xs">{planet.displayName}</span>
                        <span className="sr-only">{progress.hasVisited(planet.id) ? 'Visited' : 'Not visited'}</span>
                      </button>
                      <PlanetScienceConsole planetId={planet.id} />
                    </div>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
        className="fixed bottom-24 left-4 z-10 hidden w-[min(280px,calc(100vw-2rem))] md:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SimulationControls />
        <div className="hud-panel mt-2 rounded-lg border border-primary/25 p-3">
          <ExplorationProgress showDestinationStatus={false} />
        </div>
      </motion.div>

      {/* Desktop: Controls hint */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="hud-panel px-6 py-3 rounded-lg flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Rocket className="w-4 h-4" aria-hidden="true" />
            <span>Click a planet or select from the list • Drag to orbit • Scroll to zoom</span>
          </div>
        </div>
      </motion.div>

      {/* Corner HUD decorations */}
      <div className="fixed top-4 left-4 z-10 hidden md:block">
        <motion.div
          className="text-xs font-mono text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p>SOLAR_SYS: ACTIVE</p>
          <p>NAV_MODE: ORBIT</p>
          <p>ZOOM: SYSTEM VIEW</p>
          <p title={activePreset.description}>
            ORBIT_SCALE: 1Y / {orbitScale}
          </p>
          <p title={activePreset.description}>
            SPIN_SCALE: 1D / {spinScale}
          </p>
          <p>TIME_STATE: {isPaused ? 'PAUSED' : activePreset.label.toUpperCase()}</p>
        </motion.div>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-line/10 to-transparent"
          animate={reducedMotion ? { top: '50%' } : { top: ['0%', '100%'] }}
          transition={{
            duration: 10,
            repeat: reducedMotion ? 0 : Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </>
  );
};
