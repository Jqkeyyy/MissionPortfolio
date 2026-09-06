# Mission Portfolio Accessibility Baseline

**Audit date:** 2026-09-06

**Scope:** The primary exploration path from the solar-system view through travel, a planet surface, the HAB interior, HAB/OS desktop, and the Mission Archive. The bundled novelty apps were reviewed where they affect the shared desktop experience.

**Method:** Read-only source review against WCAG 2.2 AA expectations, supported by the existing component tests. A local Vite server started successfully, but neither a browser nor the in-app browser surface was available to this agent, so no claim below should be treated as a screen-reader, browser-zoom, or device certification.

## Executive summary

The visible desktop and mobile destination lists provide a keyboard-operable alternative to the otherwise pointer-only Three.js planets, and many newer controls use native buttons with useful accessible names. The end-to-end journey is not yet reliably accessible, however. The main blockers are focus not being moved or restored when views and windows change, controls behind overlays remaining in the tab order, unnamed previous/next buttons, long unskippable transitions, disabled page zoom, and desktop windows that open without taking focus.

The most important work is concentrated in `Index`, `SpaceHUD`, `PlanetSurface`, `BaseCampInterior`, `HabitatDesktop`, `TravelSequence`, and `useGameState`. These are already assigned to the later serial accessibility integration packet, so the findings can be fixed without widening parallel ownership.

## What is already working

- `SpaceHUD` renders every destination as a native button. Its desktop buttons mirror hover behavior on focus (`src/components/SpaceHUD.tsx:72-134`), providing a keyboard path that does not depend on the WebGL canvas.
- The base-camp exterior, monitor, stool, desktop shortcuts, and window controls are native buttons with generally descriptive names (`src/components/planet/BaseCamp.tsx:12-87`, `src/components/planet/BaseCampInterior.tsx:102-174`, `src/components/planet/HabitatDesktop.tsx:183-203`, `src/components/planet/HabitatDesktop.tsx:328-360`).
- Escape closes the Start panel, then the top visible HAB/OS window, then stands up from the computer (`src/components/planet/HabitatDesktop.tsx:557-579`). Escape also exits the HAB when the computer is inactive (`src/components/planet/BaseCampInterior.tsx:51-58`).
- Terminal output uses a polite live region, and its input has both a label and an accessible name (`src/components/planet/HabitatDesktop.tsx:758-779`).
- Some high-motion effects account for reduced-motion preferences: travel streaks, the close-approach planet, ship flight, planetary landing, dust, landing beacons, engine glow, and scanlines (`src/components/TravelSequence.tsx:13-70`, `src/components/ShipFlightLayer.tsx:20-55`, `src/components/planet/PlanetLandingShip.tsx:68-114`, `src/index.css:253-305`, `src/index.css:422-425`).

## Keyboard journey map

| State | Current keyboard route | Result and defects |
| --- | --- | --- |
| Space, desktop | Tab enters the right-side destination list, then moves through Intro and the planets; Enter or Space starts travel. | A usable route exists. The canvas planets themselves are pointer-only and the canvas has no name or fallback (`src/components/3d/SolarSystem.tsx:33-70`, `src/components/3d/PlanetMesh.tsx:111-170`, `src/components/3d/Sun.tsx:33-88`). No `main` or navigation landmark identifies the overall experience or destination list (`src/pages/Index.tsx:12-34`, `src/components/SpaceHUD.tsx:55-243`). |
| Space, mobile | Tab reaches **Select Destination**; activation inserts the two-column list; subsequent Tab presses can reach its buttons. | The disclosure button does not expose `aria-expanded` or `aria-controls`, so its state and relationship are not conveyed (`src/components/SpaceHUD.tsx:136-198`). Focus is not moved into the opened list or restored when it closes. |
| Intercept and travel | Activating a destination replaces the originating HUD with an intercept status and later the travel view. There are no interactive elements during either state. | The focused destination is removed without a focus target. The intercept region has `aria-live="polite"`, but insertion of a pre-populated live region is not a dependable announcement across screen readers; the following travel screen has no status role/live region (`src/components/SpaceHUD.tsx:14-50`, `src/components/TravelSequence.tsx:20-141`). There is no skip control. |
| Planet surface | In DOM order, Tab reaches **Enter base camp**, previous planet, **Return to Space**, then next planet. | Previous and next are icon-only buttons with no accessible names (`src/components/PlanetSurface.tsx:75-111`). Entering the HAB leaves focus on the still-mounted base-camp button behind the overlay. Navigating to another planet or returning to space removes the focused control without moving focus or announcing the new state. |
| HAB interior | The monitor and stool both activate the computer; two different controls exit the HAB on larger screens. | The planet surface remains mounted and interactive underneath the overlay. Keyboard users can encounter obscured Base Camp and navigation controls before HAB controls (`src/components/PlanetSurface.tsx:41-138`). The monitor and stool duplicate one action, while the airlock and footer duplicate another (`src/components/planet/BaseCampInterior.tsx:102-174`, `src/components/planet/BaseCampInterior.tsx:266-325`). No initial focus is assigned to the HAB. |
| Seated at computer | The activated seat/monitor gives way visually to HAB/OS. Desktop shortcuts and taskbar controls are native buttons once reached. | The stool remains focusable despite `opacity: 0` and `pointer-events: none`; the airlock and footer Exit button are also only visually hidden during the zoom. Focus therefore begins on, or advances through, invisible controls (`src/components/planet/BaseCampInterior.tsx:147-174`, `src/components/planet/BaseCampInterior.tsx:266-325`). The 2.3-second zoom does not focus the desktop or announce seating. |
| HAB/OS desktop | Tab moves through shortcut groups and then any rendered window controls, Start/taskbar controls, and Start-menu controls. Escape implements a useful layered close behavior. | Opening most apps leaves focus on their shortcut. The new window is rendered after all shortcut groups, so the user can tab through many unrelated controls before reaching it (`src/components/planet/HabitatDesktop.tsx:441-481`, `src/components/planet/HabitatDesktop.tsx:880-940`). The only exception is Terminal, whose input receives delayed focus. |
| Start panel | The Start trigger exposes `aria-expanded`; Escape closes the panel. | Opening the panel does not move focus into it. Because the panel precedes its trigger in DOM order, the next Tab normally skips past the just-opened choices. The panel has an accessible label but no dialog/menu semantics, no `aria-controls`, no focus containment, and no focus restoration (`src/components/planet/HabitatDesktop.tsx:942-1002`). The **Search HAB OS** button merely opens the panel; there is no search field to receive focus. |
| Mission Archive | The Archive shortcut opens a labeled dialog. Within it, Tab reaches window controls, sidebar buttons, then file buttons; activating a file opens another labeled dialog. | Focus stays behind each newly opened dialog. Multiple dialogs and all desktop shortcuts remain interactive concurrently. Close and minimize remove the focused subtree without restoring focus to the opener or taskbar. The **Mission drive** sidebar item looks actionable but has no behavior (`src/components/planet/HabitatDesktop.tsx:285-364`, `src/components/planet/HabitatDesktop.tsx:483-498`, `src/components/planet/HabitatDesktop.tsx:720-755`). |

## Focus-management defects

### Critical

1. **Every major state change lacks a focus contract.** Space-to-travel, arrival, return to space, entering/exiting the HAB, sitting/standing, opening most apps, opening archive files, minimizing, and closing do not intentionally place or restore focus. A removed focused element commonly leaves focus on `body`; an overlay that does not remove its trigger can leave focus visually obscured. Relevant code: `src/pages/Index.tsx:12-34`, `src/hooks/useGameState.ts:42-90`, `src/components/PlanetSurface.tsx:22-39`, `src/components/planet/HabitatDesktop.tsx:433-498`.
2. **Background content is never made inert.** `BaseCampInterior` overlays the complete surface without hiding or disabling it, and HAB/OS windows overlay the desktop without a defined modal/non-modal focus model. Keyboard and assistive-technology users can operate controls that are visually covered. Relevant code: `src/components/PlanetSurface.tsx:41-138`, `src/components/planet/BaseCampInterior.tsx:64-327`, `src/components/planet/HabitatDesktop.tsx:285-364`.
3. **Opacity is used as visibility while controls stay tabbable.** During the computer zoom, the stool, airlock, and footer Exit control remain in the accessibility tree and tab order even when opacity is zero. `pointer-events-none` affects the pointer, not keyboard focus. Relevant code: `src/components/planet/BaseCampInterior.tsx:147-174`, `src/components/planet/BaseCampInterior.tsx:266-325`.

### High

4. **Windows do not take focus.** `openWindow` focuses only the terminal input. All other dialogs open with focus left on the underlying shortcut or archive item (`src/components/planet/HabitatDesktop.tsx:441-465`).
5. **Close/minimize does not restore focus.** `closeWindow` and `minimizeWindow` update state only (`src/components/planet/HabitatDesktop.tsx:483-491`). Focus should return to the opener or the matching taskbar button, and the next active window should receive a sensible focus target.
6. **Start panel focus order does not follow its visual opening.** The menu is mounted before the trigger, but focus remains on the trigger (`src/components/planet/HabitatDesktop.tsx:942-1002`).
7. **No visible-focus treatment is guaranteed on several core controls.** The destination buttons and planet navigation buttons rely on browser defaults while using translucent, animated surfaces; other buttons explicitly remove outlines and replace them. Verify keyboard focus at all planet colors and against motion (`src/components/SpaceHUD.tsx:85-131`, `src/components/PlanetSurface.tsx:75-111`).

### Medium

8. **Pointer-only window dragging has no keyboard equivalent.** Maximize/restore mitigates the most important need, but a keyboard user cannot reposition a window that obscures another (`src/components/planet/HabitatDesktop.tsx:251-323`).
9. **The dormant `SignModal` is not a modal dialog.** It has no dialog role/name, focus trap, initial focus, Escape handling, or restoration; its icon-only close button has no accessible name (`src/components/planet/SignModal.tsx:45-104`). This is not in the current primary route but should be fixed before reuse.

These issues principally affect WCAG 2.1.1 Keyboard, 2.4.3 Focus Order, 2.4.7 Focus Visible, and 2.4.11 Focus Not Obscured (Minimum).

## Names, roles, structure, and announcements

### Missing or misleading names and roles

- Add explicit names such as **Previous planet** and **Next planet** to the chevron buttons in `src/components/PlanetSurface.tsx:75-111`; their current accessible names are empty.
- Give the overall page a `main` landmark and give the destination selector a navigation label. The current top level is an unlabeled `div`, and the HUD grouping is also generic (`src/pages/Index.tsx:12-34`, `src/components/SpaceHUD.tsx:55-243`).
- The WebGL canvas is not an accessible interactive surface. Either label it as an illustrative solar-system view and explicitly reference the equivalent destination navigation, or provide meaningful fallback content (`src/components/3d/SolarSystem.tsx:33-70`).
- Connect disclosure triggers to their panels with stable IDs and `aria-controls`, and expose expanded state on the mobile destination trigger (`src/components/SpaceHUD.tsx:136-198`, `src/components/planet/HabitatDesktop.tsx:942-1002`).
- The active taskbar button says **Focus _title_**, although activating it minimizes the active window. Its name must match its action, for example **Minimize _title_** (`src/components/planet/HabitatDesktop.tsx:1003-1019`).
- A HAB/OS window is labeled as a dialog, but windows are non-modal and may coexist. Define the intended model: either treat the active window as a modal dialog and make the rest inert, or expose non-modal windows as labeled regions with clear activation state. Do not leave several simultaneous `dialog` roles with unrestricted background focus (`src/components/planet/HabitatDesktop.tsx:285-364`, `src/components/planet/HabitatDesktop.tsx:924-940`).
- Multiple novelty apps can create unlabelled `main` landmarks inside simultaneous dialogs (`src/components/planet/HabitatFunApps.tsx:98-144`, `src/components/planet/HabitatFunApps.tsx:150-155`). Prefer one page-level `main`; use labeled sections/regions inside app windows.
- The `svg > foreignObject` desktop embedding should be tested in NVDA/Firefox, NVDA/Chrome, JAWS/Chrome, and VoiceOver/Safari. HTML focus and accessibility-tree exposure inside `foreignObject` have enough cross-browser complexity that a plain-HTML seated mode or Quick Portfolio fallback should remain available (`src/components/planet/BaseCampInterior.tsx:118-133`).

### Status messages that are missing or unreliable

- Provide one persistent, pre-mounted live region at the page level. Announce: destination selected, intercept started, close approach, arrival, return complete, HAB entered/exited, computer seated/standing, app/window opened/closed/minimized/restored, and archive file opened.
- The intercept's live region is created at the same time as its content. Some screen-reader/browser combinations do not announce an already-populated live region on insertion; update a persistent status node instead (`src/components/SpaceHUD.tsx:14-50`).
- `TravelSequence` has visible status copy but no `role="status"` or live region (`src/components/TravelSequence.tsx:96-140`). Arrival itself is silent.
- The boot screen has an accessible label but no status role, while the fixed live-region text at the end of `HabitatDesktop` may announce immediately rather than when boot completes (`src/components/planet/HabitatDesktop.tsx:1029-1064`).
- Terminal output is announced, but mail selection, Start-menu state, selected media, playback, likes, snack counts, rover changes, solitaire state, recycle changes, and chat replies are generally visual-only (`src/components/planet/HabitatFunApps.tsx`). Use restrained status announcements for state changes that are not otherwise represented by focus.

These findings principally affect WCAG 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value, and 4.1.3 Status Messages.

## Reduced-motion and timing assessment

### Timed journey

- Selecting a planet from space waits 3,200 ms in intercept plus 2,400 ms in close approach: **5,600 ms total** before the surface is available (`src/hooks/useGameState.ts:27-28`, `src/hooks/useGameState.ts:42-73`).
- Switching directly between planets waits **2,400 ms** (`src/hooks/useGameState.ts:55-73`).
- Returning to space waits **1,500 ms** (`src/hooks/useGameState.ts:76-90`).
- Sitting at the computer uses a **2,300 ms** camera zoom, followed by delayed desktop/stand-up presentation (`src/components/planet/BaseCampInterior.tsx:77-86`, `src/components/planet/BaseCampInterior.tsx:286-303`).
- HAB/OS boot can hold the desktop behind an overlay for **1,650 ms** (`src/components/planet/HabitatDesktop.tsx:69`, `src/components/planet/HabitatDesktop.tsx:423-431`, `src/components/planet/HabitatDesktop.tsx:1029-1058`).

### Current preference handling

`TravelSequence`, `ShipFlightLayer`, and `PlanetLandingShip` query the user's reduced-motion preference, but the state-machine delays above do not. Reduced-motion users therefore receive shorter individual visual effects while still waiting the full 5.6 seconds for first arrival. Travel still moves 28 streaks once over 1.2 seconds, moves/scales the destination for 0.8 seconds, and moves/fades the ship for 0.8 seconds (`src/components/TravelSequence.tsx:32-70`, `src/components/ShipFlightLayer.tsx:27-55`).

Several perpetual or large-scale Framer Motion effects ignore the preference entirely:

- Space scan line and intercept status pulse (`src/components/SpaceHUD.tsx:42-48`, `src/components/SpaceHUD.tsx:229-241`).
- Base-camp prompt bounce (`src/components/planet/BaseCamp.tsx:62-73`).
- Room particles, 7.9x computer zoom, stool prompt pulse, and numerous overlay transitions (`src/components/planet/BaseCampInterior.tsx:77-86`, `src/components/planet/BaseCampInterior.tsx:193-207`, `src/components/planet/BaseCampInterior.tsx:266-310`).
- HAB/OS boot-logo pulse and progress sweep (`src/components/planet/HabitatDesktop.tsx:1029-1057`).
- `InteractiveSign` pulses if it is reintroduced (`src/components/planet/InteractiveSign.tsx:199-243`).

Recommended behavior is to make state transitions nearly immediate under reduced motion (roughly 0-200 ms), replace spatial fly/zoom/scale sequences with a short opacity change, and expose a keyboard-focusable **Skip travel** action for everyone. Pause or remove decorative animation that runs longer than five seconds unless it is essential. This addresses WCAG 2.2.2 Pause, Stop, Hide and improves the interaction-triggered motion covered by 2.3.3 Animation from Interactions.

## Browser zoom, reflow, and mobile overflow risks

### Critical

- Page zoom and pinch zoom are explicitly disabled by `maximum-scale=1.0, user-scalable=no` (`index.html:5`). Remove both restrictions.
- `html`, `body`, and the page root all suppress overflow, while `body` also applies `touch-action: none` (`src/index.css:83-93`, `src/pages/Index.tsx:12-34`). At text zoom, 200% browser zoom, landscape mobile, or with the on-screen keyboard open, clipped content cannot fall back to page scrolling. `touch-action: none` also suppresses native gestures, including pinch behavior in browsers that honor it.

### High-risk layouts to verify at 320 CSS px width and 200%/400% zoom

- Planet HUD telemetry is fixed at both top corners while navigation is fixed at the bottom. Enlarged text can collide with the base-camp heading and action, then be clipped by the full-screen overflow container (`src/components/PlanetSurface.tsx:41-124`).
- The HAB room is a cover-sized stage based on `max(100vw, 177.87vh)` and is intentionally cropped (`src/index.css:308-326`). Interactive controls positioned as percentages can move outside the visible area at narrow or unusually tall ratios; the footer exit is the only dependable mobile escape.
- During seated mode, a fixed `1600 x 900` HTML desktop is embedded in an SVG and scaled through the room transform (`src/components/planet/BaseCampInterior.tsx:77-145`). Browser text zoom and media-query behavior inside this construct need real-device verification; clipping rather than reflow is likely.
- Desktop shortcut groups use horizontal scrolling but explicitly hide vertical overflow (`src/components/planet/HabitatDesktop.tsx:880-922`). At large text sizes, section content can grow beyond the available desktop height and be clipped.
- HAB/OS windows use an absolute height and a minimum height, with narrow-screen content such as Orbit Mail retaining a two-column minimum (`src/components/planet/HabitatDesktop.tsx:242-249`, `src/components/planet/HabitatDesktop.tsx:656-698`). Horizontal or nested scrolling is likely on small/mobile viewports.
- The Start panel has a fixed maximum height and the page cannot scroll. Test short landscape screens to ensure its footer and all app choices remain reachable (`src/components/planet/HabitatDesktop.tsx:942-981`).

These risks primarily affect WCAG 1.4.4 Resize Text and 1.4.10 Reflow. Runtime checks should cover 320 CSS px width, 200% text size, 400% browser zoom at 1280 CSS px, iOS Safari landscape, Android Chrome landscape, and an open virtual keyboard.

## Touch targets and contrast risks

- The planet navigation controls are approximately 44 px and the HAB exit/stand-up actions use a 48 px minimum height. Window control widths are 40-44 px; these are good starting points.
- Desktop and mobile destination rows use `py-2` and can be roughly 32 px tall. They likely meet WCAG 2.5.8's 24 CSS px minimum but fall below the 44 px comfort target; measure them at the smallest breakpoint (`src/components/SpaceHUD.tsx:85-131`, `src/components/SpaceHUD.tsx:167-192`).
- Spotifly's previous/next buttons wrap bare 16 px icons with no padding and are the clearest probable target-size failure (`src/components/planet/HabitatFunApps.tsx:120-122`).
- Several compact controls sit at or near the 24 px minimum, including 24 px Paint palette buttons, some restore/count actions, and small icon-only app controls. Preserve spacing so the exception for adjacent targets is not required (`src/components/planet/HabitatFunApps.tsx:164-210`).
- Numerous labels use white at 20-40% opacity or 9-10 px text against translucent/image backgrounds. Examples include telemetry, taskbar status, Start headings, desktop icon details, and novelty-app metadata (`src/components/planet/BaseCampInterior.tsx:215-264`, `src/components/planet/HabitatDesktop.tsx:880-1026`, `src/components/planet/HabitatFunApps.tsx`). These require computed-color contrast measurement. Do not assume that bright foreground tokens make translucent text pass WCAG 1.4.3.
- Focus rings must be checked against every planetary accent and image-backed surface, including the base camp and desktop wallpaper. A consistent opaque two-color focus indicator will be more robust than low-opacity borders.

## Specialized interaction risks

- Paint exposes a named canvas but drawing is pointer-only, with no keyboard alternative, instructions, or equivalent editable representation (`src/components/planet/HabitatFunApps.tsx:179-188`).
- Mars Solitaire uses columns whose accessible names are concatenated card text and a stock button whose visible/accessibility text is only a number. It does not expose card state, valid moves, instructions by relationship, or game results as status (`src/components/planet/HabitatFunApps.tsx:192-205`).
- Toggle-like controls such as playback, selected media, liked posts, and selected channels generally do not expose `aria-pressed`, `aria-current`, or equivalent state (`src/components/planet/HabitatFunApps.tsx:80-161`).
- Continuous timers in media, rover, and chat update visual state without a complete pause/status strategy (`src/components/planet/HabitatFunApps.tsx:80-88`, `src/components/planet/HabitatFunApps.tsx:170-176`, `src/components/planet/HabitatFunApps.tsx:220-224`).

## Prioritized remediation plan

### P0 — unblock the primary journey

1. **Create one view-transition focus manager and live region.** In `src/pages/Index.tsx` and `src/hooks/useGameState.ts`, define where focus lands for `space`, `intercepting`, `traveling`, and `planet`; announce each state change; restore focus to the selected destination after returning.
2. **Make overlays exclusive to keyboard and assistive technology.** In `src/components/PlanetSurface.tsx` and `src/components/planet/BaseCampInterior.tsx`, apply `inert` plus `aria-hidden` to covered layers, or conditionally unmount them. Never leave opacity-zero actions tabbable.
3. **Name all primary controls.** Add previous/next destination names in `src/components/PlanetSurface.tsx`; expose expanded/controlled state on the mobile destination menu in `src/components/SpaceHUD.tsx`.
4. **Provide skip/short travel behavior.** In `src/components/TravelSequence.tsx` and `src/hooks/useGameState.ts`, offer **Skip travel** and reduce all transition timers under `prefers-reduced-motion` instead of only shortening visual animation.
5. **Restore user zoom and a reflow escape path.** Remove zoom restrictions from `index.html`; revise global overflow/touch rules in `src/index.css`; permit vertical scrolling when content no longer fits.

### P1 — make HAB/OS predictable

6. **Implement window focus ownership.** In `src/components/planet/HabitatDesktop.tsx`, record each opener, focus a window heading or first useful control on open, contain focus if the window is modal, and restore focus on close/minimize. Decide and encode a coherent modal or non-modal role model.
7. **Treat Start as an accessible disclosure/dialog.** Connect trigger and panel, move focus on open, provide logical arrow/Tab behavior, return focus on close, and rename/remove the fake Search control.
8. **Correct taskbar state and names.** Announce active/minimized state, use **Minimize** when the active task button will minimize, and use `aria-current`/`aria-pressed` only where its defined semantics match.
9. **Apply a shared focus indicator and minimum target rule.** Cover Space HUD, planet navigation, all HAB buttons, title-bar controls, and novelty apps. Target 44 x 44 CSS px where practical and never fall below WCAG 2.2's 24 x 24 minimum without a valid spacing/inline exception.
10. **Announce important in-window changes.** Prioritize archive file open, mail selection, terminal responses, chat replies, and game outcomes. Avoid announcing decorative timers and continuously changing clocks.

### P2 — harden reflow and secondary experiences

11. **Test and, if necessary, replace the SVG `foreignObject` desktop.** Provide a plain-HTML/Quick Portfolio route that remains keyboard and screen-reader usable when WebGL, SVG focus, motion, or viewport scaling fails.
12. **Refactor narrow layouts.** Let the desktop icon area wrap or scroll vertically, collapse Orbit Mail to one pane, and make all windows fit within the visual viewport at large zoom.
13. **Fix specialized apps.** Add keyboard drawing alternatives for Paint, semantic card controls and status for Solitaire, exposed toggle state for media/social controls, and pause controls for ongoing updates.
14. **Measure color contrast and target size in rendered states.** Test default, focus, hover, selected, disabled, all planet accent colors, dimmed overlays, and image/translucent backgrounds.
15. **Add automated regression coverage.** Use existing Testing Library support first: assert names/roles, disclosure state, focus movement/restoration, Escape order, inert background behavior, reduced-motion timing, and a complete keyboard journey. Add browser smoke tests for zoom/reflow and focus visibility at the final reliability gate.

## Recommended manual verification matrix

After remediation, run the complete journey with keyboard only in current Chrome, Firefox, and Safari/Edge as available. Repeat with NVDA + Firefox, NVDA + Chrome, VoiceOver + Safari, and a mobile screen reader. For every transition, record the visible focus target and spoken announcement. Also verify Windows High Contrast/forced-colors mode, reduced motion, 200% text, 400% browser zoom, 320 CSS px width, landscape mobile, and coarse-pointer target sizes.

## Audit limitations

- No browser surface was available for this packet, so visual focus, computed contrast, actual target dimensions, reading order through SVG `foreignObject`, screen-reader speech, and real reflow remain to be measured.
- Existing tests confirm click behavior and some roles/names, but do not exercise Tab order, focus restoration, reduced motion, zoom/reflow, or assistive-technology output.
- Findings are a prioritized engineering baseline, not a formal WCAG conformance statement.
