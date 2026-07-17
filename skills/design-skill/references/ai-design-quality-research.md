# Evidence-led AI design quality handbook

## What AI must optimize

AI does not make a design good by accumulating effects. It must preserve a chain of evidence: **user task → information hierarchy → semantic structure → visual system → interaction feedback → rendered validation**. Screenshot-to-code research evaluates rendered output because code similarity and visual similarity diverge; even small implementation differences can create large rendering differences [Design2Code](https://arxiv.org/pdf/2403.03163). Recent evaluation work also treats visual fidelity, DOM structure, and behavioral completeness as distinct dimensions rather than one score [VISTA](https://arxiv.org/html/2605.26144v3).

## A microscopic design review order

1. **Purpose.** Write one task sentence and one primary action. If the action cannot be named, do not decorate the page.
2. **Content.** Use real labels, realistic content lengths, locale-aware dates/numbers, and error/empty/loading states.
3. **Hierarchy.** Identify the first, second, and third things a visitor should notice. Create contrast with size, position, density, and whitespace—not only saturated color.
4. **Geometry.** Define a spacing scale, text measure, grid, alignment lines, hit areas, and breakpoint recomposition rules.
5. **Typography.** Select families for legibility and brand voice. Set optical size when available, line-height per role, line length, weights, number/tabular behavior, and loading fallback metrics.
6. **Color and material.** Give each token a role: canvas, surface, ink, muted ink, accent, danger, success, focus. Test actual foreground/background pairs.
7. **Components.** Specify default, hover, focus-visible, active, disabled, loading, error, empty, dense, and touch states.
8. **Motion.** Every movement needs a trigger, purpose, duration, interruption behavior, and reduced-motion alternative. Do not animate merely because a property can animate.
9. **Accessibility.** Use semantic landmarks and real controls. WCAG 2.2 AA target-size minimum is 24×24 CSS pixels, subject to its defined exceptions; 44px remains a practical comfort target [WCAG guidance](https://www.audioeye.com/post/wcag-22/). Drag interactions need a non-drag alternative.
10. **Performance.** Design loading, not only the completed state. Reserve media space, defer noncritical work, cap font/JS/media budgets, and measure on representative devices.
11. **Rendered evidence.** Evaluate at target breakpoints, with keyboard focus, motion reduction, slow network, and failed enhanced features.

## Preventing AI sameness

- Do not ban a font, centered composition, grid, or color universally. Require a project-specific rationale instead.
- Separate **reference attributes** (layout rhythm, spacing, interaction pattern) from **protected expression** (logos, artwork, copy, photographs, proprietary UI). Learn the former; never copy the latter without permission.
- Make alternatives before implementing: one conservative, one expressive, one performance-first. Select against the brief.
- Penalize unexplained complexity, not a particular visual style.
- Require a “remove test”: if removing an effect does not reduce task clarity or brand expression, remove it.

## AI-to-design operating loop

```text
brief → design hypothesis → semantic implementation → screenshot
      → compare hierarchy/geometry/type/color → repair one mismatch class
      → accessibility + performance check → human acceptance
```

Do not ask a model to recreate an image “exactly” from pixels. A screenshot omits DOM, assets, fonts, state transitions, responsive rules, and behavior. Research benchmarks use image-level comparison precisely because generated code can differ while rendering similarly [Web2Code overview](https://arxiv.org/html/2511.08195v3). The correct product promise is **authorized screenshot-to-code reconstruction with iterative visual matching**.

## 3D decisions

Use 3D when it explains a product’s form, spatial relation, or material. Start with a poster and semantic equivalent. On interactive scenes, optimize geometry and textures (Meshopt/Draco, KTX2), cap draw calls, dispose GPU resources, and use LOD. Performance guidance commonly recommends KTX2, LOD, instancing, material sharing, and resource cleanup [Three.js performance guidance](https://www.utsubo.com/blog/threejs-best-practices-100-tips). See `3d-production-protocol.md` for required fallbacks.

## Review card

| Dimension | Evidence required |
|---|---|
| Task clarity | Primary action identified in a five-second review |
| Hierarchy | Screenshot at every breakpoint, marked reading order |
| Geometry | Tokens, alignment rules, and no overflow at 320px+ |
| Type | Actual font load/fallback, measure and contrast checked |
| Interaction | Keyboard, focus, error, loading, disabled states |
| Motion | Reduced-motion capture and pause/stop behavior |
| 3D | Poster, semantic fallback, WebGL-failure and low-power capture |
| Performance | Measured runtime/network report—not an estimate |
| License | Source/permission captured for every non-original asset |
```
