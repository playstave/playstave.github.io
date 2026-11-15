import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { useReducedMotion } from '../lib/useReducedMotion';
import { getAchievement } from '../data/achievements';
import { getLevel } from '../data/levels';
import { TOTAL_LEVELS } from '../data/curriculum';
import { Badge } from './Badge';
import { Confetti } from './Confetti';
import { Icon } from './Icon';
import styles from './CelebrationOverlay.module.css';

/** Counts up to `to` over ~900ms; jumps straight there with reduced motion. */
function useCountUp(to: number, reduce: boolean) {
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce || to === 0) { setV(to); return; }
    let raf = 0;
    const start = performance.now() + 700; // after the stars
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / 900));
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // rAF pauses in background tabs; make sure the final number always lands.
    const done = setTimeout(() => setV(to), 1800);
    return () => { cancelAnimationFrame(raf); clearTimeout(done); };
  }, [to, reduce]);
  return v;
}

function trace(kind: string, detail: string) {
  if (!import.meta.env.DEV) return;
  const w = window as unknown as { __celebrationLog?: string[] };
  (w.__celebrationLog ??= []).push(`${Math.round(performance.now())} ${kind}: ${detail} [${document.visibilityState}]`);
}

const WORLD_END: Record<number, string> = { 100: 'World 1 complete', 200: 'World 2 complete', 300: 'World 3 complete', 400: 'World 4 complete', 450: 'World 5 complete', 500: 'Course complete' };

/**
 * Shown over the page (background dimmed) when a lesson is passed: stars appear
 * one at a time, XP counts up with its breakdown, the next level unlocks, and
 * any badges or milestones are announced. Reduced motion removes all movement.
 */
export function CelebrationOverlay() {
  const { celebration: c, dismissCelebration, derived } = useAppState();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDialogElement>(null);
  const xp = useCountUp(c?.outcome.xpGained ?? 0, reduce);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (c && !d.open) { d.showModal(); trace('open', `level ${c.level}`); }
    if (!c && d.open) { trace('state-close', 'celebration cleared'); d.close(); }
  }, [c]);

  // Dev-only diagnostics: record every way the dialog can close.
  useEffect(() => {
    const d = ref.current;
    if (!d || !import.meta.env.DEV) return;
    const onCancel = (e: Event) => trace('cancel-event', `cancelable=${e.cancelable}`);
    const onCloseEv = () => trace('close-event', `returnValue=${d.returnValue}`);
    const onVis = () => trace('visibility', document.visibilityState);
    d.addEventListener('cancel', onCancel);
    d.addEventListener('close', onCloseEv);
    document.addEventListener('visibilitychange', onVis);
    return () => { d.removeEventListener('cancel', onCancel); d.removeEventListener('close', onCloseEv); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // The native `close` event is dispatched as a queued task after close(). If a
  // new celebration reopened the dialog in the meantime, that late event belongs
  // to the previous one and must not dismiss the new one. Only dismiss when the
  // dialog is genuinely closed now (Escape, or a real close request).
  const onNativeClose = () => {
    if (ref.current?.open) { trace('stale-close-ignored', 'dialog already reopened'); return; }
    dismissCelebration();
  };

  const o = c?.outcome;
  const milestone = o?.milestone;
  const next = c ? c.level + 1 : 0;
  const unlockedNext = !!o?.completion?.unlockedNext && next <= TOTAL_LEVELS;
  const replay = !!o?.completion?.replay;
  const level = c ? getLevel(c.level) : undefined;

  return (
    <dialog ref={ref} className={`${styles.dialog} ${milestone ? styles.milestone : ''}`} aria-labelledby="celebrate-title" onClose={onNativeClose}
      onClick={(e) => { if (e.target === e.currentTarget) dismissCelebration(); }} data-celebration={milestone ? 'milestone' : 'lesson'}>
      {c && o && (
        <div className={styles.inner} style={{ ['--wc' as string]: level?.world.colorVar }}>
          {!reduce && <Confetti count={milestone ? 40 : 24} />}
          <button type="button" className={styles.close} onClick={dismissCelebration} aria-label="Close and view results"><Icon name="close" /></button>

          {milestone ? (
            <>
              <p className={styles.milestoneTag}>Milestone · Level {milestone}</p>
              <h2 id="celebrate-title" className={styles.title}>{WORLD_END[milestone] ?? `${milestone} levels complete`}</h2>
            </>
          ) : (
            <>
              <p className="eyebrow">Level {c.level}{level?.isCheckpoint ? ' · Checkpoint' : ''}</p>
              <h2 id="celebrate-title" className={styles.title}>{c.stars === 3 ? 'Perfect!' : replay ? 'Well played' : 'Level complete'}</h2>
            </>
          )}

          <div className={styles.stars} role="img" aria-label={`${c.stars} of 3 stars`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < c.stars ? styles.starOn : styles.starOff} style={{ animationDelay: `${150 + i * 220}ms` }}>
                <Icon name="star" size={44} filled={i < c.stars} />
              </span>
            ))}
          </div>
          <p className={styles.score}>Score {c.score}%</p>

          <div className={styles.xpBox}>
            {o.xpGained > 0 ? (
              <>
                <p className={styles.xp} aria-label={`${o.xpGained} XP earned`}><span aria-hidden="true">+{xp}</span> <span className={styles.xpUnit}>XP</span></p>
                <ul className={styles.breakdown}>
                  {o.awards.map((a) => <li key={a.key}><span>{a.reason}</span><span className="num">+{a.amount}</span></li>)}
                </ul>
              </>
            ) : (
              <p className={styles.noXp}>No new XP this time — your best result was already rewarded. Beat your best star count to earn more.</p>
            )}
          </div>

          {unlockedNext && <p className={styles.unlock}><Icon name="check" size={16} /> Level {next} unlocked</p>}
          {o.streak.after > o.streak.before && <p className={styles.streak}><Icon name="flame" size={16} /> {o.streak.after}-day streak</p>}

          {o.unlocked.length > 0 && (
            <ul className={styles.badges} aria-label="Badges earned">
              {o.unlocked.map((id) => { const a = getAchievement(id); return a ? (
                <li key={id}><Badge a={a} unlocked /><div><p className={styles.badgeTitle}>Badge earned: {a.title}</p><p className={styles.badgeBody}>{a.criteria}</p></div></li>
              ) : null; })}
            </ul>
          )}

          <div className={styles.actions}>
            {next <= TOTAL_LEVELS && derived && (
              <Link to={`/level/${next}`} className={styles.primary} onClick={dismissCelebration}>
                Continue to Level {next} <Icon name="arrow-right" size={18} />
              </Link>
            )}
            <Link to={`/roadmap#level-${c.level}`} className={styles.secondary} onClick={dismissCelebration}>Back to roadmap</Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
