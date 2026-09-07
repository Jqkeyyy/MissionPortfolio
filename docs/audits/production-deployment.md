# Production Deployment Verification

**Verified:** 2026-09-07

**Public production URL:** https://mission-portfolio-amber.vercel.app/

**Production implementation commit:** `9d929d5` (`Harden Vercel production deployment`)

## Deployment status

- Vercel production deployment reached `Ready` and the public alias resolved to it.
- The deployment-specific and branch/team URLs remain protected by Vercel authentication;
  the public alias above is the correct temporary visitor URL.
- `main` and `origin/main` were synchronized through `9d929d5` before verification.

## Live browser verification

- Root document returned HTTP 200.
- Canonical, Open Graph URL, Open Graph image, and Twitter image use absolute production URLs.
- Quick Portfolio opened and the public resume link resolved.
- WebGL exploration launched without the unavailable-device fallback.
- All destination controls rendered, including the orbit and spin scale readouts.
- Earth travel reached the planet surface.
- `robots.txt`, `sitemap.xml`, the manifest, social image, and resume returned successfully.
- A direct unknown route returned the React not-found screen through the SPA rewrite.
- The 390 px mobile viewport had no horizontal overflow.
- No console errors or failed browser requests were observed.

## Response security

The live root response includes:

- HTTPS with HSTS.
- Content Security Policy.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- A restrictive Permissions Policy for camera, microphone, geolocation, payment, and USB.

## Lighthouse production result

| Category | Score |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Observed lab metrics were 1.4 s First Contentful Paint, 1.7 s Largest Contentful Paint,
0 ms Total Blocking Time, and approximately 0.0003 Cumulative Layout Shift.

## Social crawler verification

Twitterbot and Facebook's external crawler both received HTTP 200 with the Open Graph title,
absolute production URL, and absolute social image metadata. Third-party platforms may still
cache an older preview until their cache refreshes.

## Custom-domain follow-up

When a custom domain is available:

1. Add it to the Vercel project and choose the primary host.
2. Redirect alternate hosts to the primary host.
3. Replace the temporary Vercel URL in `index.html`, `public/robots.txt`,
   `public/sitemap.xml`, and `README.md`.
4. Re-run the live metadata, crawler, Lighthouse, and browser checks.
