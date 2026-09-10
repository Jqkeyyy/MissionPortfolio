import { create } from 'zustand';
import {
  DEFAULT_CHAOS_MODE_SETTINGS,
  type ChaosModeSettings,
  type ChaosPresetId,
} from './chaosMode';

interface ChaosModeState extends ChaosModeSettings {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  setIntensity: (intensity: number) => void;
  setPreset: (presetId: ChaosPresetId) => void;
  reroll: (seed?: number) => void;
  reset: () => void;
}

const normalizeSeed = (seed: number) => (
  Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : DEFAULT_CHAOS_MODE_SETTINGS.seed
);

export const useChaosMode = create<ChaosModeState>((set) => ({
  ...DEFAULT_CHAOS_MODE_SETTINGS,
  enable: () => set({ enabled: true }),
  disable: () => set({ enabled: false }),
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  setIntensity: (intensity) => set({
    intensity: Math.min(1, Math.max(0, Number.isFinite(intensity) ? intensity : 0)),
  }),
  setPreset: (presetId) => set({ presetId }),
  reroll: (seed) => set((state) => ({
    seed: normalizeSeed(seed ?? state.seed + 1),
  })),
  reset: () => set(DEFAULT_CHAOS_MODE_SETTINGS),
}));

export const getChaosModeSettings = (): ChaosModeSettings => {
  const { enabled, seed, intensity, presetId, parentShiftSeconds } = useChaosMode.getState();
  return { enabled, seed, intensity, presetId, parentShiftSeconds };
};
