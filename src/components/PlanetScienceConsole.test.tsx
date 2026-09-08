import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlanetScienceConsole } from './PlanetScienceConsole';

describe('PlanetScienceConsole', () => {
  it('explains retrograde rotation and restores focus when Escape closes it', async () => {
    render(<PlanetScienceConsole planetId="venus" />);
    const trigger = screen.getByRole('button', { name: 'Open science data for Venus' });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/retrograde/i).length).toBeGreaterThan(0);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('shows the Moon as Earth-centered and synchronously rotating', () => {
    render(<PlanetScienceConsole planetId="moon" />);
    fireEvent.click(screen.getByRole('button', { name: /open science data for the moon/i }));
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText(/Earth-centered orbit/i)).toBeInTheDocument();
  });

  it('uses explicit non-applicable values for the Sun', () => {
    render(<PlanetScienceConsole planetId="sun" />);
    fireEvent.click(screen.getByRole('button', { name: /open science data for the sun/i }));
    expect(screen.getAllByText('Not applicable')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'NASA Sun Facts' })).toHaveAttribute(
      'href',
      'https://science.nasa.gov/sun/facts/',
    );
  });

  it('uses a viewport-bounded scrollable dialog for phone widths', () => {
    render(<PlanetScienceConsole planetId="saturn" />);
    fireEvent.click(screen.getByRole('button', { name: /open science data for saturn/i }));
    expect(screen.getByRole('dialog')).toHaveClass(
      'max-h-[calc(100dvh-2rem)]',
      'w-[calc(100vw-2rem)]',
      'overflow-y-auto',
    );
  });
});
