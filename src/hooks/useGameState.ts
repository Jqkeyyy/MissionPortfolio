import { create } from 'zustand';

export type ViewMode = 'space' | 'traveling' | 'planet';

interface GameState {
  currentView: ViewMode;
  selectedPlanet: string | null;
  previousPlanet: string | null;
  isTransitioning: boolean;
  activeSign: string | null;
  
  // Actions
  selectPlanet: (planetId: string) => void;
  travelToPlanet: (planetId: string) => void;
  returnToSpace: () => void;
  openSign: (signId: string) => void;
  closeSign: () => void;
  setTransitioning: (isTransitioning: boolean) => void;
  goToNextPlanet: () => void;
  goToPreviousPlanet: () => void;
}

import { planets } from '@/data/planets';

export const useGameState = create<GameState>((set, get) => ({
  currentView: 'space',
  selectedPlanet: null,
  previousPlanet: null,
  isTransitioning: false,
  activeSign: null,

  selectPlanet: (planetId) => {
    set({ selectedPlanet: planetId });
  },

  travelToPlanet: (planetId) => {
    const { selectedPlanet } = get();
    set({
      previousPlanet: selectedPlanet,
      selectedPlanet: planetId,
      isTransitioning: true,
      currentView: 'traveling',
    });

    // Simulate travel time
    setTimeout(() => {
      set({
        currentView: 'planet',
        isTransitioning: false,
      });
    }, 2000);
  },

  returnToSpace: () => {
    set({
      isTransitioning: true,
      currentView: 'traveling',
    });

    setTimeout(() => {
      set({
        currentView: 'space',
        isTransitioning: false,
        activeSign: null,
      });
    }, 1500);
  },

  openSign: (signId) => {
    set({ activeSign: signId });
  },

  closeSign: () => {
    set({ activeSign: null });
  },

  setTransitioning: (isTransitioning) => {
    set({ isTransitioning });
  },

  goToNextPlanet: () => {
    const { selectedPlanet } = get();
    if (!selectedPlanet) return;

    const currentIndex = planets.findIndex((p) => p.id === selectedPlanet);
    const nextIndex = (currentIndex + 1) % planets.length;
    const nextPlanet = planets[nextIndex];

    get().travelToPlanet(nextPlanet.id);
  },

  goToPreviousPlanet: () => {
    const { selectedPlanet } = get();
    if (!selectedPlanet) return;

    const currentIndex = planets.findIndex((p) => p.id === selectedPlanet);
    const prevIndex = currentIndex === 0 ? planets.length - 1 : currentIndex - 1;
    const prevPlanet = planets[prevIndex];

    get().travelToPlanet(prevPlanet.id);
  },
}));
