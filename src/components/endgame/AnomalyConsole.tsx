import { useState } from 'react';
import { CircleDot, Hammer, MoonStar, Shuffle, Sparkles } from 'lucide-react';
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

export type EndgameFeatureId = 'developer-moon' | 'chaos' | 'event-horizon' | 'cosmic-architect';

export interface AnomalyConsoleProps {
  /** The console does not render until all ten destinations have been completed. */
  isComplete: boolean;
  chaosModeEnabled: boolean;
  onOpenDeveloperMoon: () => void;
  onChaosModeChange: (enabled: boolean) => void;
  onRevealEventHorizon: () => void;
  onOpenCosmicArchitect: () => void;
  className?: string;
  triggerClassName?: string;
}

const featureCardClassName =
  'rounded-lg border border-primary/20 bg-background/60 p-4 shadow-[inset_0_0_24px_hsl(var(--primary)/0.03)]';

const actionClassName =
  'mt-4 min-h-11 w-full border-primary/40 bg-primary/10 font-heading text-xs tracking-wide text-primary hover:bg-primary/20 focus-visible:ring-primary';

export const AnomalyConsole = ({
  isComplete,
  chaosModeEnabled,
  onOpenDeveloperMoon,
  onChaosModeChange,
  onRevealEventHorizon,
  onOpenCosmicArchitect,
  className,
  triggerClassName,
}: AnomalyConsoleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isComplete) return null;

  const launchAndClose = (launch: () => void) => {
    setIsOpen(false);
    launch();
  };

  return (
    <div className={className} data-testid="anomaly-console-unlocked">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'min-h-11 gap-2 border-fuchsia-400/50 bg-fuchsia-950/40 font-heading text-xs tracking-mission text-fuchsia-200 shadow-[0_0_24px_rgba(217,70,239,0.16)] hover:bg-fuchsia-900/50 hover:text-white focus-visible:ring-fuchsia-300',
              triggerClassName,
            )}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            ANOMALY CONSOLE
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto border-fuchsia-400/35 bg-background/95 p-4 shadow-[0_0_70px_rgba(217,70,239,0.2)] sm:p-6">
          <DialogHeader className="pr-8 text-left">
            <p className="font-mono text-[10px] tracking-mission text-fuchsia-300">
              TEN DESTINATIONS VERIFIED // RESTRICTIONS RELEASED
            </p>
            <DialogTitle className="font-heading text-2xl text-foreground">
              Anomaly Console
            </DialogTitle>
            <DialogDescription>
              The stable-universe rules are now optional. Choose an experiment; you can always return to the normal system.
            </DialogDescription>
          </DialogHeader>

          <ol className="grid gap-3 md:grid-cols-2" aria-label="Unlocked anomaly experiments">
            <li className={featureCardClassName} data-feature-id="developer-moon">
              <FeatureHeading rank="01" title="Developer Moon" icon={<MoonStar aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Drive a rover through the real artifacts and decisions behind Mission Portfolio.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => launchAndClose(onOpenDeveloperMoon)}
                className={actionClassName}
              >
                Land on Developer Moon
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="chaos">
              <FeatureHeading rank="02" title="Chaos Mode" icon={<Shuffle aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Unstable speeds, wandering tilts, impossible orbits, and colors that refuse to behave.
              </p>
              <Button
                type="button"
                variant="outline"
                aria-pressed={chaosModeEnabled}
                onClick={() => onChaosModeChange(!chaosModeEnabled)}
                className={actionClassName}
              >
                {chaosModeEnabled ? 'Restore Stable Universe' : 'Enable Chaos Mode'}
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="event-horizon">
              <FeatureHeading rank="03" title="The Event Horizon" icon={<CircleDot aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Approach the hidden singularity and cross into a distorted universe beyond Neptune.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => launchAndClose(onRevealEventHorizon)}
                className={actionClassName}
              >
                Reveal the Event Horizon
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="cosmic-architect">
              <FeatureHeading rank="04" title="Cosmic Architect" icon={<Hammer aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Rearrange worlds, tune gravity, create moons, and design a beautifully unstable system.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => launchAndClose(onOpenCosmicArchitect)}
                className={actionClassName}
              >
                Open Cosmic Architect
              </Button>
            </li>
          </ol>

          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
            EXPERIMENTAL SYSTEMS // Reduced-motion and graphics preferences remain active
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FeatureHeading = ({
  rank,
  title,
  icon,
}: {
  rank: string;
  title: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 text-primary">
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 [&>svg]:h-4 [&>svg]:w-4">
      {icon}
    </span>
    <div>
      <p className="font-mono text-[9px] tracking-widest text-muted-foreground">PRIORITY {rank}</p>
      <h2 className="font-heading text-sm tracking-wide text-foreground">{title}</h2>
    </div>
  </div>
);
