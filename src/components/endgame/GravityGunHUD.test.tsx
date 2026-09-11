import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { planets } from '@/data/planets';
import { useGravityGun } from '@/features/endgame/gravityGunStore';
import { GravityGunHUD } from './GravityGunHUD';

describe('GravityGunHUD', () => {
  beforeEach(() => useGravityGun.getState().restoreAll());

  it('offers every non-Sun world and fires touch-friendly vector controls', () => {
    const onFire = vi.fn();
    render(<GravityGunHUD open onOpenChange={vi.fn()} planets={planets} onFire={onFire} />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Gravity Gun');
    expect(screen.queryByRole('option', { name: 'The Sun' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Target world' }), {
      target: { value: 'earth' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Push right (→)' }));

    expect(useGravityGun.getState().motions.earth?.velocity.x).toBe(6);
    expect(onFire).toHaveBeenCalledWith('earth', { x: 1, y: 0, z: 0 }, 6);
  });

  it('supports keyboard launches, selected restore, and Escape emergency restore', () => {
    const onOpenChange = vi.fn();
    render(<GravityGunHUD open onOpenChange={onOpenChange} planets={planets} />);

    screen.getByRole('button', { name: 'Push right (→)' }).focus();
    fireEvent.keyDown(window, { key: 'PageUp' });
    expect(useGravityGun.getState().motions.mercury?.velocity.y).toBe(6);

    fireEvent.keyDown(window, { key: 'r' });
    expect(useGravityGun.getState().motions.mercury).toBeUndefined();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useGravityGun.getState().motions).toEqual({});
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
