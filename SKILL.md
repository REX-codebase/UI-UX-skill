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

## SEARCH & MEDIA TOOLING SYSTEM

To optimize token consumption and prevent context window decay, loading agents MUST NOT parse the massive reference CSV files manually. You are equipped with direct CLI tools and an interactive visual browser:

### 1. The Design & Media Search Engine (CLI)
Query elements, fonts, and images programmatically. It runs with zero external dependencies:
- **Search Design Elements**: `node skills/utils/search.js --elements "<query>"` (optional filter: `--category "<Category>"`)
- **Search Underrated Fonts**: `node skills/utils/search.js --fonts "<query>"` (optional filters: `--classification "<Serif|Sans Serif|...>"`, `--mood "<Mood>"`)
- **Royalty-Free Image Search**: `node skills/utils/search.js --images "<query>"` (Returns direct Unsplash CDN URLs and photographer credits; automatically triggers resilient offline fallback modes).

### 2. Precise SVG Logo Generation Engine
Construct mathematically perfect vector logo files programmatically using raw JS:
- **Command**: `node skills/utils/svg-generator.js --type <bento|organic|brutalist|cinematic> --name "<brand>" --output "<file.svg>"`
- Focuses on gradient meshes, organic displacements, brutalist wireframes, and cinematic marks with complete responsive vector scaling.

### 3. The Bento Grid Visual Explorer (GUI)
Start the local HTTP web explorer to visually browse, search, and live-preview all assets:
- **Launch Server**: `node skills/explorer/server.js`
- **Access App**: Open `http://localhost:3000` (or `http://localhost:3001`) in your browser to interact with the responsive glassmorphic dashboard.

### 4. Multimodal Terminal Vision System
Zero-dependency headless page capture tool that allows non-multimodal and text-only AI agents to "see" what they build by rendering truecolor ANSI blocks and an ASCII luminance blueprint in stdout:
- **Command**: `node skills/utils/screenshot.js --url <target> --output <filepath> --view`
- **Options**:
  - `--url <target>`: A web address or absolute path to a local HTML file (e.g., `skills/explorer/index.html` or `http://localhost:3000`)
  - `--output <filepath>`: Destination file path for the captured PNG screenshot (e.g., `skills/explorer/screenshot-test.png`)
  - `--view`: Decodes and visualizes the captured screenshot live in the terminal
  - `--width <pixels>`: Headless browser viewport width (default: 1280)
  - `--height <pixels>`: Headless browser viewport height (default: 800)
- **Vision Loop**: Enables agents to visually evaluate contrast, colors, and layout structure in real time, and ensures all designs align with HSL/OKLCH palette standards without requiring multimodal APIs.

### 5. Cognitive Layout Simulator & Auditor
Zero-dependency programmatic layout auditor that analyzes structural DOM geometry, visual centroids, cognitive noise coefficients, Fitts's Law interactive targets, and APCA reading contrast levels:
- **Command**: `node skills/utils/design-simulator.js --file <filepath>`
- **Directives**: Audits every created/modified HTML layout file, outputs an ASCII layout weight canvas, and generates a structured design critique to enforce spatial balance and Gestalt spacing.

---

## CROSS-SKILL INTEGRATION

When a request spans multiple domains, activate skills in sequence and maintain state via handoff files:

### Complex Requests (Design + Engineering)
1. First load: `skills/design-skill/SKILL.md` for creative direction. Ensure it generates `handoff-report.md`.
2. Then load: `skills/web-dev-frontend-skill/SKILL.md` for engineering implementation. **Explicitly pass the design-state reference to the implementation agent** by instructing it to read `handoff-report.md` immediately upon activation.

### Full-Stack Requests (Frontend + Backend)
1. First load: `skills/web-dev-frontend-skill/SKILL.md` for UI requirements
2. Then load: `skills/web-dev-backend-skill/SKILL.md` for API implementation

### Immersive Full-Stack (Design + Frontend + Backend)
1. Design skill for creative vision (outputs `handoff-report.md`)
2. Frontend skill for UI implementation (reads `handoff-report.md`)
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
- [ ] Human-made design elements used (see `1000-human-made-design-elements.csv`) OR justified via the **Design Evolution Lab (Laboratory Mode)** protocol for novel project-specific patterns
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
│
├── skills/
│   ├── design-skill/
│   │   ├── SKILL.md
│   │   └── references/               # 18 design reference docs
│   │
│   ├── web-dev-frontend-skill/
│   │   ├── SKILL.md
│   │   └── references/               # 16 frontend reference docs
│   │
│   ├── web-dev-backend-skill/
│   │   ├── SKILL.md
│   │   └── references/               # 8 backend reference docs
│   │
│   ├── utils/                         # Zero-dependency tooling
│   │   ├── search.js                  # CLI search engine
│   │   ├── svg-generator.js           # Vector logo generator
│   │   ├── screenshot.js              # Headless capture + vision
│   │   ├── design-simulator.js        # Cognitive layout auditor
│   │   ├── image-analyzer.js          # PNG decoder + analyzer
│   │   └── self-evolver.js            # Reflexion loop engine
│   │
│   └── explorer/                      # Visual dashboard
│       ├── server.js                  # Zero-dep HTTP server
│       ├── index.html                 # Bento Grid UI
│       ├── explorer.css               # OKLCH glassmorphic styles
│       └── explorer.js                # Client-side logic
│
└── .github/                           # Gemini Code Assist CI
```

---

**Last Updated**: 2026-05-28
**Version**: 3.0.0
