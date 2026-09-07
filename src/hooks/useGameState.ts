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
  quickPortfolioOpen: boolean;
  announcement: string;
  
  // Actions
  selectPlanet: (planetId: string) => void;
  travelToPlanet: (planetId: string) => void;
  returnToSpace: () => void;
  skipTravel: () => void;
  openSign: (signId: string) => void;
  closeSign: () => void;
  openQuickPortfolio: () => void;
  closeQuickPortfolio: () => void;
  setTransitioning: (isTransitioning: boolean) => void;
  goToNextPlanet: () => void;
  goToPreviousPlanet: () => void;
  announce: (message: string) => void;
}

import { planets } from '@/data/planets';

export const PLANET_TRAVEL_DURATION_MS = 2400;
export const SOLAR_INTERCEPT_DURATION_MS = 3200;
export const SPACE_RETURN_DURATION_MS = 1500;
export const REDUCED_MOTION_TRANSITION_DURATION_MS = 100;

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

let transitionSequence = 0;

const planetName = (planetId: string | null) => (
  planets.find((planet) => planet.id === planetId)?.displayName ?? 'destination'
);

export const useGameState = create<GameState>((set, get) => ({
  currentView: 'space',
  selectedPlanet: null,
  previousPlanet: null,
  isTransitioning: false,
  travelDirection: null,
  activeSign: null,
  quickPortfolioOpen: false,
  announcement: 'Solar system map ready. Select a destination to begin exploring.',

  selectPlanet: (planetId) => {
    set({ selectedPlanet: planetId });
  },

  travelToPlanet: (planetId) => {
    const { selectedPlanet, currentView, isTransitioning } = get();
    if (isTransitioning) return;

    const beginsInSolarSystem = currentView === 'space';
    const sequence = ++transitionSequence;
    const reducedMotion = prefersReducedMotion();
    const interceptDuration = reducedMotion
      ? REDUCED_MOTION_TRANSITION_DURATION_MS
      : SOLAR_INTERCEPT_DURATION_MS;
    const travelDuration = reducedMotion
      ? REDUCED_MOTION_TRANSITION_DURATION_MS
      : PLANET_TRAVEL_DURATION_MS;
    const destinationName = planetName(planetId);
    set({
      previousPlanet: selectedPlanet,
      selectedPlanet: planetId,
      isTransitioning: true,
      travelDirection: 'toPlanet',
      currentView: beginsInSolarSystem ? 'intercepting' : 'traveling',
      announcement: beginsInSolarSystem
        ? `Destination ${destinationName} selected. Autopilot intercept started.`
        : `Traveling to ${destinationName}.`,
    });

    const beginCloseApproach = () => {
      if (sequence !== transitionSequence) return;
      set({
        currentView: 'traveling',
        announcement: `Close approach to ${destinationName}.`,
      });

      setTimeout(() => {
        if (sequence !== transitionSequence) return;
        set({
          currentView: 'planet',
          isTransitioning: false,
          travelDirection: null,
          announcement: `Arrived at ${destinationName}. Planet surface ready.`,
        });
      }, travelDuration);
    };

    if (beginsInSolarSystem) {
      setTimeout(beginCloseApproach, interceptDuration);
    } else {
      beginCloseApproach();
    }
  },

  returnToSpace: () => {
    const sequence = ++transitionSequence;
    const returnDuration = prefersReducedMotion()
      ? REDUCED_MOTION_TRANSITION_DURATION_MS
      : SPACE_RETURN_DURATION_MS;
    set({
      isTransitioning: true,
      travelDirection: 'toSpace',
      currentView: 'traveling',
      announcement: 'Returning to the solar system map.',
    });

    setTimeout(() => {
      if (sequence !== transitionSequence) return;
      set({
        currentView: 'space',
        isTransitioning: false,
        travelDirection: null,
        activeSign: null,
        announcement: 'Solar system map ready. Select a destination to continue exploring.',
      });
    }, returnDuration);
  },

  skipTravel: () => {
    const { currentView, travelDirection, selectedPlanet } = get();
    if (currentView !== 'intercepting' && currentView !== 'traveling') return;

    transitionSequence += 1;
    if (travelDirection === 'toSpace') {
      set({
        currentView: 'space',
        isTransitioning: false,
        travelDirection: null,
        activeSign: null,
        announcement: 'Travel skipped. Solar system map ready.',
      });
      return;
    }

    set({
      currentView: 'planet',
      isTransitioning: false,
      travelDirection: null,
      announcement: `Travel skipped. Arrived at ${planetName(selectedPlanet)}. Planet surface ready.`,
    });
  },

  openSign: (signId) => {
    set({ activeSign: signId });
  },

  closeSign: () => {
    set({ activeSign: null });
  },

  openQuickPortfolio: () => {
    set({ quickPortfolioOpen: true });
  },

  closeQuickPortfolio: () => {
    set({ quickPortfolioOpen: false });
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

  announce: (message) => {
    set({ announcement: message });
  },
}));
