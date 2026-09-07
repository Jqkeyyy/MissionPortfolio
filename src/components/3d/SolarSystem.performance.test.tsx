import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { getGraphicsProfile, registerWebGLContextLoss, SolarSystem } from './SolarSystem';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ fallback }: { fallback: React.ReactNode }) => fallback,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
}));

vi.mock('./StarField', () => ({ StarField: () => null }));
vi.mock('./Sun', () => ({ Sun: () => null }));
vi.mock('./PlanetMesh', () => ({ PlanetMesh: () => null }));
vi.mock('./OrbitRing', () => ({ OrbitRing: () => null }));
vi.mock('./SolarSystemShip', () => ({ SolarSystemShip: () => null }));

describe('SolarSystem capability handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('offers Quick Portfolio without reporting a failure merely because fallback content mounts', () => {
    const onUnavailable = vi.fn();
    const onOpenQuickPortfolio = vi.fn();

    render(
      <SolarSystem
        onUnavailable={onUnavailable}
        onOpenQuickPortfolio={onOpenQuickPortfolio}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Immersive view unavailable');
    expect(onUnavailable).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'View Quick Portfolio' }));
    expect(onOpenQuickPortfolio).toHaveBeenCalledTimes(1);
  });

  it('uses a lower-cost profile for constrained devices', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getGraphicsProfile()).toEqual({
      dpr: [1, 1],
      starCount: 2200,
      antialias: false,
      powerPreference: 'low-power',
    });
  });

  it('rewrites only the Three.js shuttle texture to the optimized candidate', () => {
    expect(THREE.DefaultLoadingManager.resolveURL('/mission-shuttle.png')).toBe(
      '/optimized/mission-shuttle.webp',
    );
    expect(THREE.DefaultLoadingManager.resolveURL('/unrelated.png')).toBe('/unrelated.png');
  });

  it('reports WebGL context loss and removes its listener on cleanup', () => {
    const canvas = document.createElement('canvas');
    const onUnavailable = vi.fn();
    const cleanup = registerWebGLContextLoss(canvas, onUnavailable);
    const event = new Event('webglcontextlost', { cancelable: true });

    canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onUnavailable).toHaveBeenCalledTimes(1);

    cleanup();
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });
});
