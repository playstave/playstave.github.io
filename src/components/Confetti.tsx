import { useMemo } from 'react';
import styles from './Confetti.module.css';

/**
 * A short fall of notation-shaped pieces: note heads, stems and stars in the
 * brand colours. Purely decorative (aria-hidden); not rendered with reduced motion.
 */
export function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 7) * 90,
    dur: 1400 + ((i * 53) % 900),
    drift: ((i * 29) % 60) - 30,
    rot: (i * 47) % 360,
    kind: ['head', 'star', 'stem', 'head', 'dot'][i % 5],
    tone: ['accent', 'gold', 'ink', 'world'][i % 4],
  })), [count]);
  return (
    <div className={styles.layer} aria-hidden="true" data-confetti>
      {pieces.map((p, i) => (
        <span key={i} className={`${styles.piece} ${styles[p.kind]} ${styles[p.tone]}`}
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}ms`, animationDuration: `${p.dur}ms`, ['--drift' as string]: `${p.drift}px`, ['--rot' as string]: `${p.rot}deg` }} />
      ))}
    </div>
  );
}
