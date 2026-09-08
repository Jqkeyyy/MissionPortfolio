import { create } from 'zustand';

const PHYSICAL_EARTH_YEAR_SECONDS = 365.25 * 24 * 60 * 60;
const PHYSICAL_EARTH_DAY_SECONDS = 24 * 60 * 60;

export type SimulationSpeedPresetId =
  | 'real-time'
  | '100x'
  | '1000x'
  | '5000x'
  | 'mission-speed'
  | 'super-fast';

export interface SimulationSpeedPreset {
  id: SimulationSpeedPresetId;
  label: string;
  orbitTimeFactor: number;
  rotationTimeFactor: number;
  description: string;
}

export const MISSION_ORBIT_TIME_FACTOR = PHYSICAL_EARTH_YEAR_SECONDS / 60;
export const MISSION_ROTATION_TIME_FACTOR = PHYSICAL_EARTH_DAY_SECONDS / 12;

export const SIMULATION_SPEED_PRESETS: readonly SimulationSpeedPreset[] = [
  {
    id: 'real-time',
    label: 'Real Time',
    orbitTimeFactor: 1,
    rotationTimeFactor: 1,
    description: 'Orbit and spin both advance at true physical time.',
  },
  {
    id: '100x',
    label: '100x',
    orbitTimeFactor: 100,
    rotationTimeFactor: 100,
    description: 'Orbit and spin both advance at 100 times physical time.',
  },
  {
    id: '1000x',
    label: '1,000x',
    orbitTimeFactor: 1_000,
    rotationTimeFactor: 1_000,
    description: 'Orbit and spin both advance at 1,000 times physical time.',
  },
  {
    id: '5000x',
    label: '5,000x',
    orbitTimeFactor: 5_000,
    rotationTimeFactor: 5_000,
    description: 'Orbit and spin both advance at 5,000 times physical time.',
  },
  {
    id: 'mission-speed',
    label: 'Mission Speed',
    orbitTimeFactor: MISSION_ORBIT_TIME_FACTOR,
    rotationTimeFactor: MISSION_ROTATION_TIME_FACTOR,
    description: 'Readable dual scale: one Earth year takes 60 seconds and one Earth day takes 12 seconds.',
  },
  {
    id: 'super-fast',
    label: 'Super Fast',
    orbitTimeFactor: MISSION_ORBIT_TIME_FACTOR * 4,
    rotationTimeFactor: MISSION_ROTATION_TIME_FACTOR * 4,
    description: 'Four times Mission Speed: one Earth year takes 15 seconds and one Earth day takes 3 seconds.',
  },
] as const;

export const DEFAULT_SIMULATION_SPEED_PRESET_ID: SimulationSpeedPresetId = 'mission-speed';

export const getSimulationSpeedPreset = (id: SimulationSpeedPresetId) => (
  SIMULATION_SPEED_PRESETS.find((preset) => preset.id === id)!
);

interface SimulationState {
  isPaused: boolean;
  speedPresetId: SimulationSpeedPresetId;
  orbitElapsedSeconds: number;
  rotationElapsedSeconds: number;
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  setSpeedPreset: (id: SimulationSpeedPresetId) => void;
  advance: (realDeltaSeconds: number) => void;
  resetSimulation: () => void;
}

const initialSimulationState = {
  isPaused: false,
  speedPresetId: DEFAULT_SIMULATION_SPEED_PRESET_ID,
  orbitElapsedSeconds: 0,
  rotationElapsedSeconds: 0,
};

export const useSimulationState = create<SimulationState>((set, get) => ({
  ...initialSimulationState,
  setPaused: (isPaused) => set({ isPaused }),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  setSpeedPreset: (speedPresetId) => set({ speedPresetId }),
  advance: (realDeltaSeconds) => {
    const state = get();
    if (state.isPaused || !Number.isFinite(realDeltaSeconds) || realDeltaSeconds <= 0) return;

    const preset = getSimulationSpeedPreset(state.speedPresetId);
    set({
      orbitElapsedSeconds: state.orbitElapsedSeconds + realDeltaSeconds * preset.orbitTimeFactor,
      rotationElapsedSeconds: state.rotationElapsedSeconds + realDeltaSeconds * preset.rotationTimeFactor,
    });
  },
  resetSimulation: () => set(initialSimulationState),
}));
