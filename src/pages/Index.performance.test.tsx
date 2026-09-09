import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameState } from '@/hooks/useGameState';
import Index from './Index';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

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

const renderIndex = () => render(<MemoryRouter><Index /></MemoryRouter>);

const renderPlanetIndex = (planetId: string) => render(
  <MemoryRouter initialEntries={[`/explore/${planetId}`]}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/explore/:planetId" element={<Index />} />
    </Routes>
  </MemoryRouter>,
);

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

    renderIndex();
    fireEvent.click(screen.getByRole('button', { name: 'View Quick Portfolio' }));

    expect(await screen.findByRole('dialog', { name: 'Quick Portfolio' })).toBeInTheDocument();
    expect(getContext).not.toHaveBeenCalled();
    expect(screen.queryByTestId('solar-system')).not.toBeInTheDocument();
  });

  it('loads the immersive route only after Launch exploration confirms WebGL', async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => webGLContext as unknown as GPUCanvasContext);

    renderIndex();
    expect(screen.queryByTestId('solar-system')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Launch exploration' }));

    expect(await screen.findByTestId('solar-system')).toBeInTheDocument();
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(screen.getByRole('navigation', { name: 'Space navigation' })).toBeInTheDocument();
  });

  it('starts the hands-on tutorial without automatically selecting a destination', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => webGLContext as unknown as GPUCanvasContext);

    renderIndex();
    fireEvent.click(screen.getByRole('button', { name: 'Start tutorial' }));

    expect(await screen.findByTestId('solar-system')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Start with the Sun' })).toBeInTheDocument();
    expect(useGameState.getState().selectedPlanet).toBeNull();
  });

  it('keeps the complete portfolio reachable when WebGL is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    renderIndex();
    fireEvent.click(screen.getByRole('button', { name: 'Launch exploration' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Immersive exploration is unavailable');
    expect(screen.queryByRole('button', { name: 'Launch exploration' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View Quick Portfolio' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Quick Portfolio' })).toBeInTheDocument();
    });
  });

  it('returns from a planet to the solar-system map instead of the route chooser', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => webGLContext as unknown as GPUCanvasContext);
    renderPlanetIndex('mars');

    expect(await screen.findByText('Planet surface')).toBeInTheDocument();

    act(() => useGameState.getState().returnToSpace());
    act(() => useGameState.getState().skipTravel());

    expect(await screen.findByTestId('solar-system')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Choose your route' })).not.toBeInTheDocument();
  });
});
