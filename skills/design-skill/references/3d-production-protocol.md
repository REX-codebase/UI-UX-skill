# 3D production protocol

3D is justified only when it explains form, creates spatial orientation, supports a meaningful interaction, or communicates a material quality that 2D cannot. It is never a default “premium” effect.

## Decision gate
Choose the least expensive technique that achieves the design intent:

| Need | Default technique |
|---|---|
| Decorative depth | CSS transforms, gradient, SVG |
| Product turntable | `<model-viewer>` with a poster |
| Diagrammatic movement | SVG or video sequence |
| Meaningful interactive spatial scene | Three.js / React Three Fiber |

## Required scene contract
Every scene has a `scene.json` beside its assets. Validate it with:

```bash
node skills/utils/visual-contract-checker.js --assets assets
```

It must identify licensing, poster and semantic fallback, reduced-motion/WebGL/low-power behavior, and explicit resource budgets. See `assets/3d/prism-stage/scene.json` for an original, poster-first example.

## Non-negotiable implementation behavior

- Paint a poster before loading scene code.
- Preserve semantic HTML for all essential content.
- Respect `prefers-reduced-motion`; no autonomously moving camera or object in that mode.
- Do not retry WebGL repeatedly after failure.
- Load offscreen scenes only near the viewport.
- Use glTF/GLB, Meshopt or Draco compression, KTX2/Basis textures, baked lighting, and LODs when an interactive model is warranted.
- Cap device pixel ratio and pause rendering when the scene is hidden.

## Release evidence
Capture desktop, tablet, mobile, reduced-motion, keyboard-focus, and WebGL-unavailable states. Review loading on a constrained connection. A static contract check is necessary but does not establish visual quality.
