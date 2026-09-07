import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameState } from '@/hooks/useGameState';
import Index from './Index';

vi.mock('@/components/3d/SolarSystem', () => ({
  SolarSystem: () => <div data-testid="solar-system">Solar system</div>,
}));

vi.mock('@/components/SpaceHUD', () => ({
  SpaceHUD: () => <nav aria-label="Space navigation">Space HUD</nav>,
}));

vi.mock('@/components/TravelSequence', () => ({
  TravelSequence: () => <div>Travel sequence</div>,
}));

vi.mock('@/components/PlanetSurface', () => ({
  PlanetSurface: () => <div>Planet surface</div>,
}));

vi.mock('@/components/ShipFlightLayer', () => ({
  ShipFlightLayer: () => <div>Ship flight layer</div>,
}));

vi.mock('@/components/quick-portfolio', () => ({
  QuickPortfolio: ({ onClose }: { onClose: () => void }) => (
    <section role="dialog" aria-label="Quick Portfolio">
      Quick Portfolio content
      <button type="button" onClick={onClose}>Close portfolio</button>
    </section>
  ),
}));

const webGLContext = {
  getExtension: vi.fn(() => null),
} as unknown as WebGLRenderingContext;

describe('performance entry path', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useGameState.setState({
      currentView: 'space',
      selectedPlanet: null,
      previousPlanet: null,
      isTransitioning: false,
      travelDirection: null,
      activeSign: null,
      quickPortfolioOpen: false,
    });
  });

  it('opens Quick Portfolio without probing or initializing WebGL', async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => {
        throw new Error('WebGL should not be requested');
      });

    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'View Quick Portfolio' }));

    expect(await screen.findByRole('dialog', { name: 'Quick Portfolio' })).toBeInTheDocument();
    expect(getContext).not.toHaveBeenCalled();
    expect(screen.queryByTestId('solar-system')).not.toBeInTheDocument();
  });

  it('loads the immersive route only after Launch exploration confirms WebGL', async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => webGLContext as unknown as GPUCanvasContext);

    render(<Index />);
    expect(screen.queryByTestId('solar-system')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Launch exploration' }));

    expect(await screen.findByTestId('solar-system')).toBeInTheDocument();
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(screen.getByRole('navigation', { name: 'Space navigation' })).toBeInTheDocument();
  });

  it('keeps the complete portfolio reachable when WebGL is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Launch exploration' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Immersive exploration is unavailable');
    expect(screen.queryByRole('button', { name: 'Launch exploration' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View Quick Portfolio' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Quick Portfolio' })).toBeInTheDocument();
    });
  });
});
