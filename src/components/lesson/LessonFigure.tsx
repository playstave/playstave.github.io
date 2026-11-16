import type { Figure } from '../../lessons/types';
import { parseFigureMusic } from '../../lessons/notation';
import { StaffDiagram } from '../StaffDiagram';
import { Notation } from '../Notation';

/** Draws a lesson figure: the counting staff, or engraved notation. */
export function LessonFigure({ figure }: { figure: Figure }) {
  if (figure.kind === 'staff') return <StaffDiagram figure={figure} />;
  const notes = parseFigureMusic(figure.music ?? '');
  return (
    <div>
      <Notation clef={figure.clef ?? 'treble'} notes={notes} timeSignature={figure.time} keySignature={figure.keySig}
        width={figure.width ?? Math.max(220, 110 + notes.length * 42)} height={150} label={figure.alt} />
      {figure.caption && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-2)', margin: 'var(--space-2) 0 0' }}>{figure.caption}</p>}
    </div>
  );
}
