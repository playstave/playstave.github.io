import type { Achievement, BadgeGlyph } from '../data/achievements';
import styles from './Badge.module.css';

/** Glyph artwork, drawn on a 40×40 box centred in the badge. */
function Glyph({ glyph }: { glyph: BadgeGlyph }) {
  const text = (t: string, size = 15) => <text x="20" y="20" textAnchor="middle" dominantBaseline="central" fontSize={size} className={styles.glyphText}>{t}</text>;
  switch (glyph) {
    case 'ten': return text('10');
    case 'fifty': return text('50');
    case 'hundred': return text('100', 13);
    case 'note': return <g><ellipse cx="17" cy="26" rx="5" ry="3.6" transform="rotate(-22 17 26)" /><rect x="20.6" y="11" width="1.8" height="15" /></g>;
    case 'rhythm': return <g><ellipse cx="13" cy="27" rx="4" ry="3" transform="rotate(-22 13 27)" /><ellipse cx="26" cy="25" rx="4" ry="3" transform="rotate(-22 26 25)" /><rect x="15.8" y="13" width="1.6" height="14" /><rect x="28.8" y="11" width="1.6" height="14" /><path d="M15.8 13 30.4 11v3.2L15.8 16.2z" /></g>;
    case 'star': return <path d="m20 9 3.2 6.6 7.2.9-5.3 5 1.4 7.2L20 25.2l-6.5 3.5 1.4-7.2-5.3-5 7.2-.9z" />;
    case 'flame': return <path d="M20 31c4.6 0 7.5-3 7.5-7.2 0-4-3-6.2-4.2-9.6-.6 2.5-2 3.8-3.4 4.4.4-3.8-1.3-7-4.4-9.4.3 3.8-2.4 6.2-3.8 8.7-.9 1.6-1.7 3.4-1.7 5.6C10 27.8 13 31 20 31z" />;
    case 'book': return <g fill="none" strokeWidth="1.8" className={styles.glyphStroke}><path d="M11 13h11l6 6v11H11z" /><path d="M14.5 21h10M14.5 24h10M14.5 27h10" /></g>;
    case 'clef': return text('G F', 13);
    case 'key': return text('♯ ♭', 14);
    case 'eye': return <g fill="none" strokeWidth="1.8" className={styles.glyphStroke}><path d="M8 20c3.5-5.5 7.5-8 12-8s8.5 2.5 12 8c-3.5 5.5-7.5 8-12 8s-8.5-2.5-12-8z" /><circle cx="20" cy="20" r="3.5" /></g>;
    case 'crown': return <path d="M10 27h20l1.5-12-6 4.5L20 11l-5.5 8.5-6-4.5z" />;
  }
}

export function Badge({ a, unlocked }: { a: Achievement; unlocked: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={`${styles.badge} ${styles[a.tier]} ${unlocked ? '' : styles.locked}`} aria-hidden="true" focusable="false">
      {a.tier === 'gold'
        ? <path className={styles.rim} d="M32 3l6 4.6 7.4-.9 3 6.8 6.8 3-.9 7.4L59 30l-4.6 6 .9 7.4-6.8 3-3 6.8-7.4-.9L32 57l-6-4.6-7.4.9-3-6.8-6.8-3 .9-7.4L5 30l4.6-6-.9-7.4 6.8-3 3-6.8 7.4.9z" />
        : a.tier === 'silver'
          ? <path className={styles.rim} d="M21.6 5h20.8L57 19.6v20.8L42.4 55H21.6L7 40.4V19.6z" />
          : <circle className={styles.rim} cx="32" cy="30" r="26" />}
      <circle className={styles.face} cx="32" cy="30" r="19" />
      <g transform="translate(12 10)" className={styles.glyph}><Glyph glyph={a.glyph} /></g>
    </svg>
  );
}
