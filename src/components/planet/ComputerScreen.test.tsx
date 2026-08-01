import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComputerScreen } from './ComputerScreen';
import { planets } from '@/data/planets';

describe('ComputerScreen', () => {
  const planet = planets.find((p) => p.id === 'earth')!;

  it('renders a menu item for each piece of content', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} onSelectItem={() => {}} />);
    for (const item of planet.content) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('calls onSelectItem with the clicked item', () => {
    const onSelectItem = vi.fn();
    render(<ComputerScreen planet={planet} onClose={() => {}} onSelectItem={onSelectItem} />);
    fireEvent.click(screen.getByText(planet.content[0].title));
    expect(onSelectItem).toHaveBeenCalledWith(planet.content[0]);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<ComputerScreen planet={planet} onClose={onClose} onSelectItem={() => {}} />);
    fireEvent.click(screen.getByTestId('computer-screen-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
