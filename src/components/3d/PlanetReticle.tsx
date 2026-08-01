import { HudCorners } from '@/components/HudCorners';
import { ScanlineReveal } from '@/components/ScanlineReveal';

interface PlanetReticleProps {
  name: string;
  description: string;
  hovered: boolean;
  locking: boolean;
}

export const PlanetReticle = ({ name, description, hovered, locking }: PlanetReticleProps) => {
  const active = hovered || locking;

  return (
    <div
      data-testid="planet-reticle"
      className={`pointer-events-none flex flex-col items-center transition-opacity duration-200 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-24 h-24">
        <HudCorners active={active} converge={locking} size="md" />
      </div>
      <div className="hud-panel px-4 py-2 rounded-lg mt-2 overflow-hidden whitespace-nowrap">
        <ScanlineReveal active={active} duration={0.3}>
          <p className="font-heading text-sm tracking-mission text-primary">
            {locking ? 'LOCKING...' : name}
          </p>
        </ScanlineReveal>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
