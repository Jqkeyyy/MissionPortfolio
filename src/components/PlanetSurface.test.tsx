import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanetSurface } from './PlanetSurface';
import { useGameState } from '@/hooks/useGameState';

vi.mock('./planet/PlanetTerrain', () => ({
  PlanetTerrain: () => <div data-testid="planet-terrain" />,
}));

vi.mock('./planet/LandingPad', () => ({
  LandingPad: () => <div data-testid="landing-pad" />,
}));

vi.mock('./planet/PlanetLandingShip', () => ({
  PlanetLandingShip: () => <div data-testid="landing-ship" />,
}));

vi.mock('./planet/BaseCamp', () => ({
  BaseCamp: ({ planet, onClick }: { planet: { displayName: string }; onClick: () => void }) => (
    <button type="button" aria-label={`Enter the base camp on ${planet.displayName}`} onClick={onClick}>
      Enter Base Camp
    </button>
  ),
}));

vi.mock('./planet/BaseCampInterior', () => ({
  BaseCampInterior: ({
    planet,
    onExit,
    onAccessComputer,
    onLeaveComputer,
    computerActive,
    bootStartedAt,
  }: {
    planet: { displayName: string };
    onExit: () => void;
    onAccessComputer: () => void;
    onLeaveComputer: () => void;
    computerActive: boolean;
    bootStartedAt?: number | null;
  }) => (
    <section
      aria-label={`${planet.displayName} base camp interior`}
      data-computer-boot-started={bootStartedAt ? 'true' : 'false'}
    >
      {computerActive ? (
        <button type="button" aria-label="Stand up from the mission computer" onClick={onLeaveComputer} />
      ) : (
        <button type="button" aria-label="Sit down at the mission computer" onClick={onAccessComputer} />
      )}
      <button type="button" onClick={onExit}>Exit Base Camp</button>
    </section>
  ),
}));

describe('PlanetSurface accessibility', () => {
  beforeEach(() => {
    useGameState.setState({
      currentView: 'planet',
      selectedPlanet: 'earth',
      isTransitioning: false,
      travelDirection: null,
      announcement: 'Arrived at Earth. Planet surface ready.',
    });
  });

  it('focuses the arrival heading and names icon-only navigation controls', () => {
    render(<PlanetSurface />);

    expect(screen.getByRole('heading', { name: /earth planet surface/i })).toHaveFocus();
    expect(screen.getByRole('button', { name: /travel to previous planet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /travel to next planet/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/arrived at earth/i);
  });

  it('applies the destination theme and renders fixed environmental telemetry', () => {
    render(<PlanetSurface />);

    const themedSurface = screen.getByRole('heading', { name: /earth planet surface/i })
      .closest('[data-planet-theme="earth"]');
    expect(themedSurface).toHaveAttribute('data-habitat-family', 'terrestrial-research');
    expect(themedSurface).toHaveAttribute('data-ambient-animation', 'cloud-drift');
    expect(screen.getByText('SURFACE TEMP: 15°C')).toBeInTheDocument();
    expect(screen.getByText('ATMOSPHERE: N₂ / O₂')).toBeInTheDocument();
    expect(screen.getByText('O₂ RESERVE: 100%')).toBeInTheDocument();
    expect(screen.getByText('COMMS: COUNTY NETWORK')).toBeInTheDocument();
  });

  it('makes the covered surface inert and restores focus after exiting the base camp', async () => {
    render(<PlanetSurface />);
    const surfaceHeading = screen.getByRole('heading', { name: /earth planet surface/i });
    const enterButton = screen.getByRole('button', { name: /enter the base camp on earth/i });
    enterButton.focus();
    fireEvent.click(enterButton);

    const surfaceContent = surfaceHeading.closest('[aria-hidden="true"]');
    expect(surfaceContent).not.toBeNull();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sit down at the mission computer/i })).toHaveFocus();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Exit Base Camp' }));
    await waitFor(() => expect(enterButton).toHaveFocus());
    expect(useGameState.getState().announcement).toMatch(/exited the earth base camp/i);
  });

  it('moves focus to the visible computer controls as seated state changes', async () => {
    render(<PlanetSurface />);
    fireEvent.click(screen.getByRole('button', { name: /enter the base camp on earth/i }));
    const interior = screen.getByRole('region', { name: /earth base camp interior/i });
    expect(interior).toHaveAttribute('data-computer-boot-started', 'false');
    const sitButton = await screen.findByRole('button', { name: /sit down at the mission computer/i });
    fireEvent.click(sitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stand up from the mission computer/i })).toHaveFocus();
    });
    expect(interior).toHaveAttribute('data-computer-boot-started', 'true');
    fireEvent.click(screen.getByRole('button', { name: /stand up from the mission computer/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sit down at the mission computer/i })).toHaveFocus();
    });
  });
});
