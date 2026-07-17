# Asset corpus

This directory is intentionally small and licensed. It is the seed for a reference corpus that teaches **composition and implementation constraints**, not a collection of scraped visual style.

## Admission policy
Only add assets that are first-party, commissioned, public-domain, or explicitly permissively licensed. Every reference requires a `reference.json`; every 3D scene requires a `scene.json`. Store attribution and license information in the manifest before the asset is used.

Validate the corpus:

```bash
node skills/utils/visual-contract-checker.js --assets assets
```

The validator confirms local files and required metadata. It does not claim that a page is accessible, performant, or visually successful. Browser screenshots, accessibility tests, and human review are required for release.

## Structure

- `references/` — licensed responsive visual references annotated with hierarchy, visual traits, performance and accessibility intent.
- `3d/` — poster-first 3D scene contracts and original fallback assets.
