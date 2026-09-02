import { create } from 'zustand';

export type ViewMode = 'space' | 'intercepting' | 'traveling' | 'planet';
export type TravelDirection = 'toPlanet' | 'toSpace' | null;

interface GameState {
  currentView: ViewMode;
  selectedPlanet: string | null;
  previousPlanet: string | null;
  isTransitioning: boolean;
  travelDirection: TravelDirection;
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

export const PLANET_TRAVEL_DURATION_MS = 2400;
export const SOLAR_INTERCEPT_DURATION_MS = 3200;

export const useGameState = create<GameState>((set, get) => ({
  currentView: 'space',
  selectedPlanet: null,
  previousPlanet: null,
  isTransitioning: false,
  travelDirection: null,
  activeSign: null,

  selectPlanet: (planetId) => {
    set({ selectedPlanet: planetId });
  },

  travelToPlanet: (planetId) => {
    const { selectedPlanet, currentView, isTransitioning } = get();
    if (isTransitioning) return;

    const beginsInSolarSystem = currentView === 'space';
    set({
      previousPlanet: selectedPlanet,
      selectedPlanet: planetId,
      isTransitioning: true,
      travelDirection: 'toPlanet',
      currentView: beginsInSolarSystem ? 'intercepting' : 'traveling',
    });

    const beginCloseApproach = () => {
      set({
        currentView: 'traveling',
      });

      setTimeout(() => {
        set({
          currentView: 'planet',
          isTransitioning: false,
          travelDirection: null,
        });
      }, PLANET_TRAVEL_DURATION_MS);
    };

    if (beginsInSolarSystem) {
      setTimeout(beginCloseApproach, SOLAR_INTERCEPT_DURATION_MS);
    } else {
      beginCloseApproach();
    }
  },

  returnToSpace: () => {
    set({
      isTransitioning: true,
      travelDirection: 'toSpace',
      currentView: 'traveling',
    });

    setTimeout(() => {
      set({
        currentView: 'space',
        isTransitioning: false,
        travelDirection: null,
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
