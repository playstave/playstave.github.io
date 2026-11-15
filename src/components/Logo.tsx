import styles from './Logo.module.css';

/**
 * Stave wordmark. The mark is a single tilted note head resting on a
 * fragment of staff — the first thing every student learns to read.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={styles.mark}>
      <rect width="32" height="32" rx="7" className={styles.tile} />
      <g className={styles.lines} strokeWidth="1.4">
        <path d="M6 9.5h20M6 13.5h20M6 17.5h20M6 21.5h20" />
      </g>
      <ellipse cx="14" cy="19.5" rx="4.4" ry="3.1" transform="rotate(-22 14 19.5)" className={styles.head} />
      <path d="M18 18.6V6.5" strokeWidth="2" strokeLinecap="round" className={styles.stem} />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.logo}>
      <LogoMark />
      {!compact && <span className={styles.word}>Stave</span>}
    </span>
  );
}
