# Mission Portfolio Agent Work Packets

**Purpose:** Turn the portfolio roadmap into bounded tasks that multiple agents can execute without editing the same files at the same time.

**Companion plan:** [Mission Portfolio Improvement Roadmap](./2026-09-06-portfolio-improvements-roadmap.md)

## Non-negotiable Coordination Rules

1. The root worktree is the integration worktree and is owned by the coordinating agent.
2. Every implementation agent works in its own Git worktree under `.worktrees/` and on its own `agents/...` branch.
3. A wave starts only after the preceding wave is merged and `npm run check` passes in the integration worktree.
4. Agents may edit only files listed under **Owns**. If another file is required, the agent stops and requests an ownership change.
5. Agents do not merge, rebase, force-push, delete worktrees, or modify another agent's branch.
6. Only the coordinator edits integration-locked files unless a serial packet explicitly assigns one of them.
7. No agent uses `git add -A`; each agent stages only its owned files.
8. No new dependency is installed unless the packet explicitly permits it.
9. Generated claims and metrics must trace to the résumé or a public project repository. Unknowns remain unknown.
10. Every handoff includes the commit SHA, changed files, commands run, results, and unresolved risks.

## Integration-Locked Files

These files are intentionally serial because several plans need them:

- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `src/pages/Index.tsx`
- `src/hooks/useGameState.ts`
- `src/data/planets.ts`
- `src/components/SpaceHUD.tsx`
- `src/components/PlanetSurface.tsx`
- `src/components/TravelSequence.tsx`
- `src/components/planet/BaseCampInterior.tsx`
- `src/components/planet/HabitatDesktop.tsx`
- `src/components/planet/PlanetTerrain.tsx`
- `src/index.css`

Parallel packets must not touch these files. Serial integration packets may modify only the locked files named in that packet.

## Preflight: Coordinator Only

The current root worktree contains uncommitted portfolio content and visual work. New worktrees branch from commits, not from uncommitted files, so the coordinator must establish a reviewed baseline first.

- [ ] Review `git status --short` and identify which existing files belong in the baseline.
- [ ] Run `npm run check` and record the passing result.
- [ ] Commit the reviewed baseline without sweeping unrelated screenshots or private files into the commit.
- [ ] Confirm `.worktrees/` is ignored by Git and ESLint.
- [ ] Create each wave's worktrees from the same updated integration commit.

Example setup after the baseline commit:

```powershell
New-Item -ItemType Directory -Force .worktrees
git worktree add .worktrees/w1-project-catalog -b agents/w1-project-catalog main
git worktree add .worktrees/w1-brand-assets -b agents/w1-brand-assets main
git worktree add .worktrees/w1-performance-audit -b agents/w1-performance-audit main
git worktree add .worktrees/w1-accessibility-audit -b agents/w1-accessibility-audit main
```

The coordinator should give each agent its absolute worktree path and packet ID. Agents must pass that path as the working directory for every filesystem or command operation.

## Standard Agent Handoff

Every packet ends with a message in this format:

```text
Packet: <packet id>
Branch: <branch>
Commit: <sha>
Changed: <owned files only>
Verification: <commands and results>
Risks: <none or concise list>
Coordinator action: cherry-pick <sha>
```

## Wave 1: Parallel Foundations and Audits

All four Wave 1 packets can run concurrently.

### Packet W1-A: Project Catalog

**Branch:** `agents/w1-project-catalog`

**Worktree:** `.worktrees/w1-project-catalog`

**Depends on:** Green-foundation baseline.

**Owns:**

- Create `src/types/portfolio.ts`
- Create `src/data/projects.ts`
- Create `src/data/projects.test.ts`

**Must not touch:** Any existing file, image asset, package manifest, or integration-locked file.

**Deliverables:**

- Typed project status, link, metric, image, and case-study interfaces.
- Factual records for Fantasy Football, QuizClone, Campus Marketplace, Mission Portfolio, What's Jake Doing, and Arena Tracker.
- Explicit status and verified repository/live links.
- Tests for unique IDs, required copy, safe URLs, metric labels, and image-alt requirements.

**Verification:**

```powershell
npm test -- src/data/projects.test.ts --run
npm run typecheck
npm run lint
```

### Packet W1-B: Branding Asset Set

**Branch:** `agents/w1-brand-assets`

**Worktree:** `.worktrees/w1-brand-assets`

**Depends on:** Green-foundation baseline.

**Owns:**

- Create files only under `public/brand/`
- Create `docs/audits/branding-asset-spec.md`

**Must not touch:** `index.html`, `package.json`, existing public assets, or application source.

**Deliverables:**

- `1200x630` Open Graph image in WebP plus PNG fallback.
- Coordinated SVG favicon source and required raster favicon sizes.
- Asset spec listing dimensions, formats, byte sizes, colors, and intended metadata destinations.
- Visual QA at full size and small social-preview size.

**Special instruction:** If AI-generated raster artwork is used, the agent must use the available ImageGen skill and visually inspect the result before handoff.

**Verification:**

- Confirm exact image dimensions.
- Confirm files open without transparency or color-profile defects.
- Keep the combined branding set under the byte budget documented in the asset spec.

### Packet W1-C: Performance Baseline Audit

**Branch:** `agents/w1-performance-audit`

**Worktree:** `.worktrees/w1-performance-audit`

**Depends on:** Green-foundation baseline.

**Owns:**

- Create `docs/audits/performance-baseline.md`

**Must not touch:** Application source, dependencies, configuration, or public assets.

**Deliverables:**

- Production bundle table with raw and gzip sizes.
- Public-asset inventory with dimensions and byte sizes.
- Import analysis identifying initial-route and deferred-only modules.
- Ranked lazy-loading boundaries.
- Realistic budgets for initial JavaScript, images, LCP, CLS, and INP.
- Notes on the unused Query Client and the duplicate Three.js warning without changing either yet.

**Verification:**

```powershell
npm run build
```

### Packet W1-D: Accessibility Baseline Audit

**Branch:** `agents/w1-accessibility-audit`

**Worktree:** `.worktrees/w1-accessibility-audit`

**Depends on:** Green-foundation baseline.

**Owns:**

- Create `docs/audits/accessibility-baseline.md`

**Must not touch:** Application source, dependencies, configuration, or tests.

**Deliverables:**

- Keyboard journey map for space, travel, planet, HAB, desktop, and archive states.
- Focus-management defect list.
- Reduced-motion timing assessment.
- Browser-zoom and mobile-overflow risks.
- Missing accessible names, landmarks, announcements, and touch-target issues.
- Prioritized remediation list with component/file references.

**Verification:** Read-only source review plus browser/assistive-technology observations when an available browser surface permits them.

## Wave 1 Merge Gate

The coordinator cherry-picks in this order:

1. W1-A Project Catalog
2. W1-B Branding Assets
3. W1-C Performance Audit
4. W1-D Accessibility Audit

Then run `npm run check`. Resolve no feature work during this gate; record findings for later packets.

## Wave 2: Parallel Isolated Components

Create all Wave 2 worktrees from the post-Wave-1 integration commit. These four packets can run concurrently.

### Packet W2-A: Project Case-Study Components

**Branch:** `agents/w2-project-ui`

**Owns:**

- Create `src/components/portfolio/ProjectCaseStudy.tsx`
- Create `src/components/portfolio/ProjectCaseStudy.test.tsx`
- Create `src/components/portfolio/ProjectLinks.tsx`
- Create `src/components/portfolio/ProjectLinks.test.tsx`

**Consumes:** `src/types/portfolio.ts` and `src/data/projects.ts` without modifying them.

**Must not touch:** HAB, planet, HUD, global CSS, or package files.

**Deliverables:** Responsive full and compact variants, technology tags, metrics, screenshot/alt rendering, safe repository/demo actions, and tests.

### Packet W2-B: Contact System

**Branch:** `agents/w2-contact-system`

**Owns:**

- Create `src/data/contact.ts`
- Create `src/data/contact.test.ts`
- Create `src/components/portfolio/ContactActions.tsx`
- Create `src/components/portfolio/ContactActions.test.tsx`
- Create `public/Jacob-Sass-Resume.pdf` from the reviewed source résumé

**Must not touch:** `planets.ts`, HAB, HUD, Quick Portfolio, package files, or `index.html`.

**Deliverables:** Typed email/GitHub/LinkedIn/web/résumé/live-project actions, safe external-link behavior, tests, and no public phone number.

### Packet W2-C: Planet Theme Configuration

**Branch:** `agents/w2-planet-themes`

**Owns:**

- Create `src/data/planetThemes.ts`
- Create `src/data/planetThemes.test.ts`
- Create files only under `src/components/planet/theme/`

**Must not touch:** `planets.ts`, existing planet components, global CSS, or public assets.

**Deliverables:** Complete typed themes for all ten destinations, deterministic telemetry values, three reusable habitat families, and configuration tests.

### Packet W2-D: Optimized Asset Candidates

**Branch:** `agents/w2-optimized-assets`

**Owns:**

- Create files only under `public/optimized/`
- Update `docs/audits/performance-baseline.md`

**Must not touch:** Existing assets or any application/configuration file.

**Deliverables:** WebP/AVIF candidates for large HAB and ship assets, documented source-to-output mapping, visual comparison, dimensions, and byte savings.

## Wave 2 Merge Gate

Cherry-pick W2-A through W2-D in packet order, then run `npm run check`. Confirm all new components remain unused until the serial integration wave.

## Wave 3: Serial Recruiter-Path Integration

Only one implementation agent runs this packet.

### Packet W3-A: Case Studies, Contact, and Quick Portfolio

**Branch:** `agents/w3-recruiter-path`

**Depends on:** All Wave 2 packets merged.

**Owns for this serial packet:**

- `src/data/planets.ts`
- `src/components/planet/HabitatDesktop.tsx`
- `src/components/SpaceHUD.tsx`
- `src/pages/Index.tsx`
- `src/hooks/useGameState.ts`
- `src/index.css`
- Create `src/components/quick-portfolio/QuickPortfolio.tsx`
- Create `src/components/quick-portfolio/QuickPortfolio.test.tsx`
- Create any additional files under `src/components/quick-portfolio/`

**Must not touch:** `index.html`, package files, Three.js components, terrain, HAB shell, or branding assets.

**Deliverables:**

- Project IDs connected to planet archives.
- Rich case studies rendered in HAB OS.
- Neptune rendered with direct contact actions.
- One-click Quick Portfolio from desktop and mobile HUD.
- Focus trap, Escape close, focus restoration, print layout, résumé action, and return-to-exploration action.

**Verification:** Component tests for all new behavior followed by `npm run check`.

## Wave 4: Parallel Accessibility and Branding Integration

Create both branches after W3-A is merged. Two agents can run concurrently because ownership does not overlap.

### Packet W4-A: Exploration Accessibility

**Branch:** `agents/w4-accessibility`

**Owns:**

- `src/components/SpaceHUD.tsx`
- `src/components/PlanetSurface.tsx`
- `src/components/TravelSequence.tsx`
- `src/components/planet/BaseCampInterior.tsx`
- `src/components/planet/HabitatDesktop.tsx`
- `src/hooks/useGameState.ts`
- Accessibility-specific tests beside those components

**Must not touch:** `index.html`, package files, global CSS, branding files, project/contact data, Three.js rendering, or terrain.

**Deliverables:** Keyboard-complete journey, focus management, accessible icon labels, skip travel, shortened reduced-motion timers, live announcements, and regression tests.

**Dependency policy:** Adding an accessibility test package requires coordinator approval; prefer existing Testing Library capabilities when sufficient.

### Packet W4-B: Branding and Document Metadata

**Branch:** `agents/w4-brand-integration`

**Owns:**

- `index.html`
- Branding files under `public/brand/`
- Create `public/site.webmanifest`
- `.gitignore` only if a generated branding file requires it

**Coordinator-only follow-up:** Any `package.json` or lockfile change for removing `lovable-tagger`.

**Deliverables:** Original Open Graph/Twitter metadata, favicon links, manifest, zoom-enabled viewport, factual Person/SoftwareSourceCode JSON-LD, and removal of visible Lovable metadata references.

## Wave 4 Merge Gate

Merge W4-A, then W4-B. Run `npm run check`, keyboard-test Quick Portfolio and one full planet journey, and verify metadata paths in the production build.

## Wave 5: Serial Performance Integration

### Packet W5-A: Lazy Loading and Asset Swap

**Branch:** `agents/w5-performance`

**Owns for this serial packet:**

- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/components/3d/SolarSystem.tsx`
- `src/components/planet/BaseCampInterior.tsx`
- `src/components/planet/HabitatDesktop.tsx`
- `src/components/planet/PlanetTerrain.tsx`
- `vite.config.ts`
- `package.json` and `package-lock.json`
- Optimized files under `public/optimized/`
- Performance-specific tests

**Deliverables:** Lazy state boundaries, stable Suspense fallbacks, optimized asset selection, capability-aware Canvas settings, removal of genuinely unused providers/dependencies, WebGL fallback to Quick Portfolio, and before/after bundle evidence.

**Acceptance gate:** Initial JavaScript and requested-image behavior must improve measurably; moving identical code into arbitrary chunks does not qualify.

## Wave 6: Serial Planet Identity Integration

### Packet W6-A: Planet and HAB Themes

**Branch:** `agents/w6-planet-identities`

**Owns for this serial packet:**

- `src/data/planets.ts`
- `src/data/planetThemes.ts`
- `src/components/PlanetSurface.tsx`
- `src/components/planet/PlanetTerrain.tsx`
- `src/components/planet/BaseCampInterior.tsx`
- `src/components/planet/HabitatDesktop.tsx`
- `src/index.css`
- Files under `public/planet-themes/`
- Theme tests

**Deliverables:** Ten recognizable themes built from three reusable families, stable controls, deterministic telemetry, reduced-motion compliance, and no regression against the Wave 5 asset budget.

## Wave 7: Serial Reliability and Release Gate

### Packet W7-A: Final Reliability

**Branch:** `agents/w7-release-quality`

**Owns:** Assigned by the coordinator after reviewing all merged changes. This packet is serial and may touch integration-locked files only for verified defects.

**Deliverables:**

- Cancelable transition timers and fake-timer tests.
- React/WebGL recovery boundary.
- Duplicate Three.js warning investigation and fix.
- Playwright configuration and critical-path smoke tests.
- CI updated to run the final browser checks.
- Unused dependency cleanup.
- Final accessibility, responsive, bundle, link, and metadata verification.

**Final gate:**

```powershell
npm run check
```

The coordinator also runs the new browser smoke command, confirms a clean working tree for intended tracked files, and records final bundle sizes.

## Merge Conflict Policy

- If a cherry-pick conflicts, the coordinator aborts or resolves it in the integration worktree; the producing agent never edits another branch to resolve integration conflicts.
- Data contracts are merged before their consumers.
- Create-only packets merge before serial integration packets.
- Tests travel in the same commit as the behavior they verify.
- A packet with out-of-ownership changes is rejected for cleanup before merge.
- If two agents discover the same required shared-file change, both document it and the coordinator assigns it to the next serial packet.

## Maximum Useful Concurrency

- **Wave 1:** four agents.
- **Wave 2:** four agents.
- **Wave 3:** one agent.
- **Wave 4:** two agents.
- **Waves 5-7:** one implementation agent at a time.

Running more agents during serial waves adds merge risk without meaningful speedup. Audit/review agents may still work read-only while the implementation agent owns the files.
