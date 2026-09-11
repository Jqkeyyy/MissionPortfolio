import { useMemo } from 'react';
import { ArrowLeftRight, Atom, Combine, Orbit, RotateCcw, Sparkles } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FUSIBLE_PLANETS,
  createPlanetFusion,
  type FusiblePlanetId,
  type PlanetFusion,
} from '@/features/endgame/planetFusion';
import { usePlanetFusion } from '@/features/endgame/planetFusionState';

export interface PlanetFusionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFusionActivated?: (fusion: PlanetFusion) => void;
  onFusionReleased?: (fusion: PlanetFusion) => void;
}

const paletteEntries = [
  ['accent', 'Surface'],
  ['secondary', 'Energy'],
  ['interior', 'Interior'],
  ['panel', 'Panels'],
] as const;

export const PlanetFusionPanel = ({
  open,
  onOpenChange,
  onFusionActivated,
  onFusionReleased,
}: PlanetFusionPanelProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const {
    primaryId,
    secondaryId,
    activeFusion,
    selectPrimary,
    selectSecondary,
    swap,
    activate,
    release,
  } = usePlanetFusion();
  const preview = useMemo(
    () => createPlanetFusion(primaryId, secondaryId),
    [primaryId, secondaryId],
  );
  const isPreviewActive = activeFusion?.id === preview.id;

  const handleActivate = () => {
    const fusion = activate();
    onFusionActivated?.(fusion);
  };

  const handleRelease = () => {
    if (activeFusion) onFusionReleased?.(activeFusion);
    release();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-5xl overflow-y-auto border-fuchsia-300/30 bg-[#090511]/[0.98] p-0 text-white shadow-[0_0_90px_rgba(217,70,239,0.16)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.16),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(34,211,238,0.10),transparent_28%)]" />
          <div className="absolute right-8 top-10 h-28 w-28 rounded-full border border-fuchsia-300/10 motion-safe:animate-pulse" />
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <DialogHeader className="pr-9 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/70">
              Anomaly // Matter synthesizer
            </p>
            <DialogTitle className="mt-1 flex items-center gap-3 font-heading text-2xl tracking-wide sm:text-3xl">
              <Combine className="h-6 w-6 text-fuchsia-300" aria-hidden="true" />
              Planet Fusion
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-6 text-fuchsia-50/60">
              Select two worlds. Their terrain, color spectrum, portfolio signal, and HAB architecture will coexist until you release the fusion.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <section aria-labelledby="fusion-input-title" className="rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <h2 id="fusion-input-title" className="font-heading text-sm uppercase tracking-[0.16em] text-white/75">Source worlds</h2>
              <div className="mt-4 space-y-4">
                <PlanetSelect
                  id="fusion-primary"
                  label="Primary world"
                  value={primaryId}
                  excludedId={secondaryId}
                  onChange={selectPrimary}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={swap}
                  className="min-h-11 w-full border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" aria-hidden="true" />
                  Swap source roles
                </Button>
                <PlanetSelect
                  id="fusion-secondary"
                  label="Secondary world"
                  value={secondaryId}
                  excludedId={primaryId}
                  onChange={selectSecondary}
                />
              </div>

              <div className="mt-5 rounded-lg border border-amber-200/15 bg-amber-200/[0.04] p-3 text-xs leading-5 text-amber-50/55">
                Fusion is temporary. Existing routes and mission progress stay intact; releasing it restores both source worlds.
              </div>

              {isPreviewActive ? (
                <Button type="button" variant="outline" onClick={handleRelease} className="mt-5 min-h-12 w-full border-cyan-200/35 bg-cyan-200/[0.06] font-heading text-xs tracking-[0.14em] text-cyan-100 hover:bg-cyan-200/15 hover:text-white">
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Release {preview.name}
                </Button>
              ) : (
                <Button type="button" onClick={handleActivate} className="mt-5 min-h-12 w-full bg-fuchsia-300 font-heading text-xs tracking-[0.14em] text-fuchsia-950 hover:bg-fuchsia-200">
                  <Atom className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fuse into {preview.name}
                </Button>
              )}
            </section>

            <FusionPreview fusion={preview} active={isPreviewActive} reducedMotion={reducedMotion} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface PlanetSelectProps {
  id: string;
  label: string;
  value: FusiblePlanetId;
  excludedId: FusiblePlanetId;
  onChange: (planetId: FusiblePlanetId) => void;
}

const PlanetSelect = ({ id, label, value, excludedId, onChange }: PlanetSelectProps) => (
  <div>
    <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as FusiblePlanetId)}
      className="mt-2 min-h-12 w-full rounded-md border border-fuchsia-200/20 bg-[#100918] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300"
    >
      {FUSIBLE_PLANETS.map((planet) => (
        <option key={planet.id} value={planet.id} disabled={planet.id === excludedId}>
          {planet.name} — {planet.description}
        </option>
      ))}
    </select>
  </div>
);
const FusionPreview = ({
  fusion,
  active,
  reducedMotion,
}: {
  fusion: PlanetFusion;
  active: boolean;
  reducedMotion: boolean;
}) => (
  <section
    aria-labelledby="fusion-preview-title"
    className="relative overflow-hidden rounded-xl border border-fuchsia-200/20 bg-white/[0.035] p-4 sm:p-6"
    style={{
      backgroundImage: `radial-gradient(circle at 85% 10%, ${fusion.palette.accent}28, transparent 33%), linear-gradient(145deg, ${fusion.palette.interior}dd, #08050d 72%)`,
    }}
  >
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fuchsia-100/55">Live synthesis preview</p>
        <h2 id="fusion-preview-title" className="mt-2 truncate font-heading text-3xl sm:text-4xl">{fusion.name}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{fusion.description}</p>
      </div>
      <div
        aria-hidden="true"
        className={`relative mx-auto h-24 w-24 shrink-0 rounded-full shadow-[0_0_35px_var(--fusion-glow)] sm:mx-0 sm:h-28 sm:w-28 ${reducedMotion ? '' : 'motion-safe:animate-[spin_18s_linear_infinite]'}`}
        style={{
          '--fusion-glow': `${fusion.palette.accent}66`,
          background: `repeating-linear-gradient(12deg, ${fusion.palette.accent} 0 10px, ${fusion.palette.secondary} 12px 20px, ${fusion.palette.panel} 22px 27px)`,
        } as React.CSSProperties}
      >
        <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-white/25 via-transparent to-black/40" />
      </div>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <PreviewCard icon={<Orbit aria-hidden="true" />} label="Surface" title={fusion.surface.label} body={fusion.surface.description} />
      <PreviewCard icon={<Sparkles aria-hidden="true" />} label="HAB identity" title={fusion.habitat.label} body={fusion.habitat.identity} />
    </div>

    <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Fusion spectrum</p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Hybrid color palette">
        {paletteEntries.map(([key, label]) => (
          <li key={key} className="rounded-md border border-white/10 bg-black/20 p-2">
            <span className="block h-5 rounded-sm border border-white/10" style={{ backgroundColor: fusion.palette[key] }} aria-hidden="true" />
            <span className="mt-2 block font-mono text-[9px] uppercase tracking-wider text-white/50">{label}</span>
            <span className="mt-0.5 block font-mono text-[10px] text-white/75">{fusion.palette[key].toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </div>

    <p className="mt-4 min-h-5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/65" role="status" aria-live="polite">
      {active ? `${fusion.name} is stabilized in the live solar system.` : 'Preview only — solar system unchanged.'}
    </p>
  </section>
);

const PreviewCard = ({
  icon,
  label,
  title,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
}) => (
  <article className="rounded-lg border border-white/10 bg-black/20 p-4">
    <div className="flex items-center gap-2 text-fuchsia-200 [&>svg]:h-4 [&>svg]:w-4">
      {icon}
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">{label}</p>
    </div>
    <h3 className="mt-3 font-heading text-sm text-white/90">{title}</h3>
    <p className="mt-2 text-xs leading-5 text-white/50">{body}</p>
  </article>
);
