# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive space-themed portfolio built with React, Three.js, and React Three Fiber. Visitors first choose between an immersive navigable solar system and an accessible recruiter-oriented Quick Portfolio. Each planet represents a different portfolio section and leads to a surface, base camp, and HAB desktop experience.

Read `docs/session-handoff.md` before starting new roadmap work. It records the current verified baseline, completed waves, remaining packets, and local repository state.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Architecture & State Management

### Global State (Zustand)
The application uses Zustand for state management in `src/hooks/useGameState.ts`. This is the single source of truth for:
- **View modes**: `'space' | 'intercepting' | 'traveling' | 'planet'` - controls which exploration component renders
- **Planet selection**: Tracks current and previous planet IDs
- **Transition states**: Manages cancelable travel timers, skip actions, reduced-motion timing, and announcements
- **Sign interaction**: Tracks which interactive sign is currently open
- **Quick Portfolio**: Tracks the recruiter overlay independently so exploration state is preserved

State transitions flow: `space` → `intercepting` → `traveling` → `planet` → `traveling` → `space`. Visitors may skip either travel stage.

### Component Architecture

**Experience layers:**
1. **Route prompt** (`pages/Index.tsx`): Lets visitors choose exploration or Quick Portfolio before Three.js loads
2. **Space View** (`components/3d/SolarSystem.tsx`): Capability-aware 3D solar system with clickable planets
3. **Travel Sequence** (`components/TravelSequence.tsx`): Accessible, skippable transition between views
4. **Planet Surface** (`components/PlanetSurface.tsx`): 2D landing page, base camp, and HAB entry
5. **Quick Portfolio** (`components/quick-portfolio/`): Full-screen semantic overview using shared project/contact data

These layers use `React.lazy` and stable `Suspense` fallbacks. Do not replace the semantic boundaries with arbitrary manual chunks. The initial route intentionally avoids requesting WebGL code or raster artwork until the visitor launches exploration.

**Key component organization:**
- `components/3d/` - Three.js/R3F components (planets, orbits, stars, sun)
- `components/planet/` - Planet surface components (terrain, base camp, interactive signs)
- `components/portfolio/` - Shared project case-study and contact actions
- `components/quick-portfolio/` - Recruiter path, focus trap, print layout, and exploration return
- `components/ui/` - shadcn/ui design system components (DO NOT modify unless necessary)

### Data Layer

`src/data/planets.ts` contains planet and archive data. `src/data/projects.ts` and `src/data/contact.ts` are the canonical professional project/contact sources. `src/data/planetThemes.ts` contains the complete typed theme configuration that Wave 6 must integrate. Each planet has:
- Display properties (name, color, size, orbit radius/speed)
- Content array of interactive signs with type variants: `'sign' | 'tablet' | 'console' | 'crate'`

## Styling & Design System

**Technology stack:**
- Tailwind CSS with custom space mission theme
- CSS custom properties defined in `src/index.css`
- shadcn/ui components with custom styling

**Key custom classes:**
- `.hud-panel` - Sci-fi styled UI panels with glow effects
- `.mission-sign` - Interactive planet surface signs
- `.text-glow` / `.text-glow-blue` - Text glow effects
- `.tracking-mission` - Extended letter spacing for "NASA vibe"
- `.stars-bg` - Repeating star background pattern

**Custom animations:**
- `orbit` - Planet orbit rotation
- `pulse-glow` - Pulsing glow for interactive elements
- `travel` - Travel sequence zoom effect
- `float` - Floating animation for UI elements
- `breathing` - Subtle breathing effect for idle states

**Color system:**
- Primary: Mission Orange (`#FF6B35`) - used for accents and interactive elements
- Secondary: Cool Blue - used for HUD elements
- Background: Deep space dark (`hsl(222 47% 6%)`)
- Planet-specific colors applied via inline styles from planet data

## Important Conventions

**3D Scene Management:**
- All Three.js components use React Three Fiber declarative API
- Camera positioned at `[0, 40, 80]` with FOV 60
- OrbitControls limit: minDistance 20, maxDistance 150
- Planet positions calculated using `orbitRadius` and `orbitSpeed` from planet data

**Responsive Behavior:**
- Fixed viewport design (`overflow: hidden` on html/body)
- Touch action disabled (`touch-action: none`) for 3D interaction
- Use `w-screen h-screen` on main containers

**Path Aliases:**
- `@/` resolves to `src/` directory (configured in vite.config.ts)

## Testing

Tests located in `src/test/` using Vitest + jsdom. Setup file: `src/test/setup.ts`

Run `npm run check` before every handoff. The current Wave 5 baseline is 29 passing test files / 129 tests, followed by a successful production build.

## Development Notes

- The historical Lovable origin is documented in README, but Lovable metadata, tooling, and the unused placeholder asset have been removed
- Vite dev server runs on port 8080 with HMR overlay disabled
- Font loading: Space Grotesk (headings), Inter (body) from @fontsource packages
- The production domain is not yet documented, so canonical and `og:url` metadata remain intentionally unset
