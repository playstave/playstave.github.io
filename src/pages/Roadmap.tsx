import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, PageHeader, ProgressBar } from '../components/ui';
import { Icon } from '../components/Icon';
import { WorldPath } from '../components/LevelPath';
import { LevelDialog } from '../components/LevelDialog';
import { TOTAL_LEVELS, WORLDS } from '../data/curriculum';
import { isCourseComplete, nextLevel } from '../lib/progression';
import { useAppState } from '../state/AppState';
import styles from './Roadmap.module.css';

function scrollToLevel(n: number, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(`level-${n}`);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
  el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : behavior });
}

export function Roadmap() {
  const { progress } = useAppState();
  const [selected, setSelected] = useState<number | null>(null);
  const { hash } = useLocation();
  const current = nextLevel(progress);
  const done = isCourseComplete(progress);

  // Land on the requested level (#level-N) or the current one.
  useLayoutEffect(() => {
    const m = /^#level-(\d+)$/.exec(hash);
    scrollToLevel(m ? Number(m[1]) : current, 'auto');
    // Only on arrival; later progress changes shouldn't yank the page around.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  const goTo = useCallback((n: number) => {
    setSelected(null);
    requestAnimationFrame(() => {
      scrollToLevel(n);
      document.querySelector<HTMLButtonElement>(`[data-level="${n}"]`)?.focus({ preventScroll: true });
    });
  }, []);

  // Restore focus to the node that opened the dialog.
  const [lastOpened, setLastOpened] = useState<number | null>(null);
  const open = useCallback((n: number) => { setLastOpened(n); setSelected(n); }, []);
  useEffect(() => {
    if (selected === null && lastOpened !== null) {
      document.querySelector<HTMLButtonElement>(`[data-level="${lastOpened}"]`)?.focus({ preventScroll: true });
    }
  }, [selected, lastOpened]);

  const completed = Object.keys(progress.completedLevels).length;

  return (
    <div data-manages-scroll>
      <PageHeader
        eyebrow="500 levels"
        title="Roadmap"
        lede={done
          ? <>You have completed all {TOTAL_LEVELS} levels. Any level can be replayed.</>
          : <>You are on <strong>Level {current}</strong>. Levels open one at a time; completed levels can be replayed whenever you like.</>}
      />

      <div className={styles.toolbar}>
        <nav aria-label="Jump to a world" className={styles.worldNav}>
          {WORLDS.map((w) => (
            <a key={w.id} href={`#world-${w.id}`} className={styles.worldChip} style={{ ['--wc' as string]: w.colorVar }}
              onClick={(e) => { e.preventDefault(); document.getElementById(`world-${w.id}`)?.scrollIntoView({ block: 'start' }); }}>
              <span className={styles.chipDot} aria-hidden="true" />{w.id}<span className="visually-hidden">: {w.name}</span>
            </a>
          ))}
        </nav>
        <Button size="sm" icon="roadmap" onClick={() => goTo(current)}>Jump to Level {current}</Button>
      </div>

      <div className={styles.legend} aria-label="Legend">
        <span><i className={`${styles.key} ${styles.keyCurrent}`} />Current</span>
        <span><i className={`${styles.key} ${styles.keyDone}`} />Completed</span>
        <span><i className={`${styles.key} ${styles.keyLocked}`} />Locked</span>
        <span><i className={`${styles.key} ${styles.keyCheck}`} />Checkpoint (every 10)</span>
        <span><i className={`${styles.key} ${styles.keyMile}`} />Milestone (every 50)</span>
        <span className={styles.pipKey}><i /><i /><i /><i /><i /><i />Difficulty</span>
      </div>

      {WORLDS.map((w) => {
        const span = w.lastLevel - w.firstLevel + 1;
        const worldDone = Math.max(0, Math.min(span, progress.currentLevel - w.firstLevel));
        const locked = progress.currentLevel < w.firstLevel;
        return (
          <section key={w.id} id={`world-${w.id}`} className={styles.world} style={{ ['--wc' as string]: w.colorVar }} aria-labelledby={`world-${w.id}-title`}>
            <header className={styles.banner}>
              <span className={styles.bannerNum} aria-hidden="true">{w.id}</span>
              <div className={styles.bannerText}>
                <p className="eyebrow">World {w.id} · Levels {w.firstLevel}–{w.lastLevel}</p>
                <h2 id={`world-${w.id}-title`} className={styles.bannerTitle}>{w.name}</h2>
                <p className={styles.bannerSummary}>{w.summary}</p>
                <div className={styles.bannerProgress}>
                  <ProgressBar value={worldDone} max={span} label={`${w.name}: ${worldDone} of ${span} levels completed`} color={w.colorVar} />
                  <span className="num muted">{worldDone}/{span}</span>
                  {locked && <span className={styles.lockedNote}><Icon name="lock" size={13} /> Opens at Level {w.firstLevel}</span>}
                </div>
              </div>
            </header>
            <WorldPath world={w} progress={progress} onSelect={open} />
          </section>
        );
      })}

      <p className={styles.end}>
        {done ? 'Course complete.' : `${completed} of ${TOTAL_LEVELS} levels complete.`}
      </p>

      {import.meta.env.DEV && <DevTools />}

      <LevelDialog level={selected} progress={progress} onClose={() => setSelected(null)} onGoTo={goTo} />
    </div>
  );
}

/**
 * Development-only controls for testing progression before lessons exist.
 * Vite removes this from production builds (import.meta.env.DEV is false there).
 */
function DevTools() {
  const { progress, completeLevel, resetJourney } = useAppState();
  const [msg, setMsg] = useState('');
  const cur = progress.currentLevel;
  const run = (fn: () => string) => { try { setMsg(fn()); } catch (e) { setMsg(String((e as Error).message)); } };
  return (
    <aside className={styles.dev} aria-label="Developer tools">
      <p className={styles.devTitle}>Developer tools <span>(dev builds only)</span></p>
      <div className={styles.devRow}>
        {[1, 2, 3].map((s) => (
          <Button key={s} size="sm" variant="secondary" disabled={cur > TOTAL_LEVELS}
            onClick={() => run(() => { const r = completeLevel(cur, s, 50 + s * 15); return `Completed Level ${cur} with ${s}★${r.unlockedNext ? `, unlocked Level ${r.state.currentLevel}` : ''}.`; })}>
            Complete L{Math.min(cur, TOTAL_LEVELS)} {'★'.repeat(s)}
          </Button>
        ))}
        <Button size="sm" variant="secondary" disabled={cur > TOTAL_LEVELS}
          onClick={() => run(() => { let n = cur; const end = Math.min(TOTAL_LEVELS, cur + 9); for (; n <= end; n++) completeLevel(n, ((n % 3) + 1), 80); return `Completed Levels ${cur}–${end}.`; })}>
          Complete next 10
        </Button>
        <Button size="sm" variant="secondary"
          onClick={() => run(() => { completeLevel(cur + 1, 3, 100); return 'unexpected'; })}>
          Try to skip to L{cur + 1}
        </Button>
        <Button size="sm" variant="danger" onClick={() => run(() => { resetJourney(); return 'Journey reset to Level 1.'; })}>Reset journey</Button>
      </div>
      <p className={styles.devMsg} role="status">{msg}</p>
    </aside>
  );
}
