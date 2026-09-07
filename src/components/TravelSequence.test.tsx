import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameState } from '@/hooks/useGameState';
import { TravelSequence } from './TravelSequence';

describe('TravelSequence', () => {
  beforeEach(() => {
    useGameState.setState({
      currentView: 'traveling',
      selectedPlanet: 'mars',
      travelDirection: 'toPlanet',
    });
  });

  it('shows the selected planet as the ship destination before arrival', () => {
    const { container } = render(<TravelSequence />);
    expect(screen.getByText('Mars')).toBeInTheDocument();
    expect(screen.getByText('DESTINATION APPROACH ACTIVE')).toBeInTheDocument();
    expect(container.querySelector('[data-destination-planet="mars"]')).toBeInTheDocument();
  });

  it('omits the destination planet while returning to space', () => {
    useGameState.setState({ travelDirection: 'toSpace' });
    const { container } = render(<TravelSequence />);
    expect(screen.getByText('Solar System')).toBeInTheDocument();
    expect(container.querySelector('[data-destination-planet]')).not.toBeInTheDocument();
  });

  it('provides a focused skip action and announces the travel state', () => {
    useGameState.setState({ announcement: 'Close approach to Mars.' });
    render(<TravelSequence />);

    const skipButton = screen.getByRole('button', { name: /skip travel/i });
    expect(skipButton).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Close approach to Mars.');

    fireEvent.click(skipButton);
    expect(useGameState.getState()).toMatchObject({
      currentView: 'planet',
      isTransitioning: false,
      travelDirection: null,
    });
  });
});
