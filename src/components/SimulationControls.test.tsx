import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSimulationState } from '@/hooks/useSimulationState';
import { SimulationControls } from './SimulationControls';

describe('SimulationControls', () => {
  beforeEach(() => useSimulationState.getState().resetSimulation());

  it('exposes every named speed as an accessible pressed-state control', () => {
    render(<SimulationControls />);
    for (const label of ['Real Time', '100x', '1,000x', '5,000x', 'Mission Speed', 'Super Fast']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Mission Speed' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('selects a speed without modifying the accumulated clocks', () => {
    useSimulationState.setState({ orbitElapsedSeconds: 42, rotationElapsedSeconds: 24 });
    render(<SimulationControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Super Fast' }));

    expect(useSimulationState.getState()).toMatchObject({
      speedPresetId: 'super-fast',
      orbitElapsedSeconds: 42,
      rotationElapsedSeconds: 24,
    });
    expect(screen.getByTestId('simulation-scale-description')).toHaveTextContent(/Earth year takes 15 seconds/i);
  });

  it('pauses and resumes with an announced state', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Simulation paused.');

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByRole('status')).toHaveTextContent('Simulation running at Mission Speed.');
  });
});
