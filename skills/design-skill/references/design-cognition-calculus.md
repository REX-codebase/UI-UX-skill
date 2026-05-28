# Design Cognition & Layout Calculus

This reference manual provides the cognitive foundation for AI agents operating in the Avant-Garde UI-UX ecosystem. Design is not arbitrary decoration — it is a mathematical and psychological system that interfaces directly with human visual cognition, spatial reasoning, and emotional motor-sensory triggers. 

As a senior designer, you do not just predict characters; you **calculate spatial visual weights, cognitive budgets, typographic rhythm, and physical momentum.**

---

## 1. Gestalt Layout Logic (Structural Grammar)

The human visual cortex automatically groups elements based on spatial relationships. You must architect HTML structures and CSS layout systems that map to these Gestalt groupings:

### Proximity (The Spacing Hierarchy)
- **Principle**: Elements positioned close to each other are perceived as a single functional group.
- **Calculus**: Component sub-spacing (e.g. text elements inside a card) must be strictly smaller than the spacing between major sections.
- **CSS Rule**: Apply an **8pt modular spacing grid**:
  - Small elements inside cards: `8px` (`0.5rem`) or `12px` (`0.75rem`).
  - Gaps between sub-elements: `16px` (`1rem`) or `24px` (`1.5rem`).
  - Outer margins of bento cells: `32px` (`2rem`).
  - Separation between major sections: `80px` (`5rem`) to `120px` (`7.5rem`).

### Similarity (The Styling Consistence)
- **Principle**: Elements sharing visual properties (color, weight, border-radius, font size) are perceived as having the same functional priority.
- **Calculus**: Do not mix border-radii or card elevations. If a bento card uses `border-radius: 16px` (`1rem`), all other structural cards in the grid must conform. 
- **CSS Rule**: Consolidate structural properties into uniform CSS variables (`--radius-card`, `--shadow-elevation`).

### Continuity (The Grid Gravity)
- **Principle**: The eye naturally follows lines and pathways.
- **Calculus**: Grid cells, input boxes, and text sections must align to explicit vertical and horizontal grid lines. Lopsided offsets of 1px to 5px create subconscious cognitive friction (a "broken layout" feeling).
- **CSS Rule**: Enforce CSS Grid Level 2 subgrids (`grid-template-rows: subgrid`) to ensure multi-column elements align horizontally.

---

## 2. The Calculus of Visual Weight (Layout Gravity)

Every element on a screen exerts a visual "pull" on the user's attention. Visual weight ($W$) is a function of size ($S$), lightness contrast ($\Delta L$), and chroma ($C$):

$$W = S \times \Delta L \times (1 + C)$$

- **Size ($S$)**: The viewport surface area occupied by the element.
- **Lightness Contrast ($\Delta L$)**: The perceptual lightness difference between the element and the background surface.
- **Chroma ($C$)**: The purity and saturation of the color (measured in the OKLCH color space).

### The Laws of Visual Gravity:
1. **Accents Require Offset**: An element with high visual weight (e.g., a glowing primary CTA card with a rich accent gradient `oklch(0.65 0.28 320)`) has massive visual gravity. To prevent the layout from collapsing into visual clutter, this card **must be surrounded by vast active whitespace** (low weight, neutral surface area).
2. **Symmetry & Centroids**: The center of visual gravity (the visual centroid $(X_c, Y_c)$) of a page should reside close to the geometric center. If the top-left section is heavy with Display text, the bottom-right section must be balanced with a highly structured CTA or interactive element.
3. **Typographic Weights**: Higher font weights (`font-weight: 700`) must be offset by smaller font sizes (`font-size: 14px`) when used for secondary details to keep them from competing with the main heading.

---

## 3. Hick's Law & The Cognitive Load Budget

The time it takes a user to make a decision increases logarithmically with the number of visual choices presented:

$$T = b \times \log_2(n + 1)$$

You must respect the user's **Cognitive Load Budget**. If a page is visually noisy, the user experiences decision fatigue and leaves.

### The Cognitive Budget Rules:
1. **Interactive Element Limits**: A single section or Bento grid must contain **no more than 7 distinct interactive elements** at once. 
2. **Color Palette Restraint**: Max 3 active color hues: 1 primary background neutral (e.g., `oklch(0.12 0.01 240)`), 1 elevated surface neutral (`oklch(0.18 0.02 240)`), and 1 selective accent (`oklch(0.62 0.24 350)`).
3. **The 3-Dopamine Hit Limit**: On any page, you are allowed a maximum of **3 visual "reward" moments** (subtle glow rings, spring-physics hovers, glowing SVG meshes). If every element is screaming for attention with hover reveals and gradient pulses, *none of them are.*
4. **Progressive Disclosure**: Hide complex settings or technical details behind clean interactive toggles (Accordion elements, hover-cards) rather than blasting them into raw tables on load.

---

## 4. Perceptual Contrast Scale (APCA Standards)

Static contrast ratios (like WCAG 2.1's $4.5:1$ calculation) fail because the human eye is non-linear and perceives different colors at vastly different lightness levels (e.g., pure green is perceived as far brighter than pure blue).

You must comply with the **Advanced Perceptual Contrast Algorithm (APCA)**, which measures contrast based on font-size spatial frequency:

| Typography Role | Size | Min APCA Index (Lc) | Primary CSS Colors |
|-----------------|------|---------------------|--------------------|
| Display text | > 36px | Lc > 45 | Primary Headings |
| Subheadings | 20px - 32px | Lc > 60 | Section Titles |
| Body text | 15px - 18px | Lc > 75 | Body and Descriptions |
| Small Captions | 11px - 14px | Lc > 90 | Meta information |

### APCA Design Directives:
- **Thin Fonts Require Contrast**: If you use a thin font weight (`300` or `400`), you must increase the lightness contrast by using pure neutrals (`#ffffff` or `#f8f9fa` against dark backgrounds).
- **Subtle borders**: Border dividers or card frames should use low contrast (`Lc 15 - 30`) to keep them from cluttering the grid container lines.

---

## 5. Typographic Rhythm & Readability

Readability is the ease with which a reader can navigate a block of text. To prevent text from appearing as a dense, unreadable wall of characters:

1. **The 65ch Line Length Boundary**: The maximum width of any text block or paragraph must be capped at **65 characters** (~`600px` to `700px`). Beyond `75ch`, the human eye struggles to track back from the end of one line to the start of the next.
   - **CSS Directive**: `max-width: 65ch;` or `max-width: 600px;` on all paragraph selectors.
2. **Typographic Rhythm Scale**: Line-height must increase as font-size decreases to maintain breathing space:
   - Display headings: `line-height: 1.1` to `1.2`
   - Subheadings: `line-height: 1.3` to `1.4`
   - Body Paragraphs: `line-height: 1.5` to `1.65`
   - Small Captions: `line-height: 1.7` to `1.8`

---

## 6. Interaction Physics & Spatial Momentum

Linear CSS transitions (`transition: 0.3s linear`) feel robotic, artificial, and low-quality because **nothing in the physical world moves linearly.** 

To create premium, state-of-the-art interfaces, you must emulate the physics of the physical universe:

### Spring Physics Easing
- **Principle**: Objects have mass, stiffness, and friction. They accelerate, overshoot their target slightly, and settle into place with decreasing momentum (spring dampening).
- **CSS Directive**: Utilize the custom spring bezier curve for all visual hover and entrance animations:
  - **The Avant-Garde Standard Spring**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (provides a clean organic overshoot).
  - **The Slow Breath Easing**: `cubic-bezier(0.25, 1, 0.5, 1)`.

### Staggered Entrance Choreography
- **Principle**: When a page loads, elements should arrive in a sequence that guides the reading eye from the entrance point to the terminal CTA.
- **CSS Directive**: Apply incremental `animation-delay` or GSAP staggers. Gaps of `60ms` to `100ms` between grid cards create a cascading "flow" that makes the page feel organic and alive.

---

## The AI Design Reasoning Checklist
*Before writing any HTML/CSS, you must run this reasoning checklist internally:*
1.  **Which Gestalt principle** am I utilizing to group these visual elements?
2.  **Where is the visual centroid** of this section? Is it lopsided?
3.  **What is the Cognitive Load Coefficient** of this page? Am I showing too many inputs or colorful cards?
4.  **Are my font sizes compliant with APCA spatial contrast indices** (Lc 75 for body, Lc 90 for caption)?
5.  **Is my paragraph width restricted** to the `65ch` limit?
6.  **Am I using spring easing curves** rather than linear gradients or rigid timers?
