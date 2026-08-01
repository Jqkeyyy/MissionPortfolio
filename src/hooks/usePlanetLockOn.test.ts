import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanetLockOn } from './usePlanetLockOn';

describe('usePlanetLockOn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts not locking', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => usePlanetLockOn(onConfirm, 450));
    expect(result.current.locking).toBe(false);
  });

  it('locks immediately on trigger and calls onConfirm after the delay', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => usePlanetLockOn(onConfirm, 450));

    act(() => {
      result.current.trigger();
    });
    expect(result.current.locking).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.locking).toBe(false);
  });

  it('ignores repeated triggers while already locking', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => usePlanetLockOn(onConfirm, 450));

    act(() => {
      result.current.trigger();
      result.current.trigger();
      result.current.trigger();
    });

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
