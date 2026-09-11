import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useNewGamePlus } from './useNewGamePlus';

const storageKey = 'mission-portfolio:new-game-plus:v1';

describe('useNewGamePlus', () => {
  beforeEach(() => window.localStorage.clear());

  it('persists and safely restores the altered timeline', () => {
    const first = renderHook(() => useNewGamePlus());
    expect(first.result.current.active).toBe(false);

    act(() => first.result.current.enable());
    expect(first.result.current.active).toBe(true);
    expect(window.localStorage.getItem(storageKey)).toBe('active');
    first.unmount();

    const restored = renderHook(() => useNewGamePlus());
    expect(restored.result.current.active).toBe(true);
    act(() => restored.result.current.disable());
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
