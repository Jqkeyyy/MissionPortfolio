import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { getPlanetById } from "./data/planets";
import { MissionCommandPaletteLauncher } from "./components/MissionCommandPaletteLauncher";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const TelemetryDashboardPage = lazy(() => import("./pages/TelemetryDashboardPage"));

const ExploreRoute = () => {
  const { planetId = '' } = useParams();
  return getPlanetById(planetId) ? <Index /> : <NotFound />;
};

const RouteFallback = () => (
  <main
    className="flex min-h-screen items-center justify-center bg-[#02070d] px-6 text-center text-white"
    aria-busy="true"
  >
    <div role="status" aria-live="polite">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200/70">
        Mission Portfolio
      </p>
      <p className="mt-3 font-heading text-lg tracking-[0.12em] text-white/85">
        Loading navigation...
      </p>
    </div>
  </main>
);

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route path="/explore/:planetId" element={<ExploreRoute />} />
        <Route path="/mission-analytics" element={<TelemetryDashboardPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <MissionCommandPaletteLauncher />
  </BrowserRouter>
);

export default App;
