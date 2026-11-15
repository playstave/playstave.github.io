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

## Next: Stage 2 — 500-level roadmap (NOT STARTED, awaiting user go-ahead)
Plan:
- Level model: `src/data/levels.ts` deriving 500 level stubs (number, world, unit, difficulty, checkpoint/milestone flags) from curriculum.ts
- Unlock logic as pure functions (`canOpen(level, progress)`) + unit tests (add Vitest)
- Winding SVG path with circular nodes (virtualised/sectioned per world for performance), states: locked / current / completed (stars)
- Checkpoints every 10, milestone markers every 50, major markers at 100/200/300/400/500
- Auto-scroll to current level; keyboard-navigable nodes; works at 375 px
- Dev-only way to simulate progress for testing (removed or guarded before release)
