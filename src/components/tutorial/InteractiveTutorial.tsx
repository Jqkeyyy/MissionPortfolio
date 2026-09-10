import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, X } from 'lucide-react';
import {
  interactiveTutorialSteps,
  type InteractiveTutorialController,
} from '@/hooks/useInteractiveTutorial';
import { getTutorialGeometry, type TutorialTargetRect } from './tutorialGeometry';

type TargetRect = TutorialTargetRect;

interface InteractiveTutorialProps {
  controller: InteractiveTutorialController;
}

const getTargetRect = (target: string | undefined): TargetRect | null => {
  if (!target) return null;
  const element = document.querySelector<HTMLElement>(`[data-tutorial-target="${target}"]`);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
};

export const InteractiveTutorial = ({ controller }: InteractiveTutorialProps) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const step = controller.currentStep;

  useEffect(() => {
    if (controller.status !== 'running') {
      setTargetRect(null);
      return;
    }

    const updateTarget = () => setTargetRect(getTargetRect(step.target));
    updateTarget();
    const interval = window.setInterval(updateTarget, 120);
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
    };
  }, [controller.status, step.target]);

  if (controller.status === 'idle') return null;

  if (controller.status === 'complete') {
    return (
      <aside
        aria-label="Interactive tutorial complete"
        className="fixed left-1/2 top-4 z-[1100] w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-emerald-300/45 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">Tutorial complete</p>
            <h2 className="mt-1 font-heading text-lg tracking-wide">You are ready to explore</h2>
            <p className="mt-1 text-sm leading-6 text-white/65">Open more files here, stand up, or travel to another planet.</p>
          </div>
          <button
            type="button"
            onClick={controller.exit}
            aria-label="Finish tutorial"
            className="ml-auto rounded-md p-2 text-white/55 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    );
  }

  const geometry = targetRect
    ? getTutorialGeometry(targetRect, window.innerWidth, window.innerHeight)
    : null;
  const targetStyle = geometry?.highlight satisfies CSSProperties | undefined;
  const arrowStyle = geometry ? ({ left: geometry.arrow.left, top: geometry.arrow.top } satisfies CSSProperties) : undefined;
  const usesThreeDimensionalHighlight = step.id === 'select-sun';

  return (
    <div className="pointer-events-none fixed inset-0 z-[1100]" data-testid="interactive-tutorial">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{controller.announcement}</p>

      {geometry && (
        <>
          {!usesThreeDimensionalHighlight && (
            <div
              aria-hidden="true"
              data-testid="tutorial-highlight"
              className="fixed rounded-xl border-2 border-orange-300 shadow-[0_0_0_4px_rgba(251,146,60,0.2),0_0_34px_rgba(251,146,60,0.7)] motion-safe:animate-pulse"
              style={targetStyle}
            />
          )}
          <div
            aria-hidden="true"
            data-testid="tutorial-arrow"
            className="fixed -translate-x-1/2 -translate-y-1/2 text-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.95)]"
            style={arrowStyle}
          >
            <span className="block motion-safe:animate-bounce">
              {geometry.arrow.below ? <ArrowUp className="h-10 w-10 stroke-[3]" /> : <ArrowDown className="h-10 w-10 stroke-[3]" />}
            </span>
          </div>
        </>
      )}

      <aside
        aria-label="Interactive portfolio tutorial"
        className="pointer-events-auto absolute left-1/2 top-4 w-[min(92vw,30rem)] -translate-x-1/2 rounded-xl border border-orange-300/45 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange-300">
              Tutorial · Step {controller.currentStepIndex + 1} of {interactiveTutorialSteps.length}
            </p>
            <h2 className="mt-1 font-heading text-lg tracking-wide">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-white/65">{step.instruction}</p>
            {step.target && !targetRect && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-200/65">Preparing the highlighted control…</p>
            )}
          </div>
          <button
            type="button"
            onClick={controller.exit}
            aria-label="Exit tutorial"
            className="shrink-0 rounded-md p-2 text-white/55 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </div>
  );
};
