import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { getPlanetById } from '@/data/planets';
import {
  formatTelemetryReading,
  getHabitatFamily,
  getPlanetTheme,
  getTelemetryReading,
} from '@/data/planetThemes';
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PlanetTerrain } from './planet/PlanetTerrain';
import { BaseCamp } from './planet/BaseCamp';
import { LandingPad } from './planet/LandingPad';
import { PlanetLandingShip } from './planet/PlanetLandingShip';
import { BaseCampInterior } from './planet/BaseCampInterior';
import {
  getPlanetThemeCssVariables,
  getPlanetThemeDataAttributes,
} from './planet/theme/themeStyles';

export const PlanetSurface = () => {
  const prefersReducedMotion = useReducedMotion();
  const {
    announcement,
    announce,
    selectedPlanet,
    returnToSpace,
    goToNextPlanet,
    goToPreviousPlanet,
  } = useGameState();
  const planet = selectedPlanet ? getPlanetById(selectedPlanet) : null;
  const [isInsideBaseCamp, setIsInsideBaseCamp] = useState(false);
  const [showComputerScreen, setShowComputerScreen] = useState(false);
  const [computerBootStartedAt, setComputerBootStartedAt] = useState<number | null>(null);
  const landingTargetRef = useRef<HTMLSpanElement>(null);
  const surfaceContentRef = useRef<HTMLDivElement>(null);
  const surfaceHeadingRef = useRef<HTMLHeadingElement>(null);
  const baseCampTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    surfaceHeadingRef.current?.focus();
  }, [planet?.id]);

  useEffect(() => {
    if (!surfaceContentRef.current) return;
    surfaceContentRef.current.inert = isInsideBaseCamp;

    if (isInsideBaseCamp) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>(
          '[aria-label="Sit down at the mission computer"]',
        )?.focus();
      });
    }
  }, [isInsideBaseCamp]);

  if (!planet) return null;

  const theme = getPlanetTheme(planet.id)!;
  const family = getHabitatFamily(theme.family);
  const surfaceTemperature = getTelemetryReading(theme, 'surface-temperature');
  const atmosphere = getTelemetryReading(theme, 'atmosphere');
  const oxygenReserve = getTelemetryReading(theme, 'oxygen-reserve');
  const commsLink = getTelemetryReading(theme, 'comms-link');

  const handleEnterBaseCamp = () => {
    baseCampTriggerRef.current = document.activeElement as HTMLElement | null;
    setComputerBootStartedAt(Date.now());
    setIsInsideBaseCamp(true);
    announce(`Entered the ${planet.displayName} base camp.`);
  };

  const handleExitBaseCamp = () => {
    setIsInsideBaseCamp(false);
    setShowComputerScreen(false);
    setComputerBootStartedAt(null);
    announce(`Exited the ${planet.displayName} base camp. Planet surface ready.`);
    requestAnimationFrame(() => baseCampTriggerRef.current?.focus());
  };

  const handleAccessComputer = () => {
    setShowComputerScreen(true);
    announce('Mission computer active. HAB OS ready.');
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(
        '[aria-label="Stand up from the mission computer"]',
      )?.focus();
    });
  };

  const handleCloseComputer = () => {
    setShowComputerScreen(false);
    announce('Mission computer closed. Base camp interior ready.');
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(
        '[aria-label="Sit down at the mission computer"]',
      )?.focus();
    });
  };

  return (
    <motion.div
      className="planet-theme-scope fixed inset-0 overflow-hidden"
      {...getPlanetThemeDataAttributes(theme)}
      data-ambient-animation={theme.ambient.animation}
      style={getPlanetThemeCssVariables(theme)}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
    >
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <div
        ref={surfaceContentRef}
        aria-hidden={isInsideBaseCamp || undefined}
      >
      <h1
        ref={surfaceHeadingRef}
        id="planet-surface-heading"
        tabIndex={-1}
        className="sr-only"
      >
        {planet.displayName} planet surface
      </h1>
      {/* Theme-driven atmosphere; terrain remains a separate, deferred layer. */}
      <div
        className="planet-surface-sky absolute inset-0"
        style={{
          background: `radial-gradient(circle at 72% 18%, ${theme.window.tint}38 0%, transparent 34%), linear-gradient(180deg, hsl(222 60% 4%) 0%, ${theme.palette.interior} 38%, ${theme.palette.panel} 100%)`,
        }}
      />

      {/* Stars in sky */}
      <div className="absolute inset-0 stars-bg opacity-40" />
      <div
        aria-hidden="true"
        className="planet-surface-ambience absolute inset-0"
        style={{ backgroundColor: theme.window.tint }}
      />

      {/* Planet-specific terrain with curve */}
      <PlanetTerrain planet={planet} />

      {/* Landing zone and responsive orbit-to-pad touchdown */}
      <LandingPad planet={planet} targetRef={landingTargetRef} />
      <PlanetLandingShip planet={planet} targetRef={landingTargetRef} />

      {/* Physical Base Camp - click to enter */}
      <BaseCamp planet={planet} onClick={handleEnterBaseCamp} />

      {/* Navigation HUD */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <motion.button
          type="button"
          aria-label="Travel to previous planet"
          className="hud-panel planet-hud-panel p-3 rounded-lg transition-colors"
          onClick={goToPreviousPlanet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.6 }}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </motion.button>

        <motion.button
          className="hud-panel planet-hud-panel px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          onClick={returnToSpace}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.7 }}
        >
          <Rocket className="w-4 h-4" aria-hidden="true" />
          <span className="font-heading text-sm tracking-mission">Return to Space</span>
        </motion.button>

        <motion.button
          type="button"
          aria-label="Travel to next planet"
          className="hud-panel planet-hud-panel p-3 rounded-lg transition-colors"
          onClick={goToNextPlanet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.6 }}
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </motion.button>
      </div>

      {/* HUD corners */}
      <div className="planet-surface-telemetry fixed top-4 left-4 z-30 font-mono text-xs">
        <p>LOCATION: {planet.displayName.toUpperCase()}</p>
        <p className="hidden sm:block">ATMOSPHERE: {String(atmosphere.value).toUpperCase()}</p>
        <p>SURFACE TEMP: {formatTelemetryReading(surfaceTemperature)}</p>
      </div>

      <div className="planet-surface-telemetry fixed top-4 right-4 z-30 text-right font-mono text-xs">
        <p>O₂ RESERVE: {formatTelemetryReading(oxygenReserve)}</p>
        <p className="hidden sm:block">COMMS: {String(commsLink.value).toUpperCase()}</p>
      </div>

      <div className="planet-identity-panel fixed left-1/2 top-4 z-30 hidden max-w-md -translate-x-1/2 text-center lg:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-65">{family.label} habitat</p>
        <p className="mt-1 text-xs leading-5 opacity-85">{theme.identityCue}</p>
      </div>
      </div>

      {/* Base Camp Interior overlay */}
      <AnimatePresence>
        {isInsideBaseCamp && (
          <BaseCampInterior
            planet={planet}
            onExit={handleExitBaseCamp}
            onAccessComputer={handleAccessComputer}
            onLeaveComputer={handleCloseComputer}
            computerActive={showComputerScreen}
            bootStartedAt={computerBootStartedAt}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
