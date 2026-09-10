import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { SpaceHUD } from './SpaceHUD';
import { useGameState } from '@/hooks/useGameState';
import { PLANET_THEME_IDS } from '@/data/planetThemes';
import { explorationProgressStore } from '@/lib/explorationProgress';
import { useChaosMode } from '@/features/endgame/useChaosMode';

describe('SpaceHUD', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    useGameState.setState({
      currentView: 'space',
      selectedPlanet: null,
      isTransitioning: false,
      travelDirection: null,
      quickPortfolioOpen: false,
      announcement: 'Solar system map ready. Select a destination to begin exploring.',
    });
    explorationProgressStore.clearProgress();
    useChaosMode.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a destination button for every planet plus the intro', () => {
    render(<SpaceHUD />);
    expect(screen.getByRole('button', { name: /intro/i })).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Neptune')).toBeInTheDocument();
  });

  it('anchors both space title lines to the horizontal center', () => {
    render(<SpaceHUD />);

    const titleOverlay = screen.getByTestId('space-title-overlay');
    expect(titleOverlay).toHaveClass('left-1/2', '-translate-x-1/2', 'text-center');
    expect(titleOverlay).toContainElement(screen.getByRole('heading', { name: 'Mission Portfolio' }));
    expect(titleOverlay).toContainElement(screen.getByText(/Jake Sass/));
  });

  it('calls travelToPlanet with the planet id when a destination is clicked', () => {
    render(<SpaceHUD />);
    fireEvent.click(screen.getByText('Earth'));
    expect(useGameState.getState().selectedPlanet).toBe('earth');
  });

  it('crosses out visited destinations without disabling them', () => {
    explorationProgressStore.markVisited('earth');
    render(<SpaceHUD />);

    const earthLabels = screen.getAllByText('Earth');
    earthLabels.forEach((label) => expect(label).toHaveClass('line-through'));
    const earthButton = earthLabels[0].closest('button');
    expect(earthButton).not.toBeDisabled();
    fireEvent.click(earthButton!);
    expect(useGameState.getState().selectedPlanet).toBe('earth');
  });

  it('shows a visible interception status while the shuttle crosses the solar system', () => {
    useGameState.setState({
      currentView: 'intercepting',
      selectedPlanet: 'mars',
      isTransitioning: true,
      travelDirection: 'toPlanet',
    });

    render(<SpaceHUD />);

    expect(screen.getByTestId('solar-intercept-status')).toBeInTheDocument();
    expect(screen.getByText(/shuttle en route to mars/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/solar system map ready/i);
    expect(screen.getByRole('button', { name: /skip travel/i })).toHaveFocus();
  });

  it('exposes and focuses the mobile destination menu, then restores focus on Escape', async () => {
    render(<SpaceHUD />);
    const toggle = screen.getByRole('button', { name: /select destination/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const destinationMenu = screen.getByRole('navigation', {
      name: /mobile solar system destinations/i,
    });
    expect(destinationMenu).toHaveAttribute('id', 'mobile-destination-menu');
    await waitFor(() => {
      expect(within(destinationMenu).getByRole('button', { name: /intro/i })).toHaveFocus();
    });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('skips the solar intercept from its keyboard-focused action', () => {
    useGameState.setState({
      currentView: 'intercepting',
      selectedPlanet: 'mars',
      isTransitioning: true,
      travelDirection: 'toPlanet',
    });
    render(<SpaceHUD />);

    fireEvent.click(screen.getByRole('button', { name: /skip travel/i }));
    expect(useGameState.getState()).toMatchObject({
      currentView: 'planet',
      isTransitioning: false,
    });
  });

  it('shows hud-corners brackets on the desktop destination buttons', () => {
    render(<SpaceHUD />);
    expect(screen.getAllByTestId('hud-corners').length).toBeGreaterThan(0);
  });

  it('discloses the separate readable orbit and spin time scales', () => {
    render(<SpaceHUD />);
    expect(screen.getByText('ORBIT_SCALE: 1Y / 60S')).toBeInTheDocument();
    expect(screen.getByText('SPIN_SCALE: 1D / 12S')).toBeInTheDocument();
  });

  it('opens Quick Portfolio from both desktop and mobile controls', () => {
    render(<SpaceHUD />);

    fireEvent.click(screen.getByTestId('desktop-quick-portfolio'));
    expect(useGameState.getState().quickPortfolioOpen).toBe(true);

    act(() => useGameState.getState().closeQuickPortfolio());
    fireEvent.click(screen.getByTestId('mobile-quick-portfolio'));
    expect(useGameState.getState().quickPortfolioOpen).toBe(true);
  });

  it('offers the interactive tutorial from desktop and mobile HUD controls', () => {
    const onStartTutorial = vi.fn();
    render(<SpaceHUD onStartTutorial={onStartTutorial} />);

    const tutorialButtons = screen.getAllByRole('button', { name: 'Start tutorial' });
    expect(tutorialButtons).toHaveLength(2);
    fireEvent.click(tutorialButtons[0]);
    expect(onStartTutorial).toHaveBeenCalledTimes(1);
  });

  it('unlocks the anomaly console after all ten destinations are visited', () => {
    const onRevealEventHorizon = vi.fn();
    const onOpenCosmicArchitect = vi.fn();
    PLANET_THEME_IDS.forEach((id) => explorationProgressStore.markVisited(id));
    render(
      <SpaceHUD
        onRevealEventHorizon={onRevealEventHorizon}
        onOpenCosmicArchitect={onOpenCosmicArchitect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enable Chaos Mode' }));
    expect(useChaosMode.getState().enabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Reveal the Event Horizon' }));
    expect(onRevealEventHorizon).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Cosmic Architect' }));
    expect(onOpenCosmicArchitect).toHaveBeenCalledOnce();
  });
});
