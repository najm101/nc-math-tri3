# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is


The **Tri.3 Practice Lab** — an infinite-question math practice/quiz app for NCS Grade 9
(trigonometry, circles, 3-D coordinates). It began life as a single self-contained HTML
file (shared with students over WhatsApp); now that it's hosted on GitHub Pages it has
been split into **native ES modules** — no build step, no framework, no dependencies
beyond Google Fonts over CDN. `index.html` is just a shell: markup + a `<link>` to the
CSS + one `<script type="module" src="js/main.js">`.

`refrence-docs/` holds the source PDFs (`quizes.pdf`, `practice-sheet.pdf`) the
question bank is modeled on — consult them when adjusting question content or
difficulty to keep the app aligned with the actual curriculum.

`index.bak` is the original single-file version, kept for reference (gitignored).

## Running / deploying

- **Local:** serve the directory and open it over HTTP — e.g. `python3 -m http.server`,
  or the bundled `node .claude/serve.js` (port 8753). ⚠️ **Do not** open `index.html`
  via `file://` (double-click): native ES modules are blocked over `file://`, so the page
  must be served over HTTP.
- **Hosting:** GitHub Pages, served from the `main` branch root. The entry file must be
  named `index.html` so Pages serves it at the site root — a bare `index` returns a 404.
- No tests, no linter, no package manager. Verification is manual: serve the page and
  exercise the relevant topic generator / the Exam Prep run.

## File layout

```
index.html            shell only (markup + <link> css + <script type=module> main.js)
css/styles.css        all styles
js/
  main.js             composition root: imports everything, wires DOM events, bootstraps
  registry.js         TOPICS, subtopics (SUBTOPICS), LESSONS + helpers
  core/
    helpers.js        ri, pick, r1/r2, gcd, reduceFrac, within, escapeHtml, $, pt, DEG, R2
    expr.js           evalExpr (the tolerant answer parser)
    fractions.js      renderFractions (stacked-fraction renderer)
    state.js          shared mutable `state` object + saveState/loadState (localStorage)
  svg/                diagram engine: core.js (txt/mkLayout/vector ops), triangle, ssa, circle, word
  generators/         one file per topic (arc-length.js, distance.js, …) — the g* functions
  ui/
    answer.js         buildAnswerInto + gradeAnswer (input UI + grading, per q.type)
    practice.js       practice page: newQuestion, check, chips, lesson tabs, stats, recordCurrent
    history.js        history page + per-lesson dashboard (tagToLesson, renderDash, showPage)
    exam.js           Exam Prep mode (blueprint, run loop, end-of-exam analysis)
    modals.js         Rules modal + SSA explorer
```

Module rules of thumb: **generators and the SVG engine are pure** (import helpers, export
functions, no shared state). The **UI modules share state via the single `state` object**
in `core/state.js` — write `state.correct++`, never a bare module-local counter, or the
value won't be shared across modules. `main.js` is imported last so its event wiring runs
after every handler exists.

## Architecture

The page is a thin renderer driven by a registry of **question generators**. Editing
content means touching a generator function; editing behavior means touching the
render/check loop.

### Question generators (`g*` functions, `js/generators/*.js`)

Each topic is a function (e.g. `gLawCosines`, `gTrigRatio`, `gArcLength`) that
randomizes values and returns a **question object**. The object schema drives both
rendering and grading:

- `tag`, `prompt` (HTML), optional `given`, optional `diagram` (SVG string)
- `type`: one of `num`, `expr`, `frac`, `triple`, `choice` — selects the input UI in `buildAnswerInto()` (`ui/answer.js`) and the grading branch in `gradeAnswer()`
- `answer` + `tol` (numeric tolerance) for `num`/`expr`; `exact` is a display-only exact form
- `unit` for the unit label; `options`/`answerIndex` for `choice`; `num`/`den` for `frac`; `answers`/`labels` for `triple`
- Grading is **tolerance-based**, not exact string match. `evalExpr()` (`core/expr.js`)
  parses the user's typed answer — arithmetic, parentheses, `pi`/`π`, `sqrt`/`√`/`root` —
  so "3√2", "sqrt(18)", and "4.24" all grade equal within `tol`.

### Topics, subtopics & lessons (`js/registry.js`)

- `TOPICS` maps a topic `id` → display `name` → either a `gen` function (single-variant
  topics) or a `subs` array of **subtopics** (`{id, name, gen}`). A subtopic is the
  guaranteed-coverage leaf unit — e.g. `dist` has `dist-2d` and `dist-3d`; `special` has
  `special-4545` and `special-3060`. Subtopic generators are thin wrappers that call the
  topic generator with a fixed variant argument (e.g. `gDistance2D = () => gDistance(2)`).
- `SUBTOPICS` is a flat `leafId → {gen, name, topicId}` map; `topicGen(t)` returns a
  topic's gen or a random sub; `parentTopicOf(leafId)` and `leafName(leafId)` support the
  exam analysis + "Practice this →" jump.
- `LESSONS` groups **topic** ids into curriculum lessons (4-3 … 5-3, plus `all`) shown as
  tabs. Practice chips stay topic-level; subtopics surface only in the exam.
- `newQuestion()` (`ui/practice.js`) picks a random topic from the active selection and
  calls `topicGen(t)()`.

**To add a question type:** write a `g*` function in a new `js/generators/*.js`, export it,
import it in `registry.js`, and add a `TOPICS` entry (with `subs` if it has variants).

### Exam Prep — guaranteed subtopic coverage (`js/ui/exam.js`)

`EXAM_BLUEPRINT` is a list of **subtopic (leaf) ids** with counts, so a full exam run is
guaranteed to touch every variant of every topic at least once (both 2-D/3-D distance,
both special triangles, both ambiguous-case outcomes, etc.). `buildExam()` resolves each
id via `SUBTOPICS[id].gen()` and tags the question with `_topic = leafId`; the end-of-exam
analysis groups by that leaf id, so weak/strong rows are per-subtopic. Tune any `n` to
weight a section, but keep every leaf present to preserve coverage.

### SVG diagram engine (`js/svg/*.js`)

Generators that show figures build SVG strings via helpers: `svgTri`, `svgSSA`,
`svgArc`, `svgRadius`, `svgCirclePts`, `svgPie`, `svgChords`, `svgWordTri`. Two pieces
to know:
- `txt()` (`svg/core.js`) draws label text with a paper-colored halo (stroke-behind-fill)
  so labels stay readable over lines.
- `mkLayout()` is a greedy collision-avoidance placer (`place`/`reserve`) that spirals
  through candidate positions to keep labels from overlapping. Use it when adding
  labels to a new diagram rather than hard-coding coordinates.

### State & persistence (`js/core/state.js`)

Score state (`correct`, `attempted`, `qcount`, `history`, `examHistory`) lives on the
shared `state` object and persists to `localStorage` under `STORE_KEY` via
`saveState()`/`loadState()`, surviving reloads. `renderDash()` and `renderHistory()`
(`ui/history.js`) redraw the stats strip and attempt log.

### Render/check loop

`newQuestion()` → `buildAnswerInto()` (builds the input UI for `q.type`) → user submits →
`check()` (grades via `gradeAnswer()`, updates `state`, shows feedback). Enter-key
submission is wired per input type inside `buildAnswerInto()`. Exam mode reuses
`buildAnswerInto()`/`gradeAnswer()` against its own container.

## Conventions

- Coordinate helpers (`norm/add/sub/mul`) and the SVG engine treat triangle vertices
  in **math coords (y-up)**; `svgTri` flips to screen space.
- Short helper names are idiomatic here: `ri` (random int), `pick`, `r1`/`r2` (round to
  1/2 dp), `$` (getElementById). Match this terseness in generators.
- Generators must stay **pure** (no DOM, no `state`); only `ui/*.js` touches the DOM and
  the shared `state` object.
