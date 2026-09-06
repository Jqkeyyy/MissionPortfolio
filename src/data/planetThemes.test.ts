import { describe, expect, it } from 'vitest';
import { planets } from './planets';
import {
  formatTelemetryReading,
  getHabitatFamily,
  getPlanetTheme,
  habitatFamilies,
  HABITAT_FAMILY_IDS,
  isPlanetThemeId,
  PLANET_THEME_IDS,
  planetThemes,
  type HabitatFamilyId,
  type PlanetTheme,
  type PlanetThemeId,
  type TelemetryReadingId,
} from './planetThemes';
import {
  getPlanetThemeCssVariables,
  getPlanetThemeDataAttributes,
  resolveAmbientTheme,
} from '@/components/planet/theme/themeStyles';

const EXPECTED_FAMILIES: Record<HabitatFamilyId, readonly PlanetThemeId[]> = {
  'solar-industrial': ['sun', 'mercury', 'mars'],
  'terrestrial-research': ['venus', 'earth', 'moon'],
  'deep-space-station': ['jupiter', 'saturn', 'uranus', 'neptune'],
};

const EXPECTED_TELEMETRY_IDS: readonly TelemetryReadingId[] = [
  'surface-temperature',
  'atmosphere',
  'hab-pressure',
  'oxygen-reserve',
  'comms-link',
];

const EXPECTED_SURFACE_TEMPERATURES: Record<PlanetThemeId, number> = {
  sun: 5500,
  mercury: 167,
  venus: 464,
  earth: 15,
  moon: -20,
  mars: -63,
  jupiter: -110,
  saturn: -140,
  uranus: -195,
  neptune: -200,
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const relativeLuminance = (color: string): number => {
  const channels = color
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (foreground: string, background: string): number => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

const themes = Object.values(planetThemes) as PlanetTheme[];

describe('planet theme configuration', () => {
  it('covers every existing destination exactly once and in navigation order', () => {
    expect(PLANET_THEME_IDS).toEqual(planets.map((planet) => planet.id));
    expect(Object.keys(planetThemes)).toEqual(PLANET_THEME_IDS);
    expect(new Set(themes.map((theme) => theme.id)).size).toBe(PLANET_THEME_IDS.length);
    expect(themes.every((theme) => isPlanetThemeId(theme.id))).toBe(true);
    expect(isPlanetThemeId('pluto')).toBe(false);
    expect(getPlanetTheme('pluto')).toBeUndefined();
  });

  it('defines exactly three complete, reusable habitat families', () => {
    expect(Object.keys(habitatFamilies)).toEqual(HABITAT_FAMILY_IDS);

    for (const familyId of HABITAT_FAMILY_IDS) {
      const family = getHabitatFamily(familyId);
      expect(family.id).toBe(familyId);
      expect(family.label.trim().length).toBeGreaterThan(5);
      expect(family.description.trim().length).toBeGreaterThan(20);
      expect(family.shellProfile.trim()).not.toBe('');
      expect(family.panelFinish.trim()).not.toBe('');
      expect(family.structuralCue.trim()).not.toBe('');
    }
  });

  it.each(Object.entries(EXPECTED_FAMILIES))(
    'assigns the %s family to its intended destinations',
    (familyId, expectedIds) => {
      expect(themes.filter((theme) => theme.family === familyId).map((theme) => theme.id)).toEqual(
        expectedIds,
      );
    },
  );

  it('gives every destination complete visual tokens and readable panel text', () => {
    for (const theme of themes) {
      for (const color of Object.values(theme.palette)) {
        expect(color).toMatch(HEX_COLOR);
      }
      expect(theme.window.tint).toMatch(HEX_COLOR);
      expect(theme.lighting.temperatureKelvin).toBeGreaterThanOrEqual(2500);
      expect(theme.lighting.temperatureKelvin).toBeLessThanOrEqual(7000);
      expect(theme.lighting.intensity).toBeGreaterThan(0);
      expect(theme.lighting.intensity).toBeLessThanOrEqual(1);
      expect(theme.window.opacity).toBeGreaterThanOrEqual(0);
      expect(theme.window.opacity).toBeLessThanOrEqual(1);
      expect(theme.window.atmosphericEffect.trim().length).toBeGreaterThan(20);
      expect(theme.wallpaper.gradient).toContain('gradient(');
      expect(contrastRatio(theme.palette.text, theme.palette.panel)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('provides fixed, complete telemetry for every destination', () => {
    for (const theme of themes) {
      expect(theme.telemetry.map((reading) => reading.id)).toEqual(EXPECTED_TELEMETRY_IDS);
      expect(new Set(theme.telemetry.map((reading) => reading.id)).size).toBe(
        EXPECTED_TELEMETRY_IDS.length,
      );

      const surfaceTemperature = theme.telemetry[0];
      expect(surfaceTemperature.value).toBe(EXPECTED_SURFACE_TEMPERATURES[theme.id]);
      expect(surfaceTemperature.unit).toBe('°C');
      expect(formatTelemetryReading(surfaceTemperature)).toBe(
        `${EXPECTED_SURFACE_TEMPERATURES[theme.id]}°C`,
      );

      for (const reading of theme.telemetry) {
        expect(reading.label.trim()).not.toBe('');
        expect(String(reading.value).trim()).not.toBe('');
        if (typeof reading.value === 'number') {
          expect(Number.isFinite(reading.value)).toBe(true);
        }
      }
    }
  });

  it('gives each destination a distinct topic-linked identity cue', () => {
    expect(new Set(themes.map((theme) => theme.identityCue)).size).toBe(themes.length);

    for (const theme of themes) {
      expect(theme.identityCue.trim().length).toBeGreaterThan(30);
      expect(theme.props.length).toBeGreaterThanOrEqual(2);
      expect(theme.decals.length).toBeGreaterThanOrEqual(2);
      expect(theme.ambient.intensity).toBeGreaterThanOrEqual(0);
      expect(theme.ambient.intensity).toBeLessThanOrEqual(1);
    }
  });

  it('returns stable theme and telemetry references without runtime generation', () => {
    const first = getPlanetTheme('mars');
    const second = getPlanetTheme('mars');

    expect(first).toBe(second);
    expect(first?.telemetry).toBe(second?.telemetry);
    expect(first?.telemetry[0].value).toBe(-63);
  });

  it('resolves reusable CSS variables, data hooks, and reduced-motion ambience', () => {
    const theme = planetThemes.saturn;

    expect(getPlanetThemeCssVariables(theme)).toMatchObject({
      '--planet-accent': theme.palette.accent,
      '--planet-wallpaper': theme.wallpaper.gradient,
      '--planet-window-opacity': theme.window.opacity,
    });
    expect(getPlanetThemeDataAttributes(theme)).toEqual({
      'data-planet-theme': 'saturn',
      'data-habitat-family': 'deep-space-station',
      'data-wallpaper-pattern': 'orbit-lines',
      'data-window-treatment': 'deep-space-glass',
    });
    expect(resolveAmbientTheme(theme, false)).toEqual(theme.ambient);
    expect(resolveAmbientTheme(theme, true)).toEqual({ animation: 'none', intensity: 0 });
  });
});
