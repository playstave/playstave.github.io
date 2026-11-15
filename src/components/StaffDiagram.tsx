import { useRef, type KeyboardEvent } from 'react';
import type { Pos, StaffFigure } from '../lessons/types';
import { isLine, lineNumber, spaceNumber, STAFF_POSITIONS } from '../lessons/staff';
import styles from './StaffDiagram.module.css';

interface Interactive {
  picked: Pos | null;
  onPick: (p: Pos) => void;
  /** After answering: what was chosen, and the correct position when it may be shown. */
  reveal?: { answer?: Pos; chosen: Pos } | null;
  disabled?: boolean;
}

interface Props {
  figure: Omit<StaffFigure, 'kind'>;
  /** Half the distance between lines, in drawing units. Larger for tap targets. */
  half?: number;
  interactive?: Interactive;
}

/**
 * A five-line staff drawn to engraving proportions: note heads are one space
 * tall, line notes are bisected by their line, space notes touch both lines.
 */
export function StaffDiagram({ figure, half = 8, interactive }: Props) {
  const { notes = [], highlight = [], numbers, noteLabels, arcs = [], alt, caption } = figure;
  const gap = half * 2;
  const left = numbers === 'lines' || numbers === 'both' ? 34 : 14;
  const right = numbers === 'spaces' || numbers === 'both' ? 34 : 14;
  const noteSpacing = gap * 3.2;
  // Tap-to-locate staves are narrower so each line/space row is a comfortable touch target.
  const staffLen = interactive ? gap * 4 : Math.max(gap * 12, notes.length * noteSpacing + gap * 2);
  const W = left + staffLen + right;
  const pad = interactive ? gap * 0.7 : gap * 1.6;
  const top = pad + (arcs.length ? gap : 0);
  const y = (p: Pos) => top + (8 - p) * half;
  const H = y(0) + (noteLabels ? gap * 2.6 : pad);
  const noteX = (i: number) => left + gap * 1.5 + (notes.length === 1 ? (staffLen - gap * 3) / 2 : (i * (staffLen - gap * 3)) / Math.max(1, notes.length - 1));
  const rx = half * 1.3;
  const ry = half * 0.92;

  const head = (cx: number, cy: number, cls?: string, key?: string | number) => (
    <g key={key} className={cls}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className={styles.head} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.48} ry={ry * 0.55} transform={`rotate(-38 ${cx} ${cy})`} className={styles.hole} />
    </g>
  );

  const reveal = interactive?.reveal;
  const rows = STAFF_POSITIONS;
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, p: Pos) => {
    const delta = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = Math.min(8, Math.max(0, p + delta));
    rowRefs.current[next]?.focus();
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.wrap} style={{ aspectRatio: `${W} / ${H}`, maxWidth: W * 2.2 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={alt}>
          {highlight.map((p) => isLine(p)
            ? <rect key={`h${p}`} x={left - 4} y={y(p) - 3} width={staffLen + 8} height={6} rx={3} className={styles.hl} />
            : <rect key={`h${p}`} x={left} y={y(p) - half} width={staffLen} height={gap} className={styles.hl} />)}

          {interactive && reveal && (
            <>
              {reveal.chosen !== reveal.answer && <rect x={left} y={y(reveal.chosen) - half / 2} width={staffLen} height={half} className={styles.wrongBand} />}
              {reveal.answer != null && <rect x={left} y={y(reveal.answer) - half / 2} width={staffLen} height={half} className={styles.rightBand} />}
            </>
          )}

          {[0, 2, 4, 6, 8].map((p) => <line key={p} x1={left} x2={left + staffLen} y1={y(p)} y2={y(p)} className={styles.line} />)}
          <line x1={left} x2={left} y1={y(8)} y2={y(0)} className={styles.bar} />
          <line x1={left + staffLen} x2={left + staffLen} y1={y(8)} y2={y(0)} className={styles.bar} />

          {(numbers === 'lines' || numbers === 'both') && [0, 2, 4, 6, 8].map((p) => (
            <text key={`ln${p}`} x={left - 12} y={y(p)} className={styles.num} textAnchor="middle" dominantBaseline="central">{lineNumber(p)}</text>
          ))}
          {(numbers === 'spaces' || numbers === 'both') && [1, 3, 5, 7].map((p) => (
            <text key={`sn${p}`} x={left + staffLen + 12} y={y(p)} className={`${styles.num} ${styles.spaceNum}`} textAnchor="middle" dominantBaseline="central">{spaceNumber(p)}</text>
          ))}

          {notes.map((p, i) => head(noteX(i), y(p), styles.note, i))}

          {arcs.map((a) => {
            const x1 = noteX(a.from);
            const x2 = noteX(a.from + 1);
            const peak = Math.min(y(notes[a.from]), y(notes[a.from + 1])) - gap * 1.3;
            return (
              <g key={`arc${a.from}`} className={styles.arc}>
                <path d={`M ${x1 + rx * 0.4} ${peak + gap * 0.7} Q ${(x1 + x2) / 2} ${peak - gap * 0.4} ${x2 - rx * 0.4} ${peak + gap * 0.7}`} />
                <text x={(x1 + x2) / 2} y={peak - gap * 0.45} textAnchor="middle">{a.label}</text>
              </g>
            );
          })}

          {noteLabels && notes.map((_, i) => (
            <text key={`nl${i}`} x={noteX(i)} y={y(0) + gap * 1.5} className={styles.noteLabel} textAnchor="middle">{i + 1}</text>
          ))}

          {interactive?.picked != null && !reveal && head(left + staffLen / 2, y(interactive.picked), styles.ghost, 'ghost')}
          {reveal && head(left + staffLen / 2, y(reveal.chosen), reveal.chosen === reveal.answer ? styles.okNote : styles.badNote, 'chosen')}
        </svg>

        {interactive && (
          <div className={styles.rows} role="radiogroup" aria-label="Lines and spaces of the staff, from the bottom">
            {rows.map((p) => {
              const k = p + 1;
              const selected = interactive.picked === p;
              return (
                <button
                  key={p}
                  ref={(el) => { rowRefs.current[p] = el; }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${isLine(p) ? 'A line' : 'A space'}, position ${k} of 9 counting from the bottom`}
                  tabIndex={selected || (interactive.picked == null && p === 0) ? 0 : -1}
                  disabled={interactive.disabled}
                  className={`${styles.row} ${selected ? styles.rowOn : ''}`}
                  style={{ top: `${((y(p) - half / 2) / H) * 100}%`, height: `${(half / H) * 100}%`, left: `${(left / W) * 100}%`, width: `${(staffLen / W) * 100}%` }}
                  onClick={() => interactive.onPick(p)}
                  onKeyDown={(e) => onKey(e, p)}
                  onFocus={() => { /* focusing does not pick; Space/Enter or click does */ }}
                />
              );
            })}
          </div>
        )}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
