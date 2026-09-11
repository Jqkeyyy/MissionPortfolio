import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useImpossibleAchievement } from '@/features/endgame/impossibleAchievement';
import { ImpossibleAchievement } from './ImpossibleAchievement';

describe('ImpossibleAchievement', () => {
  beforeEach(() => useImpossibleAchievement.setState({ completed: [] }));

  it('shows cross-feature progress and the final unlock', () => {
    const { rerender } = render(<ImpossibleAchievement open onOpenChange={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('The Impossible Achievement');
    expect(screen.getByRole('status')).toHaveTextContent('0 / 5');

    act(() => useImpossibleAchievement.setState({ completed: ['fusion', 'gravity', 'pet', 'disco', 'rogue'] }));
    rerender(<ImpossibleAchievement open onOpenChange={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('REALITY WARRANTY VOIDED');
  });

  it('allows the visitor to reset challenge progress', () => {
    act(() => useImpossibleAchievement.setState({ completed: ['fusion'] }));
    render(<ImpossibleAchievement open onOpenChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset challenge' }));
    expect(useImpossibleAchievement.getState().completed).toEqual([]);
  });
});
