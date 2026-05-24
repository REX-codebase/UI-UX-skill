# Design Canvas Protocol

How the AI creates, uses, and destroys its internal design working documents. This is the designer's scratchpad — structured thinking before building.

---

## PURPOSE

The design canvas forces the AI to commit to design decisions in writing before writing code. This prevents:
- Inconsistent colors across components
- Mixed typography scales
- Random, uncoordinated animations
- Layout decisions made on the fly
- Self-contradicting design choices

Every professional designer sketches before they build. The canvas is that sketch.

---

## CANVAS STRUCTURE

### 1. `intent.md`

```markdown
# Design Intent

## What the User Wants
[One paragraph: the surface request translated into actual design intent]

## Extracted Intent
- **Goal**: [Convert / Showcase / Sell / Inform / Impress / Enable]
- **Success looks like**: [Specific measurable outcome]

## Identified Mood
- **Primary**: [Confident / Calm / Bold / Playful / Intimate / Serious / Energetic]
- **Secondary**: [Supporting mood quality]
- **Mood reasoning**: [Why this mood fits the request]

## Detected Audience
- **Who**: [Specific audience description]
- **Technical comfort**: [Low / Medium / High]
- **Design implications**: [How audience affects density, motion, complexity]

## Unstated Needs
- [Need 1 the user didn't mention but requires]
- [Need 2 the user didn't mention but requires]
- [Need 3 the user didn't mention but requires]
```

### 2. `layout-plan.md`

```markdown
# Layout Plan

## Page Structure
```
[Header]
  └── Nav: [left logo, right links, CTA]

[Hero Section]
  └── Layout: [asymmetric split 2fr/1fr]
  └── Content: [headline left, visual right]
  └── CTA: [single primary, positioned below headline]

[Section 2: Features]
  └── Layout: [2-column zigzag]
  └── Pattern: [alternating text/visual blocks]

[Section 3: Social Proof]
  └── Layout: [horizontal scroll / grid]
  └── Content: [logos, testimonials, metrics]

[Section 4: CTA]
  └── Layout: [centered, full-width]
  └── Content: [final conversion push]

[Footer]
  └── Layout: [4-column grid]
  └── Content: [links, legal, social]
```

## Grid Strategy
- **Base unit**: 8px
- **Container max-width**: [value]
- **Column count**: [desktop / tablet / mobile]
- **Gutter**: [value]
- **Margin**: [value]

## Section Spacing
- Between major sections: [value, e.g., 120px / 8rem]
- Between subsections: [value, e.g., 64px / 4rem]
- Between elements: [value, e.g., 24px / 1.5rem]

## Breakpoint Strategy
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px
- [Any custom breakpoints and why]
```

### 3. `tokens.md`

```markdown
# Design Tokens

## Color Palette

### Base
- background: [value]
- surface: [value]
- surface-elevated: [value]

### Text
- text-primary: [value]
- text-secondary: [value]
- text-tertiary: [value]

### Accent
- accent: [value]
- accent-hover: [value]
- accent-active: [value]

### Semantic
- success: [value]
- warning: [value]
- error: [value]
- info: [value]

### Borders & Dividers
- border-subtle: [value]
- border-default: [value]
- border-strong: [value]

## Typography

### Font Families
- headings: [font]
- body: [font]
- mono: [font]

### Type Scale
| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| display | [value] | [value] | [value] | [value] |
| h1 | [value] | [value] | [value] | [value] |
| h2 | [value] | [value] | [value] | [value] |
| h3 | [value] | [value] | [value] | [value] |
| body-lg | [value] | [value] | [value] | [value] |
| body | [value] | [value] | [value] | [value] |
| body-sm | [value] | [value] | [value] | [value] |
| caption | [value] | [value] | [value] | [value] |

## Spacing Scale
- xs: [value]
- sm: [value]
- md: [value]
- lg: [value]
- xl: [value]
- 2xl: [value]
- 3xl: [value]

## Border Radii
- sm: [value]
- md: [value]
- lg: [value]
- full: [value]

## Shadows
- sm: [value]
- md: [value]
- lg: [value]

## Z-Index Layers
- base: 0
- elevated: 10
- dropdown: 100
- modal-backdrop: 200
- modal: 300
- toast: 400
```

### 4. `motion-plan.md`

```markdown
# Motion Plan

## Motion Personality
- **Chosen**: [Whisper / Breathe / Snap / Flow / Pulse]
- **Why**: [Reasoning based on mood, audience, purpose]

## Easing Curves
- Primary: [cubic-bezier values]
- Secondary: [cubic-bezier values]
- Emphasis: [cubic-bezier values]

## Duration Scale
- instant: [value, e.g., 100ms]
- fast: [value, e.g., 150ms]
- normal: [value, e.g., 300ms]
- slow: [value, e.g., 500ms]
- deliberate: [value, e.g., 800ms]

## Entry Choreography
| Section | Pattern | Stagger | Direction | Duration |
|---------|---------|---------|-----------|----------|
| Hero | [Converge] | [N/A] | [edges to center] | [value] |
| Features | [Cascade] | [80ms] | [top to bottom] | [value] |
| Social Proof | [Wave] | [sin(index × 0.5) × 200ms] | [left to right] | [value] |
| CTA | [Converge] | [N/A] | [bottom up] | [value] |

## Interaction Sequences
- **Buttons**: [press cycle values from SKILL.md]
- **Forms**: [submit cycle values from SKILL.md]
- **Modals**: [open/close cycle values from SKILL.md]
- **Custom**: [any project-specific interactions]

## Scroll Choreography
- **Pattern**: [Pin and Reveal / Progress-Linked / Velocity-Reactive]
- **Sections affected**: [which sections have scroll animations]
- **Behavior**: [detailed description]

## prefers-reduced-motion
- All animations reduced to opacity transitions only
- Duration capped at 200ms
- No transform-based motion
- No scroll-linked animations
```

### 5. `critique.md`

```markdown
# Design Critique

## Contrast Check
- [ ] All text meets WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Interactive elements meet 3:1 against adjacent colors
- [ ] Focus indicators visible on all surfaces

## Hierarchy Check
- [ ] Primary content is visually dominant
- [ ] Secondary content is clearly subordinate
- [ ] Tertiary content is discoverable but not competing
- [ ] No two elements fight for the same visual weight

## Spacing Rhythm Check
- [ ] All spacing uses the defined scale
- [ ] Section gaps are consistent
- [ ] Component padding is uniform
- [ ] No arbitrary pixel values

## Motion Coherence Check
- [ ] All animations use the chosen motion personality
- [ ] No animation uses an easing curve outside the palette
- [ ] Durations follow the defined scale
- [ ] No element moves without a choreographic reason

## Dopamine Budget Check
- [ ] Maximum 3 reward moments on primary screen
- [ ] Rewards are spaced, not clustered
- [ ] Primary CTA is the most visually rewarding element
- [ ] No back-to-back dopamine hits

## Human Touch Check
- [ ] Layout has intentional asymmetry
- [ ] No perfectly centered everything
- [ ] Content uses organic, specific values (not round numbers)
- [ ] No Lorem Ipsum, no "John Doe", no "Acme Corp"
- [ ] At least one unexpected but delightful interaction
- [ ] Copy has actual voice, not corporate speak

## Issues Found
[List any issues that need fixing before output]

## Fixes Applied
[List fixes made to resolve issues]

## Final Verge
[Pass / Needs Revision] — One sentence summary
```

---

## WORKFLOW

```
1. Receive user request
2. Run Prompt Interpretation Engine (Steps 1-5)
3. Write intent, layout-plan, tokens, and motion-plan internally
4. Build code referencing canvas decisions (if implementing directly)
5. Write critique.md — self-review all checks
6. Fix any issues found in critique
7. If handing off to implementation agent: generate handoff-report.md in the project root
8. Output final response to user
```

---

## HANDOFF REPORT STRUCTURE (FOR AGENT HANDSHAKE)

When completing a design phase that will be implemented by another agent, you MUST output a `handoff-report.md` file. The report MUST include these four mandatory pillars:

```markdown
# Unified Handoff Report

## 1. Brand Intent
- **Goal**: [Extracted intent]
- **Mood**: [Primary and secondary mood]
- **Audience**: [Target audience and technical comfort]

## 2. Visual Tokens
- **Color Palette**: [Background, surface, primary, accent, semantic]
- **Typography**: [Fonts from CSV, type scale]
- **Spacing & Radii**: [Spacing scale, border radii]

## 3. Motion Personality
- **Chosen Personality**: [Whisper / Breathe / Snap / Flow / Pulse]
- **Easing Curves**: [Primary, secondary, emphasis]
- **Duration Scale**: [Fast, normal, slow]

## 4. Choreography
- **Entry Patterns**: [Stagger, direction, duration per section]
- **Interaction Sequences**: [Hover, press, submit cycles]
- **Dopamine Mapping**: [Strategic reward moments]
```

---

## CANVAS FILE SIZING

The canvas files should be detailed enough to be useful but not bloated:

- `intent.md`: 15-25 lines
- `layout-plan.md`: 30-50 lines
- `tokens.md`: 40-60 lines
- `motion-plan.md`: 30-50 lines
- `critique.md`: 25-40 lines

Total canvas: ~140-225 lines of structured thinking.

---

## WHEN TO SKIP THE CANVAS

Only skip for trivial, isolated changes:
- Fixing a single color value
- Adjusting one margin or padding
- Renaming a class or variable
- Adding a single line of text

Use the canvas for ANY task involving:
- New page or screen
- New component with visual design
- Layout changes
- Animation/interaction additions
- Design system establishment
- Multi-component work

---

## SELF-DISCIPLINE RULES

- Never reference `.design-canvas/` in user-facing output
- Never ask the user to review canvas files
- Never leave canvas files behind after task completion
- If the user asks about design decisions, answer from the reasoning — don't point to files
- The canvas is a thinking tool, not a deliverable
- If you catch yourself coding without the canvas, stop and create it
- The quality of canvas content directly determines the quality of output
