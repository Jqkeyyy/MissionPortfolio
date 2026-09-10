import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NullSector } from './NullSector';

describe('NullSector', () => {
  it('only renders while the event-horizon destination is open', () => {
    const { rerender } = render(<NullSector open={false} onReturn={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<NullSector open onReturn={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('NULL SECTOR');
    expect(screen.getByRole('heading', { level: 1, name: 'NULL SECTOR' })).toHaveFocus();
  });

  it('returns through both the visible control and Escape', () => {
    const onReturn = vi.fn();
    const { rerender } = render(<NullSector open onReturn={onReturn} />);
    fireEvent.click(screen.getByRole('button', { name: /return through wormhole/i }));
    expect(onReturn).toHaveBeenCalledTimes(1);

    rerender(<NullSector open={false} onReturn={onReturn} />);
    rerender(<NullSector open onReturn={onReturn} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onReturn).toHaveBeenCalledTimes(2);
  });
});
