# Post-enhancement browser journey audit

Date: 2026-09-07

## Result

Pass in Playwright Chromium against the production build served locally.

Verified journeys:

1. Route chooser -> Quick Portfolio -> resume/project/contact content -> return.
2. Discovery files and SPA deep-link fallback.
3. Immersive launch -> Earth -> surface -> base camp -> HAB desktop.
4. Real Time -> 100x -> Super Fast -> pause, with dynamic scale disclosure.
5. Saturn science dialog opens without triggering travel.
6. 390 x 844 route chooser and Quick Portfolio have no horizontal overflow.

The unit/component suite additionally verifies arrival-gated tour timing, pause remainder, timer cleanup, local progress hydration/persistence, WebGL recovery, privacy opt-outs, telemetry schema rejection, error redaction, rate limiting, and audio-control accessibility.

## Network and privacy

The default build has no telemetry endpoint and the telemetry client is a no-op. Tests verify that configured transport omits credentials and referrer data, while Global Privacy Control and Do Not Track disable collection. `npm audit --omit=dev` reported zero vulnerabilities.

## Environment note

The interactive browser-control surface was unavailable during the final pass, so visual verification used the actual Playwright Chromium renderer rather than a separate GUI session.
