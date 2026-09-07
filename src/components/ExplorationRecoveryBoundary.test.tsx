import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExplorationRecoveryBoundary } from './ExplorationRecoveryBoundary';

let shouldThrow = true;

const FragileExploration = () => {
  if (shouldThrow) throw new Error('WebGL renderer failed');
  return <p>Exploration restored</p>;
};

describe('ExplorationRecoveryBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('offers a safe route reset after an exploration render failure', () => {
    const onReset = vi.fn(() => { shouldThrow = false; });

    render(
      <ExplorationRecoveryBoundary
        resetKey="active:space"
        onReset={onReset}
        onOpenQuickPortfolio={() => {}}
      >
        <FragileExploration />
      </ExplorationRecoveryBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/exploration paused safely/i);
    fireEvent.click(screen.getByRole('button', { name: /return to route selection/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Exploration restored')).toBeInTheDocument();
  });

  it('keeps Quick Portfolio available from recovery mode', () => {
    const onOpenQuickPortfolio = vi.fn();

    render(
      <ExplorationRecoveryBoundary
        resetKey="active:planet"
        onReset={() => {}}
        onOpenQuickPortfolio={onOpenQuickPortfolio}
      >
        <FragileExploration />
      </ExplorationRecoveryBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open quick portfolio/i }));
    expect(onOpenQuickPortfolio).toHaveBeenCalledTimes(1);
  });
});
