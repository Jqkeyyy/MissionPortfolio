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
    expect(document.querySelector('img')).toHaveAttribute('src', '/base-camp-interior-v6-stool.png');
    expect(document.querySelector('source')).toHaveAttribute(
      'srcset',
      '/optimized/base-camp-interior-v6-stool.webp',
    );
    expect(screen.getByLabelText('Mars base camp interior')).toHaveAttribute(
      'data-habitat-family',
      'solar-industrial',
    );
    expect(screen.getByText(/prototype sketches surround a rugged workbench/i)).toBeInTheDocument();
    expect(screen.getByText('101 kPa')).toBeInTheDocument();
    expect(screen.getByText('Builder channel')).toBeInTheDocument();
  });

  it('calls onAccessComputer when the terminal is clicked', () => {
    const onAccessComputer = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={onAccessComputer} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sit down at the mission computer' }));
    expect(onAccessComputer).toHaveBeenCalledTimes(1);
  });

  it('offers a clickable stool in front of the mission computer', () => {
    const onAccessComputer = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={onAccessComputer} />);
    fireEvent.click(screen.getByText('SIT DOWN TO VIEW').closest('button')!);
    expect(onAccessComputer).toHaveBeenCalledTimes(1);
    expect(screen.getByText('SIT DOWN TO VIEW').closest('button')).toHaveAttribute('data-tutorial-target', 'sit-computer');
  });

  it('calls onExit when the bottom exit button is clicked', () => {
    const onExit = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={onExit} onAccessComputer={() => {}} />);
    fireEvent.click(screen.getByText('Exit Base Camp'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('leaves Escape handling to the computer while the operator is seated', () => {
    const onExit = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={onExit} onAccessComputer={() => {}} computerActive />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onExit).not.toHaveBeenCalled();
  });

  it('keeps the monitor asleep until the operator sits down', () => {
    const { rerender } = render(
      <BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={() => {}} />,
    );
    expect(screen.queryByText('HAB/OS')).not.toBeInTheDocument();

    rerender(
      <BaseCampInterior
        planet={planet}
        onExit={() => {}}
        onAccessComputer={() => {}}
        computerActive
        bootStartedAt={Date.now()}
      />,
    );
    expect(screen.getByText('HAB/OS')).toBeInTheDocument();
    expect(screen.getByText(/waking mars mission station/i)).toBeInTheDocument();
  });

  it('lazily loads an interactive desktop inside the physical monitor when seated', async () => {
    render(
      <BaseCampInterior
        planet={planet}
        onExit={() => {}}
        onAccessComputer={() => {}}
        onLeaveComputer={() => {}}
        computerActive
        bootStartedAt={Date.now() - 5000}
      />,
    );

    fireEvent.click(await screen.findByTestId('desktop-archive', {}, { timeout: 5000 }));
    expect(screen.getByRole('dialog', { name: `${planet.displayName} Mission Archive` })).toBeInTheDocument();
  });

  it('offers a stand-up button while seated at the computer', () => {
    const onLeaveComputer = vi.fn();
    render(
      <BaseCampInterior
        planet={planet}
        onExit={() => {}}
        onAccessComputer={() => {}}
        onLeaveComputer={onLeaveComputer}
        computerActive
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Stand up from the mission computer' }));
    expect(onLeaveComputer).toHaveBeenCalledTimes(1);
  });
});
