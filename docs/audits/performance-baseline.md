# Performance Baseline Audit

**Captured:** 2026-09-06

**Baseline commit:** `f63e7ef6546dad4deeac5d60080c502eb8f5b33d`

**Toolchain:** Node.js 22.18.0, npm 11.7.0, Vite 7.3.6

## Executive summary

The production build passes, but the application is delivered as one large JavaScript file. The file is 1,438.73 kB minified and 420.57 kB gzip, so it triggers Vite's 500 kB raw chunk warning and exceeds the roadmap's 325 kB gzip initial-JavaScript budget by 95.57 kB (29%). There are no dynamic imports anywhere under `src`, which means travel, planet-surface, HAB, fun-app, and not-found code all enter the initial chunk even though most of it is not rendered on the initial space view.

The `public` directory contains 8.33 MB across eight files. Two HAB interior PNGs account for 6.78 MB (81% of that directory). Browser requests are state-dependent even though their referencing modules are not: the initial space view requests the 281.68 kB shuttle texture, while planet and HAB artwork is not needed until the relevant state is rendered. One of the two HAB interior files and the placeholder SVG have no source references.

The app also mounts a TanStack Query client with no query consumers. Separately, the shader tests pass but each emits `WARNING: Multiple instances of Three.js being imported.` The installed tree contains the direct `three@0.160.1` plus `three@0.170.0` nested under `stats-gl@2.4.2`, which is brought in by `@react-three/drei`.

## Method and limitations

- `npm run build` produced the production artifact and Vite's raw/gzip report.
- A local Node gzip pass (level 9) measured aggregate output categories. These synthetic gzip figures are useful for repeatable comparison; actual hosting may use Brotli, different gzip settings, caching, or no compression for already-compressed formats.
- Public image dimensions were read from the file headers with `System.Drawing`; the SVG dimensions came from its root element.
- Static imports and asset references were inspected with `rg` and direct source review.
- The three shader tests were run together to reproduce the known Three.js warning.
- Lighthouse and real-browser network traces were not captured in this packet. LCP, CLS, and INP below are release budgets, not measured baseline values. Capture desktop and simulated-mobile traces after the lazy-loading and asset work is integrated.

## Production output

Vite emitted one JavaScript chunk and one CSS file. The first three rows are Vite's build-reported decimal kB values. Aggregate rows use a repeatable local gzip pass and therefore can differ slightly from Vite's reporting implementation.

| Output | Files | Raw | Gzip | Initial route behavior |
| --- | ---: | ---: | ---: | --- |
| `dist/index.html` | 1 | 1.65 kB | 0.67 kB | Requested first |
| `dist/assets/index-Bv_7hl45.css` | 1 | 125.79 kB | 21.41 kB | Requested first |
| `dist/assets/index-JPIHZdSr.js` | 1 | 1,438.73 kB | 420.57 kB | Requested first; Vite warning |
| Font files | 46 | 649.86 kB | 649.56 kB | Emitted up front; browser requests only supported formats/subsets/weights used |
| Copied public files | 8 | 8,333.42 kB | 8,313.95 kB | Copied to `dist`; requests depend on browser and UI state |
| Entire `dist` | 57 | 10,549.46 kB | 9,405.03 kB | Deployment footprint, not one page-load transfer |

The unavoidable first-view transfer is at least about **724 kB** before fonts, favicon, headers, and caching: HTML gzip (0.67 kB), CSS gzip (21.41 kB), JavaScript gzip (420.57 kB), and the initial shuttle PNG (281.68 kB). The stylesheet exposes five Latin WOFF2 files totaling another 87.48 kB, but the exact set requested depends on which weights the initial content uses.

## Public asset inventory

Public assets are copied byte-for-byte into `dist`; being present in this table does not mean the browser fetches the file during the initial route.

| Asset | Dimensions | Bytes | Decimal kB | Observed use / request boundary |
| --- | ---: | ---: | ---: | --- |
| `base-camp-interior-v6-stool.png` | 1672 x 940 | 3,448,745 | 3,448.75 | Rendered only after entering a base camp |
| `base-camp-interior-v5-cutout.png` | 1672 x 940 | 3,327,791 | 3,327.79 | No source reference found; still copied to deployment |
| `base-camp-exterior.png` | 1100 x 660 | 914,356 | 914.36 | Planet surface, after travel |
| `landing-pad.png` | 720 x 456 | 342,013 | 342.01 | Planet surface, after travel |
| `mission-shuttle.png` | 640 x 427 | 281,679 | 281.68 | Initial space-view Three.js texture; reused during travel/landing |
| `favicon.ico` | 48 x 48 | 15,406 | 15.41 | Browser-dependent; no explicit favicon link in current HTML |
| `placeholder.svg` | 1200 x 1200 | 3,253 | 3.25 | No source reference found |
| `robots.txt` | n/a | 174 | 0.17 | Crawler request only |

Important consequences:

- The two HAB PNGs are 6,776,536 bytes combined. They are the highest-value conversion targets for WebP/AVIF candidates.
- The unused v5 interior contributes 3.33 MB to every deployment but should not be deleted until the optimized-asset/integration packets confirm it is not a desired fallback or source artifact.
- `base-camp-exterior.png`, `landing-pad.png`, and `mission-shuttle.png` are already compressed PNGs, so HTTP gzip provides almost no benefit. Image-format conversion and responsive variants are the useful levers.
- The current initial route correctly avoids requesting HAB imagery, but it still downloads the JavaScript that implements the HAB.

## Import and loading analysis

`src/main.tsx` synchronously imports `App.tsx`, and `App.tsx` synchronously imports both routes and every global provider. `src/pages/Index.tsx` then synchronously imports all four experience states. No `React.lazy`, `lazy(...)`, or dynamic `import(...)` call exists under `src`, and the build confirms that there is only one JavaScript chunk.

| UI/module group | Render condition | Network behavior now | Classification |
| --- | --- | --- | --- |
| `App`, router, tooltip, both toaster systems, Query provider | Every route | In the initial chunk | Initial infrastructure |
| `Index`, `SolarSystem`, all `components/3d/*`, `SpaceHUD` | Default `currentView === 'space'` | In the initial chunk; shuttle texture requested | Initial rendered experience |
| `ShipFlightLayer` | Component is mounted, returns `null` until traveling | Module in initial chunk; its DOM image is not the reason the shuttle is initially fetched because `SolarSystemShip` also loads that texture | Initial code, deferred render |
| `TravelSequence` | `currentView === 'traveling'` | In the initial chunk | Deferred-only UI, not code-split |
| `PlanetSurface`, terrain, landing pad/ship, base camp | `currentView === 'planet'` | In the initial chunk; surface images wait for render | Deferred-only UI, not code-split |
| `BaseCampInterior` | User enters the base camp | In the initial chunk; 3.45 MB interior image waits for render | Deep deferred-only UI, not code-split |
| `HabitatDesktop` and `HabitatFunApps` | User sits at the HAB computer and opens apps | In the initial chunk | Deepest deferred-only UI, not code-split |
| `NotFound` | Catch-all route | In the initial chunk | Alternate-route UI, not code-split |

The two largest authored deep-state modules are `HabitatDesktop.tsx` (48,449 source bytes) and `HabitatFunApps.tsx` (33,184 source bytes). Source length is not equivalent to minified bundle contribution, but it reinforces that these modules should not be paid for before the visitor starts the HAB flow.

## Ranked lazy-loading boundaries

1. **Planet surface boundary:** lazy-load `PlanetSurface` from `Index.tsx` on the first transition toward a planet. This immediately removes planet, terrain, landing, base-camp, and HAB code from the default space-view chunk. Start the import when a destination is confirmed so the existing intercept/travel animation hides network latency.
2. **HAB interior and desktop boundary:** retain a second nested boundary at base-camp entry, with `BaseCampInterior`, `HabitatDesktop`, and especially `HabitatFunApps` deferred until needed. This keeps deep interaction code out of both the space and surface experiences. A stable, fixed-size themed fallback must preserve layout.
3. **Travel boundary:** lazy-load `TravelSequence` and the DOM flight layer when travel begins. Prefetch on planet focus/selection where practical because this state is timing-sensitive and must never show a blank frame.
4. **Not-found route boundary:** lazy-load `NotFound`; it should not ship to a visitor on the valid root route.
5. **Immersive/WebGL boundary after Quick Portfolio exists:** put `SolarSystem` and its Three.js graph behind a capability-aware exploration boundary so a visitor choosing Quick Portfolio, or a device without usable WebGL, avoids the 3D payload. Splitting `SolarSystem` while still rendering it immediately on every visit changes chunk shape but does not reduce transferred JavaScript, so it ranks below truly noninitial state boundaries until that alternate entry path exists.

Manual Rollup chunks should follow these semantic dynamic boundaries, not replace them. The acceptance signal is lower initial requested bytes and less initial parse/evaluation work, not simply more output files.

## Performance budgets

These budgets align with the roadmap and remain achievable without removing the immersive experience.

| Metric | Budget | Baseline status | Measurement rule |
| --- | ---: | --- | --- |
| Initial JavaScript | **<= 325 kB gzip** | 420.57 kB; fails by 95.57 kB | Sum JavaScript requested before interaction on `/`, cold cache |
| Initial-route raster images | **<= 250 kB transfer** | Shuttle alone is 281.68 kB; fails by 31.68 kB | Sum images requested before interaction; exclude favicon |
| Premature HAB images | **0 bytes before base-camp entry** | Passes by source/render inspection | Cold-cache network trace; no HAB interior or project media request |
| Largest deferred HAB image variant | **<= 450 kB transfer** | Current v6 PNG is 3,448.75 kB; fails | Measure the selected responsive WebP/AVIF candidate, not every emitted variant |
| Mobile LCP | **< 3.5 s** | Not measured | Lighthouse simulated mobile plus a browser trace; report median of at least 3 runs |
| CLS | **< 0.10** | Not measured | Lighthouse/browser trace through initial render and one complete planet/HAB journey |
| INP | **< 200 ms** | Not measured | Field data when available; otherwise record interactive lab traces and use TBT as a diagnostic proxy, not as INP |

The image budgets require format conversion rather than gzip. Preserve transparency only where the visual composition requires it, include intrinsic dimensions or stable aspect ratios, and select variants sized to their rendered viewport.

## Unused Query Client

`src/App.tsx` imports `QueryClient` and `QueryClientProvider`, constructs a client at module scope, and wraps the entire application. A repository search finds no `useQuery`, `useMutation`, or other query client consumer. This makes the provider and its production runtime work currently unnecessary.

Recommended ownership: remove the wrapper and dependency during the serial performance packet, then rebuild and compare the initial chunk. Do not treat removal as safe solely from this text search; run the full test suite and exercise both routes after the change.

## Duplicate Three.js warning

The targeted shader suite passes all four tests but prints the following warning once per test file:

```text
WARNING: Multiple instances of Three.js being imported.
```

The installed dependency tree explains a credible source:

- Application, `@react-three/fiber@8.18.0`, and most Drei dependencies resolve to `three@0.160.1`.
- `@react-three/drei@9.122.0` includes `stats-gl@2.4.2`.
- `stats-gl@2.4.2` has its own nested `three@0.170.0`.

The production build itself does not print the duplicate-instance warning, so this audit does not claim both full Three.js copies are present in the production chunk. The warning is confirmed in Vitest and the version split is confirmed in the installed tree. The serial reliability packet should determine whether Drei's barrel import causes `stats-gl` to load in the test transform, then align/dedupe compatible versions or use narrower supported imports. Any fix must preserve the shader `extend()` side effects and be validated in both tests and the production browser.

## Next comparison checklist

After the performance integration packet:

1. Run the identical `npm run build` command and compare initial JS gzip against 420.57 kB.
2. Confirm the output contains semantic chunks for noninitial states and that the initial route does not request them.
3. Record a cold-cache network trace for space, planet, base-camp, and HAB entry; note exactly when each image and chunk is requested.
4. Verify converted images at representative desktop/mobile sizes and transparent edges.
5. Run at least three simulated-mobile Lighthouse passes and report the median LCP and CLS.
6. Capture interaction traces for planet selection, travel skip, HAB entry, and Quick Portfolio; evaluate INP when field data becomes available.
7. Re-run the shader tests and require no unexplained duplicate Three.js warning for final release.
