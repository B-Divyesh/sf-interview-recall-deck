# Interview Recall Deck — visual thesis

## Direction: a luminous glass data landscape

Recall is treated as navigation, not examination. The interface is a quiet midnight
landscape of translucent memory panes, small evidence lights, and deliberate paths.
Bright points represent details the user has already lived; connecting lines represent
retrieval. The product never depicts rankings, brains, surveillance, or a synthetic
interviewer. This keeps the visual metaphor truthful and low-pressure.

The treatment is intentionally dark-only. A painted dark background reduces visual
glare, lets the evidence markers carry hierarchy, and makes rehearsal mode feel like a
protected space rather than an office form. Every text and control color is specified
for this background and meets WCAG AA; color is always paired with text or shape.

## Tokens

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Deep field | `--ink-950` | `#07111d` | page background |
| Raised field | `--ink-900` | `#0d1b2a` | opaque fallback surfaces |
| Glass | `--glass` | `rgba(18, 39, 57, .76)` | independent memory objects |
| Glass edge | `--edge` | `#34536a` | borders and controls |
| Primary text | `--mist-50` | `#f4fbff` | headings and body |
| Muted text | `--mist-300` | `#b9cbd6` | supporting copy (7.6:1 on deep field) |
| Retrieval cyan | `--cyan-300` | `#66e1ef` | primary actions/focus (12:1 on deep field) |
| Cyan ink | `--cyan-950` | `#04272c` | text on cyan |
| Evidence coral | `--coral-300` | `#ff9b88` | evidence chips and attention |
| Success | `--mint-300` | `#80e0b0` | saved/ready states |
| Warning | `--amber-300` | `#f2c66d` | offline/update notices |
| Danger | `--red-300` | `#ff8e9e` | destructive controls/errors |

## Typography

No font files or third-party requests are needed. Headings use the locally available
humanist system stack `Avenir Next, Segoe UI, system-ui, sans-serif`; body uses
`Inter, ui-sans-serif, system-ui, sans-serif`. The distinction comes from heading
letterspacing and weight, not novelty. Body is 16–18px with 1.55 leading; the compact
label style is 12px uppercase with .09em tracking. The scale is 12 / 16 / 20 / 28 /
clamp(36, 7vw, 68). Reading measure is capped at 68 characters.

## Spacing and layout

An 8px base rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Controls are at least 44px high
and adjacent controls keep 8px separation. Desktop uses a narrow 1160px landscape
with a persistent route rail and open content plane. At 760px the rail becomes a
bottom navigation bar; secondary labels collapse, editor sections stack, the hero
illustration moves beneath its copy, and safe-area padding keeps actions clear of
notches. Long notes never occupy the primary recall view.

## Surfaces and interaction grammar

- Memory cards are independent glass panes: 18px radius, 1px cool edge, diffuse cyan
  inner highlight, and a low opaque fallback before `backdrop-filter`.
- Competencies are coordinates (small outlined pills); evidence is a solid coral dot
  plus a text label. No meaning relies on hue alone.
- Primary buttons are cyan capsules with dark ink. Secondary actions are transparent
  with a visible edge. Destructive actions are text + red outline.
- Saving updates a polite live region immediately. Destructive deletion names the
  project and requires confirmation. Dialog focus returns to its origin.
- Rehearsal progressively reveals prompt → user's spoken/typed recall → their evidence;
  the evidence is never shown by default, preserving retrieval practice.

## Motion policy

Motion only explains spatial continuity: panes enter 8px upward in 220ms, the rehearsal
progress width changes in 200ms, and a saved marker fades once. Nothing loops. Under
`prefers-reduced-motion: reduce`, or when the in-app Reduce motion control is on, all
transforms and smooth scrolling are removed and state changes are instant. TTS is
always user initiated and can be stopped.

## Original asset plan and prompt sheet

The hero is a nonliteral memory landscape: floating translucent index panes above a
dark topographic plane, three warm evidence lights connected by fine cyan paths. It
clarifies the core transformation—scattered details becoming a traversable route—without
claiming automation. Authored SVG icons cover controls, PWA icons, and empty states.

Master prompt: “Editorial 3D still life, an abstract midnight memory landscape viewed
at a gentle isometric angle, three translucent glass index panes rising from a dark
navy topographic plane, tiny warm coral evidence lights connected by thin luminous cyan
paths, soft volumetric edge light, restrained mist, tactile glass with subtle scratches,
large calm negative space, deep navy and petrol blue, retrieval cyan, evidence coral,
premium but humane, no people, no faces, no brains, no office desk, no UI screenshot,
no legible text, no letters, no numbers, no logos, no watermark, no gradients used as
a generic background.”

Asset prompt derives from that sheet without changing world, materials, light, lens,
or palette. Generated with the factory image deployment through
`/opt/fleet/lib/gen-image.sh` on 2026-08-27. The selected output is original generated
imagery for this product. Source PNG and prompt sidecar are retained in `assets/src/`;
optimized WebP is shipped. Generated imagery is disclosed in the footer.

