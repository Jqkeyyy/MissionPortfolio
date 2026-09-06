import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { SpaceHUD } from './SpaceHUD';
import { useGameState } from '@/hooks/useGameState';

describe('SpaceHUD', () => {
  beforeEach(() => {
    useGameState.setState({ currentView: 'space', selectedPlanet: null, quickPortfolioOpen: false });
  });

  it('renders a destination button for every planet plus the intro', () => {
    render(<SpaceHUD />);
    expect(screen.getByText('☀ Intro')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Neptune')).toBeInTheDocument();
  });

  it('calls travelToPlanet with the planet id when a destination is clicked', () => {
    render(<SpaceHUD />);
    fireEvent.click(screen.getByText('Earth'));
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
  });

  it('shows hud-corners brackets on the desktop destination buttons', () => {
    render(<SpaceHUD />);
    expect(screen.getAllByTestId('hud-corners').length).toBeGreaterThan(0);
  });

  it('opens Quick Portfolio from both desktop and mobile controls', () => {
    render(<SpaceHUD />);

    fireEvent.click(screen.getByTestId('desktop-quick-portfolio'));
    expect(useGameState.getState().quickPortfolioOpen).toBe(true);

    act(() => useGameState.getState().closeQuickPortfolio());
    fireEvent.click(screen.getByTestId('mobile-quick-portfolio'));
    expect(useGameState.getState().quickPortfolioOpen).toBe(true);
  });
});
