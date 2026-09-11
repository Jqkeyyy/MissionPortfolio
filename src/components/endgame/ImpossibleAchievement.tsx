import { Check, Circle, RotateCcw, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  IMPOSSIBLE_MILESTONES,
  isImpossibleAchievementComplete,
  useImpossibleAchievement,
} from '@/features/endgame/impossibleAchievement';

interface ImpossibleAchievementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImpossibleAchievement = ({ open, onOpenChange }: ImpossibleAchievementProps) => {
  const completed = useImpossibleAchievement((state) => state.completed);
  const reset = useImpossibleAchievement((state) => state.reset);
  const unlocked = isImpossibleAchievementComplete(completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[2150] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border-amber-300/35 bg-[#090704]/98 text-white shadow-[0_0_80px_rgba(251,191,36,0.16)]">
        <DialogHeader className="pr-8 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">Classified challenge // Warranty void</p>
          <DialogTitle className="font-heading text-2xl sm:text-3xl">The Impossible Achievement</DialogTitle>
          <DialogDescription className="text-white/55">
            Complete five experiments in one browser timeline. Progress is stored only on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <Trophy aria-hidden="true" className={`h-8 w-8 ${unlocked ? 'text-amber-300' : 'text-white/25'}`} />
            <div>
              <p className="font-heading text-lg">{unlocked ? 'REALITY WARRANTY VOIDED' : `${completed.length} / ${IMPOSSIBLE_MILESTONES.length} anomalies verified`}</p>
              <p className="text-xs text-white/45">{unlocked ? 'You made the impossible repeatable.' : 'The clues describe what the system expects.'}</p>
            </div>
          </div>
        </div>

        <ol className="mt-4 space-y-2" aria-label="Impossible achievement milestones">
          {IMPOSSIBLE_MILESTONES.map((milestone, index) => {
            const done = completed.includes(milestone.id);
            return (
              <li key={milestone.id} className="flex gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                {done
                  ? <Check aria-label="Complete" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  : <Circle aria-label="Incomplete" className="mt-0.5 h-5 w-5 shrink-0 text-white/20" />}
                <div>
                  <p className="font-heading text-sm tracking-wide">{String(index + 1).padStart(2, '0')} // {milestone.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{milestone.clue}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {completed.length > 0 && (
          <Button type="button" variant="ghost" onClick={reset} className="mt-4 min-h-11 gap-2 text-white/45 hover:bg-white/10 hover:text-white">
            <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset challenge
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
