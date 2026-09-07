# Mission Portfolio

An interactive space-themed portfolio with two entry paths: visitors can launch a navigable Three.js / React Three Fiber solar system or open a fast, recruiter-friendly Quick Portfolio without loading WebGL. Each planet is a mission stop that lands on a 2D surface and HAB desktop covering a different part of the portfolio:

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

Navigation flows through an opt-in route prompt, 3D **space** and **intercept** views, an animated **travel** sequence, and a 2D **planet surface** with an explorable base camp. Quick Portfolio provides the same professional content, project case studies, résumé, and contact actions through an accessible printable overlay. Heavy 3D, planet, and HAB modules are loaded only when requested.

## Astronomical simulation

The immersive map uses approximate NASA planetary periods and axial tilts with elliptical,
inclined orbits. The Moon follows Earth, and Jupiter, Saturn, Uranus, and Neptune each have
their corresponding ring systems. Motion is accelerated with two clearly displayed visual
scales: one Earth year passes in 60 seconds for orbits, while one Earth day passes in 12
seconds for axial rotation. Keeping those scales separate makes both the inner and outer
planets readable without turning the fast-spinning giants into a blur.

Planet sizes, interplanetary distances, ring widths, and deterministic starting positions
remain artistically compressed for navigation; this is a proportional educational model,
not a live ephemeris.

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Three.js** / **React Three Fiber** / **drei** for the 3D solar system
- **Zustand** for view/navigation state
- **Tailwind CSS** + **shadcn/ui** for the sci-fi HUD design system
- **Vitest** + **Testing Library** + **Playwright** for unit, component, and browser tests

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
npm run test:e2e     # production critical-path checks in Chromium
```

## Project structure

- `src/components/3d/` — the orbiting solar system (planets, orbits, stars, sun)
- `src/components/planet/` — planet surface scenes (terrain, base camp, interactive signs)
- `src/components/quick-portfolio/` — accessible recruiter overview and print path
- `src/components/portfolio/` — reusable project and contact presentation components
- `src/components/ui/` — shadcn/ui design system components
- `src/data/planets.ts` — all planet metadata and portfolio content
- `src/data/projects.ts` / `src/data/contact.ts` — shared project and contact records
- `src/data/planetThemes.ts` — shared visual, habitat, and telemetry identity for every destination
- `src/hooks/useGameState.ts` — global view/navigation state (Zustand)

See `CLAUDE.md` for the architecture and conventions. See `docs/session-handoff.md` for current progress, verification, known risks, and the exact next packet.

## Origins

Originally scaffolded from a [Lovable](https://lovable.dev) template; since substantially rebuilt and hardened for public release.
