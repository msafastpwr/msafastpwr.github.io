# Image Asset Standards & Optimization Rules

All image assets contributed to this repository must follow the performance and dimensional guidelines codified in the [Engineering Blueprint](https://github.com/msafastpwr/msafastpwr.github.io):

## 1. Directory Structure
```text
images/
├── shared/     # Logos, favicon, Open Graph banners (cached across all pages)
├── home/       # Home page hero graphics and banners
├── about/      # Chapter history, campus, and executive photos
├── events/     # Workshop posters, webinar cards, and promotional art
├── team/       # 400x400 headshots for the 56 chapter members
└── gallery/    # Event photography and workshop photo archive
```

## 2. Dimension & File Size Budgets
| Asset Type | Format | Dimensions | Max File Size | Loading Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Banners** | `.webp` | Max `1200px` width | &le; 180 KB | `loading="eager" fetchpriority="high"` |
| **Event Posters** | `.webp` | Max `800px` width | &le; 90 KB | `loading="lazy" decoding="async"` |
| **Member Headshots** | `.webp` | Exact `400 × 400px` (1:1) | &le; 35 KB | `loading="lazy" decoding="async"` |
| **Gallery Photos** | `.webp` | Max `1080px` width | &le; 120 KB | `loading="lazy" decoding="async"` |
| **Logos & Icons** | `.svg` / `.webp` | Vector or 64 &times; 64px | &le; 25 KB | Eager |

## 3. Formatting Enforcement
- **Strict WebP Rule**: Raw `.png` and `.jpg` submissions for content photos will fail automated CI checks. Convert all photos to `.webp` before committing.
- **CLS Prevention**: Always specify `width`, `height`, and `aspect-ratio` on all `<img>` elements.
