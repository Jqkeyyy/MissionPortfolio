# Planet Surface Shader Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the "flat, blobby, cartoonish" look of the procedural planet surfaces by giving every surface type a real height field that drives both color and bump-mapped lighting, plus bespoke per-type terrain (Worley-cell craters, domain-warped bands, coastlines/mountains/ice caps, swirling haze) instead of generic 2-color noise thresholds.

**Architecture:** A single shared height-field/lighting engine (bump-mapped normal via finite-difference gradient of a per-surface-type `height(p)` function, plus ambient+diffuse+specular+rim lighting composite) is built once in Task 1, then each surface type's `height`/`color` function pair is upgraded from a placeholder (reusing today's exact patterns) to bespoke terrain logic in Tasks 2-4. Everything lives inside `src/components/3d/shaders/PlanetSurfaceMaterial.ts` — no other file changes, same uniforms, same exported names.

**Tech Stack:** React 18, TypeScript, `@react-three/fiber` v8, `@react-three/drei` v9, `three` r160, GLSL (WebGL). Vitest for the one existing unit test (uniform defaults only — jsdom cannot render WebGL/GLSL).

## Global Constraints

- No new uniforms, no changes to `SURFACE_TYPES`, no changes to any file other than `src/components/3d/shaders/PlanetSurfaceMaterial.ts`. `PlanetMesh.tsx`, `planets.ts`, `AtmosphereMaterial.ts`, `RingBandMaterial.ts`, and every other file are untouched.
- **GLSL syntax/runtime errors are invisible to `tsc`, `eslint`, `npm test`, and `npm run build`** — those only validate the TypeScript wrapping the GLSL template-string literals. A shader compile error only surfaces at runtime in a real WebGL context (browser console). Manual browser verification in Task 5 is mandatory and is the only real correctness check for the shader logic itself.
- Avoid reversed-edge `smoothstep(edge0, edge1, x)` where `edge0 >= edge1` — the GLSL spec leaves this undefined. To invert a ramp, use `1.0 - smoothstep(loEdge, hiEdge, x)` (increasing edges), never `smoothstep(hiEdge, loEdge, x)`.
- Never call `normalize()` on a vector that can be exactly `(0,0,0)` — it produces `NaN`, and `NaN` comparisons in GLSL are always `false`, so a `NaN`-guard written *after* normalizing silently fails to trigger. Check the vector's squared length (`dot(v, v)`) *before* normalizing when a zero-vector case is possible.
- `tsconfig.app.json` has `strict: false` / `noImplicitAny: false` / `strictNullChecks` off — match the codebase's existing typing looseness (this only affects the TS wrapper, not the GLSL).
- Keep the existing `as unknown as new () => THREE.ShaderMaterial & {...}` cast pattern and the `// eslint-disable-next-line @typescript-eslint/no-namespace` placement exactly as they are today — both were fixed in an earlier phase after a real lint/tsc regression; do not simplify or remove them.

---

### Task 1: Shared bump-mapping and lighting infrastructure

**Files:**
- Modify: `src/components/3d/shaders/PlanetSurfaceMaterial.ts` (full rewrite)

**Interfaces:**
- Produces: same public interface as before — `SURFACE_TYPES`, `PlanetSurfaceMaterial` with uniforms `uTime`, `uBaseColor`, `uAccentColor`, `uSeed`, `uSurfaceType`, `uLightDirection`. No other file needs to change; `PlanetMesh.tsx` is untouched.

This task builds the height-field/bump-mapping/lighting engine and wires it up using **placeholder height/color functions that reproduce today's exact visual patterns** (same noise expressions as the current file, just refactored into named per-type functions). This makes the depth/lighting improvement independently verifiable before any per-type terrain upgrade happens in Tasks 2-4.

There is no meaningful unit test for the shader logic itself (GLSL, no WebGL context in jsdom) — the existing `PlanetSurfaceMaterial.test.ts` only checks uniform defaults and needs no changes since no uniforms changed. Verification is: confirm the existing test still passes, confirm lint/tsc/build are clean, and do a manual browser check (Step 2) that the visual look actually changed (planets should now show visible depth/shading, not just the same flat colors).

- [ ] **Step 1: Replace the file contents**

Replace all of `src/components/3d/shaders/PlanetSurfaceMaterial.ts` with:

```ts
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlanetSurface } from '@/data/planets';

export const SURFACE_TYPES: Record<PlanetSurface, number> = {
  cratered: 0,
  banded: 1,
  earthlike: 2,
  venusAtmo: 3,
};

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uSeed;
  uniform float uSurfaceType;
  uniform vec3 uLightDirection;

  float hash13(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(hash13(i + vec3(0.0, 0.0, 0.0)), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise3(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // --- Per-surface-type height fields (Task 1: placeholders reproducing today's patterns) ---

  float heightCratered(vec3 p) {
    float n = fbm(p * 2.0);
    float craters = smoothstep(0.35, 0.55, fbm(p * 5.0 + 10.0));
    return n * 0.3 - craters * 0.4;
  }

  float heightBanded(vec3 p) {
    float bandNoise = fbm(vec3(p.x * 0.6, p.y * 3.0 + uTime * 0.03, p.z * 0.6));
    float bands = sin((p.y + bandNoise * 0.6) * 6.0);
    return bands * 0.25;
  }

  float heightEarthlike(vec3 p) {
    float land = smoothstep(0.42, 0.5, fbm(p * 1.8));
    return land * 0.3;
  }

  float heightVenus(vec3 p) {
    vec3 hp = p * 1.5 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
    float haze = fbm(hp * 2.5);
    return haze * 0.2;
  }

  float surfaceHeight(vec3 p) {
    if (uSurfaceType < 0.5) return heightCratered(p);
    else if (uSurfaceType < 1.5) return heightBanded(p);
    else if (uSurfaceType < 2.5) return heightEarthlike(p);
    else return heightVenus(p);
  }

  // --- Per-surface-type color (Task 1: placeholders reproducing today's patterns) ---

  vec3 colorCratered(vec3 p, float height) {
    float n = fbm(p * 2.0);
    float craters = smoothstep(0.35, 0.55, fbm(p * 5.0 + 10.0));
    vec3 color = mix(uBaseColor, uAccentColor, n);
    color = mix(color, color * 0.6, craters);
    return color;
  }

  vec3 colorBanded(vec3 p, float height) {
    float bandNoise = fbm(vec3(p.x * 0.6, p.y * 3.0 + uTime * 0.03, p.z * 0.6));
    float bands = sin((p.y + bandNoise * 0.6) * 6.0);
    float bandMix = smoothstep(-0.2, 0.2, bands);
    return mix(uBaseColor, uAccentColor, bandMix);
  }

  vec3 colorEarthlike(vec3 p, float height) {
    float land = smoothstep(0.42, 0.5, fbm(p * 1.8));
    vec3 color = mix(uBaseColor, uAccentColor, land);
    vec3 cp = normalize(p) * 2.5 + vec3(uTime * 0.02, 0.0, 0.0);
    float clouds = smoothstep(0.55, 0.7, fbm(cp * 3.0));
    color = mix(color, vec3(1.0), clouds * 0.8);
    return color;
  }

  vec3 colorVenus(vec3 p, float height) {
    vec3 hp = p * 1.5 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
    float haze = fbm(hp * 2.5);
    return mix(uBaseColor, uAccentColor, haze);
  }

  vec3 surfaceColor(vec3 p, float height) {
    if (uSurfaceType < 0.5) return colorCratered(p, height);
    else if (uSurfaceType < 1.5) return colorBanded(p, height);
    else if (uSurfaceType < 2.5) return colorEarthlike(p, height);
    else return colorVenus(p, height);
  }

  // --- Per-surface-type specular strength (Task 1: no specular yet) ---

  float surfaceSpecular(vec3 p) {
    return 0.0;
  }

  void main() {
    vec3 p = normalize(vPosition) * 3.0 + uSeed;

    // Build an arbitrary tangent basis from the geometric normal for bump-mapping.
    // Guard against normalize(0,0,0) -> NaN by checking squared length BEFORE normalizing.
    vec3 upHint = vec3(0.0, 1.0, 0.0);
    vec3 tangentRaw = cross(vNormal, upHint);
    if (dot(tangentRaw, tangentRaw) < 0.001) {
      upHint = vec3(1.0, 0.0, 0.0);
      tangentRaw = cross(vNormal, upHint);
    }
    vec3 tangent = normalize(tangentRaw);
    vec3 bitangent = normalize(cross(vNormal, tangent));

    float eps = 0.02;
    float h0 = surfaceHeight(p);
    float h1 = surfaceHeight(p + tangent * eps);
    float h2 = surfaceHeight(p + bitangent * eps);
    vec3 grad = ((h1 - h0) * tangent + (h2 - h0) * bitangent) / eps;
    float bumpStrength = 0.6;
    vec3 bumpedNormal = normalize(vNormal - grad * bumpStrength);

    vec3 color = surfaceColor(p, h0);

    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(uLightDirection);

    float ambient = 0.15;
    float diffuse = max(dot(bumpedNormal, lightDir), 0.0);

    float specStrength = surfaceSpecular(p);
    vec3 halfVec = normalize(lightDir + viewDir);
    float specAngle = max(dot(bumpedNormal, halfVec), 0.0);
    float specular = pow(specAngle, 32.0) * specStrength;

    float rim = pow(1.0 - max(dot(bumpedNormal, viewDir), 0.0), 3.0) * 0.15;

    vec3 lit = color * (ambient + diffuse * 0.85) + vec3(1.0) * specular + uBaseColor * rim;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

export const PlanetSurfaceMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color('#888888'),
    uAccentColor: new THREE.Color('#444444'),
    uSeed: 0,
    uSurfaceType: 0,
    uLightDirection: new THREE.Vector3(0.6, 0.5, 0.7),
  },
  vertexShader,
  fragmentShader
) as unknown as new () => THREE.ShaderMaterial & {
  uTime: number;
  uBaseColor: THREE.Color;
  uAccentColor: THREE.Color;
  uSeed: number;
  uSurfaceType: number;
  uLightDirection: THREE.Vector3;
};

extend({ PlanetSurfaceMaterial });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      planetSurfaceMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        ref?: React.Ref<InstanceType<typeof PlanetSurfaceMaterial>>;
        uTime?: number;
        uBaseColor?: THREE.Color;
        uAccentColor?: THREE.Color;
        uSeed?: number;
        uSurfaceType?: number;
        uLightDirection?: THREE.Vector3;
      };
    }
  }
}
```

- [ ] **Step 2: Verify the TypeScript wrapper and existing test**

Run these (none can catch a GLSL bug — they only confirm the TS/JS wrapper is valid):

```bash
npx eslint src/components/3d/shaders/PlanetSurfaceMaterial.ts
npx tsc -p tsconfig.app.json --noEmit
npm test -- PlanetSurfaceMaterial.test.ts
```

Expected: 0 lint errors, 0 tsc errors, the existing 2 tests still pass unmodified (no uniforms changed).

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/shaders/PlanetSurfaceMaterial.ts
git commit -m "feat: add bump-mapped lighting engine to planet surface shader"
```

---

### Task 2: Cratered surface upgrade (Worley-cell craters)

**Files:**
- Modify: `src/components/3d/shaders/PlanetSurfaceMaterial.ts` (targeted edits within the fragment shader string)

**Interfaces:**
- Consumes: the `surfaceHeight`/`surfaceColor`/`surfaceSpecular` dispatch structure and `bumpedNormal`/lighting composite built in Task 1 — unchanged.
- Produces: same public interface as Task 1 (no uniform/export changes).

Replaces the placeholder `heightCratered`/`colorCratered` from Task 1 with real crater primitives: a 3D Worley (cellular noise) helper placing crater centers at two scales, and a radial crater profile (bowl + rim + falloff) shaping each one.

- [ ] **Step 1: Add the `worley3` and `craterProfile` helper functions**

In `src/components/3d/shaders/PlanetSurfaceMaterial.ts`, inside the fragment shader template string, add these two functions immediately after the `fbm` function and before `heightCratered`:

```glsl
  vec2 worley3(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);
    float minDist = 10.0;
    float cellHash = 0.0;
    for (int z = -1; z <= 1; z++) {
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec3 neighbor = vec3(float(x), float(y), float(z));
          vec3 jitter = vec3(
            hash13(ip + neighbor + vec3(17.0, 0.0, 0.0)),
            hash13(ip + neighbor + vec3(0.0, 37.0, 0.0)),
            hash13(ip + neighbor + vec3(0.0, 0.0, 59.0))
          );
          vec3 cellPoint = neighbor + jitter;
          float d = length(cellPoint - fp);
          if (d < minDist) {
            minDist = d;
            cellHash = hash13(ip + neighbor + vec3(91.0, 13.0, 0.0));
          }
        }
      }
    }
    return vec2(minDist, cellHash);
  }

  float craterProfile(float d, float radius, float depth) {
    float t = d / radius;
    float bowl = -depth * (1.0 - smoothstep(0.0, 0.75, t));
    float rimT = max(smoothstep(0.6, 0.85, t) - smoothstep(0.85, 1.05, t), 0.0);
    float rim = depth * 0.4 * rimT;
    float falloff = 1.0 - smoothstep(1.0, 1.3, t);
    return (bowl + rim) * falloff;
  }
```

- [ ] **Step 2: Replace `heightCratered`**

Replace the Task 1 placeholder:

```glsl
  float heightCratered(vec3 p) {
    float n = fbm(p * 2.0);
    float craters = smoothstep(0.35, 0.55, fbm(p * 5.0 + 10.0));
    return n * 0.3 - craters * 0.4;
  }
```

with:

```glsl
  float heightCratered(vec3 p) {
    float base = fbm(p * 2.0) * 0.15;
    float height = base;

    vec3 pLarge = p * 2.2;
    vec2 wLarge = worley3(pLarge);
    if (wLarge.y < 0.55) {
      height += craterProfile(wLarge.x, 0.42, 0.5);
    }

    vec3 pSmall = p * 6.0 + 13.7;
    vec2 wSmall = worley3(pSmall);
    if (wSmall.y < 0.35) {
      height += craterProfile(wSmall.x, 0.35, 0.22);
    }

    return height;
  }
```

- [ ] **Step 3: Replace `colorCratered`**

Replace the Task 1 placeholder:

```glsl
  vec3 colorCratered(vec3 p, float height) {
    float n = fbm(p * 2.0);
    float craters = smoothstep(0.35, 0.55, fbm(p * 5.0 + 10.0));
    vec3 color = mix(uBaseColor, uAccentColor, n);
    color = mix(color, color * 0.6, craters);
    return color;
  }
```

with:

```glsl
  vec3 colorCratered(vec3 p, float height) {
    vec3 pLarge = p * 2.2;
    vec2 wLarge = worley3(pLarge);
    vec3 pSmall = p * 6.0 + 13.7;
    vec2 wSmall = worley3(pSmall);

    float bowlMask = 0.0;
    float rimMask = 0.0;

    if (wLarge.y < 0.55) {
      float t = wLarge.x / 0.42;
      bowlMask = max(bowlMask, 1.0 - smoothstep(0.0, 0.75, t));
      rimMask = max(rimMask, max(smoothstep(0.6, 0.85, t) - smoothstep(0.85, 1.05, t), 0.0));
    }
    if (wSmall.y < 0.35) {
      float t = wSmall.x / 0.35;
      bowlMask = max(bowlMask, 1.0 - smoothstep(0.0, 0.75, t));
      rimMask = max(rimMask, max(smoothstep(0.6, 0.85, t) - smoothstep(0.85, 1.05, t), 0.0));
    }

    float terrainNoise = fbm(p * 3.0 + 5.0);
    vec3 baseTone = mix(uBaseColor, uAccentColor, terrainNoise * 0.5);
    vec3 shadowTone = baseTone * 0.5;
    vec3 highlightTone = mix(baseTone, vec3(1.0), 0.3);

    vec3 color = baseTone;
    color = mix(color, shadowTone, clamp(bowlMask, 0.0, 1.0));
    color = mix(color, highlightTone, clamp(rimMask, 0.0, 1.0));

    return color;
  }
```

- [ ] **Step 4: Verify the TypeScript wrapper and existing test**

```bash
npx eslint src/components/3d/shaders/PlanetSurfaceMaterial.ts
npx tsc -p tsconfig.app.json --noEmit
npm test -- PlanetSurfaceMaterial.test.ts
```

Expected: 0 lint errors, 0 tsc errors, existing 2 tests pass unmodified.

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/shaders/PlanetSurfaceMaterial.ts
git commit -m "feat: give cratered planets real Worley-cell crater terrain"
```

---

### Task 3: Banded and Venus surface upgrade (domain-warped swirl)

**Files:**
- Modify: `src/components/3d/shaders/PlanetSurfaceMaterial.ts` (targeted edits within the fragment shader string)

**Interfaces:**
- Consumes: `worley3` (added in Task 2), the Task 1 lighting/bump-mapping engine — unchanged.
- Produces: same public interface as Task 1/2 (no uniform/export changes).

Replaces the placeholder `heightBanded`/`colorBanded`/`heightVenus`/`colorVenus` with domain-warped turbulence (bands swirl instead of sitting as static stripes; Venus's haze swirls organically), adds a rare Jupiter-style storm spot to banded planets, and adds Venus's subtle cloud-sheen specular.

- [ ] **Step 1: Replace `heightBanded`**

Replace:

```glsl
  float heightBanded(vec3 p) {
    float bandNoise = fbm(vec3(p.x * 0.6, p.y * 3.0 + uTime * 0.03, p.z * 0.6));
    float bands = sin((p.y + bandNoise * 0.6) * 6.0);
    return bands * 0.25;
  }
```

with:

```glsl
  float heightBanded(vec3 p) {
    vec3 warpP = p * 1.5 + vec3(uTime * 0.02, 0.0, 0.0);
    float warp = fbm(warpP) * 0.6;
    float bands = sin(p.y * 6.0 + warp * 3.0);
    return bands * 0.3;
  }
```

- [ ] **Step 2: Replace `colorBanded`**

Replace:

```glsl
  vec3 colorBanded(vec3 p, float height) {
    float bandNoise = fbm(vec3(p.x * 0.6, p.y * 3.0 + uTime * 0.03, p.z * 0.6));
    float bands = sin((p.y + bandNoise * 0.6) * 6.0);
    float bandMix = smoothstep(-0.2, 0.2, bands);
    return mix(uBaseColor, uAccentColor, bandMix);
  }
```

with:

```glsl
  vec3 colorBanded(vec3 p, float height) {
    vec3 warpP = p * 1.5 + vec3(uTime * 0.02, 0.0, 0.0);
    float warp = fbm(warpP) * 0.6;
    float bandValue = sin(p.y * 6.0 + warp * 3.0) * 0.5 + 0.5;

    vec3 tone1 = uBaseColor;
    vec3 tone2 = mix(uBaseColor, uAccentColor, 0.5);
    vec3 tone3 = uAccentColor;
    vec3 tone4 = mix(uAccentColor, vec3(1.0), 0.15);

    vec3 color;
    if (bandValue < 0.33) {
      color = mix(tone1, tone2, bandValue / 0.33);
    } else if (bandValue < 0.66) {
      color = mix(tone2, tone3, (bandValue - 0.33) / 0.33);
    } else {
      color = mix(tone3, tone4, (bandValue - 0.66) / 0.34);
    }

    vec3 stormP = p * 1.0 + vec3(50.0, 20.0, 5.0);
    vec2 storm = worley3(stormP);
    float stormMask = (1.0 - smoothstep(0.0, 0.35, storm.x)) * step(storm.y, 0.12);
    vec3 stormColor = mix(uAccentColor, vec3(0.8, 0.3, 0.2), 0.6);
    color = mix(color, stormColor, clamp(stormMask, 0.0, 1.0));

    return color;
  }
```

- [ ] **Step 3: Replace `heightVenus`**

Replace:

```glsl
  float heightVenus(vec3 p) {
    vec3 hp = p * 1.5 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
    float haze = fbm(hp * 2.5);
    return haze * 0.2;
  }
```

with:

```glsl
  float heightVenus(vec3 p) {
    vec3 warpP = p * 1.8 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
    float warp = fbm(warpP);
    vec3 swirlP = p * 2.5 + warp * 0.8;
    float haze = fbm(swirlP);
    return haze * 0.25;
  }
```

- [ ] **Step 4: Replace `colorVenus`**

Replace:

```glsl
  vec3 colorVenus(vec3 p, float height) {
    vec3 hp = p * 1.5 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
    float haze = fbm(hp * 2.5);
    return mix(uBaseColor, uAccentColor, haze);
  }
```

with:

```glsl
  vec3 colorVenus(vec3 p, float height) {
    vec3 warpP = p * 1.8 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
    float warp = fbm(warpP);
    vec3 swirlP = p * 2.5 + warp * 0.8;
    float haze = fbm(swirlP);

    vec3 tone1 = uBaseColor;
    vec3 tone2 = mix(uBaseColor, uAccentColor, 0.5);
    vec3 tone3 = uAccentColor;

    vec3 color;
    if (haze < 0.5) {
      color = mix(tone1, tone2, haze / 0.5);
    } else {
      color = mix(tone2, tone3, (haze - 0.5) / 0.5);
    }

    return color;
  }
```

- [ ] **Step 5: Add Venus's subtle cloud-sheen specular**

Replace:

```glsl
  float surfaceSpecular(vec3 p) {
    return 0.0;
  }
```

with:

```glsl
  float surfaceSpecular(vec3 p) {
    if (uSurfaceType >= 2.5) {
      return 0.15;
    }
    return 0.0;
  }
```

- [ ] **Step 6: Verify the TypeScript wrapper and existing test**

```bash
npx eslint src/components/3d/shaders/PlanetSurfaceMaterial.ts
npx tsc -p tsconfig.app.json --noEmit
npm test -- PlanetSurfaceMaterial.test.ts
```

Expected: 0 lint errors, 0 tsc errors, existing 2 tests pass unmodified.

- [ ] **Step 7: Commit**

```bash
git add src/components/3d/shaders/PlanetSurfaceMaterial.ts
git commit -m "feat: give gas giants and Venus domain-warped swirling terrain"
```

---

### Task 4: Earthlike surface upgrade (coastlines, mountains, ice caps, ocean specular)

**Files:**
- Modify: `src/components/3d/shaders/PlanetSurfaceMaterial.ts` (targeted edits within the fragment shader string)

**Interfaces:**
- Consumes: the Task 1 lighting/bump-mapping engine, `fbm` — unchanged.
- Produces: same public interface as Task 1/2/3 (no uniform/export changes). This is the final shader content for this plan.

Replaces the placeholder `heightEarthlike`/`colorEarthlike` with jagged coastline detail, ridged mountain elevation on land, latitude-based polar ice caps, and completes `surfaceSpecular` with ocean-only specular glint.

- [ ] **Step 1: Replace `heightEarthlike`**

Replace:

```glsl
  float heightEarthlike(vec3 p) {
    float land = smoothstep(0.42, 0.5, fbm(p * 1.8));
    return land * 0.3;
  }
```

with:

```glsl
  float heightEarthlike(vec3 p) {
    float coastDetail = fbm(p * 6.0 + 20.0) * 0.08;
    float continent = fbm(p * 1.8) + coastDetail;
    float land = smoothstep(0.42, 0.5, continent);

    float ridged = abs(fbm(p * 4.0 + 33.0) * 2.0 - 1.0);
    float mountains = (1.0 - ridged) * land * 0.4;

    float latitude = abs(normalize(p).y);
    float iceMask = smoothstep(0.75, 0.92, latitude);

    float height = land * 0.3 + mountains;
    height = mix(height, height + 0.15, iceMask * land);
    return height;
  }
```

- [ ] **Step 2: Replace `colorEarthlike`**

Replace:

```glsl
  vec3 colorEarthlike(vec3 p, float height) {
    float land = smoothstep(0.42, 0.5, fbm(p * 1.8));
    vec3 color = mix(uBaseColor, uAccentColor, land);
    vec3 cp = normalize(p) * 2.5 + vec3(uTime * 0.02, 0.0, 0.0);
    float clouds = smoothstep(0.55, 0.7, fbm(cp * 3.0));
    color = mix(color, vec3(1.0), clouds * 0.8);
    return color;
  }
```

with:

```glsl
  vec3 colorEarthlike(vec3 p, float height) {
    float coastDetail = fbm(p * 6.0 + 20.0) * 0.08;
    float continent = fbm(p * 1.8) + coastDetail;
    float land = smoothstep(0.42, 0.5, continent);

    float ridged = abs(fbm(p * 4.0 + 33.0) * 2.0 - 1.0);
    float mountainMask = smoothstep(0.55, 0.85, 1.0 - ridged) * land;

    vec3 oceanColor = uBaseColor * 0.6;
    vec3 landColor = uAccentColor;
    vec3 mountainColor = mix(landColor, vec3(0.55, 0.5, 0.45), 0.6);

    vec3 color = mix(oceanColor, landColor, land);
    color = mix(color, mountainColor, mountainMask);

    float latitude = abs(normalize(p).y);
    float iceMask = smoothstep(0.78, 0.92, latitude);
    vec3 iceColor = vec3(0.9, 0.95, 1.0);
    color = mix(color, iceColor, iceMask);

    vec3 cp = normalize(p) * 2.5 + vec3(uTime * 0.02, 0.0, 0.0);
    float clouds = smoothstep(0.55, 0.7, fbm(cp * 3.0));
    color = mix(color, vec3(1.0), clouds * 0.7);

    return color;
  }
```

- [ ] **Step 3: Complete `surfaceSpecular` with ocean-only specular**

Replace:

```glsl
  float surfaceSpecular(vec3 p) {
    if (uSurfaceType >= 2.5) {
      return 0.15;
    }
    return 0.0;
  }
```

with:

```glsl
  float surfaceSpecular(vec3 p) {
    if (uSurfaceType > 1.5 && uSurfaceType < 2.5) {
      float coastDetail = fbm(p * 6.0 + 20.0) * 0.08;
      float continent = fbm(p * 1.8) + coastDetail;
      float land = smoothstep(0.42, 0.5, continent);
      return (1.0 - land) * 0.8;
    }
    if (uSurfaceType >= 2.5) {
      return 0.15;
    }
    return 0.0;
  }
```

- [ ] **Step 4: Verify the TypeScript wrapper and existing test**

```bash
npx eslint src/components/3d/shaders/PlanetSurfaceMaterial.ts
npx tsc -p tsconfig.app.json --noEmit
npm test -- PlanetSurfaceMaterial.test.ts
```

Expected: 0 lint errors, 0 tsc errors, existing 2 tests pass unmodified.

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/shaders/PlanetSurfaceMaterial.ts
git commit -m "feat: give Earth coastlines, mountains, ice caps, and ocean glint"
```

---

### Task 5: Final integration pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated check suite**

```bash
npm run lint
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Expected: all four commands exit 0. `npm run lint` should show only the pre-existing baseline (errors/warnings confined to untouched `src/components/ui/*` and `tailwind.config.ts`) with zero new issues.

- [ ] **Step 2: Manual browser walkthrough**

Run `npm run dev`, open the app, and for each of the 9 orbiting planets plus zoom-in on the planet surface view, confirm:

1. **Depth**: every planet visibly shows bump-mapped shading — terrain catches and blocks light asymmetrically (craters have shadowed bowls and lit rims; band edges have soft relief; Earth's mountains cast visible shading), not a flat painted ball.
2. **Cratered** (Mercury, Moon, Mars): craters read as actual bowls with raised rims, at two distinct size scales, not smudgy blotches.
3. **Banded** (Jupiter, Saturn, Uranus, Neptune): band edges swirl/warp rather than sitting as static clean stripes; occasionally a storm-spot feature is visible on at least one gas giant (may need to view multiple planets/times since it's rare and orbit-position-dependent — check `uSeed`-driven placement isn't a hard blocker if not visible on every planet).
4. **Earth**: coastlines look jagged rather than smooth blobs, mountain ranges show ridged elevation, poles show ice-cap tinting, oceans show an animated specular glint, clouds still drift.
5. **Venus**: haze swirls organically (not a static blur), subtle cloud sheen visible at grazing angles.
6. Saturn's rings and every planet's atmosphere glow shell (from `RingBandMaterial`/`AtmosphereMaterial`, both unchanged by this plan) still render correctly — confirms this shader change didn't regress sibling materials.
7. Open the browser DevTools console — confirm zero shader compile errors and zero React/R3F warnings, on both the first page load and after navigating between several planets.
8. Frame rate stays smooth with all 9 planets on screen simultaneously in the solar-system view (sanity check only, not a numeric benchmark — the added noise/Worley evaluations are on a handful of small on-screen spheres, expected negligible per the design doc's cost analysis).

- [ ] **Step 3: Commit (if anything was fixed during verification)**

```bash
git add -A
git commit -m "chore: final verification pass for planet surface shader overhaul"
```

(Only run this if Step 1 or Step 2 required code changes; otherwise there's nothing to commit.)
