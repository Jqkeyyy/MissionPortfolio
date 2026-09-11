import { create } from 'zustand';
import type { PlanetThemeId } from '@/data/planetThemes';
import {
  applyGravityGunImpulse,
  createGravityGunSystem,
  getGravityGunOffset,
  restoreGravityGunBody,
  restoreGravityGunSystem,
  stepGravityGunSystem,
  type GravityGunBodyDescriptor,
  type GravityGunSystemState,
  type GravityGunVector,
} from './gravityGun';

export interface GravityGunStore extends GravityGunSystemState {
  selectedPlanetId: PlanetThemeId | null;
  selectPlanet: (planetId: PlanetThemeId) => void;
  fire: (direction: GravityGunVector, force: number) => void;
  advance: (deltaSeconds: number, bodies?: readonly GravityGunBodyDescriptor[]) => void;
  restoreSelected: () => void;
  restorePlanet: (planetId: PlanetThemeId) => void;
  restoreAll: () => void;
  readOffset: (planetId: PlanetThemeId) => GravityGunVector;
}

const initialSystem = createGravityGunSystem();

export const useGravityGun = create<GravityGunStore>((set, get) => ({
  ...initialSystem,
  selectedPlanetId: null,
  selectPlanet: (selectedPlanetId) => {
    if (selectedPlanetId !== 'sun') set({ selectedPlanetId });
  },
  fire: (direction, force) => set((state) => {
    if (!state.selectedPlanetId) return state;
    return applyGravityGunImpulse(state, state.selectedPlanetId, direction, force);
  }),
  advance: (deltaSeconds, bodies = []) => set((state) =>
    stepGravityGunSystem(state, deltaSeconds, bodies)),
  restoreSelected: () => set((state) => state.selectedPlanetId
    ? restoreGravityGunBody(state, state.selectedPlanetId)
    : state),
  restorePlanet: (planetId) => set((state) => restoreGravityGunBody(state, planetId)),
  restoreAll: () => set({ ...restoreGravityGunSystem(), selectedPlanetId: null }),
  readOffset: (planetId) => getGravityGunOffset(get(), planetId),
}));
