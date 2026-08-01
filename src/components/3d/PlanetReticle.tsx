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
        <span
          className={`absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-secondary transition-transform duration-300 ${
            locking ? 'translate-x-6 translate-y-6' : ''
          }`}
        />
        <span
          className={`absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-secondary transition-transform duration-300 ${
            locking ? '-translate-x-6 translate-y-6' : ''
          }`}
        />
        <span
          className={`absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-secondary transition-transform duration-300 ${
            locking ? 'translate-x-6 -translate-y-6' : ''
          }`}
        />
        <span
          className={`absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-secondary transition-transform duration-300 ${
            locking ? '-translate-x-6 -translate-y-6' : ''
          }`}
        />
      </div>
      <div className="hud-panel px-4 py-2 rounded-lg mt-2 overflow-hidden whitespace-nowrap">
        <p className="font-heading text-sm tracking-mission text-primary">
          {locking ? 'LOCKING...' : name}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
