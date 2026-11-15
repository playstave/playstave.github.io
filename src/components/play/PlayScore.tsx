import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { layoutScore } from '../../music/layout';
import type { RenderedNote } from '../../music/render';
import type { NoteResult } from '../../play/assess';
import type { PlayExercise, Timeline } from '../../play/exercise';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './PlayScore.module.css';

interface Props {
  exercise: PlayExercise;
  timeline: Timeline;
  results: Map<number, NoteResult>;
  /** Seconds from the first downbeat; called every animation frame while running. */
  getPosition: () => number;
  running: boolean;
  /** Index of the note to outline (e.g. chosen from the results list). */
  focusIndex?: number | null;
}

/**
 * The music for a play-along: every system drawn on one continuous page
 * (long pieces scroll), notes turn green/red as they are judged, and a
 * cursor follows the beat.
 */
export function PlayScore({ exercise, timeline, results, getPosition, running, focusIndex }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const notes = useRef<RenderedNote[]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [error, setError] = useState(false);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    setWidth(Math.floor(el.clientWidth));
    const ro = new ResizeObserver(([e]) => setWidth((w) => (Math.abs(w - e.contentRect.width) > 8 ? Math.floor(e.contentRect.width) : w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw (and redraw on resize).
  useEffect(() => {
    if (!width || !host.current) return;
    let cancelled = false;
    Promise.all([import('vexflow'), import('../../music/render')]).then(([VF, { drawScore }]) => {
      if (cancelled || !host.current) return;
      const drawW = Math.max(300, width);
      const layout = layoutScore(timeline.measures, exercise.clef, exercise.key, drawW, 100000);
      const collect: RenderedNote[] = [];
      const systems = layout.systems.map((_, i) => i);
      const svg = drawScore(VF, host.current, { measures: timeline.measures, clef: exercise.clef, key: exercise.key, time: exercise.time, layout, systems, collect });
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', `${exercise.title}: ${timeline.measures.length} bars of music`);
      notes.current = collect;
      setHeight(Number(svg.getAttribute('viewBox')!.split(' ')[3]));
      // Re-apply colours after a redraw.
      collect.forEach((n, i) => paint(n, results.get(i)));
    }).catch(() => setError(true));
    return () => { cancelled = true; };
  }, [width, exercise, timeline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Colour notes as results arrive.
  useEffect(() => {
    notes.current.forEach((n, i) => paint(n, results.get(i)));
  }, [results]);

  useEffect(() => {
    notes.current.forEach((n, i) => n.el?.classList.toggle(styles.focus, i === focusIndex));
    if (focusIndex != null) notes.current[focusIndex]?.el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [focusIndex, reduce]);

  // Cursor follows the music.
  useEffect(() => {
    const c = cursor.current;
    if (!c) return;
    if (!running) { c.style.opacity = '0'; return; }
    let raf = 0;
    let lastRow = -1;
    let k = 0;
    const tl = timeline.notes;
    const step = () => {
      raf = requestAnimationFrame(step);
      const pos = getPosition();
      const drawn = notes.current;
      if (!drawn.length) return;
      if (pos < 0) { // count-in: wait at the first note
        place(drawn[0].x, drawn[0].top);
        return;
      }
      while (k < tl.length - 1 && pos >= tl[k].end) k++;
      while (k > 0 && pos < tl[k].start) k--;
      const n = drawn[k];
      const nx = drawn[k + 1];
      const frac = Math.min(1, Math.max(0, (pos - tl[k].start) / (tl[k].end - tl[k].start)));
      const x = nx && nx.row === n.row ? n.x + (nx.x - n.x) * frac : n.x + 20 * frac;
      place(x, n.top);
      if (n.row !== lastRow) {
        lastRow = n.row;
        c.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    const place = (x: number, top: number) => {
      c.style.opacity = '1';
      c.style.transform = `translate(${x}px, ${top}px)`;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, timeline, getPosition, reduce]);

  return (
    <div ref={wrap} className={styles.wrap}>
      {error ? <p className={styles.error}>The music couldn’t be drawn. Reload the page to try again.</p> : null}
      <div className={styles.paper} style={{ minHeight: height || 160 }}>
        <div ref={host} className={styles.host} />
        <div ref={cursor} className={styles.cursor} aria-hidden="true" />
      </div>
    </div>
  );
}

function paint(n: RenderedNote, r: NoteResult | undefined) {
  if (!n.el) return;
  n.el.classList.remove(styles.good, styles.bad);
  n.el.removeAttribute('data-verdict');
  if (!r) return;
  n.el.setAttribute('data-verdict', r.verdict);
  n.el.classList.add(r.verdict === 'correct' ? styles.good : styles.bad);
}
