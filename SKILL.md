---
name: UI-UX-Skill-Orchestrator
description: Master orchestrator that routes AI to the appropriate skill based on user request. Automatically selects between UI-UX engineering, creative design choreography, or backend development skills. Use for any UI, design, frontend, or backend task.
---

# UI-UX SKILL ORCHESTRATOR

> **2026 STANDARDS**: This orchestrator routes requests to the appropriate skill based on intent detection. All referenced resources use relative paths from the skill system root.

---

## ORCHESTRATION RULES

This is the master skill that determines which specialized skill to activate. **Load only ONE skill at a time** based on the request type below.

### TOKEN OPTIMIZATION & LAZY LOADING (CRITICAL)

**DO NOT WASTE TOKENS.** You must NEVER load all reference files upfront. 
- Only load the **single specific `SKILL.md`** file corresponding to the routed skill.
- Only read reference files (e.g., `references/css-2026-features.md`) when the specific sub-task strictly requires deep context on that topic. 
- Rely on your general 2026 knowledge (WebGPU, GenUI, APCA, Bento 2.0, Spring Physics) first, and only pull references when you need explicit protocols or project-specific rules.
- If a task is simple, DO NOT route to a complex skill. Just solve it.

### SKILL SELECTION ALGORITHM

```
IF request contains: "cinematic", "immersive", "scroll animation", "motion design", 
                     "dopamine", "award-winning", "creative website", "choreography",
                     "premium feel", "animate", "transition", "WebGPU", "3D blending"
  THEN load: skills/design-skill/SKILL.md

ELIF request contains: "build API", "backend", "database", "authentication", 
                       "authorization", "server", "microservice", "deployment",
                       "CI/CD", "security", "performance optimization"
  THEN load: skills/web-dev-backend-skill/SKILL.md

ELIF request contains: "build UI", "design page", "create component", "make website",
                       "redesign interface", "implement layout", "build design system",
                       "add dark mode", "fix accessibility", "responsive layout",
                       "style frontend", "frontend", "React", "Vue", "CSS", "HTML",
                       "landing page", "dashboard", "form", "button", "navigation",
                       "typography", "color palette", "GenUI", "APCA", "Bento Grid 2.0"
  THEN load: skills/web-dev-frontend-skill/SKILL.md

ELSE
  Default to: DO NOT load any skill. Solve the task directly to save tokens unless the task explicitly requires heavy architectural design or choreography.
```

---

## SKILL QUICK REFERENCE

### Design Skill (design-skill)
**When**: Creative, cinematic, motion-focused requests

| Trigger Keywords | Examples |
|-----------------|----------|
| motion, animation, choreography | "add scroll animations", "animate the hero" |
| creative, artistic, award-winning | "make it stunning", "award-winning design" |
| dopamine, emotion, feel | "make it feel premium", "add delight" |
| scroll, reveal, transition | "parallax scrolling", "page transitions" |
| creative direction | "hero section with personality" |

**Loads**: `skills/design-skill/SKILL.md`

---

### Frontend Skill (web-dev-frontend-skill)
**When**: Engineering, production-grade UI requests

| Trigger Keywords | Examples |
|-----------------|----------|
| build, create, implement | "build a dashboard", "create a form" |
| responsive, accessibility | "make it responsive", "fix accessibility" |
| component, layout, design system | "button component", "layout system" |
| dark mode, theming | "add dark mode", "design tokens" |
| performance, optimization | "improve LCP", "optimize rendering" |

**Loads**: `skills/web-dev-frontend-skill/SKILL.md`

---

### Backend Skill (web-dev-backend-skill)
**When**: Server, API, database, infrastructure requests

| Trigger Keywords | Examples |
|-----------------|----------|
| API, endpoint, route | "create REST API", "add endpoints" |
| database, schema, query | "design database", "optimize queries" |
| authentication, authorization | "add OAuth", "implement RBAC" |
| deployment, CI/CD, DevOps | "set up deployment", "add CI/CD" |
| security, OWASP | "harden security", "add rate limiting" |

**Loads**: `skills/web-dev-backend-skill/SKILL.md`

---

## SHARED RESOURCES

All skills share these reference files:

### Human-Made Design Resources
- `1000-human-made-design-elements.csv` — 1000 handcrafted design elements across 50+ categories
- `1000-underrated-google-fonts.csv` — 1000 fonts AI rarely uses, with mood profiles

### Reference Directories
- `skills/design-skill/references/` — Design patterns, choreography, typography
- `skills/web-dev-frontend-skill/references/` — Engineering patterns, accessibility, performance
- `skills/web-dev-backend-skill/references/` — API design, security, database

---

## CROSS-SKILL INTEGRATION

When a request spans multiple domains, activate skills in sequence:

### Complex Requests (Design + Engineering)
1. First load: `skills/design-skill/SKILL.md` for creative direction
2. Then load: `skills/web-dev-frontend-skill/SKILL.md` for engineering implementation

### Full-Stack Requests (Frontend + Backend)
1. First load: `skills/web-dev-frontend-skill/SKILL.md` for UI requirements
2. Then load: `skills/web-dev-backend-skill/SKILL.md` for API implementation

### Immersive Full-Stack (Design + Frontend + Backend)
1. Design skill for creative vision
2. Frontend skill for UI implementation  
3. Backend skill for API support

---

## EXAMPLE ROUTING

| User Request | Skill to Load |
|--------------|---------------|
| "Build a stunning hero with scroll animations" | design-skill |
| "Create a responsive landing page" | web-dev-frontend-skill |
| "Add OAuth to our API" | web-dev-backend-skill |
| "Make an award-winning SaaS landing page" | design-skill → web-dev-frontend-skill |
| "Build a dashboard with dark mode" | web-dev-frontend-skill |
| "Design an API and frontend for a todo app" | web-dev-backend-skill → web-dev-frontend-skill |
| "Cinematic portfolio with smooth transitions" | design-skill |

---

## PERSONA TRANSITION

When switching skills, briefly acknowledge the transition:

```
[Design Mode] Creating a cinematic experience...
[Engineering Mode] Building production-grade implementation...
[Backend Mode] Architecting secure API...
```

---

## QUALITY STANDARDS (ALL SKILLS)

Regardless of which skill is active:

- [ ] WCAG 2.2 AA accessibility compliance
- [ ] Core Web Vitals targets met (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] AI slop patterns avoided (see `skills/design-skill/references/ai-slop-banned.csv`)
- [ ] Human-made design elements used (see `1000-human-made-design-elements.csv`)
- [ ] Synthetic IDs valid and traceable to at least three parent IDs (if Recombination Protocol is used)
- [ ] 2026 standards applied (CSS Scroll-Driven, Container Queries, OKLCH, Bento Grids)

---

## FILE STRUCTURE

```
UI-UX-Skill/
├── SKILL.md                          # This orchestrator
├── 1000-human-made-design-elements.csv
├── 1000-underrated-google-fonts.csv
├── LICENSE
├── README.md
└── skills/
    ├── design-skill/
    │   ├── SKILL.md
    │   └── references/
    │       ├── ai-slop-banned.csv
    │       ├── bento-grid-layouts.md
    │       ├── css-2026-features.md
    │       ├── design-canvas-protocol.md
    │       ├── motionsites-analysis.md
    │       ├── stunning-web-patterns.md
    │       ├── 3d-web-integration.md
    │       ├── ai-first-ui-patterns.md
    │       ├── ethical-privacy-ux.md
    │       ├── hero-video-cdn-resources.md
    │       ├── sustainable-ux.md
    │       └── wcag-3-reference.md
    ├── web-dev-frontend-skill/
    │   ├── SKILL.md
    │   ├── 1000-human-made-design-elements.csv
    │   └── references/
    │       ├── accessibility-checklist.md
    │       ├── bento-grid-layouts.md
    │       ├── color-systems.md
    │       ├── css-2026-features.md
    │       ├── design-tokens.md
    │       ├── industry-benchmarks.md
    │       ├── interaction-physics.md
    │       ├── performance-budgets.md
    │       ├── responsive-engineering.md
    │       ├── typography-scale.md
    │       ├── 3d-web-integration.md
    │       ├── ai-first-ui-patterns.md
    │       ├── ethical-privacy-ux.md
    │       ├── hero-video-cdn-resources.md
    │       ├── sustainable-ux.md
    │       └── wcag-3-reference.md
    └── web-dev-backend-skill/
        ├── SKILL.md
        └── references/
            ├── api-design.md
            ├── authentication-authorization.md
            ├── data-modeling.md
            ├── database-architecture.md
            ├── deployment-ops.md
            ├── performance-scaling.md
            ├── security-hardening.md
            └── testing-strategy.md
```

---

**Last Updated**: 2026-04-12
**Version**: 2.0.0
