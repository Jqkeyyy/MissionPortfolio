import { useState } from 'react';
import {
  Bot,
  CircleDot,
  Combine,
  Disc3,
  Flame,
  Hammer,
  MoonStar,
  Move3d,
  Orbit,
  RadioTower,
  Satellite,
  Shuffle,
  Sparkles,
  Terminal,
  Trophy,
} from 'lucide-react';
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

export type EndgameFeatureId =
  | 'developer-moon'
  | 'chaos'
  | 'event-horizon'
  | 'cosmic-architect'
  | 'alien-signal'
  | 'rogue-planet'
  | 'orbit-replay'
  | 'hab-terminal'
  | 'supernova'
  | 'planet-fusion'
  | 'gravity-gun'
  | 'space-pet'
  | 'disco-sun'
  | 'impossible-achievement';

export interface AnomalyConsoleProps {
  /** The console does not render until all ten destinations have been completed. */
  isComplete: boolean;
  chaosModeEnabled: boolean;
  onOpenDeveloperMoon: () => void;
  onChaosModeChange: (enabled: boolean) => void;
  onRevealEventHorizon: () => void;
  onOpenCosmicArchitect: () => void;
  onOpenAlienSignal: () => void;
  onOpenRoguePlanet: () => void;
  onOpenOrbitReplay: () => void;
  onOpenHabTerminal: () => void;
  onOpenSupernova: () => void;
  onOpenPlanetFusion: () => void;
  onOpenGravityGun: () => void;
  spacePetEnabled: boolean;
  onSpacePetChange: (enabled: boolean) => void;
  discoSunActive: boolean;
  onOpenDiscoSun: () => void;
  onOpenImpossibleAchievement: () => void;
  newGamePlusActive: boolean;
  onRestoreNewGamePlus: () => void;
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
  onOpenAlienSignal,
  onOpenRoguePlanet,
  onOpenOrbitReplay,
  onOpenHabTerminal,
  onOpenSupernova,
  onOpenPlanetFusion,
  onOpenGravityGun,
  spacePetEnabled,
  onSpacePetChange,
  discoSunActive,
  onOpenDiscoSun,
  onOpenImpossibleAchievement,
  newGamePlusActive,
  onRestoreNewGamePlus,
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

            <li className={featureCardClassName} data-feature-id="alien-signal">
              <FeatureHeading rank="05" title="Alien Signal Hunt" icon={<RadioTower aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Recover radio fragments hidden across the planets and decode coordinates to a secret destination.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenAlienSignal)} className={actionClassName}>
                Open Signal Receiver
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="rogue-planet">
              <FeatureHeading rank="06" title="Rogue Planet" icon={<Orbit aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Intercept an unmarked world carrying a hidden build record from outside the catalog.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenRoguePlanet)} className={actionClassName}>
                Track Rogue Planet
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="orbit-replay">
              <FeatureHeading rank="07" title="Orbit Replay" icon={<Satellite aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Launch an autopilot flyby of the completed mission, its milestones, and portfolio statistics.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenOrbitReplay)} className={actionClassName}>
                Start Orbit Replay
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="hab-terminal">
              <FeatureHeading rank="08" title="Secret HAB Terminal" icon={<Terminal aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Enter the maintenance shell. Its documented command list is intentionally incomplete.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenHabTerminal)} className={actionClassName}>
                Access HAB Terminal
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="supernova">
              <FeatureHeading rank="09" title="Supernova Button" icon={<Flame aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Collapse the system in a cinematic sequence and reform it with a New Game+ spectrum.
              </p>
              <Button
                type="button"
                variant="outline"
                aria-pressed={newGamePlusActive}
                onClick={() => {
                  if (newGamePlusActive) onRestoreNewGamePlus();
                  else launchAndClose(onOpenSupernova);
                }}
                className={actionClassName}
              >
                {newGamePlusActive ? 'Restore Original Timeline' : 'Arm Supernova'}
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="planet-fusion">
              <FeatureHeading rank="10" title="Planet Fusion" icon={<Combine aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Combine two worlds into one temporary hybrid, including its terrain, palette, identity, and orbit.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenPlanetFusion)} className={actionClassName}>
                Open Fusion Chamber
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="gravity-gun">
              <FeatureHeading rank="11" title="Gravity Gun" icon={<Move3d aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Throw planets through harmless slingshots and particle contacts before their return systems take over.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenGravityGun)} className={actionClassName}>
                Equip Gravity Gun
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="space-pet">
              <FeatureHeading rank="12" title="Space Pet M-0" icon={<Bot aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Deploy a tiny maintenance companion that follows your clicks and reacts to the mission.
              </p>
              <Button
                type="button"
                variant="outline"
                aria-pressed={spacePetEnabled}
                onClick={() => onSpacePetChange(!spacePetEnabled)}
                className={actionClassName}
              >
                {spacePetEnabled ? 'Recall M-0' : 'Deploy M-0'}
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="disco-sun">
              <FeatureHeading rank="13" title="Disco Sun" icon={<Disc3 aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Tap the classified solar rhythm to pulse the trails, lights, music, and planets in sync.
              </p>
              <Button type="button" variant="outline" aria-pressed={discoSunActive} onClick={() => launchAndClose(onOpenDiscoSun)} className={actionClassName}>
                {discoSunActive ? 'Open Solar Controls' : 'Enter Rhythm Lock'}
              </Button>
            </li>

            <li className={featureCardClassName} data-feature-id="impossible-achievement">
              <FeatureHeading rank="14" title="Impossible Achievement" icon={<Trophy aria-hidden="true" />} />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Verify five linked anomalies in one timeline and void reality's warranty.
              </p>
              <Button type="button" variant="outline" onClick={() => launchAndClose(onOpenImpossibleAchievement)} className={actionClassName}>
                Inspect Classified Challenge
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
