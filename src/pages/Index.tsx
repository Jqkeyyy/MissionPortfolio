import { lazy, Suspense, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';

const SolarSystem = lazy(() => import('@/components/3d/SolarSystem').then((module) => ({ default: module.SolarSystem })));
const TravelSequence = lazy(() => import('@/components/TravelSequence').then((module) => ({ default: module.TravelSequence })));
const PlanetSurface = lazy(() => import('@/components/PlanetSurface').then((module) => ({ default: module.PlanetSurface })));
const SpaceHUD = lazy(() => import('@/components/SpaceHUD').then((module) => ({ default: module.SpaceHUD })));
const ShipFlightLayer = lazy(() => import('@/components/ShipFlightLayer').then((module) => ({ default: module.ShipFlightLayer })));
const QuickPortfolio = lazy(() => import('@/components/quick-portfolio').then((module) => ({ default: module.QuickPortfolio })));

type ExplorationMode = 'prompt' | 'active' | 'unavailable';

const supportsWebGL = () => {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
};

const StageFallback = ({ label }: { label: string }) => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-[#02070d] px-6 text-center text-white"
    aria-busy="true"
  >
    <div role="status" aria-live="polite">
      <span className="mx-auto block h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" />
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-cyan-100/70">{label}</p>
    </div>
  </div>
);

const PortfolioFallback = () => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#02070d] px-6 text-white" aria-busy="true">
    <p role="status" aria-live="polite" className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-100/70">
      Preparing Quick Portfolio...
    </p>
  </div>
);

const ExperiencePrompt = ({
  unavailable = false,
  onExplore,
  onOpenQuickPortfolio,
}: {
  unavailable?: boolean;
  onExplore: () => void;
  onOpenQuickPortfolio: () => void;
}) => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02070d] px-5 py-12 text-white">
    <div aria-hidden="true" className="stars-bg pointer-events-none absolute inset-0 opacity-35" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(249,115,22,0.1),transparent_42%)]" />
    <section aria-labelledby="experience-title" className="relative z-10 w-full max-w-3xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-300">Mission Portfolio</p>
      <h1 id="experience-title" className="mt-5 font-heading text-4xl tracking-[0.08em] sm:text-6xl">
        Choose your route
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
        Launch the interactive solar-system experience or open the complete recruiter-friendly portfolio directly.
      </p>
      {unavailable && (
        <div role="alert" className="mx-auto mt-6 max-w-xl rounded-lg border border-amber-300/25 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-100">
          Immersive exploration is unavailable on this device. Every project and contact option remains available in Quick Portfolio.
        </div>
      )}
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
        {!unavailable && (
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-orange-400 px-7 font-heading text-sm tracking-[0.12em] text-slate-950 transition-colors hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Launch exploration
          </button>
        )}
        <button
          type="button"
          onClick={onOpenQuickPortfolio}
          className="inline-flex min-h-12 items-center justify-center rounded-md border border-cyan-200/40 bg-cyan-200/[0.04] px-7 font-heading text-sm tracking-[0.12em] text-cyan-100 transition-colors hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        >
          View Quick Portfolio
        </button>
      </div>
    </section>
  </main>
);

const Index = () => {
  const {
    currentView,
    quickPortfolioOpen,
    openQuickPortfolio,
    closeQuickPortfolio,
  } = useGameState();
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>('prompt');

  const launchExploration = () => {
    setExplorationMode(supportsWebGL() ? 'active' : 'unavailable');
  };

  const spaceViewActive = explorationMode === 'active'
    && (currentView === 'space' || currentView === 'intercepting');

  return (
    <div className="w-screen h-screen overflow-hidden bg-background">
      {explorationMode === 'prompt' && currentView === 'space' && (
        <ExperiencePrompt onExplore={launchExploration} onOpenQuickPortfolio={openQuickPortfolio} />
      )}

      {explorationMode === 'unavailable' && currentView === 'space' && (
        <ExperiencePrompt unavailable onExplore={launchExploration} onOpenQuickPortfolio={openQuickPortfolio} />
      )}

      {/* Space view with 3D solar system */}
      {spaceViewActive && (
        <Suspense fallback={<StageFallback label="Initializing solar system..." />}>
          <SolarSystem onUnavailable={() => setExplorationMode('unavailable')} onOpenQuickPortfolio={openQuickPortfolio} />
          <SpaceHUD />
        </Suspense>
      )}

      {/* Travel transition */}
      {currentView === 'traveling' && (
        <Suspense fallback={<StageFallback label="Calculating flight path..." />}>
          <TravelSequence />
          <ShipFlightLayer />
        </Suspense>
      )}

      {/* Planet surface view */}
      {currentView === 'planet' && (
        <Suspense fallback={<StageFallback label="Preparing planet surface..." />}>
          <PlanetSurface />
        </Suspense>
      )}

      {quickPortfolioOpen && (
        <Suspense fallback={<PortfolioFallback />}>
          <QuickPortfolio onClose={closeQuickPortfolio} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
