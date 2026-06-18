# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single self-contained HTML page — the **Tri.3 Practice Lab** — an infinite-question
math practice/quiz app for NCS Grade 9 (trigonometry, circles, 3-D coordinates).
Everything (markup, CSS, JS) lives in one file: **`index.html`** (originally
`tri3-practice-4-quiz-aligned.html`). There is no build step, no framework, no
dependencies beyond Google Fonts loaded over CDN.

`refrence-docs/` holds the source PDFs (`quizes.pdf`, `practice-sheet.pdf`) the
question bank is modeled on — consult them when adjusting question content or
difficulty to keep the app aligned with the actual curriculum.

## Running / deploying

- **Local:** open `index.html` in a browser, or serve the directory (e.g. `python3 -m http.server`).
- **Hosting:** GitHub Pages, served from the `main` branch root. The entry file must be
  named `index.html` so Pages serves it at the site root — a bare `index` returns a 404.
- No tests, no linter, no package manager. Verification is manual: open the page and
  exercise the relevant topic generator.

## Architecture

The page is a thin renderer driven by a registry of **question generators**. Editing
content means touching a generator function; editing behavior means touching the
render/check loop.

### Question generators (`g*` functions, ~line 786–1396)

Each topic is a function (e.g. `gLawCosines`, `gTrigRatio`, `gArcLength`) that
randomizes values and returns a **question object**. The object schema drives both
rendering and grading:

- `tag`, `prompt` (HTML), optional `given`, optional `diagram` (SVG string)
- `type`: one of `num`, `expr`, `frac`, `triple`, `choice` — selects the input UI in `buildAnswer()` and the grading branch in `check()`
- `answer` + `tol` (numeric tolerance) for `num`/`expr`; `exact` is a display-only exact form
- `unit` for the unit label; `options` for `choice`; `num`/`den` for `frac`; `answers`/`labels` for `triple`
- Grading is **tolerance-based**, not exact string match. `evalExpr()` parses the user's
  typed answer — it understands arithmetic, parentheses, `pi`/`π`, and `sqrt`/`√`/`root` —
  so "3√2", "sqrt(18)", and "4.24" all grade equal within `tol`.

### Topic & lesson registries (`TOPICS`, `LESSONS`, ~line 1401)

- `TOPICS` maps a topic `id` → display `name` → `gen` function. This is the wiring
  point: **to add a question type, write a `g*` function and add one entry here.**
- `LESSONS` groups topic ids into curriculum lessons (4-3 … 5-3, plus `all`) shown as
  tabs. `lessonTopics(id)` resolves a lesson to its topic ids.
- `newQuestion()` picks a random topic from the active selection (chips ∩ current lesson),
  calls its `gen()`, and renders.

### SVG diagram engine (~line 491–862)

Generators that show figures build SVG strings via helpers: `svgTri`, `svgSSA`,
`svgArc`, `svgRadius`, `svgCircle*`, `svgPie`, `svgChords`, `svgWordTri`. Two pieces
to know:
- `txt()` draws label text with a paper-colored halo (stroke-behind-fill) so labels
  stay readable over lines.
- `mkLayout()` is a greedy collision-avoidance placer (`place`/`reserve`) that spirals
  through candidate positions to keep labels from overlapping. Use it when adding
  labels to a new diagram rather than hard-coding coordinates.

### State & persistence (~line 1446)

Score state (`correct`, `attempted`, `qcount`, `history`) persists to
`localStorage` under `STORE_KEY` via `saveState()`/`loadState()`, surviving reloads.
`renderDash()` and `renderHistory()` redraw the stats strip and attempt log.

### Render/check loop

`newQuestion()` → `buildAnswer()` (builds the input UI for `q.type`) → user submits →
`check()` (grades via the type-appropriate branch, updates state, calls `flash()`).
Enter-key submission is wired per input type inside `buildAnswer()`.

## Conventions

- Coordinate helpers (`norm/add/sub/mul`) and the SVG engine treat triangle vertices
  in **math coords (y-up)**; `svgTri` flips to screen space.
- Short helper names are idiomatic here: `ri` (random int), `pick`, `r1`/`r2` (round to
  1/2 dp), `$` (getElementById). Match this terseness in generators.
- Keep everything in the one `index.html` file — there is no module system.
