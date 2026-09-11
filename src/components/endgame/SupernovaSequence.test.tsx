import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupernovaSequence } from './SupernovaSequence';

describe('SupernovaSequence', () => {
  afterEach(() => vi.useRealTimers());

  it('requires confirmation and preserves control until the cinematic completes', () => {
    vi.useFakeTimers();
    const onReform = vi.fn();
    const onOpenChange = vi.fn();
    render(<SupernovaSequence open onOpenChange={onOpenChange} onReform={onReform} />);

    fireEvent.click(screen.getByRole('button', { name: 'Initiate supernova' }));
    expect(screen.getByRole('status')).toHaveTextContent('PLEASE STAND BY');
    expect(onReform).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(2500));
    fireEvent.click(screen.getByRole('button', { name: 'Enter New Game+' }));
    expect(onReform).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('can be exited before activation', () => {
    const onOpenChange = vi.fn();
    render(<SupernovaSequence open onOpenChange={onOpenChange} onReform={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Return without changes' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
