import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanetReticle } from './PlanetReticle';

describe('PlanetReticle', () => {
  it('shows the planet name and description when hovered', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered locking={false} />);
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('shows LOCKING... instead of the name while locking', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered locking />);
    expect(screen.getByText('LOCKING...')).toBeInTheDocument();
    expect(screen.queryByText('Earth')).not.toBeInTheDocument();
  });

  it('is hidden when neither hovered nor locking', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered={false} locking={false} />);
    expect(screen.getByTestId('planet-reticle').className).toContain('opacity-0');
  });
});
