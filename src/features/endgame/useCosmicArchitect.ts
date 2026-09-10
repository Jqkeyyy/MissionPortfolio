import { create } from 'zustand';
import type { PlanetThemeId } from '@/data/planetThemes';
import type {
  CosmicArchitectOverride,
  CosmicArchitectOverrides,
} from './cosmicArchitect';

export interface CosmicArchitectState {
  selectedPlanetId: PlanetThemeId | null;
  overrides: CosmicArchitectOverrides;
  selectPlanet: (planetId: PlanetThemeId) => void;
  setWorldOverride: (
    planetId: PlanetThemeId,
    override: CosmicArchitectOverride,
  ) => void;
  resetWorld: (planetId: PlanetThemeId) => void;
  resetAll: () => void;
}

export const useCosmicArchitect = create<CosmicArchitectState>((set) => ({
  selectedPlanetId: null,
  overrides: {},
  selectPlanet: (selectedPlanetId) => {
    if (selectedPlanetId !== 'sun') set({ selectedPlanetId });
  },
  setWorldOverride: (planetId, override) => {
    if (planetId === 'sun') return;
    set((state) => ({
      overrides: { ...state.overrides, [planetId]: override },
    }));
  },
  resetWorld: (planetId) => set((state) => {
    const overrides = { ...state.overrides };
    delete overrides[planetId];
    return { overrides };
  }),
  resetAll: () => set({ selectedPlanetId: null, overrides: {} }),
}));
