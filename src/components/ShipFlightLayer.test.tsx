import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameState } from '@/hooks/useGameState';
import { ShipFlightLayer } from './ShipFlightLayer';

describe('ShipFlightLayer', () => {
  beforeEach(() => {
    useGameState.setState({ currentView: 'space', travelDirection: null });
  });

  it('leaves solar-system cruising to the 3D ship', () => {
    const { container } = render(<ShipFlightLayer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('stays hidden during the solar-system interception', () => {
    useGameState.setState({ currentView: 'intercepting', travelDirection: 'toPlanet' });
    const { container } = render(<ShipFlightLayer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('switches to an approach flight while traveling to a planet', () => {
    useGameState.setState({ currentView: 'traveling', travelDirection: 'toPlanet' });
    const { container } = render(<ShipFlightLayer />);
    expect(container.querySelector('[data-flight-mode="approaching-planet"]')).toBeInTheDocument();
  });

  it('does not cover the planet surface after arrival', () => {
    useGameState.setState({ currentView: 'planet', travelDirection: null });
    const { container } = render(<ShipFlightLayer />);
    expect(container).toBeEmptyDOMElement();
  });
});
