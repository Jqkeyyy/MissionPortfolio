# Mission Portfolio

**Live site:** [mission-portfolio-amber.vercel.app](https://mission-portfolio-amber.vercel.app/)

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

Navigation flows through an opt-in route prompt, 3D **space** and **intercept** views, an animated **travel** sequence, and a 2D **planet surface** with an explorable base camp. A hands-on tutorial uses arrows and live highlights to teach the real interaction path through the Sun, base camp, computer, archive, and mission files. Quick Portfolio provides the same professional content, project case studies, résumé, and contact actions through an accessible printable overlay. Heavy 3D, planet, and HAB modules are loaded only when requested.

Every major destination is shareable:

- `/portfolio` opens the recruiter-first portfolio as a standalone page.
- `/projects/:projectId` opens a media-rich engineering case study with a system map.
- `/explore/:planetId` opens a specific immersive destination when WebGL is available.
- `Ctrl/Cmd+K` opens the global command palette for projects, planets, contact actions, resume access, and graphics settings.

Project and planet pages are prerendered after the Vite build with route-specific canonical URLs, social metadata, structured data, and sitemap entries. Visitors can select Low, Balanced, High, or Auto graphics; Auto responds to device signals and sustained frame rate.

## Astronomical simulation

The immersive map uses approximate NASA planetary periods and axial tilts with elliptical,
inclined orbits. The Moon follows Earth, and Jupiter, Saturn, Uranus, and Neptune each have
their corresponding ring systems. Motion can run at Real Time, 100x, 1,000x, 5,000x,
Mission Speed, or Super Fast, and can be paused without changing position. The physical
presets accelerate orbit and rotation uniformly. Mission Speed uses two clearly disclosed
readable scales: one Earth year passes in 60 seconds for orbits, while one Earth day passes
in 12 seconds for axial rotation. Super Fast quarters those displayed durations.

Planet sizes, interplanetary distances, ring widths, and deterministic starting positions
remain artistically compressed for navigation; this is a proportional educational model,
not a live ephemeris.

The map also includes an illustrative deterministic asteroid belt, selected major moons,
a comet, and an optional axial-tilt guide. These context objects are compressed visual aids,
not a live ephemeris.

## Privacy and optional telemetry

Exploration progress and the sound preference stay in this browser. Sound is muted by
default and no audio context is created until the visitor enables it. Aggregate telemetry
is disabled unless `VITE_TELEMETRY_ENDPOINT` is configured. When configured, the client
honors Global Privacy Control and Do Not Track, sends only a strict event allowlist without
cookies or identifiers, redacts client errors, and never sends page URLs, free-form input,
camera motion, or contact details. Any configured collector must discard or truncate IP
addresses and publish a short retention/deletion policy.

The repository includes an optional same-origin collector at `/api/telemetry`. It stores only daily aggregate counters in an Upstash-compatible Redis REST store. Configure `TELEMETRY_REDIS_REST_URL`, `TELEMETRY_REDIS_REST_TOKEN`, and a strong `TELEMETRY_DASHBOARD_TOKEN`, then set `VITE_TELEMETRY_ENDPOINT=/api/telemetry`. The protected `/mission-analytics` page reads those counters and is excluded from the generated sitemap with `noindex,nofollow` metadata.

Set `VITE_SITE_URL` after connecting a custom HTTPS domain. Canonical URLs, social metadata, structured data, `robots.txt`, and the generated sitemap derive from that value during production builds.

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
npm run test:e2e     # Chromium, Firefox, and WebKit browser gates
npm run test:lighthouse # performance, accessibility, best-practice, and SEO budgets
npm run content:check   # project evidence, media, links, and stale-content validation
npm run content:check:network # optional live-link reachability pass
npm run media:capture   # refresh deployed-project WebP evidence
npm run test:visual:update # intentionally refresh reviewed visual baselines
```

Chromium additionally covers the WebGL journey, axe accessibility scans, and stable visual snapshots.

## Project structure

- `src/components/3d/` — the orbiting solar system (planets, orbits, stars, sun)
- `src/components/planet/` — planet surface scenes (terrain, base camp, interactive signs)
- `src/components/quick-portfolio/` — accessible recruiter overview and print path
- `src/components/portfolio/` — reusable project and contact presentation components
- `src/components/tutorial/` — action-driven tutorial overlay and target pointers
- `src/components/ui/` — shadcn/ui design system components
- `src/data/planets.ts` — all planet metadata and portfolio content
- `src/data/projects.ts` / `src/data/contact.ts` — shared project and contact records
- `src/data/planetThemes.ts` — shared visual, habitat, and telemetry identity for every destination
- `src/hooks/useGameState.ts` — global view/navigation state (Zustand)
- `src/hooks/useInteractiveTutorial.ts` — tutorial steps and real-action progression

See `CLAUDE.md` for the architecture and conventions. See `docs/session-handoff.md` for current progress, verification, known risks, and the exact next packet.

## Origins

Originally scaffolded from a [Lovable](https://lovable.dev) template; since substantially rebuilt and hardened for public release.
