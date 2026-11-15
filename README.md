# Stave

A free music-reading education platform: a 500-level journey from the first staff line to
master-level sight-reading, plus a legal sheet music library. Funded by advertising, free for students.

> **Status:** Stages 1–3 of 8 complete (foundation; 500-level roadmap; lesson engine + Levels 1–10).
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
| Unit tests | Vitest 2 (`npm test`) |

## Install and run

Requires Node.js 20+ (developed on 22 LTS).

```bash
# On this Mac, Node 22 is a keg-only Homebrew install:
export PATH=/opt/homebrew/opt/node@22/bin:$PATH

npm install
npm run dev        # http://localhost:5180
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
npm test           # unit tests (progression, level model, lesson engine, lesson content)
```

## Project structure

```
src/
  main.tsx              entry: fonts, global CSS, <App/>
  App.tsx               router (all routes live under <AppShell/>)
  styles/
    tokens.css          colour, type, spacing, motion tokens; light + dark
    base.css            reset, focus styles, reduced-motion handling
  lessons/              lesson content: types.ts (schema), staff.ts (positions), helpers.ts (question builders),
                        level01–level10.ts, index.ts (registry), lessons.test.ts (content validation)
  state/AppState.tsx    preferences + device-local student progress (React context)
  lib/                  storage, date/streak helpers, progression.ts (unlock rules), lessonEngine.ts (lesson state machine + scoring)
  data/
    curriculum.ts       6 worlds × 50 units × 500 levels (structure, not lesson content)
    achievements.ts     badge definitions + criteria
    levels.ts           the 500 levels: world, unit, difficulty tier, checkpoint/milestone flags
    trebleNotes.ts      note range + position explanations for the drill
  components/
    AppShell            sidebar (desktop) / icon rail (tablet) / top bar + tab bar + "More" sheet (mobile)
    Notation            VexFlow wrapper — always pass a text `label`
    NoteDrill           working note-identification exercise
    LevelPath           one world's winding path of level nodes (SVG road + buttons)
    LevelDialog         level details; locked levels explain how to unlock, no start action
    StaffDiagram        precise SVG staff for Unit 1 (highlights, numbered notes, step/skip arcs, tap-to-locate)
    lesson/             LessonPlayer (intro → lesson → practice → challenge → result) and QuestionView
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
| 2 | 500-level roadmap | **Complete** |
| 3 | Lesson engine + Levels 1–10 | **Complete** |
| 4 | Gamification (XP, stars, achievements, streaks, daily challenges) | Not started (streak counting from the practice drill already works) |
| 5 | Sheet music library + viewer | Not started |
| 6 | Accounts & persistent progress | Not started |
| 7 | Advertising integration | Not started |
| 8 | Full application testing | Not started |

## What works today

- All 9 sections plus world syllabus pages, level pages and a 404 page; responsive at phone, tablet and desktop widths.
- Roadmap: all 500 levels on a winding path across six worlds. Each node shows number, status (current / completed / locked), stars earned and a 6-step difficulty indicator. Checkpoints every 10 (square nodes), milestones every 50 (ringed), major milestones at 100–500 (double ring), unit labels. Opens scrolled to the current level; "Jump to Level N" and world shortcuts; `#level-N` deep links.
- **Lessons for Levels 1–10** (Unit 1, The Staff): Meet the Staff · Counting the Lines · Counting the Spaces · Line Notes and Space Notes · Naming a Note’s Position · Higher and Lower · Steps · Skips · Reading Melodic Shape · Checkpoint. Each has an objective, an introduction, 2–3 illustrated lesson pages, 3–4 guided practice questions and a 5–8 question challenge.
- **Lesson engine:** guided practice gives unlimited tries; every wrong answer gets feedback specific to the mistake, and you can't continue until you answer correctly. The challenge allows one try per question, explaining each answer. Star rules are shown before the challenge: pass (60%, or 70% for checkpoints) = ★, 80% = ★★, 100% = ★★★. Passing saves the result, unlocks the next level and offers Continue / Back to roadmap / Practice again. Failing lists the missed questions with explanations and lets you retry immediately. Replays keep the best result. Leaving mid-lesson asks for confirmation. Two question types: multiple choice (number keys 1–9 + Enter) and tap-a-line-or-space on the staff (arrow keys + Enter).
- Sequential unlocking: only the current level and completed levels can be opened, from the roadmap or by URL (`/level/N` for a locked level explains why it is locked). Replays keep the best stars and score and never unlock anything.
- Home: greeting, current level/unit, Continue/Start learning (opens the current level's lesson), journey stats, today's practice with a 7-day strip, honest empty states for badges and the library.
- Learn: six worlds with level ranges and progress; each world page lists its 10 (or 5) units with outcomes and topics.
- Practice: a real note-identification drill (treble C4–A5) with explanations for every answer, keyboard support (A–G, Enter), a 5-note set that records the day for the streak, a month calendar and lifetime accuracy.
- Profile: validated nickname, saved on the device. Settings: theme (system/light/dark), notation size, motion (system/reduce/full), and a confirmed device reset.

## Known limitations

- **Only Levels 1–10 have lessons.** Level 11 onward opens a page saying its lesson isn't available yet; the remaining 490 are planned in batches after Stage 8. Levels beyond 10 can only be completed with the dev-build tools on the Roadmap.
- **XP is not awarded yet** (always 0). Stars are earned and saved; XP, achievement unlocks and the fuller completion celebration come in Stage 4.
- Unit 1 draws its own staff (no clef yet, by design — clefs are taught in Unit 3). VexFlow is used for clef-based notation elsewhere.
- **Milestone celebrations** are marked on the roadmap; the celebration animations and major achievement awards come with gamification (Stage 4).
- **Library is empty (0 scores)** by design until Stage 5 adds licence-checked scores.
- **Achievements** are defined but cannot be earned until Stage 4.
- **Progress lives in this browser only.** Clearing site data erases it. No accounts yet.
- **No advertising** is integrated, and nothing claims otherwise.
- VexFlow adds a ~314 kB (gzipped) chunk, loaded only on pages that show notation.

## Testing

`npm test` runs 30 unit tests:
- **progression** (7): no skipping, invalid input, replay keeps best, all 500 in order.
- **level model** (6): 500 levels, world boundaries, checkpoint/milestone placement, difficulty never decreases.
- **lesson engine** (6): phase flow, practice retry rules, challenge one-try rule, star scoring, and that the thresholds shown to students agree with the scoring for every challenge length and pass mark.
- **lesson content** (11): Levels 1–10 present and in Unit 1; unique titles, objectives and question ids; all four parts in every lesson; every answer key valid; every wrong option has specific feedback; every step/skip arc label matches the drawn notes; question builders produce correct answers.

**Lesson walkthrough (browser, dev only):** with `npm run dev` open, run this in the browser console:

```js
const { walk } = await import('/scripts/lesson-walk.js');
await walk(1, [[false,false,false,false,false], [true,true,true,true,true]]);
```

It opens the level, pages through the lesson, answers every practice question wrong first (checking the mistake-specific feedback and that you can't continue), then right (checking the explanation), then runs each challenge attempt in the plan and reports the result, stars, unlock and saved record. It reads answers from the lesson files and drives the real UI. `scripts/` is not part of the production bundle.

**Developer tools (dev builds only):** at the bottom of the Roadmap in `npm run dev` there are buttons to complete the current level with 1–3 stars, complete the next 10, attempt a skip (it must be refused), and reset the journey. They are excluded from production builds (verified: not present in `dist/`).

Stage 3 checks: all ten lessons walked in order twice from a fresh start (every practice question wrong then right; challenge outcomes covering fail, ★, ★★, ★★★ and the checkpoint's 70% pass mark); replay improving (★ → ★★★, "New best result saved") and replay worse (best kept); leaving mid-lesson via the sidebar or the ✕ button asks first, "Keep going" stays, "Leave" saves nothing; keyboard answering; tap rows ≥ 27 px at 375 px; progress survives reload; Home, roadmap and Progress show the saved stars (23 = sum of results).

Stage 2 manual checks: fresh student → only Level 1 open; skip attempt refused; completing a level unlocks exactly the next; `/level/20` while on Level 12 shows the locked page; `/level/0`, `/level/abc`, `/level/501` → roadmap; completed-level dialog offers Practice again, locked dialog offers only Go to current; World 1 → 2 hand-off; milestone labels at 50/100/…/500; no horizontal scroll at 375 px; dark mode.

Stage 1 manual checks:

1. `npm run build` → typecheck and build pass with no errors.
2. Visit every route from the sidebar → each renders its page, updates the tab title and moves focus to the `<h1>`.
3. `/learn/world/9` and `/anything` → 404 page.
4. Practice: answer wrongly → red feedback with the correct note and its position, focus moves to Next; answer correctly → green feedback. Finish 5 → summary, streak = 1, calendar marks today, Home shows "Done today".
5. Settings: switch theme/size/motion → applied immediately and persisted across reload.
6. Profile: `Ava <script>` is rejected with an error; `Mira` saves and shows on Home.
7. Settings → Reset… → Cancel keeps data; Erase clears it.
8. At 375 px: tab bar + More sheet (Esc closes it, links navigate and close it); no horizontal scroll on any page.
9. Browser console: no errors or warnings after load.
