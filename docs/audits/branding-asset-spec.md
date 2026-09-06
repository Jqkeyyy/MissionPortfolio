# Mission Portfolio Branding Asset Specification

## Delivery summary

The branding set combines the portfolio's existing orbiting `JS` identity, deep-space navigation palette, and white/graphite/amber HAB hardware. The Open Graph artwork is composed for a `1.904:1` social card, while the favicon reduces the same identity to an opaque, high-contrast orbital monogram that remains recognizable in light and dark browser chrome.

**Combined set budget:** 750,000 bytes.

**Delivered set:** 664,856 bytes (88.6% of budget; 85,144 bytes remaining).

## Asset inventory

| File | Dimensions | Format / color | Bytes | Intended destination |
| --- | ---: | --- | ---: | --- |
| `public/brand/og-mission-portfolio.webp` | 1200x630 | WebP, RGB, opaque | 81,576 | Optimized first-party social/share image and WebP-capable metadata alternate |
| `public/brand/og-mission-portfolio.png` | 1200x630 | PNG-8, indexed sRGB palette, opaque | 428,389 | Compatibility `og:image` and `twitter:image` fallback |
| `public/brand/favicon.svg` | 64x64 view box | SVG | 1,705 | Preferred `<link rel="icon" type="image/svg+xml">` source |
| `public/brand/favicon-16x16.png` | 16x16 | PNG, RGB, opaque | 826 | `<link rel="icon" sizes="16x16">` |
| `public/brand/favicon-32x32.png` | 32x32 | PNG, RGB, opaque | 2,385 | `<link rel="icon" sizes="32x32">` |
| `public/brand/favicon-48x48.png` | 48x48 | PNG, RGB, opaque | 4,392 | Windows/browser pinned and legacy raster icon |
| `public/brand/favicon.ico` | 16x16, 32x32, 48x48 frames | ICO, RGB, opaque | 7,587 | Legacy `/favicon.ico` metadata destination |
| `public/brand/apple-touch-icon-180x180.png` | 180x180 | PNG, RGB, opaque | 27,388 | `<link rel="apple-touch-icon" sizes="180x180">` |
| `public/brand/icon-192x192.png` | 192x192 | PNG, RGB, opaque | 29,481 | Web-app manifest `192x192` icon |
| `public/brand/icon-512x512.png` | 512x512 | PNG, RGB, opaque | 81,127 | Web-app manifest `512x512` icon |

The raster files total 663,151 bytes. None contains an alpha channel or embedded ICC profile, avoiding unintended browser compositing and profile shifts. The SVG intentionally leaves the area outside its circular field transparent.

## Palette

| Role | Color |
| --- | --- |
| Space field | `#02070B` |
| Deep panel blue | `#081321` |
| Navigation cyan | `#55DFFF` |
| Orbit violet | `#A78BFA` |
| HAB amber | `#F59E0B` |
| Warm white | `#F4F1E8` |

## Visual QA

- Inspected the final PNG at 1200x630: the exact title, name, and discipline line are legible; the solar-system sweep and HAB remain distinct; no important element enters the crop-risk margin.
- Inspected a transient 300x158 downsample: `MISSION PORTFOLIO` remains the dominant readable message, the `JS` mark and HAB silhouette remain identifiable, and the name/subtitle preserve usable contrast.
- Inspected the 512x512 and 32x32 favicon rasters: the `JS` monogram, light outer ring, and cyan/violet/amber orbital line remain distinguishable at both sizes.
- Decoded every PNG, WebP, and ICO with Pillow 12.0.0 and confirmed the dimensions, formats, opaque color modes, and absence of embedded ICC profiles listed above.

## Generation and production notes

The Open Graph source artwork was generated with the built-in ImageGen tool, using the repository's existing `JS LOGO.png`, `public/base-camp-exterior.png`, and `public/base-camp-interior-v6-stool.png` as identity, materials, and lighting references. The generated 1731x909 RGB source was center-fit with Lanczos resampling to the exact 1200x630 delivery size. The WebP uses quality 86; the PNG fallback uses an optimized 256-color palette. The favicon source and coordinated raster reductions were produced deterministically from simple vector-style geometry.

Final ImageGen prompt:

```text
Use case: ads-marketing
Asset type: 1200x630 Open Graph social preview for a software-engineering portfolio
Primary request: Create a polished cinematic social card for Jake Sass's Mission Portfolio, combining an interactive solar-system view with the clean industrial HAB visual language shown in the references.
Input images: Image 1 is the existing JS orbit logo and identity reference; Image 2 is the existing HAB exterior and materials reference; Image 3 is the existing HAB interior and lighting reference.
Scene/backdrop: deep navy-black space with a restrained star field, a warm sun glow, several recognizable planets following thin orbital paths, and a compact white/graphite/orange HAB station near the lower-right horizon.
Subject: the left half contains the title text exactly “MISSION PORTFOLIO” with “JAKE SASS” above it and the subtitle exactly “FULL-STACK • DATA/ML • INTERACTIVE”; include a compact JS orbit emblem inspired by Image 1 without copying its gray square background.
Style/medium: premium cinematic 3D key art integrated with crisp editorial graphic design, sophisticated and professional, not playful clip art.
Composition/framing: landscape 1.904:1, title in the left-center safe area, solar system sweeping diagonally toward the HAB on the right, ample 60px-equivalent edge safety, strong readability at a 300x158 preview.
Lighting/mood: cool cyan navigation glow balanced by warm amber equipment lights, exploratory and credible.
Color palette: space navy #02070B, cyan #55DFFF, amber #F59E0B, warm white #F4F1E8, muted violet #A78BFA.
Text (verbatim): “JAKE SASS” “MISSION PORTFOLIO” “FULL-STACK • DATA/ML • INTERACTIVE”
Constraints: preserve exact spelling and punctuation; keep typography large and uncluttered; no tiny UI labels; no transparent background.
Avoid: watermark, stock-photo look, extra text, fake company logos, astronauts, rockets crossing the title, text near crop edges.
```

## Integration notes

The Wave 4 branding integration packet should wire the files into `index.html` and any web-app manifest. The production canonical URL is still unknown, so this packet does not invent a canonical URL or touch metadata files outside its ownership boundary.
