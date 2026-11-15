/**
 * Browser-driven lesson walkthrough (dev only — not part of the app bundle).
 *
 * In the running dev app, open the browser console and run:
 *   const { walk } = await import('/scripts/lesson-walk.js');
 *   await walk(1, [[false,false,false,false,false], [true,true,true,true,true]]);
 *
 * walk(n, plan) opens /level/n, pages through the lesson, answers every practice
 * question wrongly first (checking the specific feedback), retries, answers it
 * correctly (checking the explanation), then runs one challenge attempt per entry
 * in `plan` (true = answer that question correctly). It throws on the first
 * mismatch between what the lesson data says and what the UI shows.
 */
export async function walk(n, plan) {
  const { LESSONS } = await import('/src/lessons/index.ts');
  const L = LESSONS[n];
  if (!L) throw new Error(`No lesson for level ${n}`);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const btn = (t) => [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === t || b.textContent.trim().startsWith(t));
  const click = async (t) => { const b = btn(t); if (!b) throw new Error(`L${n}: no button "${t}" (h2=${document.querySelector('main h2')?.textContent})`); b.click(); await wait(60); };
  const text = () => document.querySelector('main').innerText;
  const go = async (path) => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); await wait(350); };
  const answer = async (q, correct) => {
    if (q.kind === 'choice') {
      const idx = correct ? q.options.findIndex((o) => o.id === q.answer) : q.options.findIndex((o) => o.id !== q.answer);
      document.querySelectorAll('[aria-label="Answers"] [role=radio]')[idx].click();
      await wait(40);
      return q.options[idx];
    }
    const pos = correct ? q.answer : (q.answer + 1) % 9;
    document.querySelectorAll('[aria-label^="Lines and spaces"] [role=radio]')[pos].click();
    await wait(40);
    return pos;
  };

  if (location.pathname === `/level/${n}`) await go('/roadmap'); // force a fresh lesson
  await go(`/level/${n}`);
  if (!document.querySelector('h1')?.textContent.includes(L.title)) throw new Error(`L${n}: wrong page "${document.querySelector('h1')?.textContent}"`);
  await click(btn('Begin lesson') ? 'Begin lesson' : 'Practice again');
  for (let i = 0; i < L.steps.length; i++) {
    if (!text().includes(L.steps[i].title)) throw new Error(`L${n}: step ${i + 1} missing`);
    await click(i === L.steps.length - 1 ? 'Start practice' : 'Next');
  }
  let practiceChecked = 0;
  for (let i = 0; i < L.practice.length; i++) {
    const q = L.practice[i];
    if (!text().includes(q.prompt)) throw new Error(`L${n}: practice ${q.id} prompt missing`);
    const wrong = await answer(q, false); await click('Check');
    const expected = q.kind === 'choice' ? wrong.feedback : 'You tapped';
    if (!text().includes('Not quite') || !text().includes(expected)) throw new Error(`L${n}: ${q.id} wrong-answer feedback missing`);
    if (text().includes(q.explanation)) throw new Error(`L${n}: ${q.id} practice revealed the answer after a wrong try`);
    if (btn('Continue') || btn('On to the challenge')) throw new Error(`L${n}: ${q.id} could continue after a wrong practice answer`);
    await click('Try again');
    await answer(q, true); await click('Check');
    if (!text().includes('Correct') || !text().includes(q.explanation)) throw new Error(`L${n}: ${q.id} correct feedback missing`);
    await click(i === L.practice.length - 1 ? 'On to the challenge' : 'Continue');
    practiceChecked++;
  }
  const res = [];
  for (const pattern of plan) {
    if (!text().includes('Ready for the challenge?')) throw new Error(`L${n}: no challenge briefing`);
    await click('Start the challenge');
    for (let i = 0; i < L.challenge.length; i++) {
      const q = L.challenge[i];
      if (!text().includes(q.prompt)) throw new Error(`L${n}: challenge ${q.id} prompt missing`);
      const ok = pattern[i];
      const chosen = await answer(q, ok); await click('Check');
      if (!text().includes(ok ? 'Correct' : 'Not quite') || !text().includes(q.explanation)) throw new Error(`L${n}: ${q.id} challenge feedback wrong`);
      if (!ok && q.kind === 'choice' && !text().includes(chosen.feedback)) throw new Error(`L${n}: ${q.id} challenge wrong-option feedback missing`);
      if (btn('Try again')) throw new Error(`L${n}: retry offered in the challenge`);
      await click(i === L.challenge.length - 1 ? 'See results' : 'Continue');
    }
    await wait(200);
    const r = {
      result: document.querySelector('[data-result]')?.dataset.result,
      stars: document.querySelector('[role=img][aria-label$="of 3 stars"]')?.getAttribute('aria-label'),
      line: text().match(/\d+ of \d+ correct · \d+%/)?.[0],
      unlocked: text().match(/Level \d+ is now unlocked/)?.[0] ?? null,
    };
    if (r.result === 'fail') {
      r.reviewItems = document.querySelectorAll('[aria-label="Questions to review"] li').length;
      await click('Try the challenge again');
    }
    res.push(r);
  }
  const stored = JSON.parse(localStorage.getItem('stave:progress') || '{}');
  return { level: n, title: L.title, steps: L.steps.length, practiceChecked, attempts: res, saved: { currentLevel: stored.currentLevel, record: stored.completedLevels?.[n] ?? null } };
}
