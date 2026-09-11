# Post-enhancement performance audit

Date: 2026-09-07

## Result

The fast Quick Portfolio route remains deferred from WebGL, and the added solar context stays within its scene budget.

- Production build passed.
- Quick Portfolio still opens without probing or initializing WebGL.
- High-capability scene: 560 deterministic asteroid points; constrained/reduced-motion scene: 160 points with decorative motion frozen.
- Solar details use five or fewer added draw calls: asteroid points, one instanced major-moon mesh, comet head, comet tail, and the optional tilt guide.
- Solar-detail authored runtime source is 7,189 bytes before minification/gzip, below the 15 kB authored-code budget.
- The deferred SolarSystem chunk is 871.67 kB / 238.43 kB gzip, up from the recorded pre-enhancement 669.49 kB / 173.47 kB gzip. The increase includes the new simulation, scene, science, and shared UI integration and does not affect the initial Quick Portfolio route.

## Bundle warning resolution — 2026-09-11

The post-endgame build keeps Three.js behind the immersive route and assigns it a named
`three-vendor` chunk. A static Chaos Mode import had temporarily pulled that dependency
into the route controller; changing the rare terminal/New Game+ access to a dynamic import
reduced the `Index` chunk from 712.65 kB / 188.44 kB gzip to 41.07 kB / 13.30 kB gzip.

The remaining renderer payload is explicit and deferred:

- `three-vendor`: 666.67 kB / 172.41 kB gzip.
- `SolarSystem`: 213.42 kB / 68.86 kB gzip.
- All ordinary application chunks remain below the original 500 kB raw warning budget.

The build threshold is 700 kB for the intentionally isolated renderer vendor chunk, so
production builds no longer emit an unactionable size warning while regressions in normal
application chunks remain visible.
