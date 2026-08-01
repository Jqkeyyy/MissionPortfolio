import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseCampInterior } from './BaseCampInterior';
import { planets } from '@/data/planets';

describe('BaseCampInterior', () => {
  const planet = planets.find((p) => p.id === 'mars')!;

  it('renders the interior header with the planet name', () => {
    render(<BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={() => {}} />);
    expect(screen.getByText('BASE CAMP INTERIOR')).toBeInTheDocument();
    expect(screen.getAllByText(planet.displayName).length).toBeGreaterThan(0);
  });

  it('calls onAccessComputer when the terminal is clicked', () => {
    const onAccessComputer = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={onAccessComputer} />);
    fireEvent.click(screen.getByText('MISSION TERMINAL').closest('button')!);
    expect(onAccessComputer).toHaveBeenCalledTimes(1);
  });

  it('calls onExit when the bottom exit button is clicked', () => {
    const onExit = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={onExit} onAccessComputer={() => {}} />);
    fireEvent.click(screen.getByText('Exit Base Camp'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
