import { create } from 'zustand';
import {
  createPlanetFusion,
  type FusiblePlanetId,
  type PlanetFusion,
} from './planetFusion';

export interface PlanetFusionState {
  primaryId: FusiblePlanetId;
  secondaryId: FusiblePlanetId;
  activeFusion: PlanetFusion | null;
  selectPrimary: (planetId: FusiblePlanetId) => void;
  selectSecondary: (planetId: FusiblePlanetId) => void;
  swap: () => void;
  activate: () => PlanetFusion;
  release: () => void;
  reset: () => void;
}

export const DEFAULT_PLANET_FUSION_SELECTION = {
  primaryId: 'mars',
  secondaryId: 'saturn',
} as const satisfies Pick<PlanetFusionState, 'primaryId' | 'secondaryId'>;

export const usePlanetFusion = create<PlanetFusionState>((set, get) => ({
  ...DEFAULT_PLANET_FUSION_SELECTION,
  activeFusion: null,
  selectPrimary: (planetId) => set((state) => planetId === state.secondaryId
    ? { primaryId: planetId, secondaryId: state.primaryId, activeFusion: null }
    : { primaryId: planetId, activeFusion: null }),
  selectSecondary: (planetId) => set((state) => planetId === state.primaryId
    ? { primaryId: state.secondaryId, secondaryId: planetId, activeFusion: null }
    : { secondaryId: planetId, activeFusion: null }),
  swap: () => set((state) => ({
    primaryId: state.secondaryId,
    secondaryId: state.primaryId,
    activeFusion: null,
  })),
  activate: () => {
    const { primaryId, secondaryId } = get();
    const activeFusion = createPlanetFusion(primaryId, secondaryId);
    set({ activeFusion });
    return activeFusion;
  },
  release: () => set({ activeFusion: null }),
  reset: () => set({ ...DEFAULT_PLANET_FUSION_SELECTION, activeFusion: null }),
}));

/** Read-only bridge for imperative render loops and non-React hosts. */
export const getActivePlanetFusion = (): PlanetFusion | null => (
  usePlanetFusion.getState().activeFusion
);
