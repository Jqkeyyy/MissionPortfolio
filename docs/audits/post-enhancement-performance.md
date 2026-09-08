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

## Known warning

Vite continues to warn that the deferred Three.js chunk exceeds 500 kB. This is accepted for the immersive opt-in route; a future optimization could split science/dialog code from the renderer or move more Three.js helpers into stable manual chunks.
