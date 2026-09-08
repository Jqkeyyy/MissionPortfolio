import { create } from 'zustand';

export type GraphicsPreference = 'auto' | 'low' | 'balanced' | 'high';
export type GraphicsTier = Exclude<GraphicsPreference, 'auto'>;

export const GRAPHICS_PREFERENCE_STORAGE_KEY = 'mission-portfolio:graphics-preference:v1';

const preferences: readonly GraphicsPreference[] = ['auto', 'low', 'balanced', 'high'];

const readPreference = (): GraphicsPreference => {
  if (typeof window === 'undefined') return 'auto';
  try {
    const stored = window.localStorage.getItem(GRAPHICS_PREFERENCE_STORAGE_KEY);
    return preferences.includes(stored as GraphicsPreference) ? stored as GraphicsPreference : 'auto';
  } catch {
    return 'auto';
  }
};

interface GraphicsSettingsState {
  preference: GraphicsPreference;
  setPreference: (preference: GraphicsPreference) => void;
}

export const useGraphicsSettings = create<GraphicsSettingsState>((set) => ({
  preference: readPreference(),
  setPreference: (preference) => {
    try {
      window.localStorage.setItem(GRAPHICS_PREFERENCE_STORAGE_KEY, preference);
    } catch {
      // Browsing can continue with the in-memory setting when storage is unavailable.
    }
    set({ preference });
  },
}));
