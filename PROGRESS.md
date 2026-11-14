# Stave — development progress (resume file)

Read this first when resuming. Updated at every checkpoint.

## Environment
- Node.js 22 installed via Homebrew (keg-only). Before any npm command:
  `export PATH=/opt/homebrew/opt/node@22/bin:$PATH`
- Dev server: `npm run dev` → http://localhost:5180

## Current stage: 1 — Design system & application foundation (IN PROGRESS)

### Done
- [x] Project scaffold (Vite + React 18 + TypeScript + React Router 6, VexFlow 4.2.5)
- [x] Design tokens (`src/styles/tokens.css`), base styles (`src/styles/base.css`)
- [x] Curriculum architecture: 6 worlds / 50 units (`src/data/curriculum.ts`)
- [x] Achievement definitions (`src/data/achievements.ts`)
- [x] Device storage + date/streak utilities (`src/lib/`)
- [x] App state provider: preferences + device progress (`src/state/AppState.tsx`)

### Next
- [ ] Components: Logo, Icon set, Button, StatTile, ProgressBar, Notation (VexFlow), AppShell + nav
- [ ] Pages: Home, Learn (+ world detail), Roadmap, Library, Practice, Progress, Achievements, Profile, Settings, 404
- [ ] Run & test in browser (navigation, responsive, console, a11y)
- [ ] README + Stage 1 report
