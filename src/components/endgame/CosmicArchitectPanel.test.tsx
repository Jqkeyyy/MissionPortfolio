import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { planets } from '@/data/planets';
import { useCosmicArchitect } from '@/features/endgame/useCosmicArchitect';
import { CosmicArchitectPanel } from './CosmicArchitectPanel';

describe('CosmicArchitectPanel', () => {
  beforeEach(() => useCosmicArchitect.getState().resetAll());

  it('is a controlled, named dialog that never offers the Sun', () => {
    render(<CosmicArchitectPanel open onOpenChange={vi.fn()} planets={planets} />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Cosmic Architect');
    const selector = screen.getByRole('combobox', { name: 'World' });
    expect(selector).toHaveValue('mercury');
    expect(screen.queryByRole('option', { name: 'The Sun' })).not.toBeInTheDocument();
  });

  it('updates a selected world through accessible controls and resets it', () => {
    render(<CosmicArchitectPanel open onOpenChange={vi.fn()} planets={planets} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'World' }), {
      target: { value: 'earth' },
    });
    fireEvent.change(screen.getByRole('slider', { name: 'World size' }), {
      target: { value: '1.75' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Retrograde' }));

    expect(useCosmicArchitect.getState().overrides.earth).toMatchObject({
      sizeMultiplier: 1.75,
      orbitDirection: -1,
    });
    expect(screen.getByRole('button', { name: 'Retrograde' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Reset Earth' }));
    expect(useCosmicArchitect.getState().overrides.earth).toBeUndefined();
    expect(screen.getByRole('slider', { name: 'World size' })).toHaveValue('1');
  });

  it('resets every modified world in one action', () => {
    render(<CosmicArchitectPanel open onOpenChange={vi.fn()} planets={planets} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Color hue' }), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'World' }), {
      target: { value: 'mars' },
    });
    fireEvent.change(screen.getByRole('slider', { name: 'Axial tilt' }), {
      target: { value: '75' },
    });

    expect(Object.keys(useCosmicArchitect.getState().overrides)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Reset all worlds' }));
    expect(useCosmicArchitect.getState().overrides).toEqual({});
  });
});
