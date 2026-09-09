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
      className={`pointer-events-none transition-opacity duration-200 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="hud-panel overflow-hidden whitespace-nowrap rounded-lg px-4 py-2 text-center"
        data-testid="planet-hover-label"
      >
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
