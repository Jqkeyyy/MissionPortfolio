import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlanetFusion } from '@/features/endgame/planetFusionState';
import { PlanetFusionPanel } from './PlanetFusionPanel';

describe('PlanetFusionPanel', () => {
  beforeEach(() => usePlanetFusion.getState().reset());

  it('is absent while closed and exposes an accessible named dialog when opened', () => {
    const { rerender } = render(<PlanetFusionPanel open={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<PlanetFusionPanel open onOpenChange={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Planet Fusion');
    expect(screen.getByRole('combobox', { name: 'Primary world' })).toHaveValue('mars');
    expect(screen.getByRole('combobox', { name: 'Secondary world' })).toHaveValue('saturn');
    expect(screen.getByRole('heading', { name: 'Marsurn' })).toBeInTheDocument();
  });

  it('previews selections and prevents duplicate world choices', () => {
    render(<PlanetFusionPanel open onOpenChange={() => {}} />);
    const primary = screen.getByRole('combobox', { name: 'Primary world' });
    const secondary = screen.getByRole('combobox', { name: 'Secondary world' });
    expect(primary.querySelector('option[value="saturn"]')).toBeDisabled();
    expect(secondary.querySelector('option[value="mars"]')).toBeDisabled();

    fireEvent.change(secondary, { target: { value: 'neptune' } });
    expect(screen.getByRole('button', { name: /fuse into marstune/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cratered regolith.*banded atmosphere/i })).toBeInTheDocument();
  });

  it('activates and releases the fusion through callbacks and shared state', () => {
    const onFusionActivated = vi.fn();
    const onFusionReleased = vi.fn();
    render(
      <PlanetFusionPanel
        open
        onOpenChange={() => {}}
        onFusionActivated={onFusionActivated}
        onFusionReleased={onFusionReleased}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fuse into Marsurn' }));
    expect(onFusionActivated).toHaveBeenCalledWith(expect.objectContaining({ name: 'Marsurn' }));
    expect(usePlanetFusion.getState().activeFusion?.name).toBe('Marsurn');
    expect(screen.getByRole('status')).toHaveTextContent(/stabilized/i);

    fireEvent.click(screen.getByRole('button', { name: 'Release Marsurn' }));
    expect(onFusionReleased).toHaveBeenCalledWith(expect.objectContaining({ name: 'Marsurn' }));
    expect(usePlanetFusion.getState().activeFusion).toBeNull();
  });
});
