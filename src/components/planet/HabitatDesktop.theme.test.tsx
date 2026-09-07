import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { planets } from '@/data/planets';
import { HabitatDesktop } from './HabitatDesktop';

describe('HabitatDesktop planet themes', () => {
  it('carries Saturn identity tokens into the wallpaper and system details', () => {
    const planet = planets.find((candidate) => candidate.id === 'saturn')!;
    const { container } = render(
      <HabitatDesktop
        planet={planet}
        onStandUp={() => {}}
        bootStartedAt={Date.now() - 5000}
      />,
    );

    const desktop = container.querySelector('[data-planet-theme="saturn"]');
    expect(desktop).toHaveAttribute('data-habitat-family', 'deep-space-station');
    expect(desktop).toHaveAttribute('data-wallpaper-pattern', 'orbit-lines');
    expect(desktop).toHaveStyle({ '--planet-accent': '#f4d58d' });

    fireEvent.click(screen.getByTestId('desktop-system'));
    expect(screen.getByText('Habitat family')).toBeInTheDocument();
    expect(screen.getByText('Deep-space / Heavy Station')).toBeInTheDocument();
    expect(screen.getByText('101.3 kPa')).toBeInTheDocument();
    expect(screen.getByText(/ring plane slices across the viewport/i)).toBeInTheDocument();
  });
});
