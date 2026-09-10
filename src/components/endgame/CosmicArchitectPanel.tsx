import { useEffect } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PlanetData } from '@/data/planets';
import type { PlanetThemeId } from '@/data/planetThemes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  COSMIC_ARCHITECT_LIMITS,
  createCosmicArchitectOverride,
  type CosmicArchitectOverride,
} from '@/features/endgame/cosmicArchitect';
import { useCosmicArchitect } from '@/features/endgame/useCosmicArchitect';

export interface CosmicArchitectPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planets: readonly PlanetData[];
}

type NumericOverrideKey = Exclude<
  keyof CosmicArchitectOverride,
  'orbitDirection'
>;

const formatValue = (key: NumericOverrideKey, value: number) => {
  if (key.endsWith('Multiplier')) return `${value.toFixed(2)}×`;
  return `${Math.round(value)}°`;
};
export const CosmicArchitectPanel = ({
  open,
  onOpenChange,
  planets,
}: CosmicArchitectPanelProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const selectedPlanetId = useCosmicArchitect((state) => state.selectedPlanetId);
  const overrides = useCosmicArchitect((state) => state.overrides);
  const selectPlanet = useCosmicArchitect((state) => state.selectPlanet);
  const setWorldOverride = useCosmicArchitect((state) => state.setWorldOverride);
  const resetWorld = useCosmicArchitect((state) => state.resetWorld);
  const resetAll = useCosmicArchitect((state) => state.resetAll);
  const editablePlanets = planets.filter((planet) => planet.id !== 'sun');
  const selectedPlanet = editablePlanets.find((planet) => planet.id === selectedPlanetId)
    ?? editablePlanets[0];

  useEffect(() => {
    if (open && selectedPlanet && selectedPlanetId !== selectedPlanet.id) {
      selectPlanet(selectedPlanet.id);
    }
  }, [open, selectPlanet, selectedPlanet, selectedPlanetId]);

  if (!selectedPlanet) return null;

  const override = overrides[selectedPlanet.id]
    ?? createCosmicArchitectOverride(selectedPlanet);

  const changeValue = (key: NumericOverrideKey, value: number) => {
    setWorldOverride(selectedPlanet.id, { ...override, [key]: value });
  };

  const changeDirection = (direction: 1 | -1) => {
    setWorldOverride(selectedPlanet.id, { ...override, orbitDirection: direction });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto border-cyan-400/35 bg-background/95 p-4 shadow-[0_0_70px_rgba(34,211,238,0.16)] sm:p-6"
      >
        <DialogHeader className="pr-8 text-left">
          <p className="font-mono text-[10px] tracking-mission text-cyan-300">
            SANDBOX PHYSICS // REVERSIBLE CHANGES
          </p>
          <DialogTitle className="font-heading text-2xl">Cosmic Architect</DialogTitle>
          <DialogDescription>
            Select a world and tune its visible physics. Every control can be restored safely.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[13rem_1fr]">
          <aside aria-label="Editable worlds">
            <label htmlFor="architect-world" className="text-xs font-medium text-foreground">
              World
            </label>
            <select
              id="architect-world"
              value={selectedPlanet.id}
              onChange={(event) => selectPlanet(event.target.value as PlanetThemeId)}
              className="mt-2 min-h-11 w-full rounded-md border border-cyan-400/30 bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {editablePlanets.map((planet) => (
                <option key={planet.id} value={planet.id}>{planet.displayName}</option>
              ))}
            </select>

            <div className="mt-3 rounded-md border border-border/60 bg-muted/25 p-3">
              <span
                aria-hidden="true"
                className="mb-2 block h-8 w-8 rounded-full border border-white/20"
                style={{ backgroundColor: selectedPlanet.color }}
              />
              <p className="font-heading text-sm">{selectedPlanet.displayName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{selectedPlanet.description}</p>
            </div>
          </aside>

          <section aria-label={`${selectedPlanet.displayName} architect controls`} className="space-y-4">
            <RangeControl
              id="architect-size"
              label="World size"
              hint="Scales the visible world"
              setting="sizeMultiplier"
              value={override.sizeMultiplier}
              step={0.05}
              onChange={changeValue}
            />
            <RangeControl
              id="architect-radius"
              label="Orbit radius"
              hint="Moves the orbit nearer or farther away"
              setting="orbitRadiusMultiplier"
              value={override.orbitRadiusMultiplier}
              step={0.05}
              onChange={changeValue}
            />
            <RangeControl
              id="architect-gravity"
              label="Gravity feel"
              hint="Higher gravity pulls the world around faster"
              setting="gravityMultiplier"
              value={override.gravityMultiplier}
              step={0.05}
              onChange={changeValue}
            />
            <RangeControl
              id="architect-speed"
              label="Orbit speed"
              hint="Fine-tunes speed after radius and gravity"
              setting="orbitSpeedMultiplier"
              value={override.orbitSpeedMultiplier}
              step={0.05}
              onChange={changeValue}
            />

            <fieldset>
              <legend className="text-xs font-medium text-foreground">Orbit direction</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([
                  [1, 'Prograde'],
                  [-1, 'Retrograde'],
                ] as const).map(([direction, label]) => (
                  <Button
                    key={direction}
                    type="button"
                    variant="outline"
                    aria-pressed={override.orbitDirection === direction}
                    onClick={() => changeDirection(direction)}
                    className={override.orbitDirection === direction ? 'border-cyan-300 bg-cyan-400/15' : ''}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </fieldset>

            <RangeControl
              id="architect-axial-tilt"
              label="Axial tilt"
              hint="Tips the world's spin axis"
              setting="axialTiltDeg"
              value={override.axialTiltDeg}
              step={1}
              onChange={changeValue}
            />
            <RangeControl
              id="architect-orbit-tilt"
              label="Orbital tilt"
              hint="Tilts the entire orbit plane"
              setting="orbitInclinationDeg"
              value={override.orbitInclinationDeg}
              step={1}
              onChange={changeValue}
            />
            <RangeControl
              id="architect-hue"
              label="Color hue"
              hint="Rotates the world's color palette"
              setting="hueShiftDeg"
              value={override.hueShiftDeg}
              step={1}
              onChange={changeValue}
            />
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={resetAll}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Reset all worlds
          </Button>
          <Button type="button" variant="outline" onClick={() => resetWorld(selectedPlanet.id)}>
            <Undo2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Reset {selectedPlanet.displayName}
          </Button>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Editing {selectedPlanet.displayName}. {Object.keys(overrides).length} worlds modified.
        </p>
      </DialogContent>
    </Dialog>
  );
};

interface RangeControlProps {
  id: string;
  label: string;
  hint: string;
  setting: NumericOverrideKey;
  value: number;
  step: number;
  onChange: (setting: NumericOverrideKey, value: number) => void;
}

const RangeControl = ({
  id,
  label,
  hint,
  setting,
  value,
  step,
  onChange,
}: RangeControlProps) => {
  const limits = COSMIC_ARCHITECT_LIMITS[setting];
  const hintId = `${id}-hint`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-foreground">{label}</label>
        <output htmlFor={id} className="font-mono text-xs text-cyan-300">
          {formatValue(setting, value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={limits.min}
        max={limits.max}
        step={step}
        value={value}
        aria-describedby={hintId}
        onChange={(event) => onChange(setting, Number(event.target.value))}
        className="mt-2 h-11 w-full cursor-pointer accent-cyan-400"
      />
      <p id={hintId} className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
};
