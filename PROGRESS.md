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

## Next: Stage 3 — Lesson engine + Levels 1–10 (NOT STARTED, awaiting user go-ahead)
Plan:
- Lesson content schema (`src/lessons/level-001.ts` …): intro, lesson steps with notation, guided practice items with per-option explanations, challenge items
- Lesson player at `/level/:n`: Intro → Lesson → Guided practice (immediate feedback, explain wrong answers) → Challenge → result
- Star thresholds defined and shown up front (e.g. pass ≥ 60%, ★★ ≥ 80%, ★★★ = 100% with no hints) — final rules in Stage 4
- On pass: call `completeLevel` (unlocks next); replay via Practice again
- Author Levels 1–10 (Unit 1: The Staff) with distinct objectives; test every question's correct and incorrect paths
