# Mission Portfolio Improvement Roadmap

> Planning document only. Each numbered plan can be implemented and reviewed independently, but the delivery order at the end minimizes rework.

> Parallel execution: use the ownership rules, worktree layout, and merge gates in [Agent Work Packets](./2026-09-06-agent-work-packets.md). Do not run the feature plans concurrently from one shared working directory.

**Goal:** Preserve the memorable solar-system experience while making the portfolio faster to evaluate, more credible, more accessible, more performant, and easier to maintain.

**Product principle:** Exploration is the signature experience; essential portfolio information must never be trapped behind exploration.

**Shared constraints:**

- Keep all résumé and project claims factual and sourced from `JacobSassResume.pdf` or the linked public repositories.
- Keep the existing planet assignments and space/HAB visual language.
- Treat the Quick Portfolio and planet archives as two presentations of the same data, not separate copies.
- Do not make sound autoplay. Preserve reduced-motion behavior and provide equivalent keyboard interaction.
- Add tests with each feature instead of leaving verification to a final cleanup phase.
- Preserve unrelated work already present in the dirty worktree.

## Implementation Status

- [x] Green-foundation slice: clean lint scope, root lint/type fixes, stronger planet-data validation, shared `npm run check`, and GitHub quality workflow.
- [ ] Plan 2: structured project catalog and case studies.
- [ ] Plan 3: clickable contact and résumé actions.
- [ ] Plans 1, 7, 8, 6, and 9, followed by the remaining Plan 10 reliability work.

## Plan 1: Quick Portfolio

**Outcome:** A recruiter can reach the complete professional summary in one click without removing the exploratory path.

### Scope

1. Add a prominent `QUICK PORTFOLIO` action to the desktop HUD and mobile destination panel.
2. Open a full-screen semantic overlay containing:
   - concise introduction;
   - education;
   - experience timeline;
   - skill groups;
   - three flagship projects;
   - contact actions;
   - `Explore the solar system` and `Download résumé` actions.
3. Read every section from shared structured data introduced in Plan 2. Do not duplicate prose in the component.
4. Trap focus while open, focus the heading on entry, return focus to the launch button on close, and support `Escape`.
5. Make the layout printable so it can act as a lightweight portfolio brief.

### Likely files

- Create `src/components/quick-portfolio/QuickPortfolio.tsx`
- Create `src/components/quick-portfolio/QuickPortfolio.test.tsx`
- Create `src/components/quick-portfolio/QuickProjectCard.tsx`
- Modify `src/components/SpaceHUD.tsx`
- Modify `src/pages/Index.tsx`
- Modify `src/hooks/useGameState.ts`
- Modify `src/index.css`

### Acceptance criteria

- Quick Portfolio is reachable with one click or keyboard activation from the initial screen.
- It contains all critical résumé information without requiring WebGL, travel, landing, or HAB interaction.
- Closing it restores focus and the previous exploration state.
- Mobile content does not overflow horizontally at 320 CSS pixels.
- A component test covers open, close, focus restoration, Escape, and all required sections.

### Risks and controls

- **Risk:** It competes visually with the primary experience. **Control:** Present two clearly labeled choices: `Explore` and `Quick Portfolio`, with exploration retaining visual priority.
- **Risk:** Content diverges from planets. **Control:** Plan 2's structured data is a prerequisite.

## Plan 2: Project Case Studies

**Outcome:** Project entries demonstrate engineering judgment and results instead of reading like short labels.

### Scope

1. Create a typed project catalog with one record per project:
   - `id`, `name`, `oneLineSummary`, `status`;
   - `problem`, `approach`, `outcome`;
   - verified metrics;
   - technology tags;
   - repository and live-demo links;
   - screenshot path and meaningful alt text;
   - optional limitations or lessons learned.
2. Keep `planets.ts` responsible for planet placement while referencing projects by ID.
3. Build a reusable case-study view for both the HAB archive and Quick Portfolio.
4. Add optimized screenshots for Fantasy Football, QuizClone, Campus Marketplace, Mission Portfolio, What's Jake Doing, and Arena Tracker.
5. Use explicit `Planned`, `In development`, or `Live` labels. Do not imply deployment where none exists.
6. Give flagship projects fuller case studies; side projects can use a shorter variant of the same component.

### Likely files

- Create `src/data/projects.ts`
- Create `src/data/projects.test.ts`
- Modify `src/data/planets.ts`
- Create `src/components/portfolio/ProjectCaseStudy.tsx`
- Create `src/components/portfolio/ProjectCaseStudy.test.tsx`
- Modify `src/components/planet/HabitatDesktop.tsx`
- Add optimized files under `public/projects/`

### Acceptance criteria

- Every Saturn and Uranus project has a summary, technologies, at least one substantive engineering detail, and a repository link.
- Live links appear only for verified deployments.
- All screenshots have useful alt text and constrained dimensions.
- No résumé metric is weakened, exaggerated, or repeated inconsistently.
- Data tests reject duplicate IDs, empty summaries, malformed URLs, missing image alt text, and unsupported status values.

### Initial content emphasis

- **Fantasy Football:** 740K+ historical records, leakage-safe validation, simulation scale, and test coverage.
- **QuizClone:** adaptive learning, multiple study modes, backups, sharing, and PostgreSQL RLS.
- **Campus Marketplace:** verified campus accounts, marketplace workflow, messaging, uploads, and administrative controls.
- **Mission Portfolio:** Three.js interaction design, planet transitions, terrain, and HAB OS.
- **What's Jake Doing?:** live availability, recurrence, ICS, protected admin tools, and secure server-only writes.
- **Arena Tracker:** Riot API integration, serverless secret protection, queue validation, and local-only result storage.

## Plan 3: Clickable Contact and Résumé Actions

**Outcome:** Visitors can contact Jake, inspect work, or download the résumé without copying text manually.

### Scope

1. Replace contact strings with typed link records: `label`, `href`, `kind`, and `external`.
2. Add accessible buttons for:
   - email via `mailto:`;
   - GitHub;
   - LinkedIn;
   - Sass Web Design;
   - résumé download;
   - verified live projects.
3. Copy `JacobSassResume.pdf` into a stable public location such as `public/Jacob-Sass-Resume.pdf` while keeping the editable/source copy unchanged.
4. Render the same contact action group on Neptune and in Quick Portfolio.
5. Use `target="_blank"` only where useful and pair it with `rel="noreferrer noopener"`.
6. Keep the phone number off the website unless explicitly requested later.

### Likely files

- Create `src/data/contact.ts`
- Create `src/components/portfolio/ContactActions.tsx`
- Create `src/components/portfolio/ContactActions.test.tsx`
- Modify `src/data/planets.ts`
- Modify `src/components/planet/HabitatDesktop.tsx`
- Add `public/Jacob-Sass-Resume.pdf`

### Acceptance criteria

- Each action has a descriptive accessible name and a valid destination.
- Email opens a prepared mail client action; résumé opens/downloads from a stable same-origin URL.
- External links are safe and visually identified.
- Neptune still makes sense if scripts for the entertainment apps fail.
- Tests assert every rendered `href`, external-link relation, and résumé filename.

## Plan 6: Performance and Loading Strategy

**Outcome:** The initial experience loads quickly on ordinary phones and laptops without flattening the visual design.

### Baseline

- Current production JavaScript is approximately 1.44 MB minified / 421 KB gzip and triggers Vite's large-chunk warning.
- The two HAB interior PNGs are each over 3 MB.
- `HabitatDesktop.tsx` and `HabitatFunApps.tsx` are large feature bundles.
- TanStack Query is mounted globally but currently has no application query consumers.

### Scope

1. Record a repeatable baseline using the production build, browser network transfer totals, and Lighthouse on desktop and simulated mobile.
2. Lazy-load noninitial states:
   - travel sequence;
   - planet surface and HAB interior;
   - HAB desktop;
   - entertainment/utility apps;
   - detailed case-study media.
3. Add lightweight, themed Suspense fallbacks that do not shift layout.
4. Convert large PNG artwork to appropriately sized WebP/AVIF variants and keep transparent PNG only where required.
5. Preload only the asset needed for the visitor's next confirmed transition.
6. Cap canvas device-pixel ratio and reduce star/terrain complexity on low-memory, reduced-motion, or low-core devices.
7. Audit and remove unused runtime providers and dependencies, beginning with the unused Query Client wrapper.
8. Add explicit Rollup chunk groups only after dynamic boundaries are working; chunk splitting alone is not treated as a performance win.
9. Add an error fallback for unavailable WebGL that opens Quick Portfolio.

### Likely files

- Modify `src/pages/Index.tsx`
- Modify `src/App.tsx`
- Modify `src/components/3d/SolarSystem.tsx`
- Modify `src/components/planet/BaseCampInterior.tsx`
- Modify `src/components/planet/HabitatDesktop.tsx`
- Modify `src/components/planet/PlanetTerrain.tsx`
- Modify `vite.config.ts`
- Replace/add optimized files in `public/`

### Performance targets

- No large-chunk warning for the initial application chunk.
- Initial JavaScript target: at or below 325 KB gzip, with HAB apps deferred.
- Initial route does not request HAB interior or project screenshots.
- Mobile LCP target: under 3.5 seconds on Lighthouse simulated mobile.
- CLS target: below 0.1; INP target: below 200 ms where measurable.
- Reduced-capability mode preserves navigation and all portfolio content.

### Tests and verification

- Production-build size report checked before and after.
- Unit tests cover lazy fallback and WebGL failure behavior.
- Manual slow-network walkthrough confirms no blank screens.
- Full exploration is checked after every asset conversion.

## Plan 7: Accessible Exploration Mode

**Outcome:** Keyboard, screen-reader, zoom, reduced-motion, and low-capability users can access the complete portfolio.

### Scope

1. Treat Quick Portfolio as the semantic non-WebGL equivalent, not a lesser fallback.
2. Remove `maximum-scale=1` and `user-scalable=no` from the viewport metadata.
3. Give all icon-only navigation buttons descriptive labels, including next/previous planet controls.
4. Add focus management for:
   - arriving on a planet;
   - entering/exiting the HAB;
   - sitting at/standing from the computer;
   - opening/closing desktop windows;
   - opening/closing Quick Portfolio.
5. Make reduced motion shorten the actual wait timers, not only the visual animations. A reduced-motion visitor should not wait through invisible 5.6-second travel.
6. Add a persistent `Skip travel` control during intercept and travel.
7. Ensure the destination list and all mission files work without pointer input.
8. Verify contrast, 44-by-44-pixel touch targets, visible focus rings, headings, landmarks, and live-region announcements.
9. Mark decorative WebGL/cosmetic layers as hidden from assistive technology while keeping the HTML navigation exposed.
10. Add automated accessibility checks and complete one NVDA keyboard walkthrough.

### Likely files

- Modify `index.html`
- Modify `src/components/SpaceHUD.tsx`
- Modify `src/components/PlanetSurface.tsx`
- Modify `src/components/TravelSequence.tsx`
- Modify `src/components/planet/BaseCampInterior.tsx`
- Modify `src/components/planet/HabitatDesktop.tsx`
- Modify `src/hooks/useGameState.ts`
- Add shared focus helpers/hooks under `src/hooks/`
- Add `vitest-axe` or equivalent test support

### Acceptance criteria

- A keyboard-only visitor can open Quick Portfolio, reach every core section, download the résumé, and activate contact links.
- A keyboard-only visitor can also complete the full explore/land/HAB/archive journey.
- Focus is never lost behind an overlay or returned to the document body unexpectedly.
- Browser zoom works to at least 200% without blocking core actions.
- Reduced-motion travel completes promptly and contains no looping decorative motion.
- Automated checks report no critical or serious accessibility violations on the initial HUD, Quick Portfolio, HAB computer, and contact actions.

## Plan 8: Portfolio Branding and Social Preview

**Outcome:** Shared links and browser surfaces look like Jake's finished product rather than a template-derived site.

### Scope

1. Create a 1200x630 Mission Portfolio Open Graph image using the real solar-system/HAB visual language and readable title treatment.
2. Replace the Lovable Open Graph and Twitter image URLs.
3. Create a coordinated favicon set and optional web-app manifest.
4. Rewrite title and meta descriptions around Jake's actual positioning: computer science, full-stack products, data/ML, and interactive experiences.
5. Add canonical URL when the production domain is known.
6. Add JSON-LD for `Person` and selected `SoftwareSourceCode` projects using only public information.
7. Remove unused Lovable artifacts, including `placeholder.svg`, comments, and `lovable-tagger` if no longer needed in development.
8. Keep the visible name (`Jake Sass`) and formal résumé name (`Jacob Sass`) intentionally consistent by context.

### Likely files

- Modify `index.html`
- Modify `package.json` and lockfile if `lovable-tagger` is removed
- Add `public/og-mission-portfolio.webp`
- Replace/add favicons under `public/`
- Add `public/site.webmanifest`
- Remove `public/placeholder.svg` if confirmed unused

### Acceptance criteria

- No metadata references Lovable or generic template artwork.
- Open Graph image remains readable at small preview sizes and has the expected 1.91:1 ratio.
- Favicon is recognizable in light and dark browser chrome.
- Structured data validates without invented employer or availability claims.
- LinkedIn, Discord, X/Twitter, and generic unfurl previews are manually checked after deployment.

## Plan 9: Distinct Planet and HAB Identities

**Outcome:** Each planet feels like a different mission destination without multiplying the application into ten unrelated designs.

### Architecture

Introduce a typed `PlanetTheme` configuration consumed by the surface, HAB, desktop, and telemetry layers. Build a small number of reusable visual systems with planet-specific variables rather than ten separate component trees.

### Scope

1. Add theme fields for:
   - accent and secondary colors;
   - interior lighting temperature;
   - window treatment and atmospheric effect;
   - wallpaper gradient/pattern;
   - telemetry labels and deterministic values;
   - prop/decal set;
   - optional ambient animation intensity.
2. Define families:
   - solar/industrial: Sun, Mercury, Mars;
   - terrestrial/research: Earth, Moon, Venus;
   - deep-space/heavy station: Jupiter, Saturn, Uranus, Neptune.
3. Give every destination one memorable identity cue tied to its portfolio topic, such as education research notes on Mercury or project schematics on Saturn.
4. Keep the desk, monitor, and navigation layout stable so users do not relearn controls.
5. Replace random surface temperature generation with deterministic planet data.
6. Use CSS variables, lightweight overlays, decals, and small props before adding more full-screen raster artwork.
7. If optional ambience is added, keep it muted by default with a visible control and stored preference.

### Likely files

- Create `src/data/planetThemes.ts`
- Create `src/data/planetThemes.test.ts`
- Modify `src/data/planets.ts`
- Modify `src/components/PlanetSurface.tsx`
- Modify `src/components/planet/PlanetTerrain.tsx`
- Modify `src/components/planet/BaseCampInterior.tsx`
- Modify `src/components/planet/HabitatDesktop.tsx`
- Modify `src/index.css`
- Add compact decorative assets under `public/planet-themes/`

### Acceptance criteria

- A user can identify the selected planet from the interior without reading the title.
- All planets retain identical core controls and readable content contrast.
- Theme configuration is complete for every planet and validated by tests.
- Temperature and telemetry do not change because React re-rendered.
- New identity assets stay within the performance budget established in Plan 6.
- Reduced-motion mode disables nonessential ambient motion.

## Plan 10: Polish, Reliability, and Quality Gates

**Outcome:** The repository has a dependable green baseline and failures are caught before deployment.

### Scope

1. Fix the current root lint errors in:
   - `src/components/ui/command.tsx`;
   - `src/components/ui/textarea.tsx`;
   - `tailwind.config.ts`.
2. Exclude `.claude/worktrees/**`, build output, and other generated/nested repositories from root lint discovery.
3. Decide whether existing Fast Refresh warnings should be fixed or explicitly accepted; do not leave ambiguous warning noise in CI.
4. Replace unmanaged transition `setTimeout` calls with cancelable timers or a small tested transition controller so unmounts and rapid navigation cannot race.
5. Add a React/WebGL error boundary that offers Retry and Quick Portfolio.
6. Expand data validation tests to require unique planet/content IDs, nonempty content, valid project references, and safe URLs.
7. Add Playwright smoke journeys for:
   - initial load and Quick Portfolio;
   - travel to one planet;
   - enter HAB and open a mission file;
   - next/previous navigation;
   - Neptune contact actions.
8. Investigate and eliminate the duplicate Three.js instance warning seen in shader tests.
9. Remove unused components/dependencies only after import analysis and a production build prove they are unnecessary.
10. Add CI gates for lint, unit tests, type checking, production build, and browser smoke tests.
11. Increase TypeScript strictness incrementally, beginning with new portfolio data and components.

### Likely files

- Modify `eslint.config.js`
- Modify `src/components/ui/command.tsx`
- Modify `src/components/ui/textarea.tsx`
- Modify `tailwind.config.ts`
- Modify `src/hooks/useGameState.ts`
- Create `src/components/AppErrorBoundary.tsx`
- Expand `src/data/planets.test.ts`
- Add `playwright.config.ts` and `e2e/`
- Add/update CI workflow under `.github/workflows/`
- Modify `package.json` scripts

### Acceptance criteria

- `npm run lint`, unit tests, type checking, production build, and browser smoke tests all exit zero.
- Lint scans only the intended repository and produces no unexplained warnings.
- Transition timers are canceled on replacement/unmount and covered by fake-timer tests.
- A forced rendering failure presents a usable recovery path.
- No duplicate Three.js warning remains in the test output.
- CI runs the same commands documented for local verification.

## Recommended Delivery Order

### Milestone A: Green foundation

1. Plan 10: lint scope, current lint errors, CI baseline, and data validators.
2. Plan 2: structured project catalog and case-study renderer.
3. Plan 3: structured contact actions and public résumé.

### Milestone B: Recruiter-ready path

4. Plan 1: Quick Portfolio using the structured project/contact data.
5. Plan 7: accessibility and reduced-motion pass across Quick Portfolio and exploration.
6. Plan 8: final metadata, social preview, favicon, and template cleanup.

### Milestone C: Experience and efficiency

7. Plan 6: lazy boundaries, image optimization, device scaling, and WebGL fallback.
8. Plan 9: planet/HAB identities implemented inside the new performance budget.
9. Plan 10: final browser tests, error recovery, dependency cleanup, and strictness pass.

## Definition of Done for the Roadmap

- A visitor can choose either immersive exploration or an immediate portfolio summary.
- Every project has evidence, safe links, clear status, and accessible media.
- Contact and résumé actions work directly.
- The initial bundle and artwork meet documented performance targets.
- The full experience works with keyboard, browser zoom, reduced motion, and without WebGL.
- Shared previews and browser branding are original to Mission Portfolio.
- Every planet has a recognizable but performant identity.
- Local and CI quality commands finish with a clean, repeatable result.
