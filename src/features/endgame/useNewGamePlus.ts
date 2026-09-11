import { useCallback, useEffect, useState } from 'react';

const NEW_GAME_PLUS_STORAGE_KEY = 'mission-portfolio:new-game-plus:v1';

const readStoredState = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(NEW_GAME_PLUS_STORAGE_KEY) === 'active';
  } catch {
    return false;
  }
};
export const useNewGamePlus = () => {
  const [active, setActive] = useState(readStoredState);

  useEffect(() => {
    try {
      if (active) window.localStorage.setItem(NEW_GAME_PLUS_STORAGE_KEY, 'active');
      else window.localStorage.removeItem(NEW_GAME_PLUS_STORAGE_KEY);
    } catch {
      // Cosmetic persistence must never interrupt the mission.
    }
  }, [active]);

  const enable = useCallback(() => setActive(true), []);
  const disable = useCallback(() => setActive(false), []);

  return { active, enable, disable };
};
