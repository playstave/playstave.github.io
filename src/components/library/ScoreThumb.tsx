import { useEffect, useRef, useState } from 'react';
import { partsFor, type ScoreSource } from '../../music/score';
import { layoutScore } from '../../music/layout';
import { drawScore } from '../../music/render';
import styles from './ScoreThumb.module.css';

/** First bars of a score, engraved only when the card scrolls into view. */
export function ScoreThumb({ score }: { score: ScoreSource }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || !ref.current) return;
    let cancelled = false;
    import('vexflow').then((V) => {
      if (cancelled || !ref.current) return;
      const part = partsFor(score)[0];
      const measures = part.measures.slice(0, score.pickup ? 3 : 2);
      const layout = layoutScore(measures, part.clef, part.key, 420);
      drawScore(V, ref.current, { measures, clef: part.clef, key: part.key, time: score.time, layout, systems: [0] });
      ref.current.dataset.rendered = 'true';
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [visible, score]);
  return <div ref={ref} className={styles.thumb} aria-hidden="true" />;
}
