# Planet & Base Camp Visual Overhaul (Phase 1) — Design

## Context

The current UI reads as "dirty"/unprofessional in four areas:
- Planets in the solar system view are flat-colored `meshStandardMaterial` spheres — no surface detail.
- Planet hover/click feedback is a plain `hud-panel` `<Html>` tooltip; click travels instantly with no feedback.
- The base camp exterior (`BaseCamp.tsx`) is ~30 absolutely-positioned `<div>`s with inline gradients.
- The base camp interior (`BaseCampInterior.tsx`) is ~50 absolutely-positioned `<div>`s with inline gradients.

Explicitly out of scope for this phase: sign modals (`SignModal.tsx`), computer terminal screen content (`ComputerScreen.tsx`), the travel sequence (`TravelSequence.tsx`), and the top-level `SpaceHUD.tsx`. Those get a later pass.

No external texture assets will be used (no image URLs to fetch/guess) — all surface detail is procedural (GLSL shaders).

## Shared visual language

All four areas use one consistent "mission HUD" idiom: thin cyan/orange reticle brackets, scanline text reveals, and glow-on-focus states — so the pass feels like one system rather than four unrelated reskins. Existing design tokens (`--primary` mission orange, `--secondary`/`--hud-line` cool blue, `hud-panel` styling) are reused, not replaced.

## 1. Realistic planets (procedural shaders)

- New `src/components/3d/shaders/PlanetSurfaceMaterial.ts`: a custom shader material (via `@react-three/drei`'s `shaderMaterial` + `extend`) with a `surface` variant switch baked in per-instance via uniform:
  - `cratered` — Mercury, Moon, Mars: mottled noise + darker crater-like spots.
  - `banded` — Jupiter, Saturn, Uranus, Neptune: horizontal noise-perturbed bands, slow horizontal drift over time.
  - `earthlike` — Earth: continents via noise threshold over an ocean base color, plus a separate slowly-drifting cloud noise layer.
  - `venusAtmo` — Venus: swirling high-frequency haze noise, no hard features.
  - Uniforms: `uBaseColor`, `uAccentColor`, `uSeed` (per-planet variation), `uTime`.
- New `src/components/3d/shaders/AtmosphereMaterial.ts`: fresnel-based glow shader applied to a slightly-larger enclosing shell mesh, additive-blended. Intensity/color tuned per planet (strong blue for Earth, faint tinted rim for rocky bodies, warm haze for Venus).
- `src/data/planets.ts`: add a `surface: 'cratered' | 'banded' | 'earthlike' | 'venusAtmo'` field to `PlanetData` and set it per planet.
- `PlanetMesh.tsx`: swap `meshStandardMaterial` for the new shader material + add the atmosphere shell; keep existing rotation/orbit logic.
- Saturn's ring: replace the flat single-opacity `Ring` with a small radial shader (`RingBandMaterial` or inline shader) that varies alpha in concentric bands, so it reads as rings rather than a translucent disk. Ring geometry/position stay as-is.

## 2. Planet hover/click interaction

- New shared `src/components/3d/PlanetReticle.tsx`, rendered via `<Html>`, used by both `PlanetMesh.tsx` and `Sun.tsx`:
  - **Hover:** four corner brackets scale/fade in around the body; label text does a brief left-to-right scanline/clip reveal (CSS `clip-path` animation or Framer Motion width reveal) instead of appearing instantly.
  - **Click:** local `locking` state drives a ~450ms "LOCKING…" animation (brackets converge inward, planet mesh gets a brief emissive pulse via a local uniform/opacity tween) before the existing `onClick` (→ `travelToPlanet`) fires. Clicks are ignored while `locking` is true, so double-clicks can't double-fire travel.
- `useGameState.ts` is untouched — the lock animation is purely local UI state in the mesh component, delaying the existing `onClick` callback.

## 3. Base camp exterior

- `BaseCamp.tsx` rebuilt around a single inline `<svg viewBox="...">` illustration (using `<defs>` for `linearGradient`/`radialGradient`/blur filters) replacing the current stacked-div dome/panels/antenna/crates: dome silhouette, glowing window row, solar panel with an actual SVG grid pattern, blinking antenna light (`motion.circle`), dashed/pulsing landing-pad lines (`motion.line`).
- The whole SVG is wrapped in the existing `motion.button` entrance/hover/tap animation (position, scale, delay unchanged).
- The info panel above (`BASE CAMP ESTABLISHED` / planet name) and the "Enter Base Camp" hint panel below keep their current `hud-panel` treatment — that part isn't part of the "dirty" complaint — but get tightened spacing and reuse the new reticle-style icon treatment for visual consistency with planet hover states.

## 4. Base camp interior

- `BaseCampInterior.tsx`: the static room shell (ceiling, side walls with pipes/vents/equipment, floor with grid + hazard stripes, ceiling lights, ceiling viewport window) becomes one SVG background illustration instead of ~50 divs — crisper linework, coherent perspective/lighting via gradients.
- The two interactive elements — computer terminal and airlock door — stay as separate `motion.button` components (they need independent hover/click states and labels) but their internals are redrawn as compact SVG graphics with fewer redundant layers and more physically plausible proportions (monitor, stand, desk; door frame, window, handle).
- Header panel, bottom exit button, HUD corner readouts (`LOCATION`, `LIFE SUPPORT`, etc.), and ambient dust particles are unchanged — they're not part of the "dirty" complaint.

## Testing / validation

- `npm run lint` and `npm test` after implementation.
- Manual verification via browser (dev server on :8080): confirm each planet renders with distinct shader surface + atmosphere glow and no console/shader compile errors; confirm hover reticle and click-lock animation on a planet and the Sun; confirm base camp exterior renders correctly for at least 2 different planet colors; confirm entering a base camp shows the new interior, and both the terminal and airlock remain clickable/functional; confirm exit flow still works.
- Since custom GLSL is being introduced, shader compilation must be checked live in-browser (console errors), not just via TypeScript build success.
