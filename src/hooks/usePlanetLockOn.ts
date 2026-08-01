import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LOCK_DURATION_MS = 450;

export const usePlanetLockOn = (onConfirm: () => void, lockDurationMs: number = DEFAULT_LOCK_DURATION_MS) => {
  const [hovered, setHovered] = useState(false);
  const [locking, setLocking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const trigger = useCallback(() => {
    if (timeoutRef.current !== null) return;
    setLocking(true);
    timeoutRef.current = setTimeout(() => {
      setLocking(false);
      onConfirm();
      timeoutRef.current = null;
    }, lockDurationMs);
  }, [lockDurationMs, onConfirm]);

  return { hovered, locking, setHovered, trigger };
};
