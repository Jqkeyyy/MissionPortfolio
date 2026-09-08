import { useEffect, useMemo, useRef } from 'react';
import { Pause, Play, SkipForward, X } from 'lucide-react';
import { recruiterTour } from '@/data/recruiterTour';
import { getPlanetById } from '@/data/planets';
import type { RecruiterTourController } from '@/hooks/useRecruiterTour';

interface GuidedRecruiterTourProps {
  controller: RecruiterTourController;
  onOpenQuickPortfolio: () => void;
  onExploreFreely: () => void;
}

export const GuidedRecruiterTour = ({
  controller,
  onOpenQuickPortfolio,
  onExploreFreely,
}: GuidedRecruiterTourProps) => {
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const stop = recruiterTour[controller.currentStepIndex];
  const planet = getPlanetById(stop.planetId);
  const featuredContent = useMemo(
    () => planet?.content.find(({ id }) => id === stop.contentId),
    [planet, stop.contentId],
  );

  useEffect(() => {
    if (controller.status !== 'idle') {
      primaryActionRef.current?.focus();
    }
  }, [controller.status]);

  useEffect(() => {
    if (controller.status === 'idle') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        controller.exit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controller]);

  if (controller.status === 'idle') return null;

  const isComplete = controller.status === 'complete';
  const isPaused = controller.status === 'paused';
  const stepLabel = `Step ${controller.currentStepIndex + 1} of ${recruiterTour.length}`;

  return (
    <aside
      aria-label="Guided recruiter tour"
      className="fixed bottom-4 left-1/2 z-40 w-[min(94vw,28rem)] -translate-x-1/2 rounded-lg border border-cyan-400/40 bg-slate-950/95 p-4 text-slate-100 shadow-2xl backdrop-blur transition-opacity motion-reduce:transition-none sm:bottom-6"
      data-testid="guided-recruiter-tour"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{stepLabel}</p>
      <h2 className="mt-1 text-lg font-semibold text-white">
        {isComplete ? 'Mission tour complete' : planet?.displayName}
      </h2>
      {!isComplete && (
        <p className="mt-1 text-sm text-slate-300">
          {featuredContent?.title ?? planet?.description}
        </p>
      )}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {controller.announcement}
      </p>

      {isComplete ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            ref={primaryActionRef}
            type="button"
            onClick={onOpenQuickPortfolio}
            className="rounded border border-orange-400 bg-orange-400/15 px-3 py-2 text-sm font-semibold text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            Open Quick Portfolio
          </button>
          <button
            type="button"
            onClick={onExploreFreely}
            className="rounded border border-cyan-400/60 px-3 py-2 text-sm font-semibold text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Explore freely
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            ref={primaryActionRef}
            type="button"
            onClick={isPaused ? controller.resume : controller.pause}
            aria-label={isPaused ? 'Resume guided tour' : 'Pause guided tour'}
            className="inline-flex items-center gap-2 rounded border border-orange-400 bg-orange-400/15 px-3 py-2 text-sm font-semibold text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            {isPaused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={controller.nextStop}
            aria-label="Go to next tour stop"
            className="inline-flex items-center gap-2 rounded border border-cyan-400/60 px-3 py-2 text-sm font-semibold text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <SkipForward aria-hidden="true" size={16} />
            Next stop
          </button>
          <button
            type="button"
            onClick={controller.exit}
            aria-label="Exit guided tour"
            className="ml-auto inline-flex items-center gap-2 rounded px-3 py-2 text-sm text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <X aria-hidden="true" size={16} />
            Exit
          </button>
        </div>
      )}
    </aside>
  );
};
