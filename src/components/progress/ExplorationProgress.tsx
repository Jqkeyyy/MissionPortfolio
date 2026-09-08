import { useId } from 'react';
import { planets } from '@/data/planets';
import { useExplorationProgress } from '@/hooks/useExplorationProgress';
import type { ExplorationProgressStore } from '@/lib/explorationProgress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExplorationProgressProps {
  store?: ExplorationProgressStore;
  showDestinationStatus?: boolean;
  showClearAction?: boolean;
}

export const ExplorationProgress = ({
  store,
  showDestinationStatus = true,
  showClearAction = true,
}: ExplorationProgressProps) => {
  const progress = useExplorationProgress(store);
  const descriptionId = useId();

  return (
    <section aria-labelledby={`${descriptionId}-heading`} className="space-y-3 text-sm">
      <h2 id={`${descriptionId}-heading`} className="font-mono text-xs uppercase tracking-[0.18em]">
        Exploration progress
      </h2>
      <progress
        aria-describedby={descriptionId}
        aria-label="Solar system exploration progress"
        className="h-2 w-full accent-cyan-400"
        max={progress.totalDestinations}
        value={progress.visitedCount}
      />
      <p id={descriptionId} className="font-mono" aria-live="polite">
        {progress.visitedCount}/{progress.totalDestinations} destinations explored
      </p>
      <p className="text-xs opacity-70">Progress is saved only in this browser.</p>

      {progress.achievementVisible && (
        <div className="border border-cyan-300/60 bg-cyan-950/70 p-3" role="status" aria-live="polite">
          <p className="font-semibold">Mission complete: all destinations explored.</p>
          <button
            className="mt-2 underline underline-offset-4"
            onClick={progress.dismissCompletion}
            type="button"
          >
            Dismiss achievement
          </button>
        </div>
      )}

      {showDestinationStatus && (
        <details>
          <summary className="cursor-pointer">Destination status</summary>
          <ul className="mt-2 grid gap-1" aria-label="Destination visit status">
            {planets.map((planet) => {
              const visited = progress.hasVisited(planet.id);
              return (
                <li className="flex justify-between gap-4" key={planet.id}>
                  <span>{planet.displayName}</span>
                  <span>{visited ? 'Visited' : 'Not visited'}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {showClearAction && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-xs underline underline-offset-4" type="button">
              Clear exploration progress
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear exploration progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes every visited destination saved in this browser. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep progress</AlertDialogCancel>
              <AlertDialogAction onClick={progress.clearProgress}>Clear progress</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
};
