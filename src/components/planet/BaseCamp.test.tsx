import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseCamp } from './BaseCamp';
import { planets } from '@/data/planets';

describe('BaseCamp', () => {
  const planet = planets.find((p) => p.id === 'earth')!;

  it('renders the planet name, description, and enter prompt', () => {
    render(<BaseCamp planet={planet} onClick={() => {}} />);
    expect(screen.getByText(planet.displayName)).toBeInTheDocument();
    expect(screen.getByText(planet.description)).toBeInTheDocument();
    expect(screen.getByText('Enter Base Camp')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<BaseCamp planet={planet} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
