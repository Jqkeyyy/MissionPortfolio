import type { PlanetData } from '@/data/planets';
import type { PlanetThemeId } from '@/data/planetThemes';

export type OrbitDirection = 1 | -1;

export interface CosmicArchitectOverride {
  sizeMultiplier: number;
  orbitRadiusMultiplier: number;
  gravityMultiplier: number;
  orbitSpeedMultiplier: number;
  orbitDirection: OrbitDirection;
  axialTiltDeg: number;
  orbitInclinationDeg: number;
  hueShiftDeg: number;
}

export type CosmicArchitectOverrides = Partial<
  Record<PlanetThemeId, CosmicArchitectOverride>
>;

export const COSMIC_ARCHITECT_LIMITS = {
  sizeMultiplier: { min: 0.25, max: 3 },
  orbitRadiusMultiplier: { min: 0.5, max: 2 },
  gravityMultiplier: { min: 0.25, max: 4 },
  orbitSpeedMultiplier: { min: 0.25, max: 4 },
  axialTiltDeg: { min: 0, max: 180 },
  orbitInclinationDeg: { min: -45, max: 45 },
  hueShiftDeg: { min: -180, max: 180 },
} as const;

const clamp = (value: number, min: number, max: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

export const createCosmicArchitectOverride = (
  planet: PlanetData,
): CosmicArchitectOverride => ({
  sizeMultiplier: 1,
  orbitRadiusMultiplier: 1,
  gravityMultiplier: 1,
  orbitSpeedMultiplier: 1,
  orbitDirection: 1,
  axialTiltDeg: planet.axialTiltDeg,
  orbitInclinationDeg: planet.orbitInclinationDeg,
  hueShiftDeg: 0,
});
export const normalizeCosmicArchitectOverride = (
  planet: PlanetData,
  override: CosmicArchitectOverride,
): CosmicArchitectOverride => ({
  sizeMultiplier: clamp(
    override.sizeMultiplier,
    COSMIC_ARCHITECT_LIMITS.sizeMultiplier.min,
    COSMIC_ARCHITECT_LIMITS.sizeMultiplier.max,
    1,
  ),
  orbitRadiusMultiplier: clamp(
    override.orbitRadiusMultiplier,
    COSMIC_ARCHITECT_LIMITS.orbitRadiusMultiplier.min,
    COSMIC_ARCHITECT_LIMITS.orbitRadiusMultiplier.max,
    1,
  ),
  gravityMultiplier: clamp(
    override.gravityMultiplier,
    COSMIC_ARCHITECT_LIMITS.gravityMultiplier.min,
    COSMIC_ARCHITECT_LIMITS.gravityMultiplier.max,
    1,
  ),
  orbitSpeedMultiplier: clamp(
    override.orbitSpeedMultiplier,
    COSMIC_ARCHITECT_LIMITS.orbitSpeedMultiplier.min,
    COSMIC_ARCHITECT_LIMITS.orbitSpeedMultiplier.max,
    1,
  ),
  orbitDirection: override.orbitDirection === -1 ? -1 : 1,
  axialTiltDeg: clamp(
    override.axialTiltDeg,
    COSMIC_ARCHITECT_LIMITS.axialTiltDeg.min,
    COSMIC_ARCHITECT_LIMITS.axialTiltDeg.max,
    planet.axialTiltDeg,
  ),
  orbitInclinationDeg: clamp(
    override.orbitInclinationDeg,
    COSMIC_ARCHITECT_LIMITS.orbitInclinationDeg.min,
    COSMIC_ARCHITECT_LIMITS.orbitInclinationDeg.max,
    planet.orbitInclinationDeg,
  ),
  hueShiftDeg: clamp(
    override.hueShiftDeg,
    COSMIC_ARCHITECT_LIMITS.hueShiftDeg.min,
    COSMIC_ARCHITECT_LIMITS.hueShiftDeg.max,
    0,
  ),
});

const rotateHexHue = (hex: string, degrees: number) => {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match || degrees === 0) return hex;

  const red = Number.parseInt(match[1], 16) / 255;
  const green = Number.parseInt(match[2], 16) / 255;
  const blue = Number.parseInt(match[3], 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  let hue = 0;
  const saturation = delta === 0
    ? 0
    : delta / (1 - Math.abs(2 * lightness - 1));

  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  hue = (hue + degrees + 360) % 360;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const offset = lightness - chroma / 2;
  const [redPrime, greenPrime, bluePrime] = hue < 60
    ? [chroma, second, 0]
    : hue < 120
      ? [second, chroma, 0]
      : hue < 180
        ? [0, chroma, second]
        : hue < 240
          ? [0, second, chroma]
          : hue < 300
            ? [second, 0, chroma]
            : [chroma, 0, second];

  return `#${[redPrime, greenPrime, bluePrime]
    .map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * Applies architect settings without mutating the source array. A negative
 * orbitalPeriodDays value represents a retrograde orbit; the orbit renderer
 * should use its absolute value for duration and its sign for direction.
 */
export const applyCosmicArchitectOverrides = (
  planets: readonly PlanetData[],
  overrides: CosmicArchitectOverrides,
): PlanetData[] => planets.map((planet) => {
  if (planet.id === 'sun') return planet;
  const pending = overrides[planet.id];
  if (!pending) return planet;

  const override = normalizeCosmicArchitectOverride(planet, pending);
  const gravityAndRadiusFactor = Math.sqrt(
    override.gravityMultiplier / override.orbitRadiusMultiplier ** 3,
  );
  const effectiveSpeed = override.orbitSpeedMultiplier * gravityAndRadiusFactor;
  const direction = override.orbitDirection;

  return {
    ...planet,
    size: planet.size * override.sizeMultiplier,
    orbitRadius: planet.orbitRadius * override.orbitRadiusMultiplier,
    orbitalPeriodDays: planet.orbitalPeriodDays === 0
      ? 0
      : (Math.abs(planet.orbitalPeriodDays) / effectiveSpeed) * direction,
    axialTiltDeg: override.axialTiltDeg,
    orbitInclinationDeg: override.orbitInclinationDeg,
    color: rotateHexHue(planet.color, override.hueShiftDeg),
    rings: planet.rings
      ? {
          ...planet.rings,
          colorA: rotateHexHue(planet.rings.colorA, override.hueShiftDeg),
          colorB: rotateHexHue(planet.rings.colorB, override.hueShiftDeg),
        }
      : undefined,
  };
});
