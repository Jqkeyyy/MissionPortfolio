# Phase 2: HUD Consistency Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the four areas Phase 1 left untouched (sign modal, computer terminal, travel sequence, top HUD) into the same "mission HUD" visual language as the new planet reticle — via two small shared components (`HudCorners`, `ScanlineReveal`) — without a full rebuild, since none of these four have Phase 1's div-soup problem.

**Architecture:** Extract `PlanetReticle`'s inline corner-bracket markup into a reusable `HudCorners` component (an `absolute inset-0` overlay that pins 4 corner marks to whatever `relative`-positioned parent wraps it — a planet reticle box, a modal panel, or a sidebar button, all at whatever size that parent happens to be). Add a new `ScanlineReveal` wrapper component implementing the clip-path text-reveal Phase 1's spec asked for but never shipped. Apply both across `PlanetReticle`, `SignModal`, `ComputerScreen`, and `SpaceHUD`. `TravelSequence` and `ComputerScreen`'s cyan palette are confirmed already-consistent and are not changed.

**Tech Stack:** React 18, TypeScript, `framer-motion`, Tailwind CSS, Vitest + `@testing-library/react` (jsdom). No Three.js/WebGL involved anywhere in this plan — every file touched is a plain 2D DOM component, so every task gets a real jsdom unit test (no manual-verification-only tasks like Phase 1 had for `PlanetMesh`/`Sun`).

## Global Constraints

- Reuse existing design tokens (`--primary`, `--secondary`, `--hud-line`, `.hud-panel`) — no new colors introduced.
- Do not modify `TravelSequence.tsx` (confirmed already consistent) or change `ComputerScreen.tsx`'s cyan color palette (established Phase 1 "terminal" convention, kept deliberately).
- Do not modify `useGameState.ts`, `SolarSystem.tsx`, `PlanetSurface.tsx`, `BaseCamp.tsx`, `BaseCampInterior.tsx`, or any Phase 1 shader/hook file — out of scope for this phase.
- **Tailwind JIT requires literal, complete class-name strings somewhere in the source.** Never build a class name via string interpolation of a dynamic value (e.g. `` `translate-x-${n}` ``) — Tailwind's scanner can't see it and it silently produces no CSS. Every class name in this plan's code is written out as a complete literal string (inside ternaries is fine — the whole string must just be literally present).
- `tsconfig.app.json` has `strict: false` / `noImplicitAny: false` / `strictNullChecks` off — match the codebase's existing typing looseness.
- Mobile-specific interaction changes to `SpaceHUD.tsx`'s expandable menu are out of scope — only the desktop sidebar buttons get the hover treatment (brackets are a hover-specific affordance; mobile has no hover state).

---

### Task 1: `HudCorners` component

**Files:**
- Create: `src/components/HudCorners.tsx`
- Test: `src/components/HudCorners.test.tsx` (create)

**Interfaces:**
- Produces: `export const HudCorners = (props: { active: boolean; converge?: boolean; size?: 'sm' | 'md' }) => JSX.Element`. Renders an `absolute inset-0 pointer-events-none` overlay with 4 corner-bracket `<span>`s. Callers must wrap it in a `relative`-positioned parent of whatever size they want the brackets to frame — `HudCorners` itself has no intrinsic size.

- [ ] **Step 1: Write the failing test**

Create `src/components/HudCorners.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HudCorners } from './HudCorners';

describe('HudCorners', () => {
  it('is hidden (opacity-0) when inactive', () => {
    render(<HudCorners active={false} />);
    expect(screen.getByTestId('hud-corners').className).toContain('opacity-0');
  });

  it('is visible (opacity-100) when active', () => {
    render(<HudCorners active />);
    expect(screen.getByTestId('hud-corners').className).toContain('opacity-100');
  });

  it('applies converge translate classes to a corner when active and converging', () => {
    const { container } = render(<HudCorners active converge size="md" />);
    const corner = container.querySelector('span');
    expect(corner?.className).toContain('translate-x-6');
  });

  it('renders smaller corner marks for size="sm"', () => {
    const { container } = render(<HudCorners active size="sm" />);
    const corner = container.querySelector('span');
    expect(corner?.className).toContain('w-2 h-2');
  });

  it('defaults to size="md" corner marks when size is omitted', () => {
    const { container } = render(<HudCorners active />);
    const corner = container.querySelector('span');
    expect(corner?.className).toContain('w-4 h-4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- HudCorners.test.tsx`
Expected: FAIL — cannot find module `./HudCorners`.

- [ ] **Step 3: Write the implementation**

Create `src/components/HudCorners.tsx`:

```tsx
interface HudCornersProps {
  active: boolean;
  converge?: boolean;
  size?: 'sm' | 'md';
}

export const HudCorners = ({ active, converge = false, size = 'md' }: HudCornersProps) => {
  const wrapperClassName = `absolute inset-0 pointer-events-none transition-opacity duration-200 ${
    active ? 'opacity-100' : 'opacity-0'
  }`;

  if (size === 'sm') {
    return (
      <div data-testid="hud-corners" className={wrapperClassName}>
        <span className="absolute left-0 top-0 w-2 h-2 border-l border-t border-secondary/70 rounded-tl-sm" />
        <span className="absolute right-0 top-0 w-2 h-2 border-r border-t border-secondary/70 rounded-tr-sm" />
        <span className="absolute left-0 bottom-0 w-2 h-2 border-l border-b border-secondary/70 rounded-bl-sm" />
        <span className="absolute right-0 bottom-0 w-2 h-2 border-r border-b border-secondary/70 rounded-br-sm" />
      </div>
    );
  }

  return (
    <div data-testid="hud-corners" className={wrapperClassName}>
      <span
        className={`absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-secondary transition-transform duration-300 ${
          converge ? 'translate-x-6 translate-y-6' : ''
        }`}
      />
      <span
        className={`absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-secondary transition-transform duration-300 ${
          converge ? '-translate-x-6 translate-y-6' : ''
        }`}
      />
      <span
        className={`absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-secondary transition-transform duration-300 ${
          converge ? 'translate-x-6 -translate-y-6' : ''
        }`}
      />
      <span
        className={`absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-secondary transition-transform duration-300 ${
          converge ? '-translate-x-6 -translate-y-6' : ''
        }`}
      />
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- HudCorners.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/HudCorners.tsx src/components/HudCorners.test.tsx
git commit -m "feat: add shared HudCorners targeting-bracket component"
```

---

### Task 2: `ScanlineReveal` component

**Files:**
- Create: `src/components/ScanlineReveal.tsx`
- Test: `src/components/ScanlineReveal.test.tsx` (create)

**Interfaces:**
- Produces: `export const ScanlineReveal = (props: { children: React.ReactNode; active?: boolean; delay?: number; duration?: number; className?: string }) => JSX.Element`. Wraps `children` in a `motion.div` that animates `clip-path` from fully-clipped to fully-revealed. `active` defaults to `true` (reveal once on mount — the common case for `SignModal`/`ComputerScreen`); pass an explicit toggling `active` value (as `PlanetReticle` will) to replay the sweep whenever it flips from `false` to `true`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ScanlineReveal.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScanlineReveal } from './ScanlineReveal';

describe('ScanlineReveal', () => {
  it('renders its children', () => {
    render(
      <ScanlineReveal>
        <p>Reveal me</p>
      </ScanlineReveal>
    );
    expect(screen.getByText('Reveal me')).toBeInTheDocument();
  });

  it('renders children when active is explicitly false', () => {
    render(
      <ScanlineReveal active={false}>
        <p>Still present</p>
      </ScanlineReveal>
    );
    expect(screen.getByText('Still present')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ScanlineReveal.test.tsx`
Expected: FAIL — cannot find module `./ScanlineReveal`.

- [ ] **Step 3: Write the implementation**

Create `src/components/ScanlineReveal.tsx`:

```tsx
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScanlineRevealProps {
  children: ReactNode;
  active?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScanlineReveal = ({
  children,
  active = true,
  delay = 0,
  duration = 0.4,
  className,
}: ScanlineRevealProps) => {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: active ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ScanlineReveal.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ScanlineReveal.tsx src/components/ScanlineReveal.test.tsx
git commit -m "feat: add ScanlineReveal clip-path text reveal component"
```

---

### Task 3: Refactor `PlanetReticle` to use `HudCorners` and `ScanlineReveal`

**Files:**
- Modify: `src/components/3d/PlanetReticle.tsx` (full rewrite)
- Modify: `src/components/3d/PlanetReticle.test.tsx` (add one assertion)

**Interfaces:**
- Consumes: `HudCorners` (Task 1), `ScanlineReveal` (Task 2).
- Produces: same public interface as before — `PlanetReticle({ name, description, hovered, locking }: { name: string; description: string; hovered: boolean; locking: boolean })`. No callers change (`PlanetMesh.tsx` and `Sun.tsx` are untouched).

This closes the Phase 1 spec gap where the reticle label was supposed to do a scanline reveal but only got an opacity fade.

- [ ] **Step 1: Write the failing test (extend existing file)**

Modify `src/components/3d/PlanetReticle.test.tsx` — add one test to the existing `describe('PlanetReticle', ...)` block (keep the existing 3 tests unchanged):

```tsx
  it('renders the shared HudCorners targeting brackets', () => {
    render(<PlanetReticle name="Earth" description="Experience" hovered locking={false} />);
    expect(screen.getByTestId('hud-corners')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- PlanetReticle.test.tsx`
Expected: FAIL — the new test fails because `data-testid="hud-corners"` doesn't exist yet in the current inline-span implementation (the other 3 existing tests still pass).

- [ ] **Step 3: Replace the file contents**

Replace all of `src/components/3d/PlanetReticle.tsx` with:

```tsx
import { HudCorners } from '@/components/HudCorners';
import { ScanlineReveal } from '@/components/ScanlineReveal';

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
        <HudCorners active={active} converge={locking} size="md" />
      </div>
      <div className="hud-panel px-4 py-2 rounded-lg mt-2 overflow-hidden whitespace-nowrap">
        <ScanlineReveal active={active} duration={0.3}>
          <p className="font-heading text-sm tracking-mission text-primary">
            {locking ? 'LOCKING...' : name}
          </p>
        </ScanlineReveal>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- PlanetReticle.test.tsx`
Expected: PASS (4 tests — the 3 original plus the new one)

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/PlanetReticle.tsx src/components/3d/PlanetReticle.test.tsx
git commit -m "refactor: rebuild PlanetReticle on HudCorners and ScanlineReveal"
```

---

### Task 4: `SignModal` — shared corner brackets and content reveal

**Files:**
- Modify: `src/components/planet/SignModal.tsx` (full rewrite)
- Test: `src/components/planet/SignModal.test.tsx` (create — no test currently exists for this file)

**Interfaces:**
- Consumes: `HudCorners` (Task 1), `ScanlineReveal` (Task 2).
- Produces: same public interface as before — `SignModal({ sign, onClose }: { sign: ContentSign; onClose: () => void })`. No callers change (`PlanetSurface.tsx` is untouched).

- [ ] **Step 1: Write the failing test**

Create `src/components/planet/SignModal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignModal } from './SignModal';
import type { ContentSign } from '@/data/planets';

describe('SignModal', () => {
  const sign: ContentSign = {
    id: 'test-1',
    title: 'Test Sign',
    content: 'Test content body',
    type: 'console',
  };

  it('renders the sign title and content', () => {
    render(<SignModal sign={sign} onClose={() => {}} />);
    expect(screen.getByText('Test Sign')).toBeInTheDocument();
    expect(screen.getByText('Test content body')).toBeInTheDocument();
  });

  it('renders the shared HudCorners targeting brackets', () => {
    render(<SignModal sign={sign} onClose={() => {}} />);
    expect(screen.getByTestId('hud-corners')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- SignModal.test.tsx`
Expected: FAIL — `getByTestId('hud-corners')` and `getByTestId('modal-backdrop')` don't exist yet in the current implementation (the title/content/close-button tests would already pass against the current file, which is fine — proceed to Step 3, then re-run in Step 4 to confirm all 4 pass).

- [ ] **Step 3: Replace the file contents**

Replace all of `src/components/planet/SignModal.tsx` with:

```tsx
import { motion } from 'framer-motion';
import { ContentSign as ContentSignType } from '@/data/planets';
import { X } from 'lucide-react';
import { HudCorners } from '@/components/HudCorners';
import { ScanlineReveal } from '@/components/ScanlineReveal';

interface SignModalProps {
  sign: ContentSignType;
  onClose: () => void;
}

const SignIcon = ({ type }: { type: ContentSignType['type'] }) => {
  const iconClass = "w-6 h-6";
  switch (type) {
    case 'console':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'tablet':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
      );
    case 'crate':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      );
  }
};

export const SignModal = ({ sign, onClose }: SignModalProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative hud-panel rounded-lg p-6 max-w-lg w-full"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background) / 0.95), hsl(var(--background) / 0.98))',
          boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--hud-line) / 0.3)',
        }}
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-primary">
            <SignIcon type={sign.type} />
          </div>
          <h3 className="font-heading text-xl tracking-mission text-primary">
            {sign.title}
          </h3>
        </div>

        <ScanlineReveal duration={0.4}>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {sign.content}
          </p>
        </ScanlineReveal>

        {/* Decorative elements */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-hud-line/50 to-transparent" />

        {/* Targeting frame corners */}
        <HudCorners active size="sm" />
      </motion.div>
    </motion.div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- SignModal.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/planet/SignModal.tsx src/components/planet/SignModal.test.tsx
git commit -m "feat: apply shared HUD corners and scanline reveal to SignModal"
```

---

### Task 5: `ComputerScreen` — scanline reveal on menu item titles

**Files:**
- Modify: `src/components/planet/ComputerScreen.tsx` (full rewrite)
- Test: `src/components/planet/ComputerScreen.test.tsx` (create — no test currently exists for this file)

**Interfaces:**
- Consumes: `ScanlineReveal` (Task 2).
- Produces: same public interface as before — `ComputerScreen({ planet, onClose, onSelectItem }: { planet: PlanetData; onClose: () => void; onSelectItem: (sign: ContentSign) => void })`. No callers change (`PlanetSurface.tsx` is untouched). No color/palette changes per the design (cyan stays).

- [ ] **Step 1: Write the failing test**

Create `src/components/planet/ComputerScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComputerScreen } from './ComputerScreen';
import { planets } from '@/data/planets';

describe('ComputerScreen', () => {
  const planet = planets.find((p) => p.id === 'earth')!;

  it('renders a menu item for each piece of content', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} onSelectItem={() => {}} />);
    for (const item of planet.content) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('calls onSelectItem with the clicked item', () => {
    const onSelectItem = vi.fn();
    render(<ComputerScreen planet={planet} onClose={() => {}} onSelectItem={onSelectItem} />);
    fireEvent.click(screen.getByText(planet.content[0].title));
    expect(onSelectItem).toHaveBeenCalledWith(planet.content[0]);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<ComputerScreen planet={planet} onClose={onClose} onSelectItem={() => {}} />);
    fireEvent.click(screen.getByTestId('computer-screen-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ComputerScreen.test.tsx`
Expected: the first two tests likely already pass against the current implementation; the third fails because `data-testid="computer-screen-close"` doesn't exist yet. Proceed to Step 3 either way, then re-run in Step 4 to confirm all 3 pass.

- [ ] **Step 3: Replace the file contents**

Replace all of `src/components/planet/ComputerScreen.tsx` with:

```tsx
import { motion } from 'framer-motion';
import { PlanetData, ContentSign as ContentSignType } from '@/data/planets';
import { Monitor, X, ChevronRight, Database, FileText, Terminal, Package } from 'lucide-react';
import { ScanlineReveal } from '@/components/ScanlineReveal';

interface ComputerScreenProps {
  planet: PlanetData;
  onClose: () => void;
  onSelectItem: (sign: ContentSignType) => void;
}

const getItemIcon = (type: ContentSignType['type']) => {
  switch (type) {
    case 'console':
      return Terminal;
    case 'tablet':
      return FileText;
    case 'crate':
      return Package;
    default:
      return Database;
  }
};

export const ComputerScreen = ({ planet, onClose, onSelectItem }: ComputerScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Darkened background */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Computer monitor frame */}
      <motion.div
        className="relative w-full max-w-3xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Monitor bezel */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(220, 15%, 20%), hsl(220, 12%, 12%))',
            border: '4px solid hsl(220, 12%, 28%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.3)',
          }}
        >
          {/* Screen area */}
          <div
            className="m-3 md:m-4 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 40%, 8%), hsl(220, 35%, 5%))',
              boxShadow: 'inset 0 0 50px rgba(0, 100, 150, 0.2)',
            }}
          >
            {/* CRT scan line effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="h-px bg-white" style={{ marginTop: '2px' }} />
              ))}
            </div>

            {/* Screen content */}
            <div className="relative p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
              {/* Header bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="font-heading text-lg md:text-xl text-cyan-400 tracking-wide">
                      MISSION TERMINAL
                    </h2>
                    <p className="text-xs text-cyan-600 font-mono">
                      {planet.displayName.toUpperCase()} // {planet.description}
                    </p>
                  </div>
                </div>
                <button
                  data-testid="computer-screen-close"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-white" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-6" />

              {/* Menu header */}
              <div className="mb-4">
                <p className="text-xs font-mono text-gray-500 mb-1">
                  {'>'} SELECT DATA FILE TO ACCESS:
                </p>
              </div>

              {/* Content items as menu */}
              <div className="space-y-3">
                {planet.content.map((item, index) => {
                  const Icon = getItemIcon(item.type);
                  return (
                    <motion.button
                      key={item.id}
                      className="w-full text-left group"
                      onClick={() => onSelectItem(item)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div
                        className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-cyan-500/10"
                        style={{
                          background: 'linear-gradient(90deg, hsl(220, 30%, 12%), transparent)',
                          border: '1px solid hsl(220, 20%, 20%)',
                        }}
                      >
                        {/* Index number */}
                        <div className="w-8 h-8 rounded-md bg-cyan-500/20 flex items-center justify-center">
                          <span className="font-mono text-sm text-cyan-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <ScanlineReveal delay={0.1 + index * 0.1} duration={0.3}>
                            <h3 className="font-heading text-base md:text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.title}
                            </h3>
                          </ScanlineReveal>
                          <p className="text-xs text-gray-500 font-mono uppercase">
                            {item.type} FILE
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs font-mono text-gray-600">
                  <span>SYSTEM STATUS: ONLINE</span>
                  <span>{planet.content.length} FILES AVAILABLE</span>
                </div>
              </div>

              {/* Blinking cursor */}
              <motion.div
                className="absolute bottom-6 left-6 flex items-center gap-1 text-cyan-500 font-mono text-sm"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span>{'>'}</span>
                <span className="w-2 h-4 bg-cyan-500" />
              </motion.div>
            </div>
          </div>

          {/* Monitor stand hint */}
          <div className="h-3 bg-gradient-to-b from-transparent to-black/20" />
        </div>

        {/* Monitor base/stand */}
        <div className="flex justify-center">
          <div
            className="w-20 h-8 -mt-1 rounded-b-lg"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 12%, 18%), hsl(220, 10%, 12%))',
            }}
          />
        </div>
        <div className="flex justify-center">
          <div
            className="w-40 h-3 rounded-b-lg"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 10%, 15%), hsl(220, 8%, 10%))',
              boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Close hint */}
        <p className="text-center text-xs text-gray-600 mt-4 font-mono">
          PRESS ESC OR CLICK OUTSIDE TO EXIT TERMINAL
        </p>
      </motion.div>
    </motion.div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ComputerScreen.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/planet/ComputerScreen.tsx src/components/planet/ComputerScreen.test.tsx
git commit -m "feat: apply scanline reveal to ComputerScreen menu item titles"
```

---

### Task 6: `SpaceHUD` — hover corner brackets on the destination sidebar

**Files:**
- Modify: `src/components/SpaceHUD.tsx` (full rewrite)
- Test: `src/components/SpaceHUD.test.tsx` (create — no test currently exists for this file)

**Interfaces:**
- Consumes: `HudCorners` (Task 1).
- Produces: same public interface as before — `SpaceHUD()` takes no props, reads `useGameState()`. No callers change (`Index.tsx`/`App.tsx` untouched). Only the desktop sidebar buttons change; the mobile expandable menu is untouched.

- [ ] **Step 1: Write the failing test**

Create `src/components/SpaceHUD.test.tsx`. `SpaceHUD` returns `null` unless `currentView === 'space'` in the Zustand store, so the test must first set that state. Note `useGameState`'s store persists across tests in the same file (Zustand doesn't auto-reset) — set `currentView` via `useGameState.setState` in a `beforeEach`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpaceHUD } from './SpaceHUD';
import { useGameState } from '@/hooks/useGameState';

describe('SpaceHUD', () => {
  beforeEach(() => {
    useGameState.setState({ currentView: 'space', selectedPlanet: null });
  });

  it('renders a destination button for every planet plus the intro', () => {
    render(<SpaceHUD />);
    expect(screen.getByText('☀ Intro')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Neptune')).toBeInTheDocument();
  });

  it('calls travelToPlanet with the planet id when a destination is clicked', () => {
    render(<SpaceHUD />);
    fireEvent.click(screen.getByText('Earth'));
    expect(useGameState.getState().selectedPlanet).toBe('earth');
  });

  it('shows hud-corners brackets on the desktop destination buttons', () => {
    render(<SpaceHUD />);
    expect(screen.getAllByTestId('hud-corners').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- SpaceHUD.test.tsx`
Expected: the first two tests likely already pass against the current implementation (clicking a destination calls `travelToPlanet`, which updates `selectedPlanet` synchronously even though the full travel sequence timer is async); the third fails because no `hud-corners` elements exist yet. Proceed to Step 3 either way, then re-run in Step 4 to confirm all 3 pass.

- [ ] **Step 3: Replace the file contents**

Replace all of `src/components/SpaceHUD.tsx` with:

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { planets } from '@/data/planets';
import { Rocket, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useState } from 'react';
import { HudCorners } from '@/components/HudCorners';

export const SpaceHUD = () => {
  const { currentView, selectedPlanet, travelToPlanet } = useGameState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null);

  if (currentView !== 'space') return null;

  return (
    <>
      {/* Title overlay */}
      <motion.div
        className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 text-center z-10 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="font-heading text-2xl md:text-5xl tracking-mission text-primary text-glow">
          Mission Portfolio
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 tracking-wide text-sm md:text-base">
          Jake Sass — Select a Planet to Explore
        </p>
      </motion.div>

      {/* Desktop: Planet quick-select sidebar */}
      <motion.div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="hud-panel p-3 rounded-lg space-y-1 max-h-[70vh] overflow-y-auto">
          <p className="text-xs tracking-mission text-muted-foreground text-center mb-3">
            DESTINATIONS
          </p>

          {/* Sun/Intro */}
          <motion.button
            className={`relative w-full px-3 py-2 rounded text-left text-sm transition-colors flex items-center gap-2 ${
              selectedPlanet === 'sun'
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-accent/20 text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => travelToPlanet('sun')}
            onMouseEnter={() => setHoveredDestination('sun')}
            onMouseLeave={() => setHoveredDestination(null)}
            whileHover={{ x: -3 }}
          >
            <HudCorners active={hoveredDestination === 'sun'} size="sm" />
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#FDB813' }}
            />
            <span className="font-heading tracking-wide text-xs">☀ Intro</span>
          </motion.button>

          <div className="h-px bg-border/30 my-2" />

          {planets.filter(p => p.id !== 'sun').map((planet) => (
            <motion.button
              key={planet.id}
              className={`relative w-full px-3 py-2 rounded text-left text-sm transition-colors flex items-center gap-2 ${
                selectedPlanet === planet.id
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-accent/20 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => travelToPlanet(planet.id)}
              onMouseEnter={() => setHoveredDestination(planet.id)}
              onMouseLeave={() => setHoveredDestination(null)}
              whileHover={{ x: -3 }}
            >
              <HudCorners active={hoveredDestination === planet.id} size="sm" />
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: planet.color }}
              />
              <span className="font-heading tracking-wide text-xs">
                {planet.displayName}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mobile: Expandable menu */}
      <div className="fixed bottom-4 left-4 right-4 z-10 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className="hud-panel w-full px-4 py-3 rounded-lg flex items-center justify-between"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-primary" />
              <span className="font-heading text-sm tracking-mission">SELECT DESTINATION</span>
            </div>
            {mobileMenuOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="hud-panel mt-2 p-3 rounded-lg max-h-[50vh] overflow-y-auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="px-3 py-2 rounded text-left text-sm flex items-center gap-2 hover:bg-accent/20"
                    onClick={() => {
                      travelToPlanet('sun');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FDB813' }} />
                    <span className="text-xs">☀ Intro</span>
                  </button>
                  {planets.filter(p => p.id !== 'sun').map((planet) => (
                    <button
                      key={planet.id}
                      className="px-3 py-2 rounded text-left text-sm flex items-center gap-2 hover:bg-accent/20"
                      onClick={() => {
                        travelToPlanet(planet.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: planet.color }}
                      />
                      <span className="text-xs truncate">{planet.displayName}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Controls hint */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="hud-panel px-6 py-3 rounded-lg flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Rocket className="w-4 h-4" />
            <span>Click a planet or select from the list • Drag to orbit • Scroll to zoom</span>
          </div>
        </div>
      </motion.div>

      {/* Corner HUD decorations */}
      <div className="fixed top-4 left-4 z-10 hidden md:block">
        <motion.div
          className="text-xs font-mono text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p>SOLAR_SYS: ACTIVE</p>
          <p>NAV_MODE: ORBIT</p>
          <p>ZOOM: SYSTEM VIEW</p>
        </motion.div>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-line/10 to-transparent"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- SpaceHUD.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SpaceHUD.tsx src/components/SpaceHUD.test.tsx
git commit -m "feat: add hud-corners hover treatment to SpaceHUD destination list"
```

---

### Task 7: Final integration pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated check suite**

```bash
npm run lint
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Expected: all four commands exit 0. `npm run lint` should show only the pre-existing baseline (errors/warnings confined to untouched `src/components/ui/*` and `tailwind.config.ts` — see Phase 1's final review for that baseline) with zero new errors/warnings in any file this plan touched.

- [ ] **Step 2: Manual browser walkthrough**

Run `npm run dev`, open the app, and walk through:
1. Hover a planet in the 3D solar system — confirm the reticle's label text does a left-to-right sweep-reveal (not an instant fade) each time you hover in, and the corner brackets still converge inward during the "LOCKING..." click animation exactly as before (no visual regression from the `HudCorners` refactor).
2. On a planet surface, open a sign — confirm the modal shows small corner brackets near its edges and the content paragraph sweeps in left-to-right on open.
3. Enter a base camp, open the computer terminal — confirm each menu item's title sweeps in (staggered, matching the existing item-by-item entrance) and the terminal still opens/closes/selects items correctly. Confirm the cyan terminal look is unchanged.
4. In the solar system view, hover each item in the right-side DESTINATIONS sidebar — confirm small corner brackets fade in around the hovered item and fade out on mouse-leave, and clicking still travels to that destination.
5. Check the browser console throughout for errors or warnings.

- [ ] **Step 3: Commit (if anything was fixed during verification)**

```bash
git add -A
git commit -m "chore: final verification pass for Phase 2 HUD consistency polish"
```

(Only run this if Step 1 or Step 2 required code changes; otherwise there's nothing to commit.)
