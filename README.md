# Stave

A free music-reading education platform: a 500-level journey from the first staff line to
master-level sight-reading, plus a legal sheet music library. Funded by advertising, free for students.

> **Status:** Stage 1 of 8 complete (design system & application foundation).
> See [PROGRESS.md](PROGRESS.md) for the live checklist and resume notes.

## Technology stack

| Concern | Choice |
|---|---|
| UI | React 18 + TypeScript 5 (strict) |
| Build / dev server | Vite 5 |
| Routing | React Router 6 (data router, v7 future flags on) |
| Notation | VexFlow 4.2.5 (lazy-loaded chunk, SVG output, theme-aware) |
| Styling | CSS Modules + design tokens in `src/styles/tokens.css` |
| Fonts | Self-hosted via Fontsource: Source Serif 4 (display), IBM Plex Sans (UI), IBM Plex Mono (numbers/labels) |
| Persistence (Stage 1) | `localStorage` on the device only. A server database arrives in Stage 6 |

## Install and run

Requires Node.js 20+ (developed on 22 LTS).

```bash
# On this Mac, Node 22 is a keg-only Homebrew install:
export PATH=/opt/homebrew/opt/node@22/bin:$PATH

npm install
npm run dev        # http://localhost:5180
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
```

## Project structure

```
src/
  main.tsx              entry: fonts, global CSS, <App/>
  App.tsx               router (all routes live under <AppShell/>)
  styles/
    tokens.css          colour, type, spacing, motion tokens; light + dark
    base.css            reset, focus styles, reduced-motion handling
  state/AppState.tsx    preferences + device-local student progress (React context)
  lib/                  storage (failure-tolerant localStorage), date/streak helpers
  data/
    curriculum.ts       6 worlds × 50 units × 500 levels (structure, not lesson content)
    achievements.ts     badge definitions + criteria
    trebleNotes.ts      note range + position explanations for the drill
  components/
    AppShell            sidebar (desktop) / icon rail (tablet) / top bar + tab bar + "More" sheet (mobile)
    Notation            VexFlow wrapper — always pass a text `label`
    NoteDrill           working note-identification exercise
    ui.tsx              Button, ButtonLink, PageHeader, Panel, Stat, ProgressBar, Stars, Notice, EmptyState, Segmented
    Badge, Icon, Logo, WeekStrip, MonthCalendar
  pages/                one file (+ .module.css) per route
```

## Environment variables

None yet. Accounts (Stage 6) and advertising (Stage 7) will require configuration; those stages will
document each variable here. Secrets will never be placed in frontend code.

## Stages

| # | Stage | Status |
|---|---|---|
| 1 | Design system & application foundation | **Complete** |
| 2 | 500-level roadmap | Not started |
| 3 | Lesson engine + Levels 1–10 | Not started |
| 4 | Gamification (XP, stars, achievements, streaks, daily challenges) | Not started (streak counting from the practice drill already works) |
| 5 | Sheet music library + viewer | Not started |
| 6 | Accounts & persistent progress | Not started |
| 7 | Advertising integration | Not started |
| 8 | Full application testing | Not started |

## What works today

- All 9 sections plus world syllabus pages and a 404 page; responsive at phone, tablet and desktop widths.
- Home: greeting, current level/unit, Continue/Start learning (opens the current world's syllabus), journey stats, today's practice with a 7-day strip, honest empty states for badges and the library.
- Learn: six worlds with level ranges and progress; each world page lists its 10 (or 5) units with outcomes and topics.
- Practice: a real note-identification drill (treble C4–A5) with explanations for every answer, keyboard support (A–G, Enter), a 5-note set that records the day for the streak, a month calendar and lifetime accuracy.
- Profile: validated nickname, saved on the device. Settings: theme (system/light/dark), notation size, motion (system/reduce/full), and a confirmed device reset.

## Known limitations

- **No lessons yet.** Levels can't be opened; the lesson engine is Stage 3. "Start learning" currently opens the World 1 syllabus.
- **Roadmap** shows a world overview only; the 500-node winding path is Stage 2.
- **Library is empty (0 scores)** by design until Stage 5 adds licence-checked scores.
- **Achievements** are defined but cannot be earned until Stage 4.
- **Progress lives in this browser only.** Clearing site data erases it. No accounts yet.
- **No advertising** is integrated, and nothing claims otherwise.
- VexFlow adds a ~314 kB (gzipped) chunk, loaded only on pages that show notation.

## Testing (Stage 1)

There is no automated suite yet; Stage 1 was tested manually in the in-app browser:

1. `npm run build` → typecheck and build pass with no errors.
2. Visit every route from the sidebar → each renders its page, updates the tab title and moves focus to the `<h1>`.
3. `/learn/world/9` and `/anything` → 404 page.
4. Practice: answer wrongly → red feedback with the correct note and its position, focus moves to Next; answer correctly → green feedback. Finish 5 → summary, streak = 1, calendar marks today, Home shows "Done today".
5. Settings: switch theme/size/motion → applied immediately and persisted across reload.
6. Profile: `Ava <script>` is rejected with an error; `Mira` saves and shows on Home.
7. Settings → Reset… → Cancel keeps data; Erase clears it.
8. At 375 px: tab bar + More sheet (Esc closes it, links navigate and close it); no horizontal scroll on any page.
9. Browser console: no errors or warnings after load.
