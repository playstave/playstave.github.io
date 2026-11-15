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
- Celebration overlay could be closed by a stale native `close` event from a previous overlay (see investigation below)
- XP count-up stayed at "+0" when the tab was in the background (rAF paused) → timer guarantees the final value
- Walkthrough script couldn't restart a lesson already on screen → navigates away first (test tooling only)

### Celebration popup investigation (2026-11-14, after Stage 4) — ROOT CAUSE FOUND AND FIXED
Symptom: twice during Stage 4 testing the celebration overlay was found closed without the student dismissing it.

How it was investigated:
- Listed every close path: app state cleared (✕, the two links, backdrop click, resetJourney/resetDevice, AppShell clearing it on pathname change) or the browser closing the native `<dialog>` (Escape / close request → `close` event → `onClose`).
- Added dev-only tracing (`window.__celebrationLog`, stripped from production builds) recording opens, cancel/close events, visibility changes and who called dismiss.
- Tried each suspect: page-visibility flips caused by screenshots of the hidden pane, viewport changes (phone/tablet/desktop emulation), window resize events, navigation, React re-renders/HMR. None of these closed the overlay on their own.

Root cause (reproduced on the unfixed code): a **stale native `close` event**. `dialog.close()` dispatches its `close` event later, as a queued task; in a throttled/hidden tab that was ~1 s later. When a celebration was cleared (e.g. by navigating) and a new one opened before that event arrived, the late event ran `onClose → dismissCelebration()` and closed the *new* celebration ~300 ms after it appeared. Both original sightings followed exactly this pattern (an earlier overlay had just been closed before the new one opened).

Fix: the native `close` handler now dismisses only if the dialog is actually closed at that moment (`if (ref.current?.open) ignore`). Applied to CelebrationOverlay, LevelDialog and the mobile More sheet, which share the pattern. No XP, achievement or streak code changed.

Verification after the fix:
- Race tests ×6 each: ✕ + new celebration in the same tick; navigate away + immediate new completion → 12/12 overlays stayed open (6 stale events logged as ignored).
- Every legitimate dismissal still works: ✕, backdrop click, Escape (real key), Continue to Level N (navigates), Back to roadmap, sidebar navigation.
- Overlay left open ~20 s through screenshots, visibility flips, tablet↔desktop viewport changes and resize events → open throughout.
- 20 real lesson completions (Levels 1–10 twice, fresh student) → overlay appeared every time and was only closed by the next navigation; total XP 370 matched the hand-computed value.
- Milestones: Level 50 and Level 100 reached twice (via bursts of rapid completions, 49 back-to-back single completions, and dismiss-then-race) → milestone overlay open at 1.5 s and 4 s every time.
- LevelDialog and More sheet: close/reopen in the same tick works; Escape/✕/links still close them.
- 59/59 unit tests, production build passes.

Note for future testing: the in-app browser's screenshot sometimes does not capture the browser top layer (open `<dialog>`s) even when the dialog is open — check `dialog.open` rather than trusting a single screenshot.
Note: a page reload intentionally does not re-show a celebration (it is transient UI); the result itself is already saved.

## Stage 5 — Sheet music library & viewer: COMPLETE (2026-11-14)
- [x] `music/pitch.ts` spelling-correct transposition + key signatures (tests)
- [x] `music/score.ts` compact score format, validation (bars add up), instrument parts with range checks
- [x] `data/scores.ts` 27 scores: 13 public-domain (engraved by Stave, CC0 edition) + 14 Stave originals (CC0); provenance + licence on each
- [x] `music/layout.ts` + `music/render.ts` paged VexFlow engraving (beams, dots, accidentals vs key, pickups, end barline, measure numbers)
- [x] ScoreViewer: zoom, pages, keyboard, full screen, print (all pages), SVG download — permission-gated by licence
- [x] Library: search, instrument/difficulty/genre filters with counts, sort, URL state, favourites, collections, recently opened, lazy previews; Home recommendations
- [x] Progress model: favorites, collections, recentScores, openedScores; `openScore` activity (no XP, not a practice day) → Sheet Music Explorer badge
- [x] 112/112 unit tests; build passes; browser-tested on phone/tablet/desktop; Stage 1–4 regression clean

Bugs found and fixed during Stage 5 testing:
- Score title fell back to a sans font (unquoted family name containing a digit) → quoted
- Phone pages were tall A4 sheets holding ~5 bars → narrow screens use one screenful per page
- Large header buttons pushed the score below the fold on phones → compact buttons
- Changing two filters at once lost one (React Router's setSearchParams doesn't queue) → pending-params ref
- First draw could wait for a delayed ResizeObserver callback → width measured synchronously on mount
- Full screen silently did nothing when the browser refused permission → explains and suggests alternatives

Not verifiable in this environment: the native print dialog (print content verified) and actual full screen (the in-app test browser refuses the permission).

## Stage 6 — Accounts & persistent progress: BUILT, AWAITING CLOUD TEST (2026-11-14)
Decisions: Supabase cloud project (user creates it); username + password sign-up, no email collected.
- [x] `supabase/schema.sql` profiles + progress tables, RLS (own rows only, anon nothing), signup trigger, username_available(), delete_own_account()
- [x] `supabase/rls_check.sql` self-check (run in SQL editor → "ALL CHECKS PASSED")
- [x] `lib/sync/` backend interface, Supabase backend, merge (never loses progress; XP recomputed from award keys), debounced sync engine with offline retry; 14 unit tests (126 total pass)
- [x] Account UI on Profile (sign in / create / sync status / sign out clears device / delete account), sidebar chip, Settings reset signs out first, updated privacy text
- [x] Browser-tested end to end with a DEV-ONLY in-browser mock backend (excluded from prod build): validation, sign-up, sync, sign-out, wrong password, isolation between accounts, device-merge choice, offline + recovery, reload, reset, delete
- [x] Cloud project connected (2026-11-15): project ref `phfbbjmxlqsskfamtgzp` (us-west-2, free). URL + anon key in `.env.local` (git-ignored; service_role never used)
- [x] schema.sql applied; rls_check.sql → "ALL CHECKS PASSED" (after fix below)
- [x] Verified with curl using the anon key: reading `progress` / `profiles` → 401 permission denied; `delete_own_account` → 401 permission denied; `username_available` → works
- [x] App on :5180 uses the real backend (called `username_available` on the project)
- Bug found by rls_check on real Supabase and fixed: students could change their own username. Supabase grants table-wide UPDATE to `authenticated` by default, so the column-level revoke did nothing → now `revoke update` on the table, `grant update (display_name)` only. Also Supabase grants EXECUTE on new functions to `anon` → revoked on `delete_own_account`.
- [x] Auth → "Confirm email" turned OFF (user approved, 2026-11-15; verified after reload)
- [ ] Real sign-up / sign-in / cross-device sync test — done by the user (Claude does not create accounts on external services)

User setup steps (to finish Stage 6):
1. Create a free Supabase project. Auth → Providers → Email: turn OFF "Confirm email" (required: sign-up uses non-deliverable addresses).
2. SQL editor: run `supabase/schema.sql`, then `supabase/rls_check.sql` → expect "ALL CHECKS PASSED".
3. Copy `.env.example` to `.env.local`, fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (never the service_role key). Restart `npm run dev`.
4. In the app: Profile → Create account, play a lesson, sign out, sign in again on another browser → progress should appear.
Open risk to verify: Supabase must accept the `@students.stave.invalid` synthetic emails.

## Next: Stage 7 — Advertising integration (not started)
