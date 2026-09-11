import { planetThemes, habitatFamilies, type HabitatFamilyId, type PlanetThemePalette } from '@/data/planetThemes';
import { planets, type PlanetData, type PlanetSurface } from '@/data/planets';

export type FusiblePlanetId = Exclude<PlanetData['id'], 'sun'>;

export interface FusionWorldOption {
  id: FusiblePlanetId;
  name: string;
  color: string;
  description: string;
}

export interface PlanetFusionSurface {
  rendererSurface: PlanetSurface;
  label: string;
  description: string;
}

export interface PlanetFusionHabitat {
  familyId: HabitatFamilyId;
  label: string;
  identity: string;
}

export interface PlanetFusion {
  id: string;
  primaryId: FusiblePlanetId;
  secondaryId: FusiblePlanetId;
  name: string;
  description: string;
  palette: PlanetThemePalette;
  surface: PlanetFusionSurface;
  habitat: PlanetFusionHabitat;
}

const canonicalPlanets = planets.filter(
  (planet): planet is PlanetData & { id: FusiblePlanetId } => planet.id !== 'sun',
);

const canonicalById = new Map<FusiblePlanetId, PlanetData>(
  canonicalPlanets.map((planet) => [planet.id, planet]),
);

/** Stable list for selectors. The Sun is reserved for its own endgame anomaly. */
export const FUSIBLE_PLANETS: readonly FusionWorldOption[] = canonicalPlanets.map((planet) => ({
  id: planet.id,
  name: planet.displayName.replace(/^The /, ''),
  color: planet.color,
  description: planet.description,
}));

const ICONIC_NAMES: Readonly<Record<string, string>> = {
  'mars:saturn': 'Marsurn',
  'saturn:mars': 'Satars',
  'earth:moon': 'Earthmoon',
  'moon:earth': 'Moonth',
};
const SURFACE_LABELS: Record<PlanetSurface, string> = {
  cratered: 'Cratered regolith',
  banded: 'Banded atmosphere',
  earthlike: 'Living terrain',
  venusAtmo: 'Cloud-shrouded terrain',
};

const parseHex = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized;
  const value = Number.parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');

/** Mixes two six- or three-digit hex colors. The result is stable and renderer-safe. */
export const mixFusionColors = (left: string, right: string, rightWeight = 0.5): `#${string}` => {
  const weight = Math.min(1, Math.max(0, Number.isFinite(rightWeight) ? rightWeight : 0.5));
  const leftRgb = parseHex(left);
  const rightRgb = parseHex(right);
  return `#${leftRgb.map((channel, index) => toHex(channel * (1 - weight) + rightRgb[index] * weight)).join('')}`;
};

const cleanName = (planet: PlanetData) => planet.displayName.replace(/^The /, '');

export const createFusionName = (primary: PlanetData, secondary: PlanetData): string => {
  const iconic = ICONIC_NAMES[`${primary.id}:${secondary.id}`];
  if (iconic) return iconic;

  const left = cleanName(primary);
  const right = cleanName(secondary);
  const leftLength = left.length <= 4 ? left.length : Math.ceil(left.length * 0.58);
  const rightStart = Math.max(1, Math.floor(right.length * 0.48));
  const joined = `${left.slice(0, leftLength)}${right.slice(rightStart)}`;
  return `${joined[0].toUpperCase()}${joined.slice(1).toLowerCase()}`;
};

const selectSurface = (primary: PlanetData, secondary: PlanetData): PlanetFusionSurface => {
  const rendererSurface = secondary.surface === 'banded' || primary.surface === 'banded'
    ? 'banded'
    : primary.surface === 'earthlike' || secondary.surface === 'earthlike'
      ? 'earthlike'
      : primary.surface === 'venusAtmo' || secondary.surface === 'venusAtmo'
        ? 'venusAtmo'
        : 'cratered';
  const primaryLabel = SURFACE_LABELS[primary.surface].toLowerCase();
  const secondaryLabel = SURFACE_LABELS[secondary.surface].toLowerCase();

  return {
    rendererSurface,
    label: primary.surface === secondary.surface
      ? `Amplified ${SURFACE_LABELS[primary.surface].toLowerCase()}`
      : `${SURFACE_LABELS[primary.surface]} / ${SURFACE_LABELS[secondary.surface]}`,
    description: primary.surface === secondary.surface
      ? `Both source worlds resonate through a denser ${primaryLabel} profile.`
      : `${primaryLabel} fractures through ${secondaryLabel}, with both source signatures still visible.`,
  };
};

const selectHabitat = (primary: PlanetData, secondary: PlanetData): PlanetFusionHabitat => {
  const primaryTheme = planetThemes[primary.id];
  const secondaryTheme = planetThemes[secondary.id];
  const familyId = primary.size >= secondary.size ? primaryTheme.family : secondaryTheme.family;
  const family = habitatFamilies[familyId];
  return {
    familyId,
    label: primaryTheme.family === secondaryTheme.family
      ? family.label
      : `${habitatFamilies[primaryTheme.family].label} × ${habitatFamilies[secondaryTheme.family].label}`,
    identity: `${primaryTheme.identityCue} ${secondaryTheme.identityCue}`,
  };
};

const createPalette = (primary: PlanetData, secondary: PlanetData): PlanetThemePalette => {
  const left = planetThemes[primary.id].palette;
  const right = planetThemes[secondary.id].palette;
  return {
    accent: mixFusionColors(left.accent, right.accent, 0.45),
    secondary: mixFusionColors(left.secondary, right.secondary, 0.55),
    interior: mixFusionColors(left.interior, right.interior, 0.5),
    panel: mixFusionColors(left.panel, right.panel, 0.5),
    text: mixFusionColors(left.text, right.text, 0.5),
  };
};

/** Creates a deterministic fusion from two distinct canonical portfolio worlds. */
export const createPlanetFusion = (
  primaryId: FusiblePlanetId,
  secondaryId: FusiblePlanetId,
): PlanetFusion => {
  const primary = canonicalById.get(primaryId);
  const secondary = canonicalById.get(secondaryId);
  if (!primary || !secondary) throw new RangeError('Planet fusion requires canonical, non-solar worlds.');
  if (primaryId === secondaryId) throw new RangeError('Planet fusion requires two distinct worlds.');

  const name = createFusionName(primary, secondary);
  return {
    id: `fusion:${primary.id}:${secondary.id}`,
    primaryId,
    secondaryId,
    name,
    description: `${name} combines ${primary.description.toLowerCase()} with ${secondary.description.toLowerCase()} in one unstable portfolio world.`,
    palette: createPalette(primary, secondary),
    surface: selectSurface(primary, secondary),
    habitat: selectHabitat(primary, secondary),
  };
};

const average = (left: number, right: number) => (left + right) / 2;

/**
 * Adapts the canonical catalog for the current 3D renderer. The primary route ID
 * remains stable, the secondary body is removed, and its satellites are re-parented.
 */
export const applyPlanetFusionToPlanets = (
  catalog: readonly PlanetData[],
  fusion: PlanetFusion | null,
): PlanetData[] => {
  if (!fusion) return [...catalog];
  const primary = catalog.find((planet) => planet.id === fusion.primaryId);
  const secondary = catalog.find((planet) => planet.id === fusion.secondaryId);
  if (!primary || !secondary) return [...catalog];

  const hybridParent = primary.orbitParentId === secondary.id
    ? secondary.orbitParentId
    : primary.orbitParentId;

  return catalog.flatMap((planet) => {
    if (planet.id === secondary.id) return [];
    if (planet.id === primary.id) {
      const inheritedRings = primary.rings ?? secondary.rings;
      return [{
        ...primary,
        displayName: fusion.name,
        name: fusion.name.toLowerCase(),
        color: fusion.palette.accent,
        surface: fusion.surface.rendererSurface,
        size: Math.max(primary.size, secondary.size) * 1.08,
        orbitRadius: average(primary.orbitRadius, secondary.orbitRadius),
        orbitalPeriodDays: average(primary.orbitalPeriodDays, secondary.orbitalPeriodDays),
        orbitalEccentricity: average(primary.orbitalEccentricity, secondary.orbitalEccentricity),
        orbitInclinationDeg: average(primary.orbitInclinationDeg, secondary.orbitInclinationDeg),
        rotationPeriodHours: average(primary.rotationPeriodHours, secondary.rotationPeriodHours),
        axialTiltDeg: average(primary.axialTiltDeg, secondary.axialTiltDeg),
        orbitParentId: hybridParent,
        rings: inheritedRings ? {
          ...inheritedRings,
          colorA: fusion.palette.accent,
          colorB: fusion.palette.secondary,
        } : undefined,
        description: fusion.description,
        content: [...primary.content, ...secondary.content],
      }];
    }
    if (planet.orbitParentId === secondary.id) {
      return [{ ...planet, orbitParentId: primary.id }];
    }
    return [planet];
  });
};
