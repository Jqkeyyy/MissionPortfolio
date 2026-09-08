import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSimulationState } from '@/hooks/useSimulationState';
import { SimulationClock } from './SimulationClock';

let frameCallback: ((_state: unknown, delta: number) => void) | undefined;
let framePriority: number | undefined;

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: (_state: unknown, delta: number) => void, priority?: number) => {
    frameCallback = callback;
    framePriority = priority;
  },
}));

describe('SimulationClock', () => {
  beforeEach(() => {
    frameCallback = undefined;
    framePriority = undefined;
    useSimulationState.getState().resetSimulation();
    useSimulationState.getState().setSpeedPreset('real-time');
  });

  it('advances the shared accumulated clock once per rendered frame', () => {
    render(<SimulationClock />);
    expect(framePriority).toBe(-100);
    act(() => frameCallback?.({}, 0.25));
    expect(useSimulationState.getState().orbitElapsedSeconds).toBe(0.25);
  });

  it('leaves the clock frozen while paused', () => {
    useSimulationState.getState().setPaused(true);
    render(<SimulationClock />);
    act(() => frameCallback?.({}, 2));
    expect(useSimulationState.getState().orbitElapsedSeconds).toBe(0);
  });
});
