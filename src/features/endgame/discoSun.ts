import { create } from 'zustand';

export const DISCO_RHYTHM_INTERVALS_MS = [320, 320, 680] as const;
export const DISCO_RHYTHM_TOLERANCE_MS = 190;

export const matchesDiscoRhythm = (tapTimes: readonly number[]) => {
  if (tapTimes.length !== DISCO_RHYTHM_INTERVALS_MS.length + 1) return false;
  return DISCO_RHYTHM_INTERVALS_MS.every((expected, index) => (
    Math.abs((tapTimes[index + 1] - tapTimes[index]) - expected) <= DISCO_RHYTHM_TOLERANCE_MS
  ));
};

interface DiscoSunState {
  active: boolean;
  activate: () => void;
  deactivate: () => void;
}

export const useDiscoSun = create<DiscoSunState>((set) => ({
  active: false,
  activate: () => set({ active: true }),
  deactivate: () => set({ active: false }),
}));
