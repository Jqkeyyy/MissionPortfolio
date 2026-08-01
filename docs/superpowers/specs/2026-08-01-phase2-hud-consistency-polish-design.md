# Phase 2: HUD Consistency Polish — Design

## Context

Phase 1 (see `2026-07-31-planet-basecamp-visual-overhaul-design.md`) rebuilt the planets, planet hover/click interaction, and base camp exterior/interior, introducing a "mission HUD" visual language: corner-bracket reticles, a shared `usePlanetLockOn` hook, and a `PlanetReticle` component. Four areas were explicitly left out of that pass: `SignModal.tsx`, `ComputerScreen.tsx`, `TravelSequence.tsx`, and `SpaceHUD.tsx`.

Unlike the base camp components Phase 1 rebuilt, none of these four have the "div soup" problem — they're already reasonably clean Tailwind/Framer Motion components using the app's design tokens (`--primary`, `--hud-line`, `.hud-panel`). This phase is a smaller, targeted consistency pass, not a rebuild: bring these four into the same visual language as the new planet reticle, and close one small gap Phase 1's own spec left unimplemented.

## Scope

1. **Shared HUD corner-bracket component.** `PlanetReticle.tsx` (`src/components/3d/PlanetReticle.tsx`) currently defines its four corner-bracket `<span>` elements inline. Extract these into a new, reusable presentational component `HudCorners` (`src/components/HudCorners.tsx`) with props `{ active: boolean; converge?: boolean; size?: 'sm' | 'md' }`: `active` controls visibility (opacity fade, matches current behavior), `converge` (default `false`) controls the inward-translate "locking" animation — only `PlanetReticle` passes `converge`, since that animation is specific to planet targeting — and `size` controls the bracket box's footprint (`md` = current `w-24 h-24`/`w-4 h-4` corners for `PlanetReticle`, `sm` = a smaller `w-4 h-4` box/`w-2 h-2` corners for use inside `SignModal` and the `SpaceHUD` sidebar buttons, both of which are much smaller elements than a planet's hover target). `PlanetReticle` is refactored to render `<HudCorners active={hovered || locking} converge={locking} size="md" />` in place of its four inline `<span>`s. `SignModal.tsx`'s existing four ad-hoc corner-accent `<div>`s (currently `absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/30 rounded-tl`, etc.) are replaced with `<HudCorners active size="sm" />` (always active/visible once the modal is mounted, since the modal itself is the "framed" content — no separate hover state), so the modal's "targeting frame" look is literally the same code as the planet reticle's, not a visually-similar reimplementation.
2. **Scanline text reveal.** Phase 1's design spec asked for the planet hover label to do "a brief left-to-right scanline/clip reveal... instead of appearing instantly," but the implementation shipped with only an opacity fade (logged as a parked, non-blocking gap in that phase's final review). This phase implements it: a small reusable `ScanlineReveal` wrapper component (`src/components/ScanlineReveal.tsx`) that animates a `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` sweep (via Framer Motion) on mount/`when` trigger, wrapping its children. Applied to:
   - `SignModal.tsx`'s content paragraph (`sign.content`), triggered on modal open.
   - `ComputerScreen.tsx`'s menu item titles, triggered on each item's existing staggered entrance (reusing the existing `delay: 0.1 + index * 0.1` stagger).
   - `PlanetReticle.tsx`'s label text, retrofitted to finally satisfy the original Phase 1 spec bullet (was opacity-only; this closes that gap using the same new component the other two areas use).
3. **`SpaceHUD` destination list hover treatment.** The desktop sidebar's per-planet buttons (`src/components/SpaceHUD.tsx`) currently transition only `background-color` and a small `x` translate on hover. Add a lightweight bracket-corner highlight (reusing `HudCorners`, sized down) that fades in around the button on hover, echoing the 3D planet-hover feel. The mobile expandable-menu buttons are left as plain touch targets — brackets are a hover-specific affordance and mobile has no hover state; adding motion there would only add visual noise without a corresponding interaction to justify it.
4. **`TravelSequence.tsx`: no changes.** Reviewed and confirmed already consistent (design tokens, `.hud-panel`-style mono corner text, `text-glow`) — nothing here reads as inconsistent with the new language. Not touched.
5. **`ComputerScreen.tsx`'s cyan palette: no changes.** Its hardcoded `cyan-400`/`cyan-500`/`cyan-600` Tailwind classes are a deliberate Phase 1 convention (the base camp's own terminal graphic uses the same cyan) representing "terminal/tech" content, distinct from the orange "mission chrome" used elsewhere. This is intentional differentiation, not an inconsistency — no color token changes in this file. Only the scanline-reveal addition from item 2 applies to it.

## Out of scope

- Any change to `TravelSequence.tsx` beyond confirming it needs none.
- Recoloring `ComputerScreen.tsx`.
- Mobile-specific interaction changes to `SpaceHUD.tsx`'s expandable menu.
- Any change to `useGameState.ts`, `SolarSystem.tsx`, `PlanetSurface.tsx`, `BaseCamp.tsx`, `BaseCampInterior.tsx`, or any of the shader/hook files from Phase 1 — this phase only touches the four named files plus two new small shared components.

## Testing / validation

- `npm run lint` and `npm test` after implementation.
- New shared components (`HudCorners`, `ScanlineReveal`) get real jsdom unit tests (pure presentational, no Three.js/WebGL dependency, same pattern as Phase 1's `PlanetReticle` tests).
- `SignModal.tsx`, `ComputerScreen.tsx`, `SpaceHUD.tsx` are 2D React components with no WebGL dependency — existing or new jsdom tests should cover that they still render their content and preserve existing click/close behavior after the refactor.
- Manual browser verification (per Phase 1's lesson: jsdom cannot render animation/visual correctness) to confirm the corner brackets and scanline reveal actually look right and don't clip/jank on the sign modal, computer screen, and sidebar hover states.
