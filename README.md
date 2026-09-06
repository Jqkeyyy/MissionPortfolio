# Mission Portfolio

An interactive 3D space-themed portfolio site. Instead of a scrolling page, visitors pilot through a navigable solar system built with Three.js / React Three Fiber — each planet is a mission stop that lands on a 2D surface with interactive signs, tablets, and consoles covering a different part of the portfolio:

| Body | Section |
| --- | --- |
| Sun | Identity / Introduction |
| Mercury | Education |
| Venus | Skills |
| Earth | Experience |
| Moon | Engineering Principles |
| Mars | About Me |
| Jupiter | Summit Moving |
| Saturn | Flagship Projects |
| Uranus | Experiments & Tools |
| Neptune | Contact / Hire Me |

Navigation flows through three views — a 3D **space** view with clickable orbiting planets, an animated **travel** sequence between stops, and a 2D **planet surface** landing page for each section's content.

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Three.js** / **React Three Fiber** / **drei** for the 3D solar system
- **Zustand** for view/navigation state
- **Tailwind CSS** + **shadcn/ui** for the sci-fi HUD design system
- **Vitest** + **Testing Library** for tests

## Getting started

```sh
# Install dependencies
npm i

# Start the dev server (http://localhost:8080)
npm run dev
```

Other useful commands:

```sh
npm run build       # production build
npm run build:dev   # development-mode build
npm run preview     # preview a production build
npm run lint         # eslint
npm run typecheck    # TypeScript validation
npm test             # run tests once
npm run test:watch  # tests in watch mode
npm run check        # lint, typecheck, test, and production build
```

## Project structure

- `src/components/3d/` — the orbiting solar system (planets, orbits, stars, sun)
- `src/components/planet/` — planet surface scenes (terrain, base camp, interactive signs)
- `src/components/ui/` — shadcn/ui design system components
- `src/data/planets.ts` — all planet metadata and portfolio content
- `src/hooks/useGameState.ts` — global view/navigation state (Zustand)

See `CLAUDE.md` for a deeper architecture walkthrough and conventions.

## Origins

Originally scaffolded from a [Lovable](https://lovable.dev) template; since substantially rebuilt and hardened for public release.
