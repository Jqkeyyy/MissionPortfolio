# Planet & Base Camp Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace flat-colored planet spheres, the plain hover tooltip, and the div-soup base camp exterior/interior with a procedurally-shaded solar system and SVG-illustrated base camp, all sharing one "mission HUD" visual language.

**Architecture:** Three new self-contained GLSL shader materials (surface detail, atmosphere glow, ring banding) drive planet rendering; a shared `usePlanetLockOn` hook + `PlanetReticle` component drive hover/click feedback for both planets and the Sun; `BaseCamp` and `BaseCampInterior` are rebuilt around inline SVG illustrations instead of stacked `<div>`s. No new dependencies, no external texture assets.

**Tech Stack:** React 18, TypeScript, `@react-three/fiber` v8, `@react-three/drei` v9, `three` r160, `framer-motion`, `zustand`, Vitest + `@testing-library/react` (jsdom).

## Global Constraints

- No external texture/image assets — all planet surface detail is procedural GLSL (per spec).
- Do not modify `SignModal.tsx`, `ComputerScreen.tsx`, `TravelSequence.tsx`, `SpaceHUD.tsx`, `useGameState.ts`, or `SolarSystem.tsx` — out of scope for this phase (per spec).
- Reuse existing design tokens (`--primary`, `--secondary`/`--hud-line`, `.hud-panel`) rather than introducing new colors/styles.
- `tsconfig.app.json` has `strict: false` / `noImplicitAny: false` / `strictNullChecks` off — match the codebase's existing typing looseness, don't introduce strict-mode-only patterns.
- Vitest runs in `jsdom` (see `vitest.config.ts`) with `@testing-library/jest-dom` matchers set up in `src/test/setup.ts` — shader material unit tests must not require a real WebGL context (only construct the material class, never render it via a `WebGLRenderer`).

---

### Task 1: Add `surface` field to planet data

**Files:**
- Modify: `src/data/planets.ts`
- Test: `src/data/planets.test.ts` (create)

**Interfaces:**
- Produces: `export type PlanetSurface = 'cratered' | 'banded' | 'earthlike' | 'venusAtmo'`; `PlanetData.surface: PlanetSurface`.

- [ ] **Step 1: Write the failing test**

Create `src/data/planets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { planets } from './planets';
import type { PlanetSurface } from './planets';

const VALID_SURFACES: PlanetSurface[] = ['cratered', 'banded', 'earthlike', 'venusAtmo'];

describe('planets data', () => {
  it('gives every planet a valid surface type', () => {
    for (const planet of planets) {
      expect(VALID_SURFACES).toContain(planet.surface);
    }
  });

  it('assigns earthlike to Earth and banded to the gas giants', () => {
    const byId = Object.fromEntries(planets.map((p) => [p.id, p.surface]));
    expect(byId.earth).toBe('earthlike');
    expect(byId.jupiter).toBe('banded');
    expect(byId.saturn).toBe('banded');
    expect(byId.uranus).toBe('banded');
    expect(byId.neptune).toBe('banded');
  });

  it('assigns cratered to the rocky bodies and venusAtmo to Venus', () => {
    const byId = Object.fromEntries(planets.map((p) => [p.id, p.surface]));
    expect(byId.mercury).toBe('cratered');
    expect(byId.moon).toBe('cratered');
    expect(byId.mars).toBe('cratered');
    expect(byId.venus).toBe('venusAtmo');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- planets.test.ts`
Expected: FAIL — `planet.surface` is `undefined` for every planet (field doesn't exist yet), so the first `toContain` assertion fails.

- [ ] **Step 3: Add the `surface` field**

In `src/data/planets.ts`, add the exported type and extend the interface (near the top, after the existing imports/before `PlanetData`):

```ts
export type PlanetSurface = 'cratered' | 'banded' | 'earthlike' | 'venusAtmo';
```

Add `surface: PlanetSurface;` to the `PlanetData` interface, right after `color: string;`:

```ts
export interface PlanetData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  surface: PlanetSurface;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  description: string;
  content: ContentSign[];
}
```

Then add `surface: '...'` to every entry in the `planets` array (right after each `color` line), using this mapping:

| id | surface |
|---|---|
| sun | `'cratered'` (unused — the Sun is rendered by `Sun.tsx`, not `PlanetMesh`, but the field is required by the type) |
| mercury | `'cratered'` |
| venus | `'venusAtmo'` |
| earth | `'earthlike'` |
| moon | `'cratered'` |
| mars | `'cratered'` |
| jupiter | `'banded'` |
| saturn | `'banded'` |
| uranus | `'banded'` |
| neptune | `'banded'` |

For example, the `mercury` entry becomes:

```ts
  {
    id: 'mercury',
    name: 'mercury',
    displayName: 'Mercury',
    color: '#8C7853',
    surface: 'cratered',
    size: 0.4,
    orbitRadius: 8,
    orbitSpeed: 4.7,
    description: 'Education',
    content: [ /* unchanged */ ],
  },
```

Apply the same pattern (insert `surface: '<value>',` right after the `color` line) to all ten entries using the table above.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- planets.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/planets.ts src/data/planets.test.ts
git commit -m "feat: add surface variant field to planet data"
```

(Skip this step if the project is not a git repository — check with `git status`; if it errors, note that git isn't initialized and move on without committing.)

---

### Task 2: `PlanetSurfaceMaterial` shader

**Files:**
- Create: `src/components/3d/shaders/PlanetSurfaceMaterial.ts`
- Test: `src/components/3d/shaders/PlanetSurfaceMaterial.test.ts` (create)

**Interfaces:**
- Consumes: `PlanetSurface` type from `src/data/planets.ts` (Task 1).
- Produces: `export const SURFACE_TYPES: Record<PlanetSurface, number>`; `export const PlanetSurfaceMaterial` (a `THREE.ShaderMaterial` subclass constructor with settable properties `uTime: number`, `uBaseColor: THREE.Color`, `uAccentColor: THREE.Color`, `uSeed: number`, `uSurfaceType: number`); registers the JSX intrinsic `<planetSurfaceMaterial />`.

- [ ] **Step 1: Write the failing test**

Create `src/components/3d/shaders/PlanetSurfaceMaterial.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PlanetSurfaceMaterial, SURFACE_TYPES } from './PlanetSurfaceMaterial';

describe('PlanetSurfaceMaterial', () => {
  it('exposes the expected surface type indices', () => {
    expect(SURFACE_TYPES).toEqual({
      cratered: 0,
      banded: 1,
      earthlike: 2,
      venusAtmo: 3,
    });
  });

  it('constructs with the expected default uniforms', () => {
    const material = new PlanetSurfaceMaterial();
    expect(material.uTime).toBe(0);
    expect(material.uSeed).toBe(0);
    expect(material.uSurfaceType).toBe(0);
    expect(material.uBaseColor.isColor).toBe(true);
    expect(material.uAccentColor.isColor).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- PlanetSurfaceMaterial.test.ts`
Expected: FAIL — cannot find module `./PlanetSurfaceMaterial`.

- [ ] **Step 3: Write the implementation**

Create `src/components/3d/shaders/PlanetSurfaceMaterial.ts`:

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

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uSeed;
  uniform float uSurfaceType;

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

  void main() {
    vec3 p = normalize(vPosition) * 3.0 + uSeed;
    vec3 color = uBaseColor;

    if (uSurfaceType < 0.5) {
      float n = fbm(p * 2.0);
      float craters = smoothstep(0.35, 0.55, fbm(p * 5.0 + 10.0));
      color = mix(uBaseColor, uAccentColor, n);
      color = mix(color, color * 0.6, craters);
    } else if (uSurfaceType < 1.5) {
      float bandNoise = fbm(vec3(p.x * 0.6, p.y * 3.0 + uTime * 0.03, p.z * 0.6));
      float bands = sin((vPosition.y + bandNoise * 0.6) * 6.0);
      float bandMix = smoothstep(-0.2, 0.2, bands);
      color = mix(uBaseColor, uAccentColor, bandMix);
    } else if (uSurfaceType < 2.5) {
      float land = smoothstep(0.42, 0.5, fbm(p * 1.8));
      color = mix(uBaseColor, uAccentColor, land);
      vec3 cp = normalize(vPosition) * 2.5 + vec3(uTime * 0.02, 0.0, 0.0);
      float clouds = smoothstep(0.55, 0.7, fbm(cp * 3.0));
      color = mix(color, vec3(1.0), clouds * 0.8);
    } else {
      vec3 hp = p * 1.5 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
      float haze = fbm(hp * 2.5);
      color = mix(uBaseColor, uAccentColor, haze);
    }

    float lightDot = max(dot(normalize(vNormal), normalize(vec3(0.6, 0.5, 0.7))), 0.0);
    vec3 lit = color * (0.35 + 0.65 * lightDot);

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
  },
  vertexShader,
  fragmentShader
);

extend({ PlanetSurfaceMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      planetSurfaceMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        ref?: React.Ref<InstanceType<typeof PlanetSurfaceMaterial>>;
        uTime?: number;
        uBaseColor?: THREE.Color;
        uAccentColor?: THREE.Color;
        uSeed?: number;
        uSurfaceType?: number;
      };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- PlanetSurfaceMaterial.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/shaders/PlanetSurfaceMaterial.ts src/components/3d/shaders/PlanetSurfaceMaterial.test.ts
git commit -m "feat: add procedural planet surface shader material"
```

---

### Task 3: `AtmosphereMaterial` shader

**Files:**
- Create: `src/components/3d/shaders/AtmosphereMaterial.ts`
- Test: `src/components/3d/shaders/AtmosphereMaterial.test.ts` (create)

**Interfaces:**
- Produces: `export const AtmosphereMaterial` (settable `uColor: THREE.Color`, `uIntensity: number`); registers `<atmosphereMaterial />`.

- [ ] **Step 1: Write the failing test**

Create `src/components/3d/shaders/AtmosphereMaterial.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { AtmosphereMaterial } from './AtmosphereMaterial';

describe('AtmosphereMaterial', () => {
  it('constructs with the expected default uniforms', () => {
    const material = new AtmosphereMaterial();
    expect(material.uIntensity).toBe(1);
    expect(material.uColor.isColor).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- AtmosphereMaterial.test.ts`
Expected: FAIL — cannot find module `./AtmosphereMaterial`.

- [ ] **Step 3: Write the implementation**

Create `src/components/3d/shaders/AtmosphereMaterial.ts`:

```ts
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  uniform vec3 uColor;
  uniform float uIntensity;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 3.0);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

export const AtmosphereMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#4B7BE5'),
    uIntensity: 1.0,
  },
  vertexShader,
  fragmentShader
);

extend({ AtmosphereMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      atmosphereMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uColor?: THREE.Color;
        uIntensity?: number;
      };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- AtmosphereMaterial.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/shaders/AtmosphereMaterial.ts src/components/3d/shaders/AtmosphereMaterial.test.ts
git commit -m "feat: add fresnel atmosphere glow shader material"
```

---

### Task 4: `RingBandMaterial` shader

**Files:**
- Create: `src/components/3d/shaders/RingBandMaterial.ts`
- Test: `src/components/3d/shaders/RingBandMaterial.test.ts` (create)

**Interfaces:**
- Produces: `export const RingBandMaterial` (settable `uColorA: THREE.Color`, `uColorB: THREE.Color`, `uSeed: number`, `uInnerRadius: number`, `uOuterRadius: number`); registers `<ringBandMaterial />`.

- [ ] **Step 1: Write the failing test**

Create `src/components/3d/shaders/RingBandMaterial.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { RingBandMaterial } from './RingBandMaterial';

describe('RingBandMaterial', () => {
  it('constructs with the expected default uniforms', () => {
    const material = new RingBandMaterial();
    expect(material.uSeed).toBe(0);
    expect(material.uInnerRadius).toBe(1);
    expect(material.uOuterRadius).toBe(2);
    expect(material.uColorA.isColor).toBe(true);
    expect(material.uColorB.isColor).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- RingBandMaterial.test.ts`
Expected: FAIL — cannot find module `./RingBandMaterial`.

- [ ] **Step 3: Write the implementation**

Create `src/components/3d/shaders/RingBandMaterial.ts`:

```ts
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vPos;

  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vPos;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uSeed;
  uniform float uInnerRadius;
  uniform float uOuterRadius;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    float r = length(vPos.xy);
    float t = clamp((r - uInnerRadius) / max(uOuterRadius - uInnerRadius, 0.0001), 0.0, 1.0);

    float bandFreq = 34.0;
    float cell = floor(t * bandFreq);
    float n = hash11(cell + uSeed);
    float wave = sin(t * bandFreq * 3.14159265 + n * 6.2831853) * 0.5 + 0.5;
    float band = smoothstep(0.15, 0.85, wave);

    vec3 color = mix(uColorA, uColorB, band);
    float edgeFade = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.9, t);
    float alpha = mix(0.25, 0.75, band) * edgeFade;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const RingBandMaterial = shaderMaterial(
  {
    uColorA: new THREE.Color('#B79B6B'),
    uColorB: new THREE.Color('#E8D4A8'),
    uSeed: 0,
    uInnerRadius: 1,
    uOuterRadius: 2,
  },
  vertexShader,
  fragmentShader
);

extend({ RingBandMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ringBandMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uColorA?: THREE.Color;
        uColorB?: THREE.Color;
        uSeed?: number;
        uInnerRadius?: number;
        uOuterRadius?: number;
      };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- RingBandMaterial.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/shaders/RingBandMaterial.ts src/components/3d/shaders/RingBandMaterial.test.ts
git commit -m "feat: add banded ring shader material for Saturn"
```

---

### Task 5: `usePlanetLockOn` hook

**Files:**
- Create: `src/hooks/usePlanetLockOn.ts`
- Test: `src/hooks/usePlanetLockOn.test.ts` (create)

**Interfaces:**
- Produces: `export const usePlanetLockOn = (onConfirm: () => void, lockDurationMs?: number) => { hovered: boolean; locking: boolean; setHovered: (v: boolean) => void; trigger: () => void }`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/usePlanetLockOn.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanetLockOn } from './usePlanetLockOn';

describe('usePlanetLockOn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts not locking', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => usePlanetLockOn(onConfirm, 450));
    expect(result.current.locking).toBe(false);
  });

  it('locks immediately on trigger and calls onConfirm after the delay', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => usePlanetLockOn(onConfirm, 450));

    act(() => {
      result.current.trigger();
    });
    expect(result.current.locking).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.locking).toBe(false);
  });

  it('ignores repeated triggers while already locking', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => usePlanetLockOn(onConfirm, 450));

    act(() => {
      result.current.trigger();
      result.current.trigger();
      result.current.trigger();
    });

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- usePlanetLockOn.test.ts`
Expected: FAIL — cannot find module `./usePlanetLockOn`.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/usePlanetLockOn.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LOCK_DURATION_MS = 450;

export const usePlanetLockOn = (onConfirm: () => void, lockDurationMs: number = DEFAULT_LOCK_DURATION_MS) => {
  const [hovered, setHovered] = useState(false);
  const [locking, setLocking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const trigger = useCallback(() => {
    if (locking) return;
    setLocking(true);
    timeoutRef.current = setTimeout(() => {
      setLocking(false);
      onConfirm();
    }, lockDurationMs);
  }, [locking, lockDurationMs, onConfirm]);

  return { hovered, locking, setHovered, trigger };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- usePlanetLockOn.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePlanetLockOn.ts src/hooks/usePlanetLockOn.test.ts
git commit -m "feat: add lock-on interaction hook for planet clicks"
```

---

### Task 6: `PlanetReticle` component

**Files:**
- Create: `src/components/3d/PlanetReticle.tsx`
- Test: `src/components/3d/PlanetReticle.test.tsx` (create)

**Interfaces:**
- Produces: `export const PlanetReticle = (props: { name: string; description: string; hovered: boolean; locking: boolean }) => JSX.Element`. Pure presentational component, no Three.js dependency — meant to be wrapped in drei's `<Html>` by callers.

- [ ] **Step 1: Write the failing test**

Create `src/components/3d/PlanetReticle.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanetReticle } from './PlanetReticle';

describe('PlanetReticle', () => {
  it('shows the planet name and description when hovered', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered locking={false} />);
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('shows LOCKING... instead of the name while locking', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered locking />);
    expect(screen.getByText('LOCKING...')).toBeInTheDocument();
    expect(screen.queryByText('Earth')).not.toBeInTheDocument();
  });

  it('is hidden when neither hovered nor locking', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered={false} locking={false} />);
    expect(screen.getByTestId('planet-reticle').className).toContain('opacity-0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- PlanetReticle.test.tsx`
Expected: FAIL — cannot find module `./PlanetReticle`.

- [ ] **Step 3: Write the implementation**

Create `src/components/3d/PlanetReticle.tsx`:

```tsx
interface PlanetReticleProps {
  name: string;
  description: string;
  hovered: boolean;
  locking: boolean;
}

export const PlanetReticle = ({ name, description, hovered, locking }: PlanetReticleProps) => {
  const active = hovered || locking;

  return (
    <div
      data-testid="planet-reticle"
      className={`pointer-events-none flex flex-col items-center transition-opacity duration-200 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-24 h-24">
        <span
          className={`absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-secondary transition-transform duration-300 ${
            locking ? 'translate-x-6 translate-y-6' : ''
          }`}
        />
        <span
          className={`absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-secondary transition-transform duration-300 ${
            locking ? '-translate-x-6 translate-y-6' : ''
          }`}
        />
        <span
          className={`absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-secondary transition-transform duration-300 ${
            locking ? 'translate-x-6 -translate-y-6' : ''
          }`}
        />
        <span
          className={`absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-secondary transition-transform duration-300 ${
            locking ? '-translate-x-6 -translate-y-6' : ''
          }`}
        />
      </div>
      <div className="hud-panel px-4 py-2 rounded-lg mt-2 overflow-hidden whitespace-nowrap">
        <p className="font-heading text-sm tracking-mission text-primary">
          {locking ? 'LOCKING...' : name}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- PlanetReticle.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/PlanetReticle.tsx src/components/3d/PlanetReticle.test.tsx
git commit -m "feat: add shared planet targeting reticle HUD component"
```

---

### Task 7: Wire the new shaders and reticle into `PlanetMesh`

**Files:**
- Modify: `src/components/3d/PlanetMesh.tsx` (full rewrite)

**Interfaces:**
- Consumes: `PlanetSurfaceMaterial`, `SURFACE_TYPES` (Task 2); `AtmosphereMaterial` (Task 3); `RingBandMaterial` (Task 4); `usePlanetLockOn` (Task 5); `PlanetReticle` (Task 6); `PlanetSurface` type + `PlanetData.surface` (Task 1).
- Produces: same public interface as before — `PlanetMesh({ planet, onClick }: { planet: PlanetData; onClick?: () => void })`. No callers change.

There is no meaningful unit test for this task (it's a Three.js scene graph component that needs a real WebGL context to render — jsdom can't provide one, and `@react-three/test-renderer` isn't installed, which is out of scope to add). Verification is manual, in-browser, in Step 2.

- [ ] **Step 1: Replace the file contents**

Replace all of `src/components/3d/PlanetMesh.tsx` with:

```tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import type { PlanetSurface } from '@/data/planets';
import { useGameState } from '@/hooks/useGameState';
import { usePlanetLockOn } from '@/hooks/usePlanetLockOn';
import { PlanetReticle } from './PlanetReticle';
import { PlanetSurfaceMaterial, SURFACE_TYPES } from './shaders/PlanetSurfaceMaterial';
import { AtmosphereMaterial } from './shaders/AtmosphereMaterial';
import { RingBandMaterial } from './shaders/RingBandMaterial';

interface PlanetMeshProps {
  planet: PlanetData;
  onClick?: () => void;
}

const ATMOSPHERE_INTENSITY: Record<PlanetSurface, number> = {
  cratered: 0.35,
  banded: 0.55,
  earthlike: 1.1,
  venusAtmo: 0.9,
};

const deriveAccentColor = (baseHex: string, surface: PlanetSurface): THREE.Color => {
  const base = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  switch (surface) {
    case 'cratered':
      return new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, Math.max(hsl.l - 0.22, 0.05));
    case 'banded':
      return new THREE.Color().setHSL((hsl.h + 0.04) % 1, Math.min(hsl.s + 0.1, 1), Math.min(hsl.l + 0.18, 0.9));
    case 'earthlike':
      return new THREE.Color().setHSL(0.32, 0.45, 0.32);
    case 'venusAtmo':
      return new THREE.Color().setHSL((hsl.h + 0.08) % 1, hsl.s * 0.6, Math.min(hsl.l + 0.15, 0.85));
    default:
      return base.clone().multiplyScalar(0.7);
  }
};

export const PlanetMesh = ({ planet, onClick }: PlanetMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<InstanceType<typeof PlanetSurfaceMaterial>>(null);
  const { selectedPlanet } = useGameState();
  const isSelected = selectedPlanet === planet.id;
  const surface = planet.surface;

  const initialAngle = useRef(Math.random() * Math.PI * 2);
  const seed = useRef(Math.random() * 100);

  const baseColor = useMemo(() => new THREE.Color(planet.color), [planet.color]);
  const accentColor = useMemo(() => deriveAccentColor(planet.color, surface), [planet.color, surface]);

  const { hovered, locking, setHovered, trigger } = usePlanetLockOn(() => onClick?.());

  useFrame((state) => {
    if (groupRef.current && planet.orbitRadius > 0) {
      const time = state.clock.elapsedTime;
      const angle = initialAngle.current + time * planet.orbitSpeed * 0.05;

      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
    }

    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
    }

    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    trigger();
  };

  const isSaturn = planet.id === 'saturn';

  return (
    <group ref={groupRef} position={[planet.orbitRadius, 15, 0]}>
      <Sphere
        ref={planetRef}
        args={[planet.size, 64, 64]}
        scale={locking ? 1.08 : 1}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <planetSurfaceMaterial
          ref={materialRef}
          uBaseColor={baseColor}
          uAccentColor={accentColor}
          uSeed={seed.current}
          uSurfaceType={SURFACE_TYPES[surface]}
        />
      </Sphere>

      {isSaturn && (
        <Ring args={[planet.size * 1.4, planet.size * 2.2, 64]} rotation={[-Math.PI / 3, 0, 0]}>
          <ringBandMaterial
            uColorA={new THREE.Color('#B79B6B')}
            uColorB={new THREE.Color('#E8D4A8')}
            uSeed={seed.current}
            uInnerRadius={planet.size * 1.4}
            uOuterRadius={planet.size * 2.2}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </Ring>
      )}

      <Sphere args={[planet.size * 1.15, 32, 32]}>
        <atmosphereMaterial
          uColor={baseColor}
          uIntensity={ATMOSPHERE_INTENSITY[surface] * (hovered || isSelected ? 1.6 : 1)}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      <Html position={[0, planet.size + 1.8, 0]} center style={{ pointerEvents: 'none' }}>
        <PlanetReticle
          name={planet.displayName}
          description={planet.description}
          hovered={hovered}
          locking={locking}
        />
      </Html>
    </group>
  );
};
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`, open `http://localhost:8080`.

Check:
- Each planet in the solar system view shows visible surface detail (mottled/cratered for Mercury/Moon/Mars, banded stripes for Jupiter/Saturn/Uranus/Neptune, continents+drifting clouds for Earth, hazy swirl for Venus) instead of a flat-colored sphere.
- Every planet has a soft colored glow around its rim (atmosphere shell).
- Saturn's ring shows visible concentric banding, not a single flat translucent disk.
- Hovering a planet shows the new reticle (corner brackets + label) instead of the old plain tooltip.
- Clicking a planet shows a brief "LOCKING..." animation (~450ms) before travel begins, and rapid double-clicks don't double-trigger travel.
- Open the browser DevTools console — confirm there are no shader compile errors or React warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/PlanetMesh.tsx
git commit -m "feat: render planets with procedural shaders and lock-on reticle"
```

---

### Task 8: Wire the reticle into `Sun`

**Files:**
- Modify: `src/components/3d/Sun.tsx` (full rewrite)

**Interfaces:**
- Consumes: `usePlanetLockOn` (Task 5), `PlanetReticle` (Task 6).
- Produces: same public interface as before — `Sun({ onClick }: { onClick?: () => void })`. No callers change.

No unit test for the same reason as Task 7 (WebGL scene graph component). Verification is manual, in-browser.

- [ ] **Step 1: Replace the file contents**

Replace all of `src/components/3d/Sun.tsx` with:

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetLockOn } from '@/hooks/usePlanetLockOn';
import { PlanetReticle } from './PlanetReticle';

interface SunProps {
  onClick?: () => void;
}

export const Sun = ({ onClick }: SunProps) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { hovered, locking, setHovered, trigger } = usePlanetLockOn(() => onClick?.());

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 15, 0]}>
      <Sphere
        ref={sunRef}
        args={[2.5, 64, 64]}
        scale={locking ? 1.05 : 1}
        onClick={(e) => {
          e.stopPropagation();
          trigger();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshBasicMaterial color="#FDB813" />
      </Sphere>

      <Sphere ref={glowRef} args={[3, 32, 32]}>
        <meshBasicMaterial color="#FF9500" transparent opacity={hovered ? 0.5 : 0.3} />
      </Sphere>

      <Sphere args={[4, 32, 32]}>
        <meshBasicMaterial color="#FF6B00" transparent opacity={hovered ? 0.2 : 0.1} />
      </Sphere>

      <pointLight color="#FFF4E0" intensity={2} distance={200} decay={2} />

      <Html position={[0, 5, 0]} center style={{ pointerEvents: 'none' }}>
        <PlanetReticle
          name="The Sun"
          description="Identity / Introduction"
          hovered={hovered}
          locking={locking}
        />
      </Html>
    </group>
  );
};
```

- [ ] **Step 2: Manually verify in the browser**

With `npm run dev` still running:

- Hover the Sun — confirm the new reticle (brackets + label) appears instead of the old tooltip.
- Click the Sun — confirm the "LOCKING..." animation plays before travel begins.

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/Sun.tsx
git commit -m "feat: reuse the lock-on reticle for the Sun"
```

---

### Task 9: Rebuild `BaseCamp` as an SVG illustration

**Files:**
- Modify: `src/components/planet/BaseCamp.tsx` (full rewrite)
- Test: `src/components/planet/BaseCamp.test.tsx` (create)

**Interfaces:**
- Produces: same public interface as before — `BaseCamp({ planet, onClick }: { planet: PlanetData; onClick: () => void })`. No callers change (`PlanetSurface.tsx` is untouched).

- [ ] **Step 1: Write the failing test**

Create `src/components/planet/BaseCamp.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseCamp } from './BaseCamp';
import { planets } from '@/data/planets';

describe('BaseCamp', () => {
  const planet = planets.find((p) => p.id === 'earth')!;

  it('renders the planet name, description, and enter prompt', () => {
    render(<BaseCamp planet={planet} onClick={() => {}} />);
    expect(screen.getByText(planet.displayName)).toBeInTheDocument();
    expect(screen.getByText(planet.description)).toBeInTheDocument();
    expect(screen.getByText('Enter Base Camp')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<BaseCamp planet={planet} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- BaseCamp.test.tsx`
Expected: FAIL — the current `BaseCamp` doesn't crash, but this establishes the baseline before the rewrite. (If it unexpectedly passes because the old markup already contains this text, that's fine — proceed to Step 3 and re-run in Step 4 to confirm the new markup still satisfies it.)

- [ ] **Step 3: Replace the file contents**

Replace all of `src/components/planet/BaseCamp.tsx` with:

```tsx
import { motion } from 'framer-motion';
import { PlanetData } from '@/data/planets';
import { DoorClosed } from 'lucide-react';

interface BaseCampProps {
  planet: PlanetData;
  onClick: () => void;
}

export const BaseCamp = ({ planet, onClick }: BaseCampProps) => {
  return (
    <motion.button
      className="absolute bottom-[18%] z-10 group"
      style={{ left: '50%' }}
      initial={{ opacity: 0, scale: 0.8, y: 20, x: '-50%' }}
      animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
      transition={{ delay: 0.4, duration: 0.6 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <svg
          width="360"
          height="220"
          viewBox="0 0 360 220"
          className="overflow-visible transition-all duration-300 group-hover:drop-shadow-[0_0_30px_rgba(255,107,53,0.35)]"
        >
          <defs>
            <linearGradient id={`dome-${planet.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220, 22%, 28%)" />
              <stop offset="55%" stopColor="hsl(220, 16%, 20%)" />
              <stop offset="100%" stopColor="hsl(220, 12%, 14%)" />
            </linearGradient>
            <radialGradient id={`window-${planet.id}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="hsl(200, 90%, 70%)" />
              <stop offset="100%" stopColor="hsl(200, 60%, 25%)" />
            </radialGradient>
            <linearGradient id={`panel-${planet.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(220, 60%, 42%)" />
              <stop offset="100%" stopColor="hsl(220, 55%, 22%)" />
            </linearGradient>
            <pattern id={`panel-grid-${planet.id}`} width="8" height="10" patternUnits="userSpaceOnUse">
              <rect width="8" height="10" fill="none" stroke="hsl(220, 40%, 15%)" strokeWidth="0.6" />
            </pattern>
          </defs>

          <ellipse cx="180" cy="196" rx="150" ry="14" fill="hsl(220, 12%, 10%)" opacity="0.6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.line
              key={i}
              x1={70 + i * 55}
              y1="200"
              x2={92 + i * 55}
              y2="200"
              stroke="hsl(24, 95%, 53%)"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          <g transform="translate(48, 108) rotate(-14)">
            <rect width="52" height="72" rx="3" fill={`url(#panel-${planet.id})`} stroke="hsl(220, 45%, 55%)" strokeWidth="1.5" />
            <rect width="52" height="72" rx="3" fill={`url(#panel-grid-${planet.id})`} />
          </g>
          <rect x="70" y="176" width="6" height="20" fill="hsl(220, 10%, 35%)" />

          <line x1="300" y1="70" x2="300" y2="160" stroke="hsl(220, 10%, 55%)" strokeWidth="3" />
          <path d="M 285 78 L 300 60 L 315 78" fill="none" stroke="hsl(220, 10%, 55%)" strokeWidth="2.5" />
          <motion.circle
            cx="300"
            cy="60"
            r="4"
            fill="hsl(0, 85%, 55%)"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />

          <path
            d="M 90 170 Q 90 60 180 55 Q 270 60 270 170 Z"
            fill={`url(#dome-${planet.id})`}
            stroke="hsl(var(--hud-line))"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />

          {[142, 180, 218].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy="108"
              r="13"
              fill={`url(#window-${planet.id})`}
              stroke="hsl(200, 40%, 45%)"
              strokeWidth="1.5"
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}

          <motion.circle
            cx="252"
            cy="72"
            r="2.5"
            fill="hsl(24, 95%, 53%)"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="112"
            cy="76"
            r="2"
            fill="hsl(140, 70%, 50%)"
            animate={{ opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />

          <rect x="78" y="168" width="204" height="14" rx="2" fill="hsl(220, 14%, 16%)" stroke="hsl(220, 10%, 24%)" />

          <g>
            <path
              d="M 160 168 L 160 132 Q 160 122 180 122 Q 200 122 200 132 L 200 168 Z"
              fill="hsl(220, 16%, 22%)"
              stroke="hsl(220, 18%, 38%)"
              strokeWidth="2"
              className="transition-colors duration-300 group-hover:stroke-primary"
            />
            <rect x="170" y="132" width="20" height="20" rx="2" fill="hsl(200, 45%, 20%)" stroke="hsl(200, 40%, 40%)" />
            <rect x="176" y="158" width="8" height="3" rx="1.5" fill="hsl(220, 8%, 60%)" />
          </g>

          <rect x="258" y="172" width="20" height="20" rx="2" fill="hsl(30, 28%, 30%)" stroke="hsl(30, 20%, 20%)" />
          <rect x="238" y="178" width="16" height="14" rx="2" fill="hsl(200, 26%, 30%)" stroke="hsl(200, 20%, 20%)" />
        </svg>

        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <DoorClosed className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Enter Base Camp</span>
          </div>
        </motion.div>

        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-max pointer-events-none">
          <div
            className="hud-panel px-6 py-4 rounded-lg text-center"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--background) / 0.9), hsl(var(--background) / 0.95))',
            }}
          >
            <p className="text-xs tracking-mission text-muted-foreground mb-1">
              BASE CAMP ESTABLISHED
            </p>
            <h1 className="font-heading text-xl md:text-2xl text-primary text-glow">
              {planet.displayName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{planet.description}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- BaseCamp.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Manually verify in the browser**

With `npm run dev` running, travel to at least two different planets (e.g. Earth and Mars) and confirm:
- The base camp dome renders as crisp SVG (gradient dome, glowing window row, blinking antenna light, pulsing landing-pad lines, solar panel with visible grid) instead of the old stacked rectangles.
- Hovering the dome shows the orange glow (`group-hover:drop-shadow`) and the airlock door outline highlights.
- Clicking the dome still opens the base camp interior.

- [ ] **Step 6: Commit**

```bash
git add src/components/planet/BaseCamp.tsx src/components/planet/BaseCamp.test.tsx
git commit -m "feat: rebuild base camp exterior as an SVG illustration"
```

---

### Task 10: Rebuild `BaseCampInterior` as an SVG-backed room

**Files:**
- Modify: `src/components/planet/BaseCampInterior.tsx` (full rewrite)
- Test: `src/components/planet/BaseCampInterior.test.tsx` (create)

**Interfaces:**
- Produces: same public interface as before — `BaseCampInterior({ planet, onExit, onAccessComputer }: { planet: PlanetData; onExit: () => void; onAccessComputer: () => void })`. No callers change (`PlanetSurface.tsx` is untouched).

- [ ] **Step 1: Write the failing test**

Create `src/components/planet/BaseCampInterior.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseCampInterior } from './BaseCampInterior';
import { planets } from '@/data/planets';

describe('BaseCampInterior', () => {
  const planet = planets.find((p) => p.id === 'mars')!;

  it('renders the interior header with the planet name', () => {
    render(<BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={() => {}} />);
    expect(screen.getByText('BASE CAMP INTERIOR')).toBeInTheDocument();
    expect(screen.getAllByText(planet.displayName).length).toBeGreaterThan(0);
  });

  it('calls onAccessComputer when the terminal is clicked', () => {
    const onAccessComputer = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={() => {}} onAccessComputer={onAccessComputer} />);
    fireEvent.click(screen.getByText('MISSION TERMINAL').closest('button')!);
    expect(onAccessComputer).toHaveBeenCalledTimes(1);
  });

  it('calls onExit when the bottom exit button is clicked', () => {
    const onExit = vi.fn();
    render(<BaseCampInterior planet={planet} onExit={onExit} onAccessComputer={() => {}} />);
    fireEvent.click(screen.getByText('Exit Base Camp'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- BaseCampInterior.test.tsx`
Expected: the first two assertions likely pass against the current markup (the header text and "MISSION TERMINAL" label already exist), confirming baseline behavior before the rewrite — proceed to Step 3 either way, then re-run in Step 4 to confirm the new markup still satisfies all three.

- [ ] **Step 3: Replace the file contents**

Replace all of `src/components/planet/BaseCampInterior.tsx` with:

```tsx
import { motion } from 'framer-motion';
import { PlanetData } from '@/data/planets';
import { DoorOpen, Monitor } from 'lucide-react';

interface BaseCampInteriorProps {
  planet: PlanetData;
  onExit: () => void;
  onAccessComputer: () => void;
}

export const BaseCampInterior = ({ planet, onExit, onAccessComputer }: BaseCampInteriorProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="room-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(220, 25%, 10%)" />
            <stop offset="45%" stopColor="hsl(220, 19%, 14%)" />
            <stop offset="100%" stopColor="hsl(220, 15%, 12%)" />
          </linearGradient>
          <radialGradient id="ceiling-glow" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="hsl(220, 30%, 18%)" />
            <stop offset="100%" stopColor="hsl(220, 25%, 12%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wall-panel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(220, 22%, 15%)" />
            <stop offset="100%" stopColor="hsl(220, 17%, 20%)" />
          </linearGradient>
          <radialGradient id="viewport-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={planet.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={planet.color} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1000" height="600" fill="url(#room-bg)" />
        <rect x="0" y="0" width="1000" height="240" fill="url(#ceiling-glow)" />

        {[130, 330, 500, 670, 870].map((x) => (
          <rect key={x} x={x - 6} y="60" width="12" height="130" rx="4" fill="hsl(220, 14%, 22%)" />
        ))}

        {[320, 500, 680].map((x, i) => (
          <g key={x}>
            <rect x={x - 55} y="34" width="110" height="14" rx="6" fill="hsl(200, 55%, 60%)" />
            <motion.rect
              x={x - 60}
              y="46"
              width="120"
              height="120"
              rx="60"
              fill="hsl(200, 80%, 60%)"
              opacity="0.08"
              animate={{ opacity: [0.06, 0.14, 0.06] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            />
          </g>
        ))}

        <rect x="420" y="20" width="160" height="90" rx="30" fill="hsl(230, 45%, 8%)" stroke="hsl(220, 20%, 32%)" strokeWidth="5" />
        <rect x="420" y="20" width="160" height="90" rx="30" fill="url(#viewport-glow)" />

        <rect x="0" y="90" width="170" height="420" fill="url(#wall-panel)" />
        <rect x="164" y="90" width="6" height="420" fill="hsl(220, 15%, 28%)" />
        <rect x="120" y="130" width="10" height="330" rx="5" fill="hsl(220, 12%, 40%)" />
        <rect x="100" y="160" width="6" height="260" rx="3" fill="hsl(190, 55%, 32%)" />
        {[0, 1, 2, 3].map((i) => (
          <motion.rect
            key={i}
            x="130"
            y={330 + i * 34}
            width="14"
            height="26"
            rx="6"
            fill="hsl(200, 70%, 45%)"
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        <g transform="translate(1000,0) scale(-1,1)">
          <rect x="0" y="90" width="170" height="420" fill="url(#wall-panel)" />
        </g>
        <rect x="830" y="90" width="6" height="420" fill="hsl(220, 15%, 28%)" />
        <rect x="855" y="150" width="70" height="50" rx="6" fill="hsl(220, 20%, 10%)" stroke="hsl(220, 15%, 30%)" strokeWidth="2" />
        <motion.rect
          x="861"
          y="156"
          width="58"
          height="38"
          rx="4"
          fill="hsl(150, 45%, 18%)"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {[0, 1, 2, 3].map((i) => (
          <motion.rect
            key={i}
            x="860"
            y={330 + i * 34}
            width="14"
            height="26"
            rx="6"
            fill="hsl(25, 75%, 48%)"
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <rect x="0" y="470" width="1000" height="130" fill="hsl(220, 13%, 12%)" stroke="hsl(220, 10%, 22%)" strokeWidth="3" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1={(i + 1) * 100}
            y1="470"
            x2={(i + 1) * 100}
            y2="600"
            stroke="hsl(220, 10%, 40%)"
            strokeOpacity="0.15"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <rect
            key={i}
            x={400 + i * 20}
            y="470"
            width="10"
            height="130"
            fill={i % 2 === 0 ? 'hsl(45, 90%, 55%)' : 'transparent'}
            opacity="0.08"
          />
        ))}
      </svg>

      <motion.button
        className="absolute left-[58%] bottom-[22%] -translate-x-1/2 z-20 group cursor-pointer"
        onClick={onAccessComputer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          className="overflow-visible transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(0,200,255,0.35)]"
        >
          <defs>
            <linearGradient id="monitor-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220, 25%, 20%)" />
              <stop offset="100%" stopColor="hsl(220, 20%, 12%)" />
            </linearGradient>
          </defs>
          <rect x="25" y="10" width="100" height="72" rx="8" fill="url(#monitor-body)" stroke="hsl(220, 18%, 34%)" strokeWidth="3" />
          <motion.rect
            x="35"
            y="20"
            width="80"
            height="52"
            rx="4"
            fill="hsl(200, 50%, 14%)"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <rect x="70" y="82" width="10" height="14" fill="hsl(220, 10%, 35%)" />
          <rect x="50" y="96" width="50" height="6" rx="3" fill="hsl(220, 10%, 20%)" />
          <rect x="20" y="102" width="110" height="16" rx="3" fill="hsl(220, 12%, 22%)" stroke="hsl(220, 12%, 30%)" strokeWidth="2" />
          <rect x="26" y="118" width="8" height="26" fill="hsl(220, 10%, 20%)" />
          <rect x="116" y="118" width="8" height="26" fill="hsl(220, 10%, 20%)" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-start pt-4 pointer-events-none">
          <Monitor className="w-4 h-4 text-cyan-400 mt-2" />
          <p className="text-[9px] font-mono text-cyan-400 mt-1">MISSION TERMINAL</p>
        </div>

        <motion.div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Access Terminal</span>
          </div>
        </motion.div>
      </motion.button>

      <motion.button
        className="absolute bottom-[22%] left-[38%] -translate-x-1/2 z-30 group cursor-pointer"
        onClick={onExit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
      >
        <svg
          width="110"
          height="160"
          viewBox="0 0 110 160"
          className="overflow-visible transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(255,107,53,0.35)]"
        >
          <rect x="5" y="5" width="100" height="150" rx="14" fill="hsl(220, 15%, 22%)" stroke="hsl(220, 12%, 34%)" strokeWidth="4" />
          <rect
            x="16"
            y="16"
            width="78"
            height="128"
            rx="10"
            fill="hsl(220, 17%, 15%)"
            stroke="hsl(220, 10%, 30%)"
            strokeWidth="2"
            className="transition-colors duration-300 group-hover:stroke-primary"
          />
          <rect x="34" y="30" width="42" height="30" rx="4" fill="hsl(220, 28%, 10%)" stroke="hsl(220, 16%, 36%)" strokeWidth="2" />
          <rect x="82" y="70" width="8" height="30" rx="4" fill="hsl(220, 8%, 55%)" />
          <motion.circle
            cx="86"
            cy="85"
            r="3"
            fill="hsl(140, 70%, 50%)"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text x="55" y="126" textAnchor="middle" fontSize="8" fill="hsl(220, 10%, 55%)" fontFamily="monospace" letterSpacing="1">
            AIRLOCK
          </text>
        </svg>

        <motion.div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Exit</span>
          </div>
        </motion.div>
      </motion.button>

      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          className="hud-panel px-4 md:px-8 py-3 md:py-4 rounded-lg text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] md:text-xs tracking-mission text-muted-foreground mb-1">BASE CAMP INTERIOR</p>
          <h1 className="font-heading text-lg md:text-xl text-primary text-glow">{planet.displayName}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{planet.description}</p>
        </motion.div>
      </div>

      <motion.button
        className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 hud-panel px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center gap-2 md:gap-3 hover:bg-accent/20 transition-colors"
        onClick={onExit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <DoorOpen className="w-4 md:w-5 h-4 md:h-5" />
        <span className="font-heading text-xs md:text-sm tracking-mission">Exit Base Camp</span>
      </motion.button>

      <div className="fixed top-4 left-4 text-[10px] md:text-xs font-mono text-muted-foreground z-30 hidden md:block">
        <p>LOCATION: INTERIOR</p>
        <p>LIFE SUPPORT: ACTIVE</p>
        <p>PRESSURE: NOMINAL</p>
        <p>AIRLOCK: SEALED</p>
      </div>

      <div className="fixed top-4 right-4 text-[10px] md:text-xs font-mono text-muted-foreground text-right z-30 hidden md:block">
        <p>SYSTEMS: ONLINE</p>
        <p>POWER: 98%</p>
        <p>O₂ RECYCLER: ACTIVE</p>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${25 + Math.random() * 50}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- BaseCampInterior.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Manually verify in the browser**

With `npm run dev` running, enter a base camp interior and confirm:
- The room (walls, ceiling, floor, viewport window, ceiling lights) renders as one crisp SVG background instead of ~50 stacked divs.
- The computer terminal and airlock door are visually distinct, redrawn as compact SVG graphics, and still show hover labels ("Access Terminal" / "Exit").
- Clicking the terminal opens the computer screen; clicking the airlock or the bottom "Exit Base Camp" button returns to the planet surface.

- [ ] **Step 6: Commit**

```bash
git add src/components/planet/BaseCampInterior.tsx src/components/planet/BaseCampInterior.test.tsx
git commit -m "feat: rebuild base camp interior as an SVG-backed room"
```

---

### Task 11: Final integration pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated check suite**

```bash
npm run lint
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Expected: all four commands exit 0. If `npx tsc --noEmit` surfaces type errors in the new shader material JSX intrinsic declarations, check that each `declare global { namespace JSX { ... } }` block only adds its own key (`planetSurfaceMaterial`, `atmosphereMaterial`, `ringBandMaterial`) and that there's no duplicate key across files.

- [ ] **Step 2: Full manual walkthrough in the browser**

Run `npm run dev`, open `http://localhost:8080`, and walk through:
1. Solar system view: hover several planets — reticle + label appear; each planet shows distinct procedural surface detail and an atmosphere glow; Saturn's rings show banding.
2. Click a planet — "LOCKING..." plays, then travel begins, then the planet surface loads.
3. On the planet surface: base camp SVG dome renders correctly for the current planet's color; click it — base camp interior opens with the new SVG room.
4. Click the computer terminal — computer screen opens (unchanged, out of scope); close it.
5. Click the airlock — returns to the planet surface.
6. Click "Return to Space" — back to the solar system view.
7. Hover and click the Sun — reticle + lock-on animation match the planet behavior.
8. Check the browser console throughout for errors or warnings.

- [ ] **Step 3: Commit (if anything was fixed during verification)**

```bash
git add -A
git commit -m "chore: final verification pass for planet and base camp visual overhaul"
```

(Only run this if Step 1 or Step 2 required code changes; otherwise there's nothing to commit.)
