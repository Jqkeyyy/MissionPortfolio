# Mission Portfolio Post-Deployment Enhancement Plan

**Purpose:** Prepare items 2–7 as bounded multi-agent work that begins only after the
production deployment is complete and verified.

**Sequence:** Plan now -> deploy and verify production -> execute this plan.

**Deployment gate status:** Complete on 2026-09-07 at production implementation commit
`9d929d5`. Wave 1 may begin after the documentation handoff is merged.

**Baseline:** `main` at or after `1471aed` (`Model proportional planetary motion and
rings`), plus the deployment-specific metadata commit.

## Outcomes

This program adds:

2. A planet science console and continuous pause / `0.5x` / `1x` / `4x` simulation controls.
3. A 60–90 second guided recruiter tour.
4. Persistent, browser-local exploration progress.
5. Optional, user-activated mission sound.
6. Lightweight solar-system details: an asteroid belt, selected major moons, a comet,
   and an optional axial-tilt guide.
7. Privacy-safe aggregate analytics and sanitized client-error monitoring.

It must preserve the fast Quick Portfolio route, keyboard access, reduced-motion support,
WebGL recovery, and the current tested travel path.

## Coordination Rules

1. The root worktree is the integration worktree and is owned by the coordinator.
2. Feature agents work in dedicated `.worktrees/` directories on `agents/...` branches.
3. At most three implementation agents run concurrently so the coordinator retains one
   slot for review and integration.
4. Every agent edits only the files listed in its packet. A needed ownership change is
   requested before editing.
5. Create-only foundation packets never edit shared application files.
6. Agents do not merge, rebase, force-push, delete worktrees, or use `git add -A`.
7. No package dependency or binary media asset is added unless its packet explicitly
   permits it and the coordinator approves it.
8. Every merge gate requires focused tests followed by `npm run check`.
9. Browser-facing waves also require `npm run test:e2e` and actual WebGL inspection.
10. Preserve these four untracked user files:
    - `JacobSassResume.pdf`
    - `Screenshot 2026-09-04 174513.png`
    - `Screenshot 2026-09-05 162608.png`
    - `Screenshot 2026-09-05 174204.png`

## Integration-Locked Files

Only the named serial or integration packet may edit these files:

- `package.json`
- `package-lock.json`
- `src/main.tsx`
- `src/pages/Index.tsx`
- `src/hooks/useGameState.ts`
- `src/components/SpaceHUD.tsx`
- `src/components/PlanetSurface.tsx`
- `src/components/TravelSequence.tsx`
- `src/components/3d/SolarSystem.tsx`
- `src/components/3d/PlanetMesh.tsx`
- `src/components/3d/OrbitRing.tsx`
- `src/components/3d/Sun.tsx`
- `src/components/3d/orbitalSimulation.ts`
- `src/components/ExplorationRecoveryBoundary.tsx`
- `src/components/portfolio/ProjectLinks.tsx`
- `src/components/portfolio/ContactActions.tsx`
- `src/index.css`
- `tests/e2e/critical-path.spec.ts`

## Milestone D: Deployment Gate

Deployment is deliberately completed before any enhancement implementation begins.

The coordinator must:

- Push the current verified commits.
- Deploy to the final production domain.
- Add and verify canonical and absolute social metadata.
- Verify the production Quick Portfolio and immersive routes on desktop and phone.
- Verify social previews, Lighthouse behavior, console output, and WebGL recovery.
- Record the hosting platform and whether it offers a suitable cookieless telemetry endpoint.
- Run `npm run check` and `npm run test:e2e` locally against the deployment commit.
- Commit any deployment fixes and tag or record the post-deployment baseline SHA.

No packet below starts until this gate is green.

## Wave 1: Parallel Product Foundations

Packets E1-A, E1-B, and E1-C run concurrently from the same post-deployment baseline.
They create new files only.

### Packet E1-A: Science and Simulation Foundation

**Branch:** `agents/e1-science-foundation`

**Owns:**

- Create `src/data/planetScience.ts`
- Create `src/data/planetScience.test.ts`
- Create `src/hooks/useSimulationState.ts`
- Create `src/hooks/useSimulationState.test.ts`
- Create `src/components/3d/SimulationClock.tsx`
- Create `src/components/3d/SimulationClock.test.tsx`
- Create `src/components/SimulationControls.tsx`
- Create `src/components/SimulationControls.test.tsx`
- Create `src/components/PlanetScienceConsole.tsx`
- Create `src/components/PlanetScienceConsole.test.tsx`

**Design:**

- Keep simulation state separate from navigation state.
- Supported speeds are exactly `0.5`, `1`, and `4`; default is running at `1`.
- Use one accumulated simulation clock shared by all R3F bodies. Never derive simulated
  time as `realElapsed * speed`, because changing speed would teleport planets.
- Pausing freezes orbital position, axial rotation, and procedural planet motion while
  camera controls, the shuttle, and cosmetic UI remain responsive.
- Science records supplement existing `PlanetData`; they do not duplicate its period,
  tilt, inclination, eccentricity, parent, or ring fields.
- Every body has a compact science record with an optional mean orbital speed, ring
  summary, and authoritative source URL.
- The accessible dialog explains retrograde rotation, Earth-centered Moon motion, ring
  type, day/year length, tilt, inclination, and eccentricity.

**Tests:** Catalog completeness, safe source URLs, all speed/pause transitions, continuous
clock behavior, retrograde formatting, Moon parent display, Sun non-applicable values,
dialog focus/Escape behavior, and phone-width layout.

### Packet E1-B: Guided Recruiter Tour Foundation

**Branch:** `agents/e1-guided-tour`

**Owns:**

- Create `src/data/recruiterTour.ts`
- Create `src/data/recruiterTour.test.ts`
- Create `src/hooks/useRecruiterTour.ts`
- Create `src/hooks/useRecruiterTour.test.ts`
- Create `src/components/tour/GuidedRecruiterTour.tsx`
- Create `src/components/tour/GuidedRecruiterTour.test.tsx`
- Optionally create `src/components/tour/index.ts`

**Route:** Sun -> Earth -> Saturn -> Neptune.

**Design:**

- Four 12-second dwell periods plus existing travel durations produce an approximately
  61-second tour.
- Reference existing planet and content IDs rather than duplicating portfolio claims.
- Status is `idle`, `running`, `paused`, or `complete`.
- Dwell timing begins only after arrival at the matching destination.
- Pause preserves remaining dwell time. Exit stops automation without moving the visitor.
- The overlay exposes `Step N of 4`, pause/resume, next stop, and exit controls with polite
  announcements and reduced-motion-safe animation.
- Neptune completion offers Quick Portfolio and free-exploration actions.
- All timers are cleared on exit, completion, unmount, or recovery.

**Tests:** Route validity and duration, arrival-gated timing, pause/resume remainder,
single-dispatch next behavior, cleanup, final completion, keyboard controls, and live
announcements.

### Packet E1-C: Exploration Progress Foundation

**Branch:** `agents/e1-progress`

**Owns:**

- Create `src/lib/explorationProgress.ts`
- Create `src/lib/explorationProgress.test.ts`
- Create `src/hooks/useExplorationProgress.ts`
- Create `src/hooks/useExplorationProgress.test.ts`
- Create `src/components/progress/ExplorationProgress.tsx`
- Create `src/components/progress/ExplorationProgress.test.tsx`
- Create `src/components/progress/ExplorationProgressTracker.tsx`
- Create `src/components/progress/ExplorationProgressTracker.test.tsx`
- Optionally create `src/components/progress/index.ts`

**Design:**

- Persist only `mission-portfolio:exploration-progress:v1`.
- Store a version, a validated array of visited planet IDs, and completion-dismissal state.
- Mark a world visited only when `currentView === 'planet'`; selection and interception do
  not count, while a skipped flight that arrives does count.
- Progress survives route reset and reload. Clearing progress is an explicit, confirmed,
  separate action.
- The UI exposes native progress semantics, `N/10 destinations explored`, visited status,
  and a dismissible 10/10 achievement.
- Malformed, unavailable, or quota-limited storage never breaks exploration.
- Progress never leaves the browser.

**Tests:** Parsing/version validation, ID filtering/deduplication, unavailable storage,
idempotent marking, hydration, arrival rules, persistence, completion, dismissal, and
accessible progress output.

### Wave 1 Merge Gate

The coordinator reviews ownership, cherry-picks E1-A through E1-C, then runs:

```powershell
npm run check
```

## Wave 2: Serial Cockpit Integration

These packets run one at a time because both modify the HUD and browser journey.

### Packet E2-A: Science-Control Integration

**Depends on:** E1-A.

**Owns:**

- `src/components/3d/SolarSystem.tsx`
- `src/components/3d/PlanetMesh.tsx`
- `src/components/3d/OrbitRing.tsx`
- `src/components/3d/Sun.tsx`
- `src/components/3d/orbitalSimulation.ts`
- Related focused tests
- `src/components/SpaceHUD.tsx`
- `src/components/SpaceHUD.test.tsx`
- `tests/e2e/critical-path.spec.ts`
- `README.md`

**Integration:**

- Advance the shared simulation clock once per frame before body updates.
- Use simulated absolute time for orbits and scaled delta for spins.
- Keep the Moon synchronized at every speed.
- Add Pause/Resume and three accessible speed buttons to the HUD.
- Change the displayed scales dynamically: at `1x`, one Earth year is 60 seconds and one
  Earth day is 12 seconds; `0.5x` doubles those durations and `4x` quarters them.
- Add a separate science-information control beside every desktop/mobile destination.
  Information controls must not be nested in travel buttons and must never start travel.
- Use an accessible, focus-trapped science dialog that fits a 390 x 844 viewport.

**Acceptance:** No position jump on pause/resume or speed changes; no per-frame React
rerender loop; all ten bodies work by keyboard and pointer; Quick Portfolio, fallback,
travel, and Earth-to-HAB tests remain green.

### Packet E2-B: Tour and Progress Integration

**Depends on:** E1-B, E1-C, and E2-A.

**Owns:**

- `src/pages/Index.tsx`
- `src/pages/Index.performance.test.tsx`
- `src/components/SpaceHUD.tsx`
- `src/components/SpaceHUD.test.tsx`
- `src/components/PlanetSurface.tsx`
- `src/components/PlanetSurface.test.tsx`
- `tests/e2e/critical-path.spec.ts`

**Integration:**

- Mount the tour controller above space/travel/surface switching so it survives every stop.
- Add `Take guided tour` to the initial route chooser and a smaller HUD action.
- Hide the immersive tour when WebGL is unavailable.
- Mount progress tracking once at route level.
- Add the compact progress count and visited status to desktop/mobile destination controls.
- Add compact progress to planet surfaces without obscuring telemetry or navigation.
- Do not add tour dwell timers to `useGameState`; consume its existing cancelable travel API.
- Do not clear progress when exploration state resets.

**Acceptance:** The complete guided route works with pause, next, and exit; manual controls
remain usable after stopping; arrival persistence survives reload; interception does not
count; 10/10 completion is announced; existing recruiter and recovery paths stay green.

### Wave 2 Merge Gate

```powershell
npm run check
npm run test:e2e
```

Also perform keyboard, phone-width, reduced-motion, and real-WebGL checks.

## Wave 3: Parallel Sensory and Operations Foundations

Packets E3-A, E3-B, and E3-C run concurrently from the merged Wave 2 baseline. They create
new files only.

### Packet E3-A: Optional Mission Audio

**Branch:** `agents/e3-audio`

**Owns:**

- Create files under `src/audio/`
- Create `src/components/MissionSoundControl.tsx`
- Create `src/components/MissionSoundControl.test.tsx`

**Design:**

- Use a zero-dependency Web Audio engine with subtle procedural hum, lock-on, travel,
  arrival, and planet-keyed ambience.
- Default to muted and create/resume no `AudioContext` before a user gesture.
- Persist only `mission-portfolio:audio-muted:v1`.
- Suspend while the page is hidden and disconnect all nodes when disabled/unmounted.
- Sound errors are silent failures and sound never carries unique information.
- The toggle uses `aria-pressed`; unsupported browsers degrade to a disabled control.
- Add no downloaded media, licensing risk, or production dependency.

**Tests:** No pre-gesture audio, enable/disable/suspend/cleanup, duplicate-loop prevention,
storage failure, profile completeness, state-to-cue mapping, and accessible toggle behavior.

### Packet E3-B: Lightweight Solar Details

**Branch:** `agents/e3-solar-details`

**Owns:**

- Create `src/data/solarDetails.ts`
- Create `src/data/solarDetails.test.ts`
- Create `src/components/3d/AsteroidBelt.tsx`
- Create `src/components/3d/MajorMoonSystem.tsx`
- Create `src/components/3d/Comet.tsx`
- Create `src/components/3d/AxialTiltGuide.tsx`
- Create `src/components/3d/SolarSystemDetails.tsx`
- Create focused tests or pure geometry helpers beside those components

**Design and budgets:**

- Use a deterministic point field between Mars and Jupiter.
- Use one instanced mesh for a curated set of major moons attached to moving parents.
- Use one subtle deterministic comet/tail.
- Show only the inspected body's axial guide, controlled by the science console.
- Mark compressed decorative bodies as illustrative, not live ephemeris data.
- No textures, runtime randomness, pointer handlers, destination labels, or blocked raycasts.
- High profile: roughly 450–700 asteroid points; low profile: 120–200.
- Added scene cost: at most five draw calls and 15 kB gzip of authored feature code.
- Reduced motion freezes decorative belt/comet motion without removing context.

**Tests:** Seed stability, belt bounds, valid/unique moon parents, parent-relative transforms,
profile counts, reduced-motion behavior, noninteractive objects, and tilt-vector correctness.

### Packet E3-C: Privacy-Safe Observability Core

**Branch:** `agents/e3-observability`

**Owns:**

- Create files under `src/observability/`
- Create `.env.example` only if it does not already exist

**Design:**

- Use a dependency-free client and the deployment's approved same-origin or HTTPS endpoint.
- Be a no-op when the endpoint is absent.
- Accept only typed events: route choice, immersive launch, Quick Portfolio open,
  destination selection/arrival, project/contact action, tour start/complete/skip,
  exploration completion, WebGL unavailability, and client error.
- Never collect cookies, IDs, fingerprints, full URLs, query/hash values, free-form text,
  contact information, keystrokes, camera motion, or session replay.
- Honor Global Privacy Control and Do Not Track.
- Sanitize/truncate/redact error messages and stacks; deduplicate and rate-limit events.
- Swallow all telemetry transport failures.
- The production endpoint must discard or truncate IP data and document retention.

**Tests:** Disabled behavior, GPC/DNT, schema rejection, redaction, rate limiting,
beacon/fetch fallback, listener cleanup, and transport-failure isolation.

### Wave 3 Merge Gate

Cherry-pick all three create-only packets and run `npm run check`.

## Wave 4: Parallel Audio and Scene Integration

Two agents may run concurrently from the same Wave 3 baseline because their existing-file
ownership does not overlap.

### Packet E4-A: Audio Integration

**Owns:**

- `src/pages/Index.tsx`
- `src/components/SpaceHUD.tsx`
- `src/components/SpaceHUD.test.tsx`
- Audio files created by E3-A

Mount one audio controller above view switching and add its toggle to the unified cockpit.
The controller observes navigation transitions without changing game state.

### Packet E4-B: Solar-Detail Integration

**Owns:**

- `src/components/3d/SolarSystem.tsx`
- `src/components/3d/SolarSystem.performance.test.tsx`
- Solar-detail files created by E3-B

Mount one detail composition in Canvas. Extend the existing graphics profile with detail
level and decorative-motion settings. Do not duplicate device-capability detection.

### Wave 4 Merge Gate

Because E4-A and E4-B have disjoint ownership, the coordinator may cherry-pick either order,
then runs:

```powershell
npm run check
npm run test:e2e
```

Perform actual-browser audio-autoplay, WebGL console, reduced-motion, low-capability, phone,
and 200% zoom checks.

## Wave 5: Serial Observability Integration

Analytics is wired last so its event surface follows the final stable UI.

### Packet E5-A: Observability Wiring

**Owns:**

- `src/main.tsx`
- `src/pages/Index.tsx`
- `src/components/ExplorationRecoveryBoundary.tsx` and test
- `src/components/portfolio/ProjectLinks.tsx` and test
- `src/components/portfolio/ContactActions.tsx` and test
- Final tour/progress/science/audio control files only where direct events are unavoidable
- `src/vite-env.d.ts`
- `tests/e2e/critical-path.spec.ts`

**Integration:**

- Prefer one state-transition bridge instead of scattering calls through `useGameState`.
- Use direct calls only for project/contact actions and tour actions that cannot be inferred.
- Install and clean up global `error` and `unhandledrejection` handlers.
- Report React boundary errors once through the sanitizer.
- Verify the default build sends no telemetry request.
- Verify a configured test build sends only allowlisted, identifier-free payloads.

**Acceptance:** No behavior change when disabled or offline; no personal/free-form data;
errors still reach recovery UI; the endpoint's cookie, IP, retention, and deletion policy is
documented in the public privacy note.

## Wave 6: Parallel Release Audits

Three read-only agents run concurrently after Wave 5:

- **E6-A Accessibility:** keyboard-only journey, focus, screen-reader naming, reduced motion,
  200% zoom, sound alternatives, dialog behavior, and tour announcements.
- **E6-B Performance:** initial/deferred bundle comparison, network requests, draw calls,
  low-capability behavior, and representative frame-time sampling.
- **E6-C Browser Journey:** desktop/phone/touch flows, reload persistence, audio gesture rules,
  WebGL recovery, full guided tour, and configured/disabled telemetry network inspection.

Each agent writes a new report under `docs/audits/` and does not edit application code.
The coordinator assigns any fixes as narrow serial packets, then runs the final gate.

## Final Gate

Required before calling items 2–7 complete:

```powershell
npm run check
npm run test:e2e
npm audit --omit=dev
```

Also require:

- No browser console, shader, unhandled-promise, or audio errors.
- Quick Portfolio initial-loading behavior does not regress.
- The immersive bundle increase is recorded and justified.
- Solar details remain inside the draw-call/count budgets.
- No audio starts before an explicit gesture.
- Progress is local only and analytics uses no storage or identifiers.
- Default/no-endpoint telemetry sends zero requests.
- All new controls work at 390 x 844, 200% zoom, keyboard-only, and reduced motion.

## Standard Agent Handoff

```text
Packet: <packet id>
Branch: <branch>
Commit: <sha>
Changed: <owned files only>
Verification: <commands and results>
Risks: <none or concise list>
Coordinator action: cherry-pick <sha>
```

## Planned Execution Order

1. Finish and verify deployment.
2. Run E1-A / E1-B / E1-C in parallel.
3. Integrate E2-A, then E2-B serially.
4. Run E3-A / E3-B / E3-C in parallel.
5. Run E4-A / E4-B in parallel.
6. Integrate E5-A serially.
7. Run E6-A / E6-B / E6-C audits in parallel.
8. Apply narrow fixes and pass the final gate.
