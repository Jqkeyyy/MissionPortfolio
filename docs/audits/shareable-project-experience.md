# Shareable project experience audit

**Date:** 2026-09-08

## Implemented

- Added standalone `/portfolio`, six `/projects/:projectId`, ten `/explore/:planetId`, and protected `/mission-analytics` routes.
- Added build-time HTML prerendering, route metadata, structured data, custom-domain configuration, and generated sitemap entries.
- Added four reviewed WebP product captures and a typed architecture map for every project.
- Added URL/state synchronization, a lazy global command palette, manual graphics presets, and sustained-frame-rate adaptation.
- Added an optional allowlisted aggregate telemetry collector and token-protected summary dashboard.
- Added content validation, live-link checking, repeatable media capture, axe coverage, visual snapshots, Firefox/WebKit recruiter coverage, and Lighthouse CI budgets.

## Verification

- Static checks and 230 Vitest tests passed during implementation.
- Playwright: 20 passed across Chromium, Firefox, and WebKit; 10 intentionally skipped engine-specific duplicates.
- Axe: no WCAG A/AA violations in the route chooser, portfolio, project page, or command palette.
- Lighthouse CI passed the route chooser, standalone portfolio, and flagship project budgets. Latest local scores were 96 performance and 100 accessibility/best-practices/SEO for all three checked routes.
- `npm audit`: zero production or development vulnerabilities.

## Deployment input

The implementation uses the current Vercel alias as its safe fallback. Connecting a custom domain only requires setting `VITE_SITE_URL` and redeploying. Enabling aggregate telemetry additionally requires the Redis REST and dashboard-token environment variables documented in `.env.example`.
