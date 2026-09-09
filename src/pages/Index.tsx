import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { ExplorationRecoveryBoundary } from '@/components/ExplorationRecoveryBoundary';
import { useInteractiveTutorial } from '@/hooks/useInteractiveTutorial';
import { InteractiveTutorial } from '@/components/tutorial';
import { ExplorationProgressTracker } from '@/components/progress';
import { MissionAudioController } from '@/audio/MissionAudioController';
import { telemetryClient } from '@/observability/telemetryClient';
import { useExplorationProgress } from '@/hooks/useExplorationProgress';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPlanetById } from '@/data/planets';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { SITE_URL } from '@/config/site';

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
  onStartTutorial,
  onOpenQuickPortfolio,
}: {
  unavailable?: boolean;
  onExplore: () => void;
  onStartTutorial?: () => void;
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
          <>
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-orange-400 px-7 font-heading text-sm tracking-[0.12em] text-slate-950 transition-colors hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Launch exploration
            </button>
            {onStartTutorial && (
              <button
                type="button"
                onClick={onStartTutorial}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-orange-300/50 bg-orange-300/[0.06] px-7 font-heading text-sm tracking-[0.12em] text-orange-100 transition-colors hover:bg-orange-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
              >
                Start tutorial
              </button>
            )}
          </>
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
    selectedPlanet,
    quickPortfolioOpen,
    openQuickPortfolio,
    closeQuickPortfolio,
    resetExploration,
    arriveAtPlanet,
    announce,
  } = useGameState();
  const { planetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>(planetId ? 'active' : 'prompt');
  const progress = useExplorationProgress();
  const previousView = useRef(currentView);
  const previousPlanet = useRef(selectedPlanet);
  const previousPortfolioOpen = useRef(quickPortfolioOpen);
  const completionReported = useRef(progress.isComplete);
  const previousLocationPath = useRef(location.pathname);
  const initialRouteHydration = useRef(true);
  const linkedPlanet = planetId ? getPlanetById(planetId) : undefined;
  const destinationStructuredData = useMemo(() => linkedPlanet ? ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${linkedPlanet.displayName} Mission — Jake Sass`,
    description: `The ${linkedPlanet.description} destination in Jake Sass's Mission Portfolio.`,
    url: `${SITE_URL}/explore/${linkedPlanet.id}`,
  }) : undefined, [linkedPlanet]);

  useDocumentMetadata({
    title: linkedPlanet ? `${linkedPlanet.displayName} Mission — Jake Sass` : 'Mission Portfolio — Jake Sass',
    description: linkedPlanet
      ? `Explore ${linkedPlanet.displayName}, the ${linkedPlanet.description.toLowerCase()} destination in Jake Sass's Mission Portfolio.`
      : "Explore Jake Sass's interactive portfolio: a navigable solar system featuring full-stack projects, data and machine-learning work, experience, and contact details.",
    path: linkedPlanet ? `/explore/${linkedPlanet.id}` : '/',
    structuredData: destinationStructuredData,
  });

  const tutorial = useInteractiveTutorial({
    currentView,
    currentPlanetId: selectedPlanet,
    onAnnounce: announce,
    onStart: () => telemetryClient.track({ type: 'tour_start' }),
    onComplete: () => telemetryClient.track({ type: 'tour_complete' }),
    onExit: () => telemetryClient.track({ type: 'tour_skip' }),
  });

  useEffect(() => {
    if (!planetId) {
      resetExploration();
      return;
    }
    if (!getPlanetById(planetId)) return;
    if (!supportsWebGL()) {
      setExplorationMode('unavailable');
      return;
    }
    setExplorationMode('active');
    arriveAtPlanet(planetId);
  }, [arriveAtPlanet, planetId, resetExploration]);

  useEffect(() => {
    if (initialRouteHydration.current) {
      initialRouteHydration.current = false;
      return;
    }
    if (tutorial.status !== 'idle') {
      previousLocationPath.current = location.pathname;
      return;
    }
    const cameBackToMissionMap = location.pathname === '/'
      && previousLocationPath.current.startsWith('/explore/');
    if (cameBackToMissionMap && currentView !== 'space') {
      resetExploration();
      previousLocationPath.current = location.pathname;
      return;
    }
    if (currentView === 'planet' && selectedPlanet) {
      const destinationPath = `/explore/${selectedPlanet}`;
      if (location.pathname !== destinationPath) navigate(destinationPath);
      previousLocationPath.current = location.pathname;
      return;
    }
    if (currentView === 'space' && location.pathname.startsWith('/explore/')) {
      navigate('/', { replace: true });
    }
    previousLocationPath.current = location.pathname;
  }, [currentView, location.pathname, navigate, resetExploration, selectedPlanet, tutorial.status]);

  const launchExploration = () => {
    telemetryClient.track({ type: 'route_choice', route: 'immersive' });
    if (supportsWebGL()) {
      telemetryClient.track({ type: 'immersive_launch' });
      setExplorationMode('active');
    } else {
      telemetryClient.track({ type: 'webgl_unavailable', reason: 'unsupported' });
      setExplorationMode('unavailable');
    }
  };

  const openQuickPortfolioRoute = () => {
    telemetryClient.track({ type: 'route_choice', route: 'quick-portfolio' });
    openQuickPortfolio();
  };

  const startTutorial = () => {
    if (!supportsWebGL()) {
      telemetryClient.track({ type: 'webgl_unavailable', reason: 'unsupported' });
      setExplorationMode('unavailable');
      return;
    }
    telemetryClient.track({ type: 'route_choice', route: 'immersive' });
    telemetryClient.track({ type: 'immersive_launch' });
    setExplorationMode('active');
    tutorial.start();
  };

  useEffect(() => {
    if (selectedPlanet && selectedPlanet !== previousPlanet.current) {
      telemetryClient.track({ type: 'destination_selected', destination: selectedPlanet });
    }
    if (
      currentView === 'planet'
      && (previousView.current !== 'planet' || previousPlanet.current !== selectedPlanet)
      && selectedPlanet
    ) {
      telemetryClient.track({ type: 'destination_arrived', destination: selectedPlanet });
    }
    if (quickPortfolioOpen && !previousPortfolioOpen.current) {
      telemetryClient.track({ type: 'quick_portfolio_open' });
    }
    previousView.current = currentView;
    previousPlanet.current = selectedPlanet;
    previousPortfolioOpen.current = quickPortfolioOpen;
  }, [currentView, quickPortfolioOpen, selectedPlanet]);

  useEffect(() => {
    if (progress.isComplete && !completionReported.current) {
      telemetryClient.track({ type: 'exploration_complete' });
    }
    completionReported.current = progress.isComplete;
  }, [progress.isComplete]);

  const spaceViewActive = explorationMode === 'active'
    && (currentView === 'space' || currentView === 'intercepting');

  return (
    <div className="w-screen h-screen overflow-hidden bg-background">
      <ExplorationProgressTracker />
      <MissionAudioController />
      {explorationMode === 'prompt' && currentView === 'space' && (
        <ExperiencePrompt onExplore={launchExploration} onStartTutorial={startTutorial} onOpenQuickPortfolio={openQuickPortfolioRoute} />
      )}

      {explorationMode === 'unavailable' && currentView === 'space' && (
        <ExperiencePrompt unavailable onExplore={launchExploration} onOpenQuickPortfolio={openQuickPortfolio} />
      )}

      <ExplorationRecoveryBoundary
        resetKey={`${explorationMode}:${currentView}`}
        onReset={() => {
          resetExploration();
          setExplorationMode('prompt');
        }}
        onOpenQuickPortfolio={openQuickPortfolio}
      >
        {/* Space view with 3D solar system */}
        {spaceViewActive && (
          <Suspense fallback={<StageFallback label="Initializing solar system..." />}>
            <SolarSystem
              onUnavailable={() => {
                telemetryClient.track({ type: 'webgl_unavailable', reason: 'context-lost' });
                setExplorationMode('unavailable');
              }}
              onOpenQuickPortfolio={openQuickPortfolio}
            />
            <SpaceHUD onStartTutorial={tutorial.start} />
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
      </ExplorationRecoveryBoundary>

      <InteractiveTutorial controller={tutorial} />

      {quickPortfolioOpen && (
        <Suspense fallback={<PortfolioFallback />}>
          <QuickPortfolio onClose={closeQuickPortfolio} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
