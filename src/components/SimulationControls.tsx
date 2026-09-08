import { Gauge, Pause, Play } from 'lucide-react';
import {
  getSimulationSpeedPreset,
  SIMULATION_SPEED_PRESETS,
  useSimulationState,
} from '@/hooks/useSimulationState';
import { cn } from '@/lib/utils';

export interface SimulationControlsProps {
  className?: string;
}

const formatFactor = (factor: number) => `${Math.round(factor).toLocaleString('en-US')}x`;

export const SimulationControls = ({ className }: SimulationControlsProps) => {
  const isPaused = useSimulationState((state) => state.isPaused);
  const speedPresetId = useSimulationState((state) => state.speedPresetId);
  const togglePaused = useSimulationState((state) => state.togglePaused);
  const setSpeedPreset = useSimulationState((state) => state.setSpeedPreset);
  const activePreset = getSimulationSpeedPreset(speedPresetId);

  return (
    <section
      aria-label="Simulation controls"
      className={cn('hud-panel rounded-lg border border-primary/25 p-3 text-foreground', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-heading text-xs tracking-mission text-primary">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          TIME CONTROL
        </div>
        <button
          type="button"
          onClick={togglePaused}
          aria-pressed={isPaused}
          className="inline-flex min-h-11 items-center gap-2 rounded border border-primary/40 bg-background/70 px-3 text-xs text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Simulation speed">
        {SIMULATION_SPEED_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={speedPresetId === preset.id}
            onClick={() => setSpeedPreset(preset.id)}
            className={cn(
              'min-h-11 rounded border px-2 py-2 font-heading text-[11px] tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              speedPresetId === preset.id
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-border/60 bg-background/55 text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground" data-testid="simulation-scale-description">
        {activePreset.description}
        <span className="mt-1 block font-mono text-[10px] text-primary/80">
          ORBIT {formatFactor(activePreset.orbitTimeFactor)} / SPIN {formatFactor(activePreset.rotationTimeFactor)}
        </span>
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {isPaused ? 'Simulation paused.' : `Simulation running at ${activePreset.label}.`}
      </p>
    </section>
  );
};
