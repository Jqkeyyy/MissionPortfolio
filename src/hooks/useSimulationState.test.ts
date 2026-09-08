import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SIMULATION_SPEED_PRESET_ID,
  getSimulationSpeedPreset,
  MISSION_ORBIT_TIME_FACTOR,
  MISSION_ROTATION_TIME_FACTOR,
  SIMULATION_SPEED_PRESETS,
  useSimulationState,
} from './useSimulationState';

describe('useSimulationState', () => {
  beforeEach(() => useSimulationState.getState().resetSimulation());

  it('offers the requested named modes and defaults to Mission Speed', () => {
    expect(SIMULATION_SPEED_PRESETS.map(({ label }) => label)).toEqual([
      'Real Time', '100x', '1,000x', '5,000x', 'Mission Speed', 'Super Fast',
    ]);
    expect(DEFAULT_SIMULATION_SPEED_PRESET_ID).toBe('mission-speed');
    expect(useSimulationState.getState().speedPresetId).toBe('mission-speed');
  });

  it('models physical modes with equal orbit and rotation factors', () => {
    for (const id of ['real-time', '100x', '1000x', '5000x'] as const) {
      const preset = getSimulationSpeedPreset(id);
      expect(preset.orbitTimeFactor).toBe(preset.rotationTimeFactor);
    }
  });

  it('models Mission Speed with honest independent orbit and spin scales', () => {
    const mission = getSimulationSpeedPreset('mission-speed');
    expect(mission.orbitTimeFactor).toBe(MISSION_ORBIT_TIME_FACTOR);
    expect(mission.rotationTimeFactor).toBe(MISSION_ROTATION_TIME_FACTOR);
    expect(mission.orbitTimeFactor).not.toBe(mission.rotationTimeFactor);
    expect(getSimulationSpeedPreset('super-fast').orbitTimeFactor).toBe(mission.orbitTimeFactor * 4);
  });

  it('advances both accumulated clocks with the selected factors', () => {
    act(() => useSimulationState.getState().setSpeedPreset('100x'));
    act(() => useSimulationState.getState().advance(0.5));

    expect(useSimulationState.getState()).toMatchObject({
      orbitElapsedSeconds: 50,
      rotationElapsedSeconds: 50,
    });
  });

  it('freezes while paused and resumes from the accumulated time', () => {
    act(() => useSimulationState.getState().setSpeedPreset('real-time'));
    act(() => useSimulationState.getState().advance(2));
    act(() => useSimulationState.getState().setPaused(true));
    act(() => useSimulationState.getState().advance(10));
    expect(useSimulationState.getState().orbitElapsedSeconds).toBe(2);

    act(() => useSimulationState.getState().togglePaused());
    act(() => useSimulationState.getState().advance(3));
    expect(useSimulationState.getState().orbitElapsedSeconds).toBe(5);
  });

  it('preserves accumulated time exactly when changing presets', () => {
    act(() => useSimulationState.getState().setSpeedPreset('real-time'));
    act(() => useSimulationState.getState().advance(7));
    const before = useSimulationState.getState();

    act(() => useSimulationState.getState().setSpeedPreset('super-fast'));
    const after = useSimulationState.getState();
    expect(after.orbitElapsedSeconds).toBe(before.orbitElapsedSeconds);
    expect(after.rotationElapsedSeconds).toBe(before.rotationElapsedSeconds);
  });
});
