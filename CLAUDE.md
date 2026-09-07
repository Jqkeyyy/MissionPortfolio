# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive 3D space-themed portfolio website built with React, Three.js, and React Three Fiber. The application presents a navigable solar system where each planet represents a different section of a portfolio (education, skills, experience, projects, contact, etc.).

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
- **View modes**: `'space' | 'traveling' | 'planet'` - controls which view component renders
- **Planet selection**: Tracks current and previous planet IDs
- **Transition states**: Manages travel animations between views
- **Sign interaction**: Tracks which interactive sign is currently open

State transitions flow: `space` → `traveling` → `planet` → `traveling` → `space`

### Component Architecture

**Three-tier view system:**
1. **Space View** (`components/3d/SolarSystem.tsx`): Interactive 3D solar system with clickable planets
2. **Travel Sequence** (`components/TravelSequence.tsx`): Animated transition between views
3. **Planet Surface** (`components/PlanetSurface.tsx`): 2D landing page with interactive signs/content

**Key component organization:**
- `components/3d/` - Three.js/R3F components (planets, orbits, stars, sun)
- `components/planet/` - Planet surface components (terrain, base camp, interactive signs)
- `components/ui/` - shadcn/ui design system components (DO NOT modify unless necessary)

### Data Layer

`src/data/planets.ts` contains all planet and content data. Each planet has:
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

## Development Notes

- Built from Lovable.dev template - some references remain in README
- Vite dev server runs on port 8080 with HMR overlay disabled
- Font loading: Space Grotesk (headings), Inter (body) from @fontsource packages
