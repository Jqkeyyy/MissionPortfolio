export type EventHorizonQuality = 'low' | 'balanced' | 'high';

export interface EventHorizonGeometryBudget {
  coreSegments: number;
  diskSegments: number;
  haloSegments: number;
}

export interface EventHorizonMotionSample {
  diskRotation: number;
  counterRotation: number;
  haloPulse: number;
  verticalDrift: number;
  shaderTime: number;
}

const GEOMETRY_BUDGETS: Record<EventHorizonQuality, EventHorizonGeometryBudget> = {
  low: { coreSegments: 24, diskSegments: 48, haloSegments: 32 },
  balanced: { coreSegments: 32, diskSegments: 72, haloSegments: 48 },
  high: { coreSegments: 48, diskSegments: 96, haloSegments: 64 },
};
export const getEventHorizonGeometryBudget = (
  quality: EventHorizonQuality,
): EventHorizonGeometryBudget => GEOMETRY_BUDGETS[quality];

/**
 * Returns a deterministic animation sample without allocating Three.js objects.
 * A frozen sample is used when decorative motion is disabled so reduced-motion
 * users still see the complete anomaly without continuous movement.
 */
export const sampleEventHorizonMotion = (
  elapsedSeconds: number,
  decorativeMotion = true,
): EventHorizonMotionSample => {
  const time = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;

  if (!decorativeMotion) {
    return {
      diskRotation: 0.28,
      counterRotation: -0.16,
      haloPulse: 1,
      verticalDrift: 0,
      shaderTime: 0,
    };
  }

  return {
    diskRotation: time * 0.16,
    counterRotation: -time * 0.09,
    haloPulse: 1 + Math.sin(time * 1.35) * 0.035,
    verticalDrift: Math.sin(time * 0.42) * 0.12,
    shaderTime: time,
  };
};
