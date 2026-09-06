import type { CSSProperties } from 'react';
import {
  getHabitatFamily,
  type AmbientAnimation,
  type PlanetTheme,
} from '@/data/planetThemes';

export type PlanetThemeCssProperties = CSSProperties & {
  [property: `--planet-${string}`]: string | number;
};

export interface ResolvedAmbientTheme {
  animation: AmbientAnimation | 'none';
  intensity: number;
}

export const getPlanetThemeCssVariables = (theme: PlanetTheme): PlanetThemeCssProperties => ({
  '--planet-accent': theme.palette.accent,
  '--planet-secondary': theme.palette.secondary,
  '--planet-interior': theme.palette.interior,
  '--planet-panel': theme.palette.panel,
  '--planet-text': theme.palette.text,
  '--planet-light-temperature': `${theme.lighting.temperatureKelvin}K`,
  '--planet-light-intensity': theme.lighting.intensity,
  '--planet-window-tint': theme.window.tint,
  '--planet-window-opacity': theme.window.opacity,
  '--planet-wallpaper': theme.wallpaper.gradient,
  '--planet-ambient-intensity': theme.ambient.intensity,
});

export const resolveAmbientTheme = (
  theme: PlanetTheme,
  prefersReducedMotion: boolean,
): ResolvedAmbientTheme =>
  prefersReducedMotion
    ? { animation: 'none', intensity: 0 }
    : { animation: theme.ambient.animation, intensity: theme.ambient.intensity };

export const getPlanetThemeDataAttributes = (theme: PlanetTheme) => ({
  'data-planet-theme': theme.id,
  'data-habitat-family': getHabitatFamily(theme.family).id,
  'data-wallpaper-pattern': theme.wallpaper.pattern,
  'data-window-treatment': theme.window.treatment,
});
