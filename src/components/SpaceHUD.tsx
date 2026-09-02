import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { planets } from '@/data/planets';
import { Rocket, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useState } from 'react';
import { HudCorners } from '@/components/HudCorners';
import { getPlanetById } from '@/data/planets';

export const SpaceHUD = () => {
  const { currentView, selectedPlanet, travelToPlanet } = useGameState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null);

  if (currentView === 'intercepting') {
    const destination = selectedPlanet ? getPlanetById(selectedPlanet) : null;

    return (
      <div
        className="pointer-events-none fixed inset-0 z-10"
        data-testid="solar-intercept-status"
        aria-live="polite"
      >
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
              transition={{ duration: 3.1, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded border border-primary/25 bg-background/65 px-4 py-2 font-mono text-[10px] tracking-mission text-primary backdrop-blur-sm"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        >
          TRACKING LIVE ORBIT • VISUAL LOCK CONFIRMED
        </motion.div>
      </div>
    );
  }

  if (currentView !== 'space') return null;

  return (
    <>
      {/* Title overlay */}
      <motion.div
        className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 text-center z-10 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="font-heading text-2xl md:text-5xl tracking-mission text-primary text-glow">
          Mission Portfolio
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 tracking-wide text-sm md:text-base">
          Jake Sass — Select a Planet to Explore
        </p>
      </motion.div>

      {/* Desktop: Planet quick-select sidebar */}
      <motion.div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="hud-panel p-3 rounded-lg space-y-1 max-h-[70vh] overflow-y-auto">
          <p className="text-xs tracking-mission text-muted-foreground text-center mb-3">
            DESTINATIONS
          </p>

          {/* Sun/Intro */}
          <motion.button
            className={`relative w-full px-3 py-2 rounded text-left text-sm transition-colors flex items-center gap-2 ${
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
          </motion.button>

          <div className="h-px bg-border/30 my-2" />

          {planets.filter(p => p.id !== 'sun').map((planet) => (
            <motion.button
              key={planet.id}
              className={`relative w-full px-3 py-2 rounded text-left text-sm transition-colors flex items-center gap-2 ${
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
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mobile: Expandable menu */}
      <div className="fixed bottom-4 left-4 right-4 z-10 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className="hud-panel w-full px-4 py-3 rounded-lg flex items-center justify-between"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-primary" />
              <span className="font-heading text-sm tracking-mission">SELECT DESTINATION</span>
            </div>
            {mobileMenuOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="hud-panel mt-2 p-3 rounded-lg max-h-[50vh] overflow-y-auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="px-3 py-2 rounded text-left text-sm flex items-center gap-2 hover:bg-accent/20"
                    onClick={() => {
                      travelToPlanet('sun');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FDB813' }} />
                    <span className="text-xs">☀ Intro</span>
                  </button>
                  {planets.filter(p => p.id !== 'sun').map((planet) => (
                    <button
                      key={planet.id}
                      className="px-3 py-2 rounded text-left text-sm flex items-center gap-2 hover:bg-accent/20"
                      onClick={() => {
                        travelToPlanet(planet.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: planet.color }}
                      />
                      <span className="text-xs truncate">{planet.displayName}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Controls hint */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="hud-panel px-6 py-3 rounded-lg flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Rocket className="w-4 h-4" />
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
        </motion.div>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-line/10 to-transparent"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </>
  );
};
