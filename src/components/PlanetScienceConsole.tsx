import { Info, Orbit, RotateCcw } from 'lucide-react';
import type { PlanetThemeId } from '@/data/planetThemes';
import { getPlanetById } from '@/data/planets';
import { getPlanetScience } from '@/data/planetScience';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSimulationState } from '@/hooks/useSimulationState';

export interface PlanetScienceConsoleProps {
  planetId: PlanetThemeId;
  triggerClassName?: string;
  triggerLabel?: string;
}

const formatDuration = (value: number, unit: 'hours' | 'days') => {
  if (value === 0) return 'Not applicable';
  const absolute = Math.abs(value);
  if (unit === 'hours' && absolute >= 48) return `${(absolute / 24).toLocaleString('en-US', { maximumFractionDigits: 2 })} Earth days`;
  if (unit === 'days' && absolute >= 730) return `${(absolute / 365.25).toLocaleString('en-US', { maximumFractionDigits: 1 })} Earth years`;
  return `${absolute.toLocaleString('en-US', { maximumFractionDigits: 3 })} ${unit}`;
};

const formatRotationPeriod = (hours: number) => (
  `${formatDuration(hours, 'hours')}${hours < 0 ? ' (retrograde)' : ''}`
);

export const PlanetScienceConsole = ({
  planetId,
  triggerClassName,
  triggerLabel,
}: PlanetScienceConsoleProps) => {
  const planet = getPlanetById(planetId);
  const science = getPlanetScience(planetId);
  const tiltGuidePlanetId = useSimulationState((state) => state.tiltGuidePlanetId);
  const toggleTiltGuide = useSimulationState((state) => state.toggleTiltGuide);
  if (!planet || !science) return null;

  const orbitCenter = planet.orbitParentId
    ? getPlanetById(planet.orbitParentId)?.displayName ?? planet.orbitParentId
    : planet.id === 'sun' ? 'Not applicable' : 'The Sun';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('min-h-11 min-w-11 text-primary', triggerClassName)}
          aria-label={triggerLabel ?? `Open science data for ${planet.displayName}`}
        >
          <Info aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border-primary/35 bg-background/95 p-4 shadow-[0_0_45px_hsl(var(--primary)/0.18)] sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <p className="font-mono text-[10px] tracking-mission text-primary">SCIENCE CONSOLE</p>
          <DialogTitle className="font-heading text-2xl text-foreground">{planet.displayName}</DialogTitle>
          <DialogDescription>
            {science.bodyType}. Values are proportional astronomical parameters; displayed sizes and distances remain compressed for exploration.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <ScienceField label="Day / rotation" value={formatRotationPeriod(planet.rotationPeriodHours)} />
          <ScienceField label="Year / orbit" value={formatDuration(planet.orbitalPeriodDays, 'days')} />
          <ScienceField label="Axial tilt" value={`${planet.axialTiltDeg} degrees`} />
          <ScienceField label="Orbit inclination" value={`${planet.orbitInclinationDeg} degrees`} />
          <ScienceField label="Orbital eccentricity" value={planet.orbitalEccentricity.toFixed(4)} />
          <ScienceField label="Orbits" value={orbitCenter} />
          <ScienceField
            label="Mean orbital speed"
            value={science.meanOrbitalSpeedKmS === undefined ? 'Not applicable' : `${science.meanOrbitalSpeedKmS} km/s`}
          />
          <ScienceField label="Ring system" value={science.ringSummary ?? 'No planetary ring system'} />
        </div>

        <div className="rounded border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-2 font-heading text-xs tracking-wide text-primary">
            <Orbit className="h-4 w-4" aria-hidden="true" /> MODEL NOTES
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{science.scienceNote}</p>
          {planet.rotationPeriodHours < 0 && (
            <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Retrograde means this body spins opposite the direction most planets rotate.
            </p>
          )}
          {planet.id === 'moon' && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The Moon follows an Earth-centered orbit and rotates synchronously with that orbit.
            </p>
          )}
        </div>

        <button
          type="button"
          aria-pressed={tiltGuidePlanetId === planet.id}
          onClick={() => toggleTiltGuide(planet.id)}
          className="inline-flex min-h-11 items-center justify-center rounded border border-primary/35 bg-primary/10 px-4 font-heading text-xs tracking-wide text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {tiltGuidePlanetId === planet.id ? 'Hide axial-tilt guide' : 'Show axial-tilt guide'}
        </button>

        <p className="text-xs text-muted-foreground">
          Source:{' '}
          <a
            href={science.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {science.sourceLabel}
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
};

const ScienceField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-border/60 bg-background/55 p-3">
    <dt className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="mt-1 font-heading text-sm text-foreground">{value}</dd>
  </div>
);
