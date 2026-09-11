import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PlanetData } from '@/data/planets';
import type { PlanetThemeId } from '@/data/planetThemes';
import { Button } from '@/components/ui/button';
import { useGravityGun } from '@/features/endgame/gravityGunStore';
import type { GravityGunVector } from '@/features/endgame/gravityGun';

export interface GravityGunHUDProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planets: readonly PlanetData[];
  /** Optional hook for sound, recoil, telemetry, or achievement tracking. */
  onFire?: (planetId: PlanetThemeId, direction: GravityGunVector, force: number) => void;
}

const DIRECTIONS = {
  left: { x: -1, y: 0, z: 0 },
  right: { x: 1, y: 0, z: 0 },
  forward: { x: 0, y: 0, z: -1 },
  backward: { x: 0, y: 0, z: 1 },
  up: { x: 0, y: 1, z: 0 },
  down: { x: 0, y: -1, z: 0 },
} as const satisfies Record<string, GravityGunVector>;

const GRAVITY_GUN_KEY_BINDINGS = {
  ArrowLeft: DIRECTIONS.left,
  ArrowRight: DIRECTIONS.right,
  ArrowUp: DIRECTIONS.forward,
  ArrowDown: DIRECTIONS.backward,
  PageUp: DIRECTIONS.up,
  PageDown: DIRECTIONS.down,
} as const;

export const GravityGunHUD = ({
  open,
  onOpenChange,
  planets,
  onFire,
}: GravityGunHUDProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const [force, setForce] = useState(reducedMotion ? 3 : 6);
  const selectRef = useRef<HTMLSelectElement>(null);
  const selectedPlanetId = useGravityGun((state) => state.selectedPlanetId);
  const motions = useGravityGun((state) => state.motions);
  const collisionEvents = useGravityGun((state) => state.collisionEvents);
  const selectPlanet = useGravityGun((state) => state.selectPlanet);
  const fire = useGravityGun((state) => state.fire);
  const restoreSelected = useGravityGun((state) => state.restoreSelected);
  const restoreAll = useGravityGun((state) => state.restoreAll);
  const editablePlanets = planets.filter((planet) => planet.id !== 'sun');
  const selectedPlanet = editablePlanets.find((planet) => planet.id === selectedPlanetId)
    ?? editablePlanets[0];

  useEffect(() => {
    if (!open || !selectedPlanet) return;
    if (selectedPlanetId !== selectedPlanet.id) selectPlanet(selectedPlanet.id);
    selectRef.current?.focus();
  }, [open, selectPlanet, selectedPlanet, selectedPlanetId]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreAll();
        onOpenChange(false);
        return;
      }

      const target = event.target;
      if (target instanceof Element && target.matches('input, select, textarea')) return;
      const direction = GRAVITY_GUN_KEY_BINDINGS[
        event.key as keyof typeof GRAVITY_GUN_KEY_BINDINGS
      ];
      if (direction && selectedPlanet) {
        event.preventDefault();
        fire(direction, force);
        onFire?.(selectedPlanet.id, direction, force);
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        restoreSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fire, force, onFire, onOpenChange, open, restoreAll, restoreSelected, selectedPlanet]);

  if (!open || !selectedPlanet) return null;

  const launch = (direction: GravityGunVector) => {
    fire(direction, force);
    onFire?.(selectedPlanet.id, direction, force);
  };
  const selectedMotion = motions[selectedPlanet.id];
  const displacement = selectedMotion
    ? Math.hypot(selectedMotion.offset.x, selectedMotion.offset.y, selectedMotion.offset.z)
    : 0;
  const latestCollision = collisionEvents[collisionEvents.length - 1];

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="gravity-gun-title"
      aria-describedby="gravity-gun-description"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-fuchsia-300/40 bg-background/95 p-4 shadow-[0_0_60px_rgba(217,70,239,0.2)] backdrop-blur sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-mission text-fuchsia-300">
            REVERSIBLE TRAJECTORY LAB // SAFETY SHELL ONLINE
          </p>
          <h2 id="gravity-gun-title" className="mt-1 font-heading text-xl text-foreground">
            Gravity Gun
          </h2>
          <p id="gravity-gun-description" className="mt-1 text-xs text-muted-foreground">
            Push a world off course, chain a slingshot, or press Escape to restore every orbit.
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Close Gravity Gun"
          onClick={() => onOpenChange(false)}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <label htmlFor="gravity-gun-world" className="block text-xs font-medium text-foreground">
            Target world
          </label>
          <select
            ref={selectRef}
            id="gravity-gun-world"
            value={selectedPlanet.id}
            onChange={(event) => selectPlanet(event.target.value as PlanetThemeId)}
            className="min-h-11 w-full rounded-md border border-fuchsia-300/30 bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300"
          >
            {editablePlanets.map((planet) => (
              <option key={planet.id} value={planet.id}>{planet.displayName}</option>
            ))}
          </select>

          <div>
            <div className="flex justify-between gap-3 text-xs">
              <label htmlFor="gravity-gun-force">Impulse power</label>
              <output htmlFor="gravity-gun-force" className="font-mono text-fuchsia-300">
                {force.toFixed(0)} MN
              </output>
            </div>
            <input
              id="gravity-gun-force"
              type="range"
              min="1"
              max="12"
              step="1"
              value={force}
              onChange={(event) => setForce(Number(event.target.value))}
              className="mt-2 min-h-6 w-full accent-fuchsia-400"
            />
          </div>

          <p className="font-mono text-[10px] text-muted-foreground" role="status" aria-live="polite">
            {selectedPlanet.displayName.toUpperCase()} // OFFSET {displacement.toFixed(2)} AU
            {latestCollision ? ` // CONTACT ${latestCollision.bodies.join(' + ').toUpperCase()}` : ''}
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 text-center font-mono text-[10px] tracking-wide text-muted-foreground">
            SLINGSHOT VECTOR
          </legend>
          <div className="grid grid-cols-3 gap-2">
            <span aria-hidden="true" />
            <VectorButton label="Push forward" shortcut="↑" onClick={() => launch(DIRECTIONS.forward)}>
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </VectorButton>
            <VectorButton label="Push up" shortcut="PgUp" onClick={() => launch(DIRECTIONS.up)}>Y+</VectorButton>
            <VectorButton label="Push left" shortcut="←" onClick={() => launch(DIRECTIONS.left)}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </VectorButton>
            <VectorButton label="Push backward" shortcut="↓" onClick={() => launch(DIRECTIONS.backward)}>
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </VectorButton>
            <VectorButton label="Push right" shortcut="→" onClick={() => launch(DIRECTIONS.right)}>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </VectorButton>
            <span aria-hidden="true" />
            <VectorButton label="Push down" shortcut="PgDn" onClick={() => launch(DIRECTIONS.down)}>Y−</VectorButton>
          </div>
        </fieldset>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={restoreSelected}>
          Restore {selectedPlanet.displayName}
        </Button>
        <Button type="button" variant="outline" onClick={restoreAll}>
          <RotateCcw aria-hidden="true" className="mr-2 h-4 w-4" />
          Restore all orbits
        </Button>
      </div>
    </section>
  );
};

interface VectorButtonProps {
  label: string;
  shortcut: string;
  onClick: () => void;
  children: React.ReactNode;
}

const VectorButton = ({ label, shortcut, onClick, children }: VectorButtonProps) => (
  <Button
    type="button"
    size="icon"
    variant="outline"
    aria-label={`${label} (${shortcut})`}
    title={`${label} (${shortcut})`}
    onClick={onClick}
    className="min-h-11 min-w-11 border-fuchsia-300/35 text-fuchsia-200 hover:bg-fuchsia-400/15"
  >
    {children}
  </Button>
);
