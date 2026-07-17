# Visual validation protocol

A source-level style audit cannot determine whether a design is visually successful. Use the following evidence chain for every non-trivial interface.

## 1. Define the design brief
Record the primary task, audience, content density, brand traits, device/network constraints, accessibility requirements, and named visual references. State what must *not* be copied.

## 2. Define the visual contract
When using a reference or 3D scene, add the relevant manifest under `assets/` and validate it:

```bash
node skills/utils/visual-contract-checker.js --assets assets
```

## 3. Capture rendering evidence
Capture the exact page at a minimum of 390px, 768px, 1024px, and 1440px widths. Also capture keyboard focus and `prefers-reduced-motion`. For 3D, capture a WebGL-unavailable state and a slow-network loading state.

## 4. Review by dimensions

| Dimension | Pass question |
|---|---|
| Task clarity | Is the primary action obvious before decorative details? |
| Hierarchy | Does the reading order remain clear at every breakpoint? |
| Responsiveness | Does composition adapt, instead of merely shrink? |
| Accessibility | Is each interaction keyboard-operable and understandable without color/motion/WebGL? |
| Motion | Is it interruptible, purposeful, and reduced when requested? |
| Performance | Do assets and runtime remain inside the declared budget? |
| Originality | Does it follow the brief rather than a generic effect recipe? |

## 5. Make the release decision
Static tools may identify source-level risks. They cannot certify taste, contrast in a rendered composition, interaction feel, or browser performance. Require screenshots, automated accessibility/performance checks, and human review before calling work release-ready.
