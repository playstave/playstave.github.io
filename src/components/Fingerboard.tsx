import { getInstrument, type InstrumentId } from '../audio/notes';
import { placeNote, sharpName } from '../course/fingering';
import styles from './Fingerboard.module.css';

interface Props {
  instrument: InstrumentId;
  /** Sounding pitches to show. */
  notes: number[];
  /** Sounding pitches drawn as "new" (accent colour). */
  highlight?: number[];
}

const SEMITONES = 8;

/**
 * The top of the fingerboard, strings lowest-to-highest from left to right,
 * nut at the top. Open strings show "0" above the nut; fingered notes show a
 * dot with the finger number where the fingertip goes.
 */
export function Fingerboard({ instrument, notes, highlight = [] }: Props) {
  const inst = getInstrument(instrument)!;
  const W = 220, top = 48, step = 26, left = 46, gap = (W - left * 2) / 3;
  const H = top + SEMITONES * step + 20;
  const placed = notes.map((m) => ({ m, p: placeNote(instrument, m) })).filter((x) => x.p);
  const x = (s: number) => left + s * gap;
  const y = (offset: number) => top + (offset - 0.5) * step;
  const name = (m: number) => sharpName(m);
  const label = `${inst.name} fingerboard: ${placed.map(({ m, p }) => `${name(m)} = ${p!.finger === 0 ? `open ${p!.stringName} string` : `${p!.stringName} string, finger ${p!.finger}`}`).join('; ')}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.board} role="img" aria-label={label}>
      <rect x={left - 18} y={top} width={W - (left - 18) * 2} height={H - top - 6} rx="6" className={styles.wood} />
      {Array.from({ length: SEMITONES }, (_, k) => <line key={k} x1={left - 14} x2={W - left + 14} y1={top + (k + 1) * step} y2={top + (k + 1) * step} className={styles.grid} />)}
      <rect x={left - 18} y={top - 4} width={W - (left - 18) * 2} height="6" rx="2" className={styles.nut} />
      {inst.strings.map((s, i) => (
        <g key={s.name}>
          <line x1={x(i)} x2={x(i)} y1={top} y2={H - 8} className={styles.string} strokeWidth={2.6 - i * 0.45} />
          <text x={x(i)} y={14} textAnchor="middle" className={styles.stringName}>{s.name}</text>
        </g>
      ))}
      {placed.map(({ m, p }) => {
        const hi = highlight.includes(m);
        const cx = x(p!.string);
        if (p!.finger === 0) {
          return <g key={m} className={hi ? styles.hi : styles.lo}><circle cx={cx} cy={top - 13} r="7" className={styles.open} /><text x={cx + 12} y={top - 9} className={styles.openName}>{name(m)}</text></g>;
        }
        const cy = y(p!.offset);
        return (
          <g key={m} className={hi ? styles.hi : styles.lo}>
            <circle cx={cx} cy={cy} r="10" className={styles.dot} />
            <text x={cx} y={cy + 4} textAnchor="middle" className={styles.finger}>{p!.finger}</text>
            <text x={cx + 14} y={cy + 4} className={styles.noteName}>{name(m)}</text>
          </g>
        );
      })}
    </svg>
  );
}
