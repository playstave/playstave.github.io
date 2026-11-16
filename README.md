# Stave

A free music-reading education platform: a 500-level journey from the first staff line to
master-level sight-reading, plus a legal sheet music library. Funded by advertising, free for students.

> **Status:** Stages 1–6 of 8 complete (foundation; 500-level roadmap; lesson engine + Levels 1–10; gamification; sheet music library; accounts with cloud sync on Supabase).
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
| Persistence | `localStorage` on the device; signed-in students sync to Supabase (Postgres, row-level security) |
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
npm test           # unit tests (progression, levels, lessons, rewards, music/transposition, catalogue, search)
```

### Testing on a phone (same Wi-Fi)

Phones only allow the microphone on https pages, so there is a phone mode:

```bash
PHONE=1 npm run dev
```

It serves https on port 5182 on your local network (self-signed certificate — the phone will show a warning you have to accept once). Open `https://<your-computer's-IP>:5182` on the phone.

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
  music/                pitch.ts (spelling-correct transposition), score.ts (score format, validation, instrument parts),
                        layout.ts (measures per line / lines per page), render.ts (VexFlow drawing)
  state/progress.ts     the stored progress model (version 2)
  state/AppState.tsx    preferences + device-local student progress (React context)
  lib/                  progression.ts (unlocks), lessonEngine.ts (lesson flow + scoring), xp.ts (XP rules),
                        streak.ts (streak rules), achievements.ts (badge conditions), daily.ts (daily challenge),
                        rewards.ts (single entry point for activities + migration), storage, dates
  data/
    curriculum.ts       6 worlds × 50 units × 500 levels (structure, not lesson content)
    achievements.ts     badge definitions + criteria
    levels.ts           the 500 levels: world, unit, difficulty tier, checkpoint/milestone flags
    trebleNotes.ts      note range + position explanations for the drill
    scores.ts           the sheet music catalogue (27 scores, all public domain or Stave originals)
  components/
    AppShell            sidebar (desktop) / icon rail (tablet) / top bar + tab bar + "More" sheet (mobile)
    Notation            VexFlow wrapper — always pass a text `label`
    NoteDrill           working note-identification exercise
    LevelPath           one world's winding path of level nodes (SVG road + buttons)
    LevelDialog         level details; locked levels explain how to unlock, no start action
    StaffDiagram        precise SVG staff for Unit 1 (highlights, numbered notes, step/skip arcs, tap-to-locate)
    CelebrationOverlay  lesson/milestone celebration (stars, XP count-up, unlock, badges, confetti)
    Toasts              notifications for XP, streak bonuses and badges outside lessons
    library/            ScoreViewer (paged, zoom, print, SVG download, full screen), ScoreCard, ScoreThumb (lazy previews)
    lesson/             LessonPlayer (intro → lesson → practice → challenge → result) and QuestionView
    ui.tsx              Button, ButtonLink, PageHeader, Panel, Stat, ProgressBar, Stars, Notice, EmptyState, Segmented
    Badge, Icon, Logo, WeekStrip, MonthCalendar
  pages/                one file (+ .module.css) per route
```

## Environment variables

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`). Without them the app runs in device-only mode. Never put the service_role key in the frontend. Dev-only mock backend: `localStorage.setItem('stave:dev-mock-backend','1')`.

## Stages

| # | Stage | Status |
|---|---|---|
| 1 | Design system & application foundation | **Complete** |
| 2 | 500-level roadmap | **Complete** |
| 3 | Lesson engine + Levels 1–10 | **Complete** |
| 4 | Gamification (XP, stars, achievements, streaks, daily challenges) | **Complete** |
| 5 | Sheet music library + viewer | **Complete** |
| 6 | Accounts & persistent progress | **Complete** — tested on a real Supabase project (setup steps in PROGRESS.md) |
| R1 | **Remodel step 1:** listening engine + tuner | **Complete** (tested with synthetic sound; real-instrument check by the owner) |
| — | Welcome questions (instrument, experience) + personalised app: only the chosen instrument's pieces, tuner and (soon) lessons | **Complete** |
| — | Install on Home Screen (PWA): manifest, branded icons, safe service worker, device-aware illustrated guide at /install | **Complete** (real-device installs to be checked by the owner) |
| R2 | Remodel: play-along assessment — score marks notes green/red as you play; count-in, metronome, backing tracks | **Complete** (tested with synthetic playing; real-instrument check by the owner) |
| R3 | Remodel: instruments (violin, viola, cello, bass), fingering, tutorial → try it → play test lesson flow; first 10 playing levels per instrument; theory at fixed random positions | **Complete** (synthetic testing; real-instrument check by the owner) |
| R4 | Remodel: 500-level map for playing (6 worlds, 50 units) + all of World 1 (Levels 1–100) for every instrument; every level harder than the last | **Complete** |
| R5 | All 500 levels for all four instruments — mostly real public-domain songs, every level harder than the last, Vivaldi’s Spring at Level 500 | **Complete** (songs to be checked by a musician) |
| R6 | All 36 theory lessons (clefs, note names, rhythm, keys, intervals, chords, expression, string terms, Vivaldi) with engraved notation | **Complete** |
| 7 | Advertising integration (Google AdSense, consent first, non-personalised, never during learning) | **Built** — goes live once the owner adds an AdSense publisher ID (see “Advertising”) |
| 8 | Full application testing | **Complete** — see PROGRESS.md (2 bugs fixed; real-mic, account and real-ad checks left to the owner) |

**Direction (2026-11-15):** Stave is being remodelled into a string-orchestra tutor. Each playing level teaches something new, then listens to the student play and scores pitch and rhythm. A note within **±20 cents** counts as in tune by default (`src/audio/tolerance.ts`).

## What works today

- All 9 sections plus world syllabus pages, level pages and a 404 page; responsive at phone, tablet and desktop widths.
- Roadmap: all 500 levels on a winding path across six worlds. Each node shows number, status (current / completed / locked), stars earned and a 6-step difficulty indicator. Checkpoints every 10 (square nodes), milestones every 50 (ringed), major milestones at 100–500 (double ring), unit labels. Opens scrolled to the current level; "Jump to Level N" and world shortcuts; `#level-N` deep links.
- **Lessons for Levels 1–10** (Unit 1, The Staff): Meet the Staff · Counting the Lines · Counting the Spaces · Line Notes and Space Notes · Naming a Note’s Position · Higher and Lower · Steps · Skips · Reading Melodic Shape · Checkpoint. Each has an objective, an introduction, 2–3 illustrated lesson pages, 3–4 guided practice questions and a 5–8 question challenge.
- **Lesson engine:** guided practice gives unlimited tries; every wrong answer gets feedback specific to the mistake, and you can't continue until you answer correctly. The challenge allows one try per question, explaining each answer. Star rules are shown before the challenge: pass (60%, or 70% for checkpoints) = ★, 80% = ★★, 100% = ★★★. Passing saves the result, unlocks the next level and offers Continue / Back to roadmap / Practice again. Failing lists the missed questions with explanations and lets you retry immediately. Replays keep the best result. Leaving mid-lesson asks for confirmation. Two question types: multiple choice (number keys 1–9 + Enter) and tap-a-line-or-space on the staff (arrow keys + Enter).
- **XP** (each reward is paid once, enforced by a unique key per award): level +20 (checkpoint +40); +5 per star you earn; Level 50s +50 and World completions +100; daily challenge +15 once a day; first practice set each day +5; streaks of 3/7/14/30 days +10/+25/+50/+100. Replays only earn XP for stars you didn't have before. Failed attempts earn nothing. Progress saved before XP existed is credited retroactively, once.
- **Achievements:** 16 badges evaluated against real progress after every activity (First Lesson, Ten Levels, First Perfect Score, Staff Star, Daily Start, Seven-Day Rhythm, Steady Reader, …), saved with the date earned. The Achievements page shows earned dates and "7 of 10"-style progress for the rest.
- **Streaks:** any finished lesson, daily challenge or practice set counts. One rest day between practice days never breaks a streak; today never counts against you; your best streak is kept forever. Messages are encouraging ("Start a new streak today — your best is 12 days").
- **Daily challenge** (`/practice/daily`): 5 review questions from levels you've completed, favouring the ones with fewer stars, fixed for the day. Any finish counts; missed questions link back to their lessons.
- **Celebrations:** passing a level opens an overlay over a dimmed page: stars appear one by one, XP counts up with a breakdown, the next level unlocks, badges and streak changes are announced, with subtle notation-shaped confetti. Every 50th level gets a gold milestone variant. With reduced motion (OS setting or Settings → Motion → Reduce) there is no confetti and no animation, and numbers appear immediately.
- **Sheet music library** (`/library`): 27 scores — 13 public-domain works (Beethoven, Petzold, Pierpont and traditional tunes) and 14 Stave originals — covering all five difficulty levels, treble/bass/alto/percussion clefs and meters from 2/4 to 7/8. Search (title, composer, instrument, description; accent- and case-insensitive; every word must match), filters for instrument, difficulty and genre with live counts (empty options disabled), sorting, shareable URLs. Tabs for Favourites, Collections (create, rename, delete with confirmation, add/remove scores; validated names) and Recently opened. Lazy-rendered notation previews on every card. Home recommends scores for your current world.
- **Instrument parts generated per score:** concert pitch, B♭ (trumpet, clarinet — up a major second), E♭ alto sax (up a major sixth), bass clef (octave down) and alto clef (viola), with correct note spelling and key signatures. An instrument is listed only if the part fits its range.
- **Score viewer** (`/library/:id`): engraved with VexFlow; paged layout that reflows to the screen (A4-shaped pages on desktop, one screenful per page on phones); zoom 75–200%; previous/next page; keyboard ← → and + −; full screen (explains itself if the browser refuses); Print / save as PDF (prints every page); Download SVG (with licence comment); all print/download actions appear only when the licence allows. Each score page shows provenance and licence.
- Sequential unlocking: only the current level and completed levels can be opened, from the roadmap or by URL (`/level/N` for a locked level explains why it is locked). Replays keep the best stars and score and never unlock anything.
- Home: greeting, current level/unit, Continue/Start learning (opens the current level's lesson), journey stats, today's practice with a 7-day strip, honest empty states for badges and the library.
- Learn: six worlds with level ranges and progress; each world page lists its 10 (or 5) units with outcomes and topics.
- Practice: a real note-identification drill (treble C4–A5) with explanations for every answer, keyboard support (A–G, Enter), a 5-note set that records the day for the streak, a month calendar and lifetime accuracy.
- Profile: validated nickname, saved on the device. Settings: theme (system/light/dark), notation size, motion (system/reduce/full), and a confirmed device reset.

## Known limitations

- **Installing (PWA)** needs Stave to be served over https (localhost works for development). On iPhone/iPad the Home Screen app has its own storage — students should sign in to keep progress. The service worker only runs in production builds; to regenerate icons run `python3 scripts/make-icons.py`.

- **Play-along** needs headphones for the cleanest results when a backing track is on (the app also keeps the backing from doubling the student's note). Device audio latency varies; timing is judged generously and a calibration step may be added.
- **Listening** judges one note at a time (pitch and, later, timing). It cannot judge bowing, posture, tone quality, or two notes at once (double stops/chords). It needs a microphone, a secure (https or localhost) page and a fairly quiet room. Accuracy was measured on synthetic bowed-string/voice sounds (worst error: violin 0.4, viola 0.2, cello 0.4, double bass 1.1 cents); it has not yet been checked by us with a real instrument.

- **Library size:** 27 scores (no Religious or Jazz pieces yet — those filters show 0). Melodies only (single staff); no piano grand-staff or ensemble scores yet. No PDF file download — use Print → Save as PDF; SVG download is available.
- **Not testable here:** the browser print dialog itself (print content is verified), and full screen inside the in-app test browser (the host refuses the permission; the viewer now explains this). Both use standard browser APIs.

- (Fixed) A stale dialog `close` event could dismiss a newly opened celebration; see PROGRESS.md for the investigation.

- **All 500 levels have content** (464 playing levels per instrument + 36 theory lessons). The songs were written from memory and should be checked by a musician, especially Vivaldi's Spring. Scoring with a real microphone still needs the owner's check on a real instrument.
- The XP history keeps the latest 100 events and learning history the latest 200 attempts (XP totals and badges are unaffected).
- Unit 1 draws its own staff (no clef yet, by design — clefs are taught in Unit 3). VexFlow is used for clef-based notation elsewhere.
- **Advertising is built but off** until a real AdSense publisher ID is configured. No ads (real or fake) show in the production build without it.

## Advertising

Stave shows at most **one** ad, at the bottom of browsing pages (Home, Learn, Roadmap, Library list, Practice, Progress, Achievements, Profile, Settings). There are **never** ads on lessons and play tests (`/level/…`), the tuner, the play-along, the daily quiz, a score being read, the welcome screen or the install guide.

- **Consent first:** a banner asks “Show ads / No ads”. Nothing from Google loads before “Show ads”; “No ads” loads nothing. Students can change it in Settings → Privacy & data.
- **Non-personalised only:** `requestNonPersonalizedAds = 1` is set before any ad request (per Google’s AdSense help, answer 9042142). Google may still use cookies for frequency capping and fraud prevention, and the banner says so.
- **To go live (owner):**
  1. Create an AdSense account and get the site approved (I can’t do this for you).
  2. Create a display ad unit.
  3. Set `VITE_ADSENSE_CLIENT=ca-pub-…` and `VITE_ADSENSE_SLOT=…` in the hosting environment (or `.env.local`), then build. `ads.txt` is generated automatically only when the ID is set.
- **Children:** many students may be under 13. Google’s docs show age (child) treatment for Ad Manager tags (`tagForAgeTreatment`), but **not** for the AdSense async tag used here. Before going live, check in AdSense how to apply child-directed treatment to the site, and check the rules where you launch (e.g. COPPA in the US, the UK Children’s Code, GDPR in the EU). In the EEA/UK/Switzerland, Google requires a Google-certified consent platform (CMP); Stave’s own banner is not certified, so use AdSense’s Privacy & messaging tool there.
- VexFlow adds a ~314 kB (gzipped) chunk, loaded only on pages that show notation.

## Testing

Play-along (`src/play/`): 40 tests that synthesise whole performances (with deliberate wrong, flat, sharp, early, late and skipped notes, vibrato, noise, and backing-track bleed) and run them through the real pitch detector and assessment. DEV-only synthetic performer for browser tests.

Listening (`src/audio/`): 36 unit tests with synthesised bowed-string, weak-fundamental and voice-like sounds — every open string of all four instruments, every chromatic note across the violin and double-bass ranges, sharp/flat offsets, vibrato, noise, silence and pure noise (no false notes), speed (bass window well under 8 ms per analysis). In the browser, a DEV-only synthetic source (`localStorage.setItem('stave:dev-test-tone','1')`, never in production builds) drives the real tuner UI.

`npm test` runs 112 unit tests:
- **progression** (7): no skipping, invalid input, replay keeps best, all 500 in order.
- **level model** (6): 500 levels, world boundaries, checkpoint/milestone placement, difficulty never decreases.
- **lesson engine** (6): phase flow, practice retry rules, challenge one-try rule, star scoring, and that the thresholds shown to students agree with the scoring for every challenge length and pass mark.
- **XP and rewards** (15): first pass, checkpoint, replay with same/fewer/more stars, history, locked levels, milestones once, practice/daily once per day, streak bonuses once (including across a rest day), broken streaks never remove XP, badges unlock once from real progress, migration credits old progress exactly once.
- **streaks** (9): today never breaks a streak, one rest day forgiven, two missed days end the run, best kept, month boundaries, future dates ignored.
- **daily challenge** (5): empty before Level 1, 5 distinct questions only from completed levels, stable for the day, changes daily, favours weaker levels.
- **music** (8): pitch parsing, spelling-correct transposition, key-signature transposition; layout places every measure once, within the line, on correctly sized pages at four widths.
- **catalogue** (37): every one of the 27 scores is notationally valid (every bar adds up, pickups balanced), licensing/provenance complete, playable by at least one instrument, drums only for percussion, every listed instrument family covered, transposed parts correct (B♭ in A major, E♭ in E major, bass clef an octave down), rhythms unchanged by transposition, range limits respected.
- **library search** (6) and **library activity** (2): title/composer/accents, all words must match, combined filters, sort orders, facet counts; opening scores tracks recent/distinct opens, pays no XP, unlocks Sheet Music Explorer at 25.
- **lesson content** (11): Levels 1–10 present and in Unit 1; unique titles, objectives and question ids; all four parts in every lesson; every answer key valid; every wrong option has specific feedback; every step/skip arc label matches the drawn notes; question builders produce correct answers.

**Lesson walkthrough (browser, dev only):** with `npm run dev` open, run this in the browser console:

```js
const { walk } = await import('/scripts/lesson-walk.js');
await walk(1, [[false,false,false,false,false], [true,true,true,true,true]]);
```

It opens the level, pages through the lesson, answers every practice question wrong first (checking the mistake-specific feedback and that you can't continue), then right (checking the explanation), then runs each challenge attempt in the plan and reports the result, stars, unlock and saved record. It reads answers from the lesson files and drives the real UI. `scripts/` is not part of the production bundle.

**Developer tools (dev builds only):** at the bottom of the Roadmap in `npm run dev` there are buttons to complete the current level with 1–3 stars, complete the next 10, attempt a skip (it must be refused), and reset the journey. They are excluded from production builds (verified: not present in `dist/`).

Stage 5 checks (browser): all 117 score parts rendered with every note present (avg 3.9 ms per page, max 16 ms, no errors); zoom 75–200% and page navigation keep all notes across pages; keyboard shortcuts; B♭/E♭/bass parts visually checked; phone (375 px: one screenful per page, no overflow), tablet (768 px) and desktop; dark mode keeps the score page ink-on-paper; print renders the full score into the print area; SVG download is valid SVG with every note and a licence comment; search, filters (including several changed at once), sorting, URL state; favourites, collections, recently opened persist after reload; Sheet Music Explorer unlocks at 25 scores; production build: page load 33 ms, VexFlow fetched only when notation is shown, first viewer page in 125 ms.

Stage 4 checks (browser): fresh Level 1 pass at 2★ → +30 XP, Level 2 unlocked, First Lesson, 1-day streak, all shown in the overlay; replay at 2★ and 1★ → "No new XP"; replay at 3★ → +5 and First Perfect Score; again → nothing; daily challenge +15 and Daily Start, second run that day no XP; practice set +5, second set no XP; injected histories for streak continuing (+10 at 3 days), rest day, broken (best kept) and 7 days across a rest day (+10 and +25 once); Level 50 milestone overlay (+105 XP, Fifty Levels, gold variant); reduced vs full motion (no confetti and ~0 s animations vs confetti and 0.36–0.52 s); reload keeps XP, level, badges and streak identical; old-format progress upgraded once (+90 XP for 3 levels, stable on a second reload); all ten lessons walked again with total XP equal to the computed value (345); overlay fits at 375 px.

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
