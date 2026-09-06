import { forwardRef, type HTMLAttributes } from 'react';
import { getPlanetTheme, type PlanetThemeId } from '@/data/planetThemes';
import { getPlanetThemeCssVariables, getPlanetThemeDataAttributes } from './themeStyles';

export interface PlanetThemeScopeProps extends HTMLAttributes<HTMLDivElement> {
  planetId: PlanetThemeId;
}

export const PlanetThemeScope = forwardRef<HTMLDivElement, PlanetThemeScopeProps>(
  ({ planetId, style, ...props }, ref) => {
    const theme = getPlanetTheme(planetId);

    if (!theme) {
      return null;
    }

    return (
      <div
        ref={ref}
        {...getPlanetThemeDataAttributes(theme)}
        {...props}
        style={{ ...getPlanetThemeCssVariables(theme), ...style }}
      />
    );
  },
);

PlanetThemeScope.displayName = 'PlanetThemeScope';
