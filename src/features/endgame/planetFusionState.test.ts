import { beforeEach, describe, expect, it } from 'vitest';
import { usePlanetFusion } from './planetFusionState';

describe('planet fusion state', () => {
  beforeEach(() => usePlanetFusion.getState().reset());

  it('keeps source worlds distinct by swapping collisions', () => {
    usePlanetFusion.getState().selectPrimary('saturn');
    expect(usePlanetFusion.getState()).toMatchObject({ primaryId: 'saturn', secondaryId: 'mars' });
    usePlanetFusion.getState().selectSecondary('saturn');
    expect(usePlanetFusion.getState()).toMatchObject({ primaryId: 'mars', secondaryId: 'saturn' });
  });

  it('publishes and releases a renderer-ready active fusion', () => {
    const result = usePlanetFusion.getState().activate();
    expect(result.name).toBe('Marsurn');
    expect(usePlanetFusion.getState().activeFusion).toEqual(result);
    usePlanetFusion.getState().release();
    expect(usePlanetFusion.getState().activeFusion).toBeNull();
  });
});
