# Planet Surface Shader Overhaul — Design

## Context

The procedural planet surface shader (`src/components/3d/shaders/PlanetSurfaceMaterial.ts`, introduced in the earlier visual-overhaul phase) reads as flat, blobby, and cartoonish:

- **Flat**: lighting is a single Lambertian diffuse term (`0.35 + 0.65 * lightDot`) with no bump/normal perturbation, no specular, no rim light. The sphere is lit as a smooth ball; the color pattern painted on top has no relationship to how light actually hits it.
- **Blobby**: color patterns come from broad `smoothstep` thresholds over `fbm` noise, producing soft, indistinct blotches rather than crisp, recognizable features (craters that look like craters, coastlines that look like coastlines).
- **Cartoonish**: every surface type is fundamentally a 2-color (`uBaseColor`/`uAccentColor`) blend gated by one threshold — a "paint by numbers" structure with no tonal depth (shadow tones, highlights, multi-stop gradients).

This is a full overhaul (design option "C" from brainstorming): fix all three problems together via a shared height-field + bump-mapping architecture, then give each of the four surface types (`cratered`, `banded`, `earthlike`, `venusAtmo`) bespoke, physically-motivated height/color logic instead of the current generic noise-threshold approach.

No external texture assets — this stays fully procedural GLSL, consistent with the existing constraint from the original visual-overhaul phase.

## Scope

**In scope**: a full rewrite of `src/components/3d/shaders/PlanetSurfaceMaterial.ts`'s fragment shader (vertex shader gets one addition — a view-space position varying for the rim/specular terms). No other file changes — same uniforms (`uTime`, `uBaseColor`, `uAccentColor`, `uSeed`, `uSurfaceType`, `uLightDirection`), same exported `SURFACE_TYPES` map, same JSX intrinsic typing. `PlanetMesh.tsx`, `planets.ts`, `AtmosphereMaterial.ts`, `RingBandMaterial.ts`, and all other Phase 1/Phase 2 files are untouched.

**Out of scope**: adding new uniforms/props, changing the atmosphere shell or Saturn's rings, adding real texture maps, changing planet sizes/geometry segment counts, touching any non-shader file.

## Architecture: shared height field + bump-mapped lighting

A per-surface-type height function `h(p): float` returns a scalar elevation for a given point on the unit sphere (`p = normalize(vPosition)`, offset by `uSeed`). This height field drives two things from the same source, so color and lighting stay physically consistent:

1. **Color** — elevation (and, for some surface types, a secondary "feature" value like crater-rim distance or band-turbulence) selects between 3+ color stops instead of the current single base/accent 2-stop blend, giving real tonal depth (shadow tone in low areas, base tone at mid elevation, highlight tone on peaks/rims).
2. **Bump-mapped normal** — sample `h` at the shading point and at two nearby points along an arbitrary tangent basis (derived from the geometric normal via a cross-product trick, since there's no UV-based tangent available), take finite differences to get a gradient, and perturb the geometric normal by `-gradient * bumpStrength` before normalizing. Lighting uses this bumped normal instead of the raw geometric normal, so craters/mountains/bands actually occlude and catch light like real terrain.

**Lighting composite** (replaces the current single `lightDot` line):
- Ambient floor (small, same purpose as today's `0.35` floor, retuned as needed)
- Bump-mapped diffuse: `max(dot(bumpedNormal, lightDir), 0)`
- Specular (Blinn-Phong, `pow(max(dot(bumpedNormal, halfVector), 0), shininess)`), strength varies by surface type: near-zero for `cratered`/`banded`, present for `earthlike` (ocean glint) and a subtle cloud sheen for `venusAtmo`
- Rim/fresnel term: `pow(1 - max(dot(bumpedNormal, viewDir), 0), 3)`, adds a soft edge highlight consistent with the existing separate atmosphere shell, using the bumped normal so terrain silhouettes read at the limb too

Requires adding `vViewPosition` to the vertex shader (same technique already used in `AtmosphereMaterial.ts`) so the fragment shader can compute `viewDir`.

## Per-surface-type height/color design

### `cratered` (Mercury, Moon, Mars)

Replaces the current "fbm blotches thresholded as craters" with actual crater primitives:
- Base terrain: low-amplitude `fbm` for rolling regolith texture (existing style, reduced amplitude so it doesn't compete with craters).
- Craters: 2 scales of cell-based (Worley-style nearest-feature-point) crater placement — a sparse large-crater layer and a denser small-crater layer. Each crater is shaped by a radial profile from its cell center: bowl-shaped depression for the interior, a raised rim ring near the edge, smooth falloff just outside. Layers combine additively (clamped) so overlapping craters look plausible.
- Color: darker shadow tone in bowls, base rock tone at rest elevation, a lighter/warmer highlight tone on rims (freshly-exposed material read).

### `banded` (Jupiter, Saturn, Uranus, Neptune)

- Bands: same sine-based structure as today, but the input coordinate is domain-warped by a second turbulent noise layer (animated via `uTime`) before the `sin()`, so band edges swirl organically instead of reading as clean, static stripes.
- Storm spot: a single low-frequency Worley cell, thresholded to appear rarely/subtly, produces a Jupiter-Great-Red-Spot-style localized dark/warm elliptical feature with swirl distortion around its edge.
- Color: 3-4 color stops interpolated across the warped band value (not a flat 2-tone flip), for richer banding gradients.
- Bump: subtle turbulence-driven height for soft cloud-top shading — not deep relief, just enough to break up the flat-ball look.

### `earthlike` (Earth)

- Land/ocean: keep the existing continent threshold on `fbm`, but add a higher-frequency detail-noise layer right at the threshold boundary so coastlines look jagged/natural instead of smooth blobs.
- Mountains: add a ridged-noise (`abs(noise*2-1)` inverted) elevation layer on land only, feeding the shared bump-mapping so mountain ranges actually cast shading.
- Oceans: flat height, get the specular highlight term (animated glint via `uTime`) for a "wet" read.
- Poles: latitude-based tint (using `abs(normalize(vPosition).y)` past a threshold) shifts color toward ice-white/pale-blue, both on land and ocean.
- Clouds: keep the existing drifting semi-transparent white layer (own `fbm`, offset by `uTime`), unchanged in spirit.

### `venusAtmo` (Venus)

- Same domain-warped turbulent-swirl treatment as `banded`'s storm distortion, tuned to Venus's warm haze palette (3-stop color blend instead of 2-stop).
- Subtle turbulence-driven bump for cloud-top relief (same technique as `banded`, lower amplitude) — no real solid surface, so this stays gentle.

## Testing / validation

- Existing `src/components/3d/shaders/PlanetSurfaceMaterial.test.ts` continues to cover uniform defaults (jsdom, no WebGL) — no new uniforms are introduced, so this file needs no changes.
- No automated test can verify the actual visual output (jsdom cannot render WebGL/GLSL) — manual browser verification is required for every surface type, per the lesson from the original visual-overhaul phase (a real runtime bug there was invisible to unit tests and only caught by loading the app in a browser).
- Manual verification checklist: each of the 4 surface types shows visible bump-mapped depth (terrain catches light asymmetrically, not a flat painted ball), craters on rocky planets look like bowls-with-rims rather than blotches, gas giant bands swirl rather than sitting as static stripes, Earth's coastlines/mountains/ice caps/ocean glint are all visible, no shader compile errors in the browser console, frame rate stays smooth with all ~9 planets on screen (the added bump-mapping/crater-layer cost is a few extra noise evaluations per fragment across a handful of small on-screen spheres — expected negligible, but worth a console/visual sanity check, not a numeric benchmark).
