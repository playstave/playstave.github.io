# Stave — development progress (resume file)

Read this first when resuming after a sleep/restart. Updated at every checkpoint; every checkpoint is a git commit.

## Resume in 3 steps
1. `cd` into this `stave/` folder.
2. `export PATH=/opt/homebrew/opt/node@22/bin:$PATH` (Node 22 is keg-only via Homebrew).
3. `npm run dev` → http://localhost:5180 (dependencies are already installed; run `npm install` if `node_modules` is missing).

The in-app browser preview config lives one level up at `../.claude/launch.json` (name: `stave`).

## Stage 1 — Design system & application foundation: COMPLETE (2026-11-14)
- [x] Scaffold: Vite + React 18 + TS strict + React Router 6 + VexFlow 4.2.5
- [x] Design tokens (light/dark), base styles, reduced-motion handling
- [x] Curriculum architecture: 6 worlds / 50 units / 500 levels
- [x] Achievement definitions + original badge artwork
- [x] App shell: desktop sidebar, tablet rail, mobile top bar + tab bar + More sheet
- [x] Pages: Home, Learn, World detail, Roadmap (overview), Library (empty, licensing), Practice (working drill), Progress, Achievements, Profile, Settings, 404, error screen
- [x] Tested in browser at 375 / 768 / 1280 px; console clean; build passes
- [x] README

Bugs found and fixed during Stage 1 testing:
- React Router v7 future-flag console warnings → flags enabled
- Drill notation too small on phones → `scale` prop added to Notation
- Home caption wrapped mid-sequence ("E G B D / F") → nowrap span
- Regression introduced while adding `scale` (prop not destructured, page crashed) → fixed, re-tested

### Stage 1 verification pass (2026-11-14, before Stage 2)
- Clean `rm -rf dist && npm run build` → exit 0
- Git: 3 Stage 1 commits present, working tree clean
- README.md + PROGRESS.md tracked in git
- Restart test: stopped all servers, followed "Resume in 3 steps" from an empty environment (`env -i`) → server up in ~100 ms, all routes 200
- Browser: 18 route checks (incl. all 6 worlds, 404s, #privacy anchor) render correct page, no console errors; production build (`vite preview`) also checked
- Fixed: 404 page inside /learn showed tab title "Learn · Stave" → now "Page not found · Stave"
- Fixed: Library intro said "searchable" before search exists → reworded

## Stage 2 — 500-level roadmap: COMPLETE (2026-11-14)
- [x] `src/data/levels.ts`: 500 levels derived from curriculum (difficulty tiers, checkpoint/milestone/major flags)
- [x] `src/lib/progression.ts`: pure unlock rules (`levelStatus`, `canOpen`, `completeLevel`, `nextLevel`) + Vitest (13 tests pass)
- [x] AppState: `completeLevel(n, stars, score)` (sync via ref, safe under StrictMode) and `resetJourney()`
- [x] Winding path UI (`LevelPath`), level dialog, sticky toolbar (world shortcuts, Jump to current), legend
- [x] `/level/:n` route with lock guard; Home "Continue learning" → current level page
- [x] Dev-only progression tools on Roadmap (excluded from prod bundle — verified)
- [x] Tested at 1280 / 375 px, dark mode; regression sweep of Stage 1 routes, console clean

Bugs found and fixed during Stage 2 testing:
- AppShell scrolled to top after the roadmap positioned itself → pages can opt out with `data-manages-scroll`
- Dashed road ran through star/difficulty marks → marks get a paper background
- Roadmap auto-scroll hid the header even when Level 1 was visible → scroll only if the current node is off-screen
- Locked dialog wording ("every level after it") → "Complete Levels X–Y to unlock it"
- Phone toolbar wrapped to two rows → single row, scrollable world chips, shorter button label
- CSS order bug: phone padding for world chips overridden by base rule → moved after

## Stage 3 — Lesson engine + Levels 1–10: COMPLETE (2026-11-14)
- [x] Lesson schema (`src/lessons/types.ts`); staff positions shared by figures and answers (`staff.ts`)
- [x] Engine state machine + scoring (`src/lib/lessonEngine.ts`), 6 unit tests
- [x] `StaffDiagram`: precise staff, highlights, numbered notes, step/skip arcs, accessible tap-to-locate
- [x] Question builders with mistake-specific feedback (`helpers.ts`)
- [x] Levels 1–10 authored (Unit 1: The Staff), 11 content-validation tests
- [x] `LessonPlayer` + `QuestionView`, mounted at `/level/:n` (lock guard kept); leave confirmation via `useBlocker`
- [x] Browser walkthrough script `scripts/lesson-walk.js` (dev only); full runs of all 10 lessons pass
- [x] 30/30 unit tests, build passes, console clean; Stage 1–2 regression sweep passed

Bugs found and fixed during Stage 3 testing:
- Practice tap questions showed the correct position after a wrong try (made retry trivial) → hidden in practice, shown in the challenge
- Locate feedback said "2 positions lower" for line-to-line → "one line lower"
- Tap rows were ~12 px on phones → narrower interactive staff, rows now 27 px at 375 px
- Lesson figures too small in their box → larger max size
- Five stacked options pushed feedback below the fold on desktop → two columns ≥ 560 px
- Awkward line-1 explanations ("count … — 1.") → reworded
- Keyboard handlers assumed an element target → guarded (also in the note drill)
- Inline focus refs would re-focus headings on every re-render → single focus effect per screen

## Stage 4 — Gamification: COMPLETE (2026-11-14)
- [x] `lib/xp.ts` XP rules with one-time award keys (no duplicate XP)
- [x] `lib/streak.ts` encouraging streaks (one rest day allowed, best kept, today never counts against you)
- [x] `lib/achievements.ts` 16 badges from real progress, with progress measures
- [x] `lib/daily.ts` daily review challenge (deterministic per day, favours weak levels)
- [x] `lib/rewards.ts` single entry point (lesson / practice set / daily) + v1→v2 migration
- [x] AppState rewired; `state/progress.ts` model v2 (awarded keys, XP log, achievements, history, counters)
- [x] CelebrationOverlay (stars, XP count-up, unlock, badges, milestone variant, confetti), Toasts, reduced-motion hook
- [x] `/practice/daily` page; Home, Practice, Achievements, Progress, Profile show real XP/streak/badges/history
- [x] 59/59 unit tests; browser tests of every rule, replay, streak scenario, milestone, reduced motion, reload, migration; Stage 1–3 regression

Bugs found and fixed during Stage 4 testing:
- XP count-up stayed at "+0" when the tab was in the background (rAF paused) → timer guarantees the final value
- Walkthrough script couldn't restart a lesson already on screen → navigates away first (test tooling only)

Observed, not reproduced: twice the celebration overlay was found closed after a screenshot of the hidden browser pane. With close/cancel/key/click logging attached it never recurred and nothing in the app called close(). Noted in case it shows up in real use.

## Next: Stage 5 — Sheet music library (NOT STARTED, awaiting user go-ahead)
Plan:
- Score data model (title, composer, instrument, difficulty, genre, description, licence, source, files, page count) designed to scale
- Seed catalogue with genuinely public-domain / openly licensed material only (likely Stave-original educational pieces rendered with VexFlow, plus a curated set of PD works with verified sources) — no claim of “thousands”
- Search (title/composer) + filters (instrument, difficulty, genre), favourites, collections, recently opened
- Viewer: zoom, page navigation, fullscreen, print/download only where licence permits
- Wire `scoresOpened` counter → Sheet Music Explorer badge
