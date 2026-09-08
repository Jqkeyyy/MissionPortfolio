import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLANET_THEME_IDS } from '@/data/planetThemes';
import { createExplorationProgressStore } from '@/lib/explorationProgress';
import { ExplorationProgress } from './ExplorationProgress';

describe('ExplorationProgress', () => {
  it('exposes native progress semantics and destination visit states', () => {
    const store = createExplorationProgressStore(null);
    store.markVisited('earth');
    render(<ExplorationProgress store={store} />);

    expect(screen.getByRole('progressbar', { name: /solar system exploration progress/i }))
      .toHaveAttribute('value', '1');
    expect(screen.getByText('1/10 destinations explored')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Destination status'));
    const list = screen.getByRole('list', { name: /destination visit status/i });
    expect(within(list).getAllByText('Visited')).toHaveLength(1);
    expect(within(list).getAllByText('Not visited')).toHaveLength(9);
  });

  it('announces and dismisses the completion achievement', () => {
    const store = createExplorationProgressStore(null);
    PLANET_THEME_IDS.forEach((id) => store.markVisited(id));
    render(<ExplorationProgress store={store} />);

    expect(screen.getByRole('status')).toHaveTextContent(/mission complete/i);
    fireEvent.click(screen.getByRole('button', { name: /dismiss achievement/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('requires confirmation before clearing progress', () => {
    const store = createExplorationProgressStore(null);
    store.markVisited('neptune');
    render(<ExplorationProgress store={store} />);

    fireEvent.click(screen.getByRole('button', { name: /clear exploration progress/i }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent(/cannot be undone/i);
    expect(screen.getByText('1/10 destinations explored')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /^clear progress$/i }));
    expect(screen.getByText('0/10 destinations explored')).toBeInTheDocument();
  });
});
