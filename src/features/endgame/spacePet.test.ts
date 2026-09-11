import { describe, expect, it } from 'vitest';
import {
  SPACE_PET_CHATTER_CADENCE,
  clampSpacePetPoint,
  createSpacePetStore,
  getSpacePetContextReaction,
  getSpacePetInteractionReaction,
} from './spacePet';

describe('spacePet model', () => {
  const context = {
    view: 'planet' as const,
    destinationId: 'mars',
    destinationName: 'Mars',
  };

  it('produces destination-aware context reactions', () => {
    expect(getSpacePetContextReaction(context)).toMatchObject({
      text: expect.stringContaining('Mars'),
      mood: 'curious',
      source: 'context',
    });
    expect(getSpacePetContextReaction({
      ...context,
      view: 'intercepting',
      traveling: true,
    })).toMatchObject({
      text: expect.stringContaining('Course locked for Mars'),
      mood: 'working',
    });
  });

  it('emits deterministic, occasional interaction chatter', () => {
    for (let count = 1; count < SPACE_PET_CHATTER_CADENCE; count += 1) {
      expect(getSpacePetInteractionReaction(context, count)).toBeNull();
    }

    const first = getSpacePetInteractionReaction(context, SPACE_PET_CHATTER_CADENCE);
    const replay = getSpacePetInteractionReaction(context, SPACE_PET_CHATTER_CADENCE);
    const next = getSpacePetInteractionReaction(context, SPACE_PET_CHATTER_CADENCE * 2);
    expect(replay).toEqual(first);
    expect(next?.text).not.toBe(first?.text);
  });

  it('clamps invalid and offscreen points to a safe viewport area', () => {
    expect(clampSpacePetPoint({ x: -100, y: 900 }, { width: 320, height: 640 }))
      .toEqual({ x: 52, y: 588 });
    expect(clampSpacePetPoint({ x: Number.NaN, y: 100 }, { width: 320, height: 640 }))
      .toEqual({ x: 52, y: 100 });
  });

  it('supports isolated host stores and preserves quiet clicks', () => {
    const store = createSpacePetStore({ enabled: false });
    store.getState().setContext(context);
    expect(store.getState()).toMatchObject({ enabled: false, mood: 'curious' });

    const originalMessage = store.getState().message;
    store.getState().interact(context, { x: 80, y: 90 });
    expect(store.getState()).toMatchObject({
      interactionCount: 1,
      position: { x: 80, y: 90 },
      message: originalMessage,
    });

    store.getState().toggle();
    expect(store.getState().enabled).toBe(true);
  });
});
