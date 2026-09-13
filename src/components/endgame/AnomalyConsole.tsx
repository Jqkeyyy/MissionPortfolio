import { useState } from 'react';
import { Bot, CircleDot, Combine, Disc3, Flame, Hammer, LockKeyhole, MoonStar, Move3d, Orbit, RadioTower, Satellite, Shuffle, Sparkles, Terminal, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { matchesDiscoRhythm } from '@/features/endgame/discoSun';
import { getAnomalyStatus, useAnomalyProgress, type AnomalyFeatureId } from '@/features/endgame/anomalyProgress';

export type EndgameFeatureId = AnomalyFeatureId;

export interface AnomalyConsoleProps {
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
  onRestoreStableUniverse?: () => void;
  onDiscovery?: (message: string) => void;
  className?: string;
  triggerClassName?: string;
}

const features = [
  { id: 'developer-moon', title: 'Developer Moon', icon: MoonStar, description: 'Drive a rover through the real artifacts and decisions behind Mission Portfolio.', action: 'Land on Developer Moon', clue: '' },
  { id: 'chaos', title: 'Chaos Mode', icon: Shuffle, description: 'Unstable speeds, wandering tilts, impossible orbits, and colors that refuse to behave.', action: 'Enable Chaos Mode', clue: '' },
  { id: 'event-horizon', title: 'The Event Horizon', icon: CircleDot, description: 'Approach the hidden singularity and cross into a distorted universe beyond Neptune.', action: 'Reveal the Event Horizon', clue: 'Review every destination in Orbit Replay.' },
  { id: 'cosmic-architect', title: 'Cosmic Architect', icon: Hammer, description: 'Rearrange worlds, tune gravity, create moons, and design a beautifully unstable system.', action: 'Open Cosmic Architect', clue: 'Finish the rover story on Developer Moon.' },
  { id: 'alien-signal', title: 'Alien Signal Hunt', icon: RadioTower, description: 'Recover radio fragments across the planets and decode coordinates to a secret destination.', action: 'Open Signal Receiver', clue: '' },
  { id: 'rogue-planet', title: 'Rogue Planet', icon: Orbit, description: 'Intercept an unmarked world carrying a hidden build record.', action: 'Track Rogue Planet', clue: 'Decode the alien transmission.' },
  { id: 'orbit-replay', title: 'Orbit Replay', icon: Satellite, description: 'Launch an autopilot flyby of the completed mission and its milestones.', action: 'Start Orbit Replay', clue: '' },
  { id: 'hab-terminal', title: 'Secret HAB Terminal', icon: Terminal, description: 'Enter the maintenance shell. Its documented command list is intentionally incomplete.', action: 'Access HAB Terminal', clue: '' },
  { id: 'supernova', title: 'Supernova Button', icon: Flame, description: 'Collapse the system and reform it with a New Game+ spectrum.', action: 'Arm Supernova', clue: '' },
  { id: 'planet-fusion', title: 'Planet Fusion', icon: Combine, description: 'Combine two worlds into one temporary hybrid.', action: 'Open Fusion Chamber', clue: 'Fire the Gravity Gun once.' },
  { id: 'gravity-gun', title: 'Gravity Gun', icon: Move3d, description: 'Throw planets through harmless slingshots before their return systems take over.', action: 'Equip Gravity Gun', clue: 'Try Chaos Mode.' },
  { id: 'space-pet', title: 'Space Pet M-0', icon: Bot, description: 'Deploy a tiny maintenance companion that follows your clicks.', action: 'Deploy M-0', clue: '' },
  { id: 'disco-sun', title: 'Disco Sun', icon: Disc3, description: 'Pulse the trails, lights, music, and planets in sync.', action: 'Enter Rhythm Lock', clue: '' },
  { id: 'impossible-achievement', title: 'Impossible Achievement', icon: Trophy, description: 'Verify five linked anomalies in one timeline and void reality’s warranty.', action: 'Inspect Classified Challenge', clue: '' },
] as const;

const cardClass = 'rounded-lg border border-primary/20 bg-background/60 p-4 shadow-[inset_0_0_24px_hsl(var(--primary)/0.03)]';
const actionClass = 'mt-4 min-h-11 w-full border-primary/40 bg-primary/10 font-heading text-xs tracking-wide text-primary hover:bg-primary/20 focus-visible:ring-primary';

export const AnomalyConsole = (props: AnomalyConsoleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [rhythmMessage, setRhythmMessage] = useState('');
  const events = useAnomalyProgress((state) => state.events);
  const freeExplore = useAnomalyProgress((state) => state.freeExplore);
  const setFreeExplore = useAnomalyProgress((state) => state.setFreeExplore);
  const record = useAnomalyProgress((state) => state.record);

  if (!props.isComplete) return null;

  const launch = (callback: () => void) => { setIsOpen(false); callback(); };
  const actions: Record<AnomalyFeatureId, { callback: () => void; label?: string; pressed?: boolean; stayOpen?: boolean }> = {
    'developer-moon': { callback: props.onOpenDeveloperMoon },
    chaos: { callback: () => props.onChaosModeChange(!props.chaosModeEnabled), label: props.chaosModeEnabled ? 'Restore Stable Universe' : undefined, pressed: props.chaosModeEnabled, stayOpen: true },
    'event-horizon': { callback: props.onRevealEventHorizon },
    'cosmic-architect': { callback: props.onOpenCosmicArchitect },
    'alien-signal': { callback: props.onOpenAlienSignal },
    'rogue-planet': { callback: props.onOpenRoguePlanet },
    'orbit-replay': { callback: props.onOpenOrbitReplay },
    'hab-terminal': { callback: props.onOpenHabTerminal },
    supernova: { callback: props.newGamePlusActive ? props.onRestoreNewGamePlus : props.onOpenSupernova, label: props.newGamePlusActive ? 'Restore Original Timeline' : undefined, pressed: props.newGamePlusActive, stayOpen: props.newGamePlusActive },
    'planet-fusion': { callback: props.onOpenPlanetFusion },
    'gravity-gun': { callback: props.onOpenGravityGun },
    'space-pet': { callback: () => props.onSpacePetChange(!props.spacePetEnabled), label: props.spacePetEnabled ? 'Recall M-0' : undefined, pressed: props.spacePetEnabled, stayOpen: true },
    'disco-sun': { callback: props.onOpenDiscoSun, label: props.discoSunActive ? 'Open Solar Controls' : undefined, pressed: props.discoSunActive },
    'impossible-achievement': { callback: props.onOpenImpossibleAchievement },
  };
  const hiddenCount = features.filter(({ id }) => getAnomalyStatus(id, events, freeExplore) === 'hidden').length;
  const availableCount = features.filter(({ id }) => getAnomalyStatus(id, events, freeExplore) === 'available').length;

  const tapRhythm = () => {
    const now = performance.now();
    const next = tapTimes.length && now - tapTimes[tapTimes.length - 1] > 1300 ? [now] : [...tapTimes, now];
    if (next.length < 4) {
      setTapTimes(next);
      setRhythmMessage(`${next.length} / 4 pulses received`);
      return;
    }
    setTapTimes([]);
    if (matchesDiscoRhythm(next)) {
      record('sun-rhythm');
      setRhythmMessage('Solar rhythm accepted. A new experiment appeared.');
      props.onDiscovery?.('Disco Sun discovered. Solar rhythm accepted.');
    } else {
      setRhythmMessage('Rhythm missed. Try two quick beats, then one slower beat.');
    }
  };

  return (
    <div className={props.className} data-testid="anomaly-console-unlocked">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className={cn('min-h-11 gap-2 border-fuchsia-400/50 bg-fuchsia-950/40 font-heading text-xs tracking-mission text-fuchsia-200 shadow-[0_0_24px_rgba(217,70,239,0.16)] hover:bg-fuchsia-900/50 hover:text-white focus-visible:ring-fuchsia-300', props.triggerClassName)}>
            <Sparkles className="h-4 w-4" aria-hidden="true" /> ANOMALY CONSOLE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto border-fuchsia-400/35 bg-background/95 p-4 shadow-[0_0_70px_rgba(217,70,239,0.2)] sm:p-6">
          <DialogHeader className="pr-8 text-left">
            <p className="font-mono text-[10px] tracking-mission text-fuchsia-300">TEN DESTINATIONS VERIFIED // ANOMALY PROTOCOL ACTIVE</p>
            <DialogTitle className="font-heading text-2xl text-foreground">Anomaly Console</DialogTitle>
            <DialogDescription>Follow the clues to unlock experiments. Some remain off the manifest until discovered. You can always return to the stable universe.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-fuchsia-400/20 bg-fuchsia-950/15 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-fuchsia-200">{availableCount} / {features.length} available · {hiddenCount} unknown signals</p>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={freeExplore} onChange={(event) => setFreeExplore(event.target.checked)} className="accent-fuchsia-400" /> Reveal all experiments
            </label>
          </div>
          <ol className="grid gap-3 md:grid-cols-2" aria-label="Anomaly experiments">
            {features.map((feature, index) => {
              const status = getAnomalyStatus(feature.id, events, freeExplore);
              if (status === 'hidden') return null;
              const Icon = feature.icon;
              const action = actions[feature.id];
              return (
                <li key={feature.id} className={cn(cardClass, status === 'locked' && 'border-muted-foreground/20 opacity-75')} data-feature-id={feature.id} data-status={status}>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <div><p className="font-mono text-[9px] tracking-widest text-muted-foreground">PRIORITY {String(index + 1).padStart(2, '0')}</p><h2 className="font-heading text-sm tracking-wide text-foreground">{feature.title}</h2></div>
                    {status === 'locked' && <LockKeyhole className="ml-auto h-4 w-4 text-muted-foreground" aria-label="Locked" />}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{status === 'locked' ? feature.clue : feature.description}</p>
                  <Button type="button" variant="outline" disabled={status === 'locked'} aria-pressed={action.pressed} onClick={() => action.stayOpen ? action.callback() : launch(action.callback)} className={actionClass}>
                    {status === 'locked' ? 'Challenge locked' : (action.label ?? feature.action)}
                  </Button>
                </li>
              );
            })}
          </ol>
          {!freeExplore && getAnomalyStatus('disco-sun', events) === 'hidden' && (
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-200/75">Unidentified solar telemetry</p>
              <p className="mt-1 text-sm text-muted-foreground">The Sun is repeating a pulse: short · short · long. Can you answer?</p>
              <Button type="button" variant="outline" onClick={tapRhythm} className="mt-3 min-h-11 border-amber-300/30 text-amber-100">Tap solar pulse</Button>
              <p role="status" className="mt-2 text-xs text-amber-100/70">{rhythmMessage}</p>
            </div>
          )}
          <Button type="button" variant="ghost" onClick={props.onRestoreStableUniverse ?? (() => { props.onChaosModeChange(false); props.onRestoreNewGamePlus(); })} className="min-h-11 self-start text-xs text-muted-foreground">Restore stable universe</Button>
          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">EXPERIMENTAL SYSTEMS // Reduced-motion and graphics preferences remain active</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};
