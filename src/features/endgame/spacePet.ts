import { createStore, type StoreApi } from 'zustand/vanilla';

export type SpacePetView =
  | 'space'
  | 'intercepting'
  | 'planet'
  | 'habitat'
  | 'portfolio'
  | (string & {});

export type SpacePetMood = 'idle' | 'curious' | 'excited' | 'working';

export interface SpacePetPoint {
  x: number;
  y: number;
}

export interface SpacePetContext {
  view: SpacePetView;
  destinationId?: string | null;
  destinationName?: string | null;
  traveling?: boolean;
}

export interface SpacePetMessage {
  id: string;
  text: string;
  mood: SpacePetMood;
  source: 'context' | 'interaction';
}

export interface SpacePetState {
  enabled: boolean;
  interactionCount: number;
  contextSignature: string;
  mood: SpacePetMood;
  message: SpacePetMessage | null;
  position: SpacePetPoint | null;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  setContext: (context: SpacePetContext) => void;
  setPosition: (position: SpacePetPoint | null) => void;
  interact: (context: SpacePetContext, position?: SpacePetPoint) => SpacePetMessage | null;
  dismissMessage: () => void;
  reset: () => void;
}

export type SpacePetStore = StoreApi<SpacePetState>;

export const SPACE_PET_NAME = 'M-0';
export const SPACE_PET_CHATTER_CADENCE = 4;

const normalizeLabel = (context: SpacePetContext) => (
  context.destinationName?.trim()
  || context.destinationId?.trim()
  || 'the next waypoint'
);

export const getSpacePetContextSignature = (context: SpacePetContext): string => [
  context.view || 'unknown',
  context.destinationId || '',
  context.destinationName || '',
  context.traveling ? 'traveling' : 'stationary',
].join(':').toLowerCase();

export const getSpacePetContextReaction = (
  context: SpacePetContext,
): SpacePetMessage => {
  const label = normalizeLabel(context);
  const signature = getSpacePetContextSignature(context);

  if (context.traveling || context.view === 'intercepting') {
    return {
      id: `context:${signature}`,
      text: `Course locked for ${label}. I tightened the loose thruster again.`,
      mood: 'working',
      source: 'context',
    };
  }

  switch (context.view) {
    case 'planet':
      return {
        id: `context:${signature}`,
        text: `New world: ${label}. Please pretend my sample jar is mission-critical.`,
        mood: 'curious',
        source: 'context',
      };
    case 'habitat':
      return {
        id: `context:${signature}`,
        text: 'HAB pressure nominal. Vent snacks remain classified.',
        mood: 'working',
        source: 'context',
      };
    case 'portfolio':
      return {
        id: `context:${signature}`,
        text: 'Project archive open. I helped with the tiny screws.',
        mood: 'excited',
        source: 'context',
      };
    case 'space':
      return {
        id: `context:${signature}`,
        text: 'Orbit watch active. All planets accounted for. Mostly.',
        mood: 'idle',
        source: 'context',
      };
    default:
      return {
        id: `context:${signature}`,
        text: 'Maintenance companion online. Point me at something suspicious.',
        mood: 'curious',
        source: 'context',
      };
  }
};

const interactionLines = [
  'I checked that spot. Definitely space-grade.',
  'Tiny click detected. Huge scientific implications.',
  'I am following you for maintenance reasons. And friendship reasons.',
  'Diagnostic complete: you have excellent cursor control.',
  'That panel was not blinking before. Probably fine.',
] as const;

const hashText = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** Returns chatter on a fixed cadence, with no random or time-dependent output. */
export const getSpacePetInteractionReaction = (
  context: SpacePetContext,
  interactionCount: number,
): SpacePetMessage | null => {
  if (
    interactionCount <= 0
    || interactionCount % SPACE_PET_CHATTER_CADENCE !== 0
  ) return null;

  const signature = getSpacePetContextSignature(context);
  const cycle = Math.floor(interactionCount / SPACE_PET_CHATTER_CADENCE) - 1;
  const lineIndex = (hashText(signature) + cycle) % interactionLines.length;
  return {
    id: `interaction:${signature}:${interactionCount}`,
    text: interactionLines[lineIndex],
    mood: cycle % 2 === 0 ? 'excited' : 'curious',
    source: 'interaction',
  };
};

export const clampSpacePetPoint = (
  point: SpacePetPoint,
  viewport: { width: number; height: number },
  padding = 52,
): SpacePetPoint => ({
  x: Math.min(
    Math.max(padding, Number.isFinite(point.x) ? point.x : padding),
    Math.max(padding, viewport.width - padding),
  ),
  y: Math.min(
    Math.max(padding, Number.isFinite(point.y) ? point.y : padding),
    Math.max(padding, viewport.height - padding),
  ),
});

export const createSpacePetStore = (
  initial: Partial<Pick<SpacePetState, 'enabled' | 'position'>> = {},
): SpacePetStore => createStore<SpacePetState>((set, get) => ({
  enabled: initial.enabled ?? true,
  interactionCount: 0,
  contextSignature: '',
  mood: 'idle',
  message: null,
  position: initial.position ?? null,
  setEnabled: (enabled) => set({ enabled }),
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  setContext: (context) => {
    const contextSignature = getSpacePetContextSignature(context);
    if (contextSignature === get().contextSignature) return;
    const message = getSpacePetContextReaction(context);
    set({ contextSignature, message, mood: message.mood });
  },
  setPosition: (position) => set({ position }),
  interact: (context, position) => {
    const interactionCount = get().interactionCount + 1;
    const message = getSpacePetInteractionReaction(context, interactionCount);
    set({
      interactionCount,
      ...(position ? { position } : {}),
      ...(message ? { message, mood: message.mood } : {}),
    });
    return message;
  },
  dismissMessage: () => set({ message: null }),
  reset: () => set({
    enabled: true,
    interactionCount: 0,
    contextSignature: '',
    mood: 'idle',
    message: null,
    position: null,
  }),
}));

/** Shared convenience store. Hosts that need isolation can inject createSpacePetStore(). */
export const spacePetStore = createSpacePetStore();
