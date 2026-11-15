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

## Stage 6 — Accounts & persistent progress: COMPLETE (2026-11-15)
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
- [x] Real sign-up / sign-in / sign-out tested by the user (2026-11-15). Database shows 1 account with a synthetic `@students.stave.invalid` email (so Supabase accepts those addresses — open risk closed), its profile row, and a progress row (version 2)
- [x] Progress sync confirmed: after the user finished Level 1 while signed in, the cloud row shows xp 25, currentLevel 2 (matches the app)

User setup steps (to finish Stage 6):
1. Create a free Supabase project. Auth → Providers → Email: turn OFF "Confirm email" (required: sign-up uses non-deliverable addresses).
2. SQL editor: run `supabase/schema.sql`, then `supabase/rls_check.sql` → expect "ALL CHECKS PASSED".
3. Copy `.env.example` to `.env.local`, fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (never the service_role key). Restart `npm run dev`.
4. In the app: Profile → Create account, play a lesson, sign out, sign in again on another browser → progress should appear.
Open risk to verify: Supabase must accept the `@students.stave.invalid` synthetic emails.

## Remodel — string-orchestra tutor (decided 2026-11-15)
Owner's direction: instrument tabs (violin, viola, cello, double bass) with fingering; each playing level teaches something new (fingering, notes, terms like ritardando) and then a play test where the app listens and scores pitch + rhythm; 30–40 of the 500 levels are theory, at random positions (fixed seed: same for every student, never moves under saved progress); every other level is a play-along level (tutorial, then listen + green/red); difficulty from very easy to near-impossible at 450–500 (always taught first), and pieces get longer as levels get harder (a few bars early, multi-page pieces near the top); tuner; play-along with library scores. In tune = within ±20 cents by default ("don't make it too harsh"). Singing: mentioned earlier, not yet confirmed as a track.
Core experience (owner, 2026-11-15): play-along assessment — music on screen, the app listens and marks each note green (correct) or red (wrong pitch or timing); some exercises with a backing track; a tutorial before every lesson on whatever is new in it. Original product; do not copy any existing app's name, look or content.
Build order (revised): R1 listening + tuner → R2 play-along assessment engine (green/red notes, count-in, metronome, backing tracks) → R3 instruments + fingering + tutorial→play-test lesson flow → R4 500-level map + first levels → R5 remaining levels in batches → Stage 7 ads → Stage 8 full testing.

### R1 — Listening engine + tuner: COMPLETE (2026-11-15)
- [x] `src/audio/pitch.ts` McLeod pitch method, FFT autocorrelation (`fft.ts`), multi-period refinement for high notes; `notes.ts` (Hz/MIDI/cents, four instruments' tunings, sounding pitch); `tracker.ts` (confirm over 3 frames, trimmed mean in cents for vibrato, hold/clear); `tolerance.ts` (±20 default, ±10/±5 optional)
- [x] `input.ts` Listener: mic with echo cancellation / noise suppression / auto gain OFF; 30 analyses/s on a timer; releases the mic on stop, unmount and when the page is hidden; states: denied / unsupported (incl. insecure page) / no device / error; reference tone (listening pauses while it plays); nothing recorded or sent
- [x] `/tuner` page (nav "Tuner"): instrument tabs, Auto / pick a string / Any note, gauge with in-tune zone, plain advice (tighten/loosen; finger toward bridge/scroll; "that sounds like A4 — play the open G string"), reference pitch A4 430–450, tolerance setting, mic level, privacy note, screen-reader announcements (throttled), saved per device
- [x] 36 audio unit tests (162 total pass); measured worst error over each instrument's range incl. ±30 c offsets, weak fundamentals, noise: violin 0.42 c, viola 0.17 c, cello 0.39 c, bass 1.07 c, no misses
- [x] Browser-tested with the DEV-only synthetic source: A 440/445/447/430, G3, E5, vibrato ±25 c, noise, weak-fundamental D, F4 between strings, wrong string chosen, Any-note C♯5 −12 c, tolerance ±5 vs ±20, A4 = 442, bass low E, cello C, viola C, reference tone pause/resume, stop; phone 375 (no overflow), tablet dark, desktop light; prod build contains no dev-tone code
- Bugs found and fixed: high-note error ~4 c (→ multi-period refinement); vibrato centre off 10 c (median → trimmed mean); one-frame glitch blanked display; analysis loop on requestAnimationFrame froze when the browser stopped painting (→ timer); "loosen by 1400 cents" when the wrong string was played (→ "that sounds like …")
- [ ] Not yet verified with a real microphone/instrument — owner to try a violin (and ideally viola/cello/bass) on the Tuner page

### R2 — Play-along assessment engine: COMPLETE (2026-11-15)
- [x] `src/play/exercise.ts` exercise model (library text format, written pitch; double bass sounds 8vb) → timeline in seconds
- [x] `src/play/assess.ts` per-note verdicts: correct / flat / sharp / early / late / wrong-note (named at written pitch) / missed; ±20 c default; timing window 30% of a beat (0.12–0.25 s); repeated notes found by level rise after the bow change; pitch-less attack (scratch, or backing chord) counted as part of the start; a late start may run past the written end only if it holds that note; summary (green %, pitch %, rhythm %), stars 85/70/50; kind explanations
- [x] `src/play/backing.ts` chord symbols → block / pulse / drone backing; leaves out any chord tone matching the student's current note (unison/octave) so speaker bleed can't fake a green note; `sound.ts` synthesised clicks + piano-like voice on the audio clock
- [x] `src/play/session.ts` count-in (one bar), metronome, backing, mic (processing off), 30 analyses/s, latency correction (output + base + 20 ms, plus offset hook for calibration), notes judged live as soon as each one is past; stop/abort; mic released on stop, finish, unmount, hidden page
- [x] UI: `/play` (instrument tabs, 12 original demo pieces — 3 per instrument) and `/play/:id` with `PlayAlongPlayer` + `PlayScore` (whole piece on one scrolling page, cursor follows the beat, notes turn green/red live, live tip for the latest red note, slower 75% option, metronome/backing toggles, headphones tip, results card with stars, pitch/rhythm %, "notes to work on" list that highlights the note)
- [x] 40 play-along tests: synthesised performances through the real pitch detector — clean takes all green (incl. vibrato, noise, cello, bass, fast eighths, every demo piece); each mistake type marked on exactly the right note; skipped note → missed; latency up to 100 ms tolerated; backing audible → clean take ≥90% green and mistakes still caught; backing alone → zero green notes
- [x] Browser-tested with a DEV-only synthetic performer (perfect / mistakes / silent, optional speaker bleed): violin First steps 100% live, mistakes (wrong, flat, late, skipped) all marked correctly with and without bleed; bass Morning Walk 100% and mistakes; cello repeated open strings 100%; silence → all missed; slower speed (92→69); stop mid-take; phone 375 (no overflow, one bar per line), tablet dark, desktop; production bundle contains no dev code
- Bugs found and fixed: early entry hidden by its own attack being taken as a second start; backing chord attacks made on-time notes look late; skipped note reported as "heard <next note>"; bass wrong note named at sounding pitch; player grid overflowed on phones
- [ ] Not yet verified with a real microphone and instrument — owner to try the Play-along page (ideally with headphones for backing tracks)
- Known limits: one note at a time (no double stops/chords); fast passages on double bass are limited by its longer analysis window (85 ms); real devices' audio latency differs — a calibration step may be needed (hook exists: `latencyOffset`)

### Welcome questions + personalised experience: COMPLETE (2026-11-15, owner request)
- [x] First visit (any page except Profile/Settings) goes to `/welcome`: 1) which instrument (violin, viola, cello, double bass — original line drawings scaled by size), 2) experience (brand new / a little / for a while), 3) "your plan"; then returns to the page the student asked for. "Already have an account? Sign in" link
- [x] Answers saved in progress (`student: { instrument, experience, setAt }`) → synced to the account; merge keeps the most recent choice; kept when the journey is reset; migration test
- [x] Owner rule "if the person selects violin, only show violin": Play-along lists only that instrument's pieces (another instrument's piece link shows a friendly notice), Tuner shows only that instrument's strings; lessons will follow in R3
- [x] Personalised: Home shows "Learning the cello · I can play a little · Change", "Your first steps on the cello" plan (until 3 levels done), and the hero staff in the instrument's own clef (treble / alto / bass); brand-new players start play-alongs at the slower speed; Settings → "Your instrument" (change instrument / experience); Profile shows the instrument
- [x] Browser-tested on a clean origin (production preview :4173): redirect with return path, step validation, plan per experience, saved answers, other-instrument notice, Play-along/Tuner/Home/Profile personalised, switching to double bass in Settings updates everything, phone 375 layout (fixed the double-bass drawing overflowing its card)
- Note: the existing reading lessons (Levels 1–10) are still treble-clef for everyone until R3 adds instrument-specific lessons

### Install Stave on your Home Screen (PWA): COMPLETE (2026-11-15, owner request)
- [x] `public/manifest.webmanifest` (name, short name, standalone, theme/background colours, start URL, icons incl. maskable); iOS tags (apple-touch-icon, apple-mobile-web-app-*) in `index.html`
- [x] Branded PNG icons drawn from the logo by `scripts/make-icons.py` (no image libraries): 192, 512, maskable 512, apple-touch 180
- [x] `public/sw.js`, production only: same-origin GETs only (Supabase sync never touched); pages network-first (new releases are used straight away; cached page only offline); hashed `/assets/*` cache-first with a size cap; old caches removed on update
- [x] `/install` guide: detects iPhone / iPad (incl. iPads reporting as Mac) / Android / computer and the browser (Safari, Chrome, Edge, Firefox, Samsung Internet, in-app browsers); manual device switch + browser chips; 5 illustrated steps per guide (original schematic SVGs, tap point highlighted); browser-specific notes (iOS 16.4+ for non-Safari browsers, Edit Actions, macOS Add to Dock, Firefox desktop can't install); native "Install Stave" button when the browser offers a prompt; "installed" only shown on the browser's appinstalled event or when running standalone; "how to check it worked"; iPhone/iPad storage notice (Home Screen app has separate storage → sign in)
- [x] Entry points: Settings → "Install Stave" (phone icon); quiet, dismissible tip at the bottom of Home (hidden when installed or dismissed); `/install` reachable before the welcome questions
- [x] Tests: 13 user-agent cases for detection + 3 standalone cases (16 new); browser on the production preview: manifest served as application/manifest+json, all icons 200 at correct sizes, service worker activated, page + assets + notation chunk cached, page renders fully with the server stopped (offline), a rebuilt version is picked up on the first reload (updates not held back), simulated install prompt → accept → "installing" message, appinstalled → "Stave was installed"; no service worker in development; layouts phone 375 (Android UA detected), tablet dark, desktop; Settings entry; Home tip dismiss persists
- [ ] Not verifiable here: real installs on an iPhone/iPad, Android phone and desktop Chrome/Edge (the built-in browser can't install apps or show the native prompt) — owner to try on real devices once Stave is on an https address

### R3 — Instruments, fingering, tutorial → try it → play test: COMPLETE (2026-11-15)
- [x] Course map (`src/course/map.ts`): 36 theory levels at random but FIXED positions (seeded; pinned by tests): 9, 12, 25, 44, 51, 72, 75, 94, 102, 113, …; never Level 1–2, never a checkpoint (every 10th), never two in a row. Every other level is a playing level. The 10 existing reading lessons fill the first 10 theory positions
- [x] Fingering engine (`src/course/fingering.ts`): first-position tables per instrument (violin/viola 1-2-3-4; cello one finger per half step; double bass 1-2-4) + best placement (open strings preferred); `Fingerboard` diagram (strings low→high, open-string markers, finger numbers, new notes highlighted, full text alternative)
- [x] First 10 playing levels for each of the 4 instruments (Levels 1–8, 10, 11), generated from one syllabus with each instrument's own strings, clef, register and fingers: open D; next string up; crossing; next string down + rests; all four strings; 1st finger E; F♯ + key signature (2nd finger violin/viola, 3rd cello, 4th bass); G + first tune (bass: open G string); checkpoint "Morning Steps" (8 bars — pieces get longer); waltz in 3/4. New ideas taught: parts, holding, bow hold, open string, whole/half/quarter notes, rests, finger numbers, sharps, key signature, steps, checkpoint, time signature, dotted half
- [x] `PlayLessonPlayer`: intro with "New in this level" → Learn cards (fingerboard / notation / instrument picture, "Hear the note") → Try it (`TryNote`: play each new note while Stave listens; green when held in tune ±20 c for 0.7 s; skippable) → Play test (play-along; ≥50% green = 1 star passes; stars/XP/celebration via the existing completeLevel) → result with "notes to work on"
- [x] LevelPage picks the student's instrument for playing levels; theory levels use the reading lessons; roadmap dialog, Home hero, World page and Profile show each level's own title and type; Notation now draws dotted notes and respects key signatures
- [x] Progress migration to course layout 2: old Levels 1–10 results, history and XP award keys move to the first 10 theory positions (nothing lost, nothing paid twice, applied once, works with sync merge); students continue from the first incomplete level (the new playing Level 1)
- [x] Tests: 49 course tests + 5 migration tests + 2 new assessment tests (275 total pass): every playing level on every instrument is playable in first position and a clean simulated take scores 100%; theory layout pinned
- [x] Browser-tested on a separate test server (owner's data untouched) with the synthetic performer: cello Level 1 full flow (5 cards → try it D3 heard in tune → play test 100%, 3★, +35 XP, Level 2 unlocked, celebration); failing attempt (silence) saves nothing; double bass Levels 7–8 teach 4th finger F♯ and open-string G; Levels 9/12 open the reading lessons; checkpoint with mistakes 19/23 (83%, 2★); result lists the red notes; phone layout
- Bugs found and fixed: skipped note followed by the same pitch was credited as green (now "missed"); a note starting more than 0.5 s late was not marked late; result screen lost the red-note list; fingerboard open-string marker overlapped the string name
- [ ] Not verified with a real instrument (owner)
- Known: World/unit titles on the roadmap are still the original reading syllabus — R4 rewrites the 500-level map for playing; Levels 13+ show "not written yet" until R4/R5

### R4 — 500-level map for playing + all of World 1 (Levels 1–100): COMPLETE (2026-11-15)
- [x] New curriculum (`data/curriculum.ts`): 6 worlds / 50 units for string playing — First Steps (1–100), First Position Fluency (101–200), Shifting (201–300), Upper Positions (301–400), Advanced Technique (401–450), Virtuoso (451–500, ending with Vivaldi's The Four Seasons at Level 500). Skills the mic can't judge (bowing, vibrato, double stops) are marked "taught; not scored"
- [x] Skill badges redefined on the new course (Bright Beginnings, Theory Expert, Rhythm Master, Key Keeper, Checkpoint Champion); earned badges are never removed
- [x] Unit-based level generator (`course/generator.ts`) + World 1 unit specs (`course/world1.ts`, Units 2–10): each level teaches ONE idea (card + fingering for the student's instrument + "Today's piece"), with an original practice piece composed by rule (fixed per level, mostly stepwise, phrase endings, ends on the tonic, I/IV/V backing), every note checked playable in first position; per-instrument registers (e.g. the bass reaches down where first position can't reach up)
- [x] Owner request "every level gets much harder": difficulty is a course-wide curve (tempo, length, busier rhythms, more leaps, fewer long notes; rhythms once learned keep coming back), AND a hard rule — every playing level must score higher than the previous one (score = notes/sec × √bars × (1 + ½·leaps) × (1 + range/36)); the generator picks the gentlest candidate that beats the last level, then lengthens / speeds up / busies the rhythm, with tempo as a guaranteed last step. Hand-written early levels follow the same rule (faster, then "play it twice"). Measured (violin): L13 ♩77, 9 bars, 0.9 notes/s → L50 ♩97, 16 bars, 2.2 n/s → L100 ♩118, 40 bars, 2.7 n/s; score 4.3 → 13.5 → 32.8
- [x] Fingering refinements: violin/viola low 1 / low 2 / high 2 / high 3 labels, cello extended 4th finger; lesson note names spelled with sharps (G♯ not A♭)
- [x] Tests (663 total pass): every World 1 level exists for every instrument; every playing level on every instrument is playable in first position, ends on a note, valid backing, and a clean simulated take scores 100% (372 checks); EVERY playing level is harder than the one before on all 4 instruments; each unit harder than the last; Level 100 the hardest; tempos ≤ 150, bars ≤ 40, ≤ 4.5 notes/s; no duplicate titles
- [x] Browser (separate test server): roadmap shows the new worlds/units; World 1 says "Every lesson in this world is ready"; World 6 plan; generated Levels 37/61/64/97 open with unit intro, idea card, fingering, piece; cello Level 61 played through at 100%; Level 101 explains it isn't written yet
- Bugs found and fixed: repeated eighth notes on bass were marked early (onset taken from the previous identical note); lesson note names used flats (A♭ for G♯)
- Known: first visit to a late level computes the earlier levels once (~0.5 s in development, cached afterwards)

### "Notes turn green without playing" (owner report, 2026-11-15): investigated and fixed
- Cause of the report: the owner was using the separate TEST server tab (localhost:5181) that Claude had left open with the DEV test mode on (`stave:dev-test-tone`), where a simulated player replaces the microphone. Not present in production builds. Test mode switched off in that tab; tab moved to the real app (5180)
- [x] `DevModeBanner`: whenever DEV test mode is on, a red banner on every page says the microphone is not being used, with a "Turn off test mode" button (dev only)
- [x] Real risk found while investigating: backing-track bleed. A full chord implies a phantom low root (D–F♯–A sounds like a low D), which cello and double bass listen for: with nobody playing, cello got up to 3% and bass up to 10% green notes (violin/viola 0%). Fixes: (1) when the student's note is the chord's root, the backing plays one other chord note instead of the full chord; (2) assessment: a note whose pitch never sounds during its own written time can never be "correct" (it is late or missed)
- [x] New `bleed.test.ts`: 10 levels × 4 instruments × 3 speaker types (full range, cut below 180 Hz, cut below 300 Hz), nobody playing → zero green notes (675 tests total pass)
- [x] `MicPermission`: a clear "Allow microphone" step on the play-along player, lesson "Try it" and the Tuner until the browser has permission; explains blocked/unsupported states
- Finding: the desktop app's built-in browser pane reports microphone permission "denied" and offers no way to allow it — listening must be tested in Chrome/Safari/Edge/Firefox (http://localhost:5180)
- Lesson for future sessions: never leave DEV test mode on in a tab the owner can reach; use the banner; stop test servers and close/redirect their tabs

## Next: R5 — World 2 (Levels 101–200): slurs, dynamics, flats, minor keys, sixteenths (needs slur/dynamic notation) — then Worlds 3–6 (positions/shifting, high positions, advanced, Vivaldi)

## Later: Stage 7 — Advertising integration (not started)
