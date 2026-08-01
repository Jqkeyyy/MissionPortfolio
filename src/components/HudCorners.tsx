interface HudCornersProps {
  active: boolean;
  converge?: boolean;
  size?: 'sm' | 'md';
}

export const HudCorners = ({ active, converge = false, size = 'md' }: HudCornersProps) => {
  const wrapperClassName = `absolute inset-0 pointer-events-none transition-opacity duration-200 ${
    active ? 'opacity-100' : 'opacity-0'
  }`;

  if (size === 'sm') {
    return (
      <div data-testid="hud-corners" className={wrapperClassName}>
        <span className="absolute left-0 top-0 w-2 h-2 border-l border-t border-secondary/70 rounded-tl-sm" />
        <span className="absolute right-0 top-0 w-2 h-2 border-r border-t border-secondary/70 rounded-tr-sm" />
        <span className="absolute left-0 bottom-0 w-2 h-2 border-l border-b border-secondary/70 rounded-bl-sm" />
        <span className="absolute right-0 bottom-0 w-2 h-2 border-r border-b border-secondary/70 rounded-br-sm" />
      </div>
    );
  }

  return (
    <div data-testid="hud-corners" className={wrapperClassName}>
      <span
        className={`absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-secondary transition-transform duration-300 ${
          converge ? 'translate-x-6 translate-y-6' : ''
        }`}
      />
      <span
        className={`absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-secondary transition-transform duration-300 ${
          converge ? '-translate-x-6 translate-y-6' : ''
        }`}
      />
      <span
        className={`absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-secondary transition-transform duration-300 ${
          converge ? 'translate-x-6 -translate-y-6' : ''
        }`}
      />
      <span
        className={`absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-secondary transition-transform duration-300 ${
          converge ? '-translate-x-6 -translate-y-6' : ''
        }`}
      />
    </div>
  );
};
