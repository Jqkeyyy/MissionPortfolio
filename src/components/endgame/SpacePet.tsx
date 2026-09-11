import { useEffect, useMemo, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Power, X } from 'lucide-react';
import { useStore } from 'zustand';
import { cn } from '@/lib/utils';
import {
  SPACE_PET_NAME,
  clampSpacePetPoint,
  spacePetStore,
  type SpacePetContext,
  type SpacePetMessage,
  type SpacePetPoint,
  type SpacePetStore,
} from '@/features/endgame/spacePet';

export interface SpacePetProps {
  /** Current mission context; changing it gives the companion a relevant reaction. */
  context: SpacePetContext;
  /** Optional screen-space ship/HUD anchor. Page interactions can move it afterward. */
  anchor?: SpacePetPoint | null;
  /** Inject a store for isolated instances. Defaults to the shared endgame store. */
  store?: SpacePetStore;
  /** Controlled availability hook for hosts that own the unlock state. */
  enabled?: boolean;
  /** Follow page pointer interactions and chatter on every fourth interaction. */
  listenForPageClicks?: boolean;
  /** Optional host override; otherwise follows prefers-reduced-motion. */
  reducedMotion?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onMessage?: (message: SpacePetMessage) => void;
  className?: string;
}

const safeViewport = () => ({
  width: typeof window === 'undefined' ? 1280 : window.innerWidth,
  height: typeof window === 'undefined' ? 720 : window.innerHeight,
});

export const SpacePet = ({
  context,
  anchor,
  store = spacePetStore,
  enabled: controlledEnabled,
  listenForPageClicks = true,
  reducedMotion: reducedMotionOverride,
  onEnabledChange,
  onMessage,
  className,
}: SpacePetProps) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const reducedMotion = reducedMotionOverride ?? prefersReducedMotion;
  const enabled = useStore(store, (state) => state.enabled);
  const mood = useStore(store, (state) => state.mood);
  const message = useStore(store, (state) => state.message);
  const position = useStore(store, (state) => state.position);

  useEffect(() => {
    store.getState().setContext(context);
  }, [context, store]);

  useEffect(() => {
    if (controlledEnabled !== undefined) {
      store.getState().setEnabled(controlledEnabled);
    }
  }, [controlledEnabled, store]);

  useEffect(() => {
    if (!anchor) return;
    store.getState().setPosition(clampSpacePetPoint(anchor, safeViewport()));
  }, [anchor, store]);

  useEffect(() => {
    if (message) onMessage?.(message);
  }, [message, onMessage]);

  useEffect(() => {
    if (!enabled || !listenForPageClicks) return;

    const handlePageClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-space-pet-root]')) return;
      const point = clampSpacePetPoint(
        { x: event.clientX, y: event.clientY },
        safeViewport(),
      );
      store.getState().interact(context, point);
    };

    document.addEventListener('click', handlePageClick);
    return () => document.removeEventListener('click', handlePageClick);
  }, [context, enabled, listenForPageClicks, store]);

  useEffect(() => {
    const keepOnscreen = () => {
      const current = store.getState().position;
      if (current) store.getState().setPosition(clampSpacePetPoint(current, safeViewport()));
    };
    window.addEventListener('resize', keepOnscreen);
    return () => window.removeEventListener('resize', keepOnscreen);
  }, [store]);

  const setEnabled = (nextEnabled: boolean) => {
    store.getState().setEnabled(nextEnabled);
    onEnabledChange?.(nextEnabled);
  };

  const interactWithPet = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    store.getState().interact(context, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const positionStyle = useMemo<CSSProperties>(() => position ? ({
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -50%)',
  }) : ({
    bottom: '6rem',
    left: '1.25rem',
  }), [position]);

  if (!enabled) {
    return (
      <button
        type="button"
        data-space-pet-root
        aria-label={`Recall maintenance companion ${SPACE_PET_NAME}`}
        title={`Recall ${SPACE_PET_NAME}`}
        onClick={() => setEnabled(true)}
        className={cn(
          'fixed bottom-24 left-5 z-30 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-cyan-300/35 bg-slate-950/90 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.16)] backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 md:bottom-7',
          className,
        )}
      >
        <Power className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <aside
      data-space-pet-root
      data-mood={mood}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-label={`Maintenance companion ${SPACE_PET_NAME}`}
      className={cn(
        'pointer-events-none fixed z-30 flex max-w-[calc(100vw-1.5rem)] items-end gap-2 transition-[left,top] duration-500 ease-out',
        reducedMotion && 'transition-none',
        className,
      )}
      style={positionStyle}
    >
      <motion.div
        className="relative shrink-0"
        animate={reducedMotion ? undefined : { y: [0, -4, 0], rotate: [0, -1.5, 0, 1.5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <button
          type="button"
          onPointerDown={interactWithPet}
          aria-label={`Interact with maintenance companion ${SPACE_PET_NAME}`}
          title={`${SPACE_PET_NAME} // maintenance companion`}
          className="pointer-events-auto relative block h-16 w-14 rounded-[45%_45%_38%_38%] border border-cyan-200/55 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-[0_7px_24px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span aria-hidden="true" className="absolute -top-3 left-1/2 h-4 w-px -translate-x-1/2 bg-cyan-200/70">
            <span className={cn(
              'absolute -left-1.5 -top-1 h-3 w-3 rounded-full border border-cyan-100/70 bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]',
              !reducedMotion && 'animate-pulse',
            )} />
          </span>
          <span aria-hidden="true" className="absolute left-1.5 right-1.5 top-2 h-7 rounded-[48%] border border-cyan-200/30 bg-cyan-950 shadow-[inset_0_0_12px_rgba(34,211,238,0.22)]">
            <span className={cn(
              'absolute left-2 top-2 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,1)]',
              mood === 'excited' && 'h-2.5 w-2.5',
            )} />
            <span className={cn(
              'absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,1)]',
              mood === 'excited' && 'h-2.5 w-2.5',
            )} />
            <span className="absolute bottom-1 left-1/2 h-px w-2 -translate-x-1/2 bg-cyan-200/70" />
          </span>
          <span aria-hidden="true" className="absolute bottom-3 left-1/2 h-2.5 w-5 -translate-x-1/2 rounded border border-orange-200/40 bg-orange-300/15 shadow-[0_0_8px_rgba(251,146,60,0.25)]" />
          <span aria-hidden="true" className="absolute -bottom-1 left-2 h-2 w-3 rounded-b-full border-b border-cyan-200/40" />
          <span aria-hidden="true" className="absolute -bottom-1 right-2 h-2 w-3 rounded-b-full border-b border-cyan-200/40" />
        </button>
        <button
          type="button"
          aria-label={`Power down ${SPACE_PET_NAME}`}
          title={`Power down ${SPACE_PET_NAME}`}
          onClick={() => setEnabled(false)}
          className="pointer-events-auto absolute -right-2 -top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/95 text-white/55 opacity-80 shadow-md hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        >
          <Power className="h-3 w-3" aria-hidden="true" />
        </button>
      </motion.div>

      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={reducedMotion ? false : { opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-auto relative mb-4 w-[min(15rem,calc(100vw-6rem))] rounded-xl rounded-bl-sm border border-cyan-200/25 bg-slate-950/95 px-3 py-2 pr-8 font-mono text-[11px] leading-5 text-cyan-50 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md"
        >
          <span className="mb-0.5 block text-[9px] uppercase tracking-[0.22em] text-cyan-300/65">
            {SPACE_PET_NAME} // {mood}
          </span>
          {message.text}
          <button
            type="button"
            aria-label="Dismiss companion message"
            onClick={() => store.getState().dismissMessage()}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded text-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </aside>
  );
};
